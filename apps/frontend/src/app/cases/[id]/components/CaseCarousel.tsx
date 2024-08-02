"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { WindowSize } from "../hooks/useWindowResize";
import { BaseCaseItem } from "@solspin/game-engine-types";
import {
  animationCalculation,
  AnimationCalculation,
  Direction,
  DISTANCE_IN_ITEMS,
  ITEM_HEIGHT,
  ITEM_WIDTH,
} from "../utils";
import { RootState } from "../../../../store";
import { useDispatch, useSelector } from "react-redux";
import { setStartMiddleItem } from "../../../../store/slices/caseCarouselSlice";

const CarouselItem = dynamic(() => import("./CarouselItem"), { ssr: false });

interface CaseCarouselProps {
  items: BaseCaseItem[];
  isSpinClicked: boolean;
  isFastAnimationClicked: boolean;
  numCases: number;
  onAnimationComplete: () => void;
  windowSize: WindowSize;
  skipAnimation: boolean;
}

type Action =
  | { type: "RESET" }
  | { type: "START_ANIMATION"; payload: { currentPosition: number; direction: Direction } }
  | { type: "FIRST_STAGE_END" }
  | { type: "SECOND_STAGE_END" };

type State = {
  animationStage: number;
  offset: AnimationCalculation;
};

function carouselReducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return { animationStage: 0, offset: { distance: 0, tickerOffset: 0 } };
    case "START_ANIMATION":
      return {
        ...state,
        animationStage: 1,
        offset: animationCalculation(
          action.payload.currentPosition,
          action.payload.direction === Direction.HORIZONTAL
        ),
      };
    case "FIRST_STAGE_END":
      return { ...state, animationStage: 2 };
    case "SECOND_STAGE_END":
      return { ...state, animationStage: 3 };
    default:
      return state;
  }
}

