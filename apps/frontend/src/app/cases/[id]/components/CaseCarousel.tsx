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

    const updatePosition = useCallback((position: number) => {
      currentPositionRef.current = position;
      calculateMiddleItem();
    }, []);

    useLayoutEffect(() => {
      if ((state.animationStage === 3 || state.animationStage === 0) && isSpinClicked) {
        if (carouselRef.current) {
          dispatch({ type: "RESET" });
          currentPositionRef.current = 0;

          void carouselRef.current.offsetHeight;

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

    useEffect(() => {
      const handleTransitionEnd = () => {
        if (state.animationStage === 1) {
          dispatch({ type: "FIRST_STAGE_END" });
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

    useEffect(() => {
      if ((skipAnimation && state.animationStage === 1) || state.animationStage === 2) {
        animationCompletedRef.current = true;
        onAnimationComplete();
        dispatch({ type: "SECOND_STAGE_END" });
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

      if (state.animationStage === 1 || state.animationStage === 2) {
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

    const calculateMiddleItem = useCallback(() => {
      if (!carouselContainerRef.current || !carouselRef.current) return;

      const itemSize = direction === Direction.HORIZONTAL ? ITEM_WIDTH : ITEM_HEIGHT;

      // Calculate the index of the middle item based on the current position
      const middleIndex = Math.floor(Math.abs(currentPositionRef.current) / itemSize);

      if (middleIndex !== middleItem) {
        setMiddleItem(middleIndex);
      }
    }, [direction, middleItem]);

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
      <div className={`relative rounded-md main-element flex-grow w-full`}>
        <div
          className={`w-0 h-0 absolute z-20 ${
            direction === Direction.HORIZONTAL
              ? "top-0 inset-x-0 mx-auto border-l-[16px] border-r-[16px] border-t-[27.71px] border-l-transparent border-r-transparent border-t-yellow-400"
              : "left-0 inset-y-0 my-auto border-t-[16px] border-b-[16px] border-l-[27.71px] border-t-transparent border-b-transparent border-l-yellow-400"
          }`}
        ></div>
        <div
          className={`w-0 h-0 absolute z-20 ${
            direction === Direction.HORIZONTAL
              ? "bottom-0 inset-x-0 mx-auto border-l-[16px] border-r-[16px] border-b-[27.71px] border-l-transparent border-r-transparent border-b-yellow-400"
              : "right-0 inset-y-0 my-auto border-t-[16px] border-b-[16px] border-r-[27.71px] border-t-transparent border-b-transparent border-r-yellow-400"
          }`}
        ></div>
        <div
          className={`mt-md flex overflow-hidden rounded-sm flex-col gap-xs ${
            direction === Direction.VERTICAL ? "h-[450px]" : "h-[310px]"
          }`}
        >
          <div
            className="relative flex h-full overflow-hidden bg-dark-4 w-full items-center justify-center"
            ref={carouselContainerRef}
          >
            <div
              ref={carouselRef}
              className={`flex absolute carousel-animation ${
                direction === Direction.VERTICAL ? "flex-col top-0" : "flex-row left-0"
              } h-max`}
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