const CaseCarousel: React.FC<CaseCarouselProps> = React.memo(
  ({
    items,
    isFastAnimationClicked,
    numCases,
    onAnimationComplete,
    windowSize,
    isSpinClicked,
    skipAnimation,
  }) => {
    const [state, dispatch] = useReducer(carouselReducer, {
      animationStage: 0,
      offset: { distance: 0, tickerOffset: 0 },
    });
    const animationCompletedRef = useRef(false);
    const currentPositionRef = useRef(0);
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const carouselContainerRef = useRef<HTMLDivElement | null>(null);
    const [middleItem, setMiddleItem] = useState<number>(0);
    const startMiddleItem = useSelector((state: RootState) => state.caseCarousel.startMiddleItem);
    const reduxDispatch = useDispatch();
    const [direction, setDirection] = useState<Direction>(Direction.HORIZONTAL);
    const [carouselDimensions, setCarouselDimensions] = useState<{ width: number; height: number }>(
      { width: 0, height: 0 }
    );
    const middleIndexUpdatingRef = useRef(0);

    const calculateDirection = useCallback(() => {
      if (windowSize.width && windowSize.width <= 640) {
        if (numCases > 1) {
          return Direction.HORIZONTAL;
        }
        return Direction.VERTICAL;
      }
      if (windowSize.width && windowSize.width < 1280) {
        return Direction.HORIZONTAL;
      }
      if (numCases > 1) {
        return Direction.VERTICAL;
      }
      return Direction.HORIZONTAL;
    }, [windowSize, numCases]);

    useEffect(() => {
      const newDirection = calculateDirection();
      if (newDirection !== direction) {
        setDirection(newDirection);
      }
    }, [windowSize, numCases, calculateDirection, direction, items]);

    const playSound = useCallback((src: string) => {
      const audio = new Audio(src);
      audio.play().catch((error) => console.error("Audio playback failed:", error));
    }, []);

    useEffect(() => {
      if (middleItem !== startMiddleItem && middleItem !== 0) {
        playSound("/sounds/tick.wav");
      }
    }, [middleItem, startMiddleItem]);

    const calculateMiddleItem = useCallback(() => {
      if (!carouselContainerRef.current || !carouselRef.current) return;

      // Calculate the index of the middle item based on the current position
      const middleIndex = Math.floor(Math.abs(currentPositionRef.current) / ITEM_WIDTH);

      if (middleIndex !== middleIndexUpdatingRef.current) {
        setMiddleItem(middleIndex);
        middleIndexUpdatingRef.current = middleIndex;
      }
    }, [direction]);

    const updatePosition = useCallback(
      (position: number) => {
        currentPositionRef.current = position;
        calculateMiddleItem();
      },
      [calculateMiddleItem]
    );

    useLayoutEffect(() => {
      if ((state.animationStage === 3 || state.animationStage === 0) && isSpinClicked) {
        if (carouselRef.current) {
          dispatch({ type: "RESET" });
          currentPositionRef.current = 0;

          requestAnimationFrame(() => {
            const currentPosition =
              (direction === Direction.HORIZONTAL
                ? carouselDimensions.width
                : carouselDimensions.height) / 2;
            dispatch({
              type: "START_ANIMATION",
              payload: {
                currentPosition: currentPosition,
                direction: direction,
              },
            });
            animationCompletedRef.current = false;
          });
        }
      }
    }, [items]);

    useLayoutEffect(() => {
      const handleTransitionEnd = () => {
        if (state.animationStage === 1) {
          dispatch({ type: "FIRST_STAGE_END" });
          playSound("/sounds/cashier-cha-ching.mp3");
        } else if (state.animationStage === 2 && !animationCompletedRef.current) {
          animationCompletedRef.current = true;
          onAnimationComplete();
          dispatch({ type: "SECOND_STAGE_END" });
        }
      };

      const carousel = carouselRef.current;
      if (carousel) {
        carousel.addEventListener("transitionend", handleTransitionEnd);
        return () => carousel.removeEventListener("transitionend", handleTransitionEnd);
      }
    }, [state.animationStage, onAnimationComplete]);

    useLayoutEffect(() => {
      if ((skipAnimation && state.animationStage === 1) || state.animationStage === 2) {
        animationCompletedRef.current = true;
        onAnimationComplete();
        dispatch({ type: "SECOND_STAGE_END" });
        setMiddleItem(DISTANCE_IN_ITEMS + startMiddleItem);
      }
    }, [skipAnimation]);

    useEffect(() => {
      let animationFrameId: number;

      const animate = () => {
        if (carouselRef.current) {
          const transform = getComputedStyle(carouselRef.current).transform;
          const matrix = new DOMMatrix(transform);
          const position =
            direction === Direction.VERTICAL
              ? matrix.m42 - carouselDimensions.height / 2
              : matrix.m41 - carouselDimensions.width / 2; // m42 for Y, m41 for X
          updatePosition(position);
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      if (state.animationStage === 1) {
        animationFrameId = requestAnimationFrame(animate);
      }

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [state.animationStage, numCases, direction]);

    const carouselStyle = useMemo(() => {
      const { distance, tickerOffset } = state.offset;
      let transformDistance = 0;
      let transition = "none";

      switch (state.animationStage) {
        case 0:
          transformDistance = 0;
          transition = "none";
          break;
        case 1:
          transformDistance = distance;
          transition = `transform ${
            !isFastAnimationClicked
              ? `${6.5 + Math.random() - 0.5}s`
              : `${2 + Math.random() * 0.33 - 0.165}s`
          } cubic-bezier(0, 0.49, 0.1, 1)`;
          break;
        case 2:
          transformDistance = distance - tickerOffset;
          transition = `transform ${
            !isFastAnimationClicked
              ? `${0.75 + Math.random() * 0.5 - 0.25}s`
              : `${0.375 + Math.random() * 0.25 - 0.125}s`
          }`;
          break;
        case 3:
          transformDistance = distance - tickerOffset;
          transition = `none`;
          break;
      }

      return {
        transform:
          direction === Direction.HORIZONTAL
            ? `translate3d(${transformDistance}px, 0, 0)`
            : `translate3d(0, ${transformDistance}px, 0)`,
        transition,
      };
    }, [state.animationStage, state.offset, isFastAnimationClicked, direction]);

    const setMiddleDueToResizedCarousel = useCallback(
      (width: number, height: number) => {
        if (carouselContainerRef.current) {
          const dimension = direction === Direction.HORIZONTAL ? width : height;

          const middleElement = Math.ceil(
            dimension / ((direction === Direction.HORIZONTAL ? ITEM_WIDTH : ITEM_HEIGHT) * 2)
          );
          reduxDispatch(setStartMiddleItem(middleElement - 1));
        }
      },
      [direction]
    );

    useEffect(() => {
      if (!carouselContainerRef.current) return;

      const carouselRefTemp = carouselContainerRef.current;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setMiddleDueToResizedCarousel(width, height);
          setCarouselDimensions({ width: width, height: height });
        }
      });

      resizeObserver.observe(carouselContainerRef.current);

      // Cleanup function
      return () => {
        if (carouselRefTemp) {
          resizeObserver.unobserve(carouselRefTemp);
        }
      };
    }, [setMiddleDueToResizedCarousel]);

    return (
      <div className={`relative rounded-md h-full flex-grow w-full bg-navbar_bg`}>
        <div
          className={`w-0 h-0 absolute z-20 ${
            direction === Direction.HORIZONTAL
              ? "-top-2 inset-x-0 mx-auto "
              : "left-0 inset-y-0 my-auto"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="31"
            viewBox="0 0 36 31"
            fill="none"
          >
            <g filter="url(#filter0_d_121_502)">
              <path
                d="M21.1206 23.1083C19.5194 25.1052 16.4806 25.1052 14.8794 23.1083L1.56344 6.50234C-0.536127 3.88403 1.32791 -3.64309e-06 4.68406 -3.34969e-06L31.3159 -1.02145e-06C34.6721 -7.28048e-07 36.5361 3.88403 34.4366 6.50235L21.1206 23.1083Z"
                fill="url(#paint0_linear_121_502)"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_121_502"
                x="0.676514"
                y="0"
                width="34.647"
                height="30.606"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="6" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_121_502"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_121_502"
                  result="shape"
                />
              </filter>
              <linearGradient
                id="paint0_linear_121_502"
                x1="18"
                y1="-9"
                x2="18"
                y2="27"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#FFE500" />
                <stop offset="1" stop-color="#FFEDBE" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div
          className={`w-0 h-0 absolute z-20 ${
            direction === Direction.HORIZONTAL
              ? "bottom-[23px] inset-x-0 mx-auto"
              : "right-0 inset-y-0 my-auto"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="31"
            viewBox="0 0 36 31"
            fill="none"
          >
            <g filter="url(#filter0_d_121_503)">
              <path
                d="M21.1206 7.89165C19.5194 5.89478 16.4806 5.89478 14.8794 7.89165L1.56344 24.4977C-0.536127 27.116 1.32791 31 4.68406 31L31.3159 31C34.6721 31 36.5361 27.116 34.4366 24.4977L21.1206 7.89165Z"
                fill="url(#paint0_linear_121_503)"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_121_503"
                x="0.676514"
                y="0.393982"
                width="34.647"
                height="30.606"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="-6" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_121_503"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_121_503"
                  result="shape"
                />
              </filter>
              <linearGradient
                id="paint0_linear_121_503"
                x1="18"
                y1="40"
                x2="18"
                y2="4"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#FFE500" />
                <stop offset="1" stop-color="#FFEDBE" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div
          className={`mt-md flex rounded-sm flex-col overflow-visible gap-xs ${
            direction === Direction.VERTICAL ? "h-[200px]" : "h-[200px]"
          }`}
        >
          <div
            className="relative flex h-full w-full overflow-visible items-center justify-center"
            ref={carouselContainerRef}
          >
            <div
              ref={carouselRef}
              className={`flex absolute will-change-transform overflow-visible transform-gpu ${
                direction === Direction.VERTICAL ? "flex-col top-0" : "flex-row left-0"
              }`}
              style={carouselStyle}
            >
              {items.map((item, index) => (
                <CarouselItem
                  key={index}
                  item={item}
                  isMiddle={index === (middleItem === 0 ? startMiddleItem : middleItem)}
                  isFinal={index === DISTANCE_IN_ITEMS + startMiddleItem}
                  animationEnd={state.animationStage === 2 || state.animationStage === 3}
                  animationStart={state.animationStage === 1}
                  direction={direction}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CaseCarousel.displayName = "CaseCarousel";

export { CaseCarousel };
