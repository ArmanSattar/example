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
import { animationCalculation, getItemDimensions } from "../utils";
import { DISTANCE_IN_ITEMS } from "../../../libs/constants";
import { AnimationCalculation, Direction } from "../../../libs/types";
import { RootState } from "../../../../store";
import { useDispatch, useSelector } from "react-redux";
import { setStartMiddleItem } from "../../../../store/slices/caseCarouselSlice";
import TriangleIcon from "./TriangleIcon";
import { Howl } from "howler";
import { setDimensions } from "../../../../store/slices/demoSlice";

const CarouselItem = dynamic(() => import("./CarouselItem"), { ssr: false });

interface CaseCarouselProps {
  items: BaseCaseItem[];
  index: number;
  isSpinClicked: boolean;
  isFastAnimationClicked: boolean;
  numCases: number;
  onAnimationComplete: () => void;
  windowSize: WindowSize;
  skipAnimation: boolean;
  attachObserver: boolean;
}

type Action =
  | { type: "RESET" }
  | {
      type: "START_ANIMATION";
      payload: { currentPosition: number; direction: Direction; numCases: number };
    }
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
          action.payload.direction === Direction.HORIZONTAL,
          action.payload.numCases
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
    index,
    isFastAnimationClicked,
    numCases,
    onAnimationComplete,
    windowSize,
    isSpinClicked,
    skipAnimation,
    attachObserver,
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
    const isSoundOn = useSelector((state: RootState) => state.demo.soundOn);
    const reduxDispatch = useDispatch();
    const [direction, setDirection] = useState<Direction>(Direction.HORIZONTAL);
    const carouselDimensions = useSelector((state: RootState) => state.demo.dimensions);
    const middleIndexUpdatingRef = useRef(0);
    const { width: itemWidth, height: itemHeight } = useMemo(
      () => getItemDimensions(direction === Direction.HORIZONTAL, numCases),
      [direction]
    );
    const isVertical = useMemo(() => direction === Direction.VERTICAL, [direction]);

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

    const useDebouncedCallback = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
      const timeout = useRef<NodeJS.Timeout | undefined>();

      return useCallback(
        ((...args: Parameters<T>) => {
          const later = () => {
            clearTimeout(timeout.current);
            func(...args);
          };

          clearTimeout(timeout.current);
          timeout.current = setTimeout(later, wait);
        }) as T,
        [func, wait]
      );
    };

    const playSound = useDebouncedCallback((src: string) => {
      let sound: Howl;

      if (src === "/sounds/tick.wav") {
        sound = new Howl({
          src: ["/sounds/tick.wav"],
          volume: 0.3,
          preload: true,
        });
      } else {
        sound = new Howl({
          src: ["/sounds/reward-item-reached.wav"],
          volume: 0.1,
          preload: true,
        });
      }
      sound.play();
    }, 20);

    useEffect(() => {
      if (middleItem !== startMiddleItem && middleItem !== 0 && isSoundOn) {
        playSound("/sounds/tick.wav");
      }
    }, [middleItem, startMiddleItem]);

    const calculateMiddleItem = useCallback(() => {
      if (!carouselContainerRef.current || !carouselRef.current) return;

      // Calculate the index of the middle item based on the current position
      const middleIndex = Math.floor(Math.abs(currentPositionRef.current) / itemWidth);

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
                numCases: numCases,
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
          if (isSoundOn) playSound("/sounds/reward-item-reached.wav");
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
          const position = isVertical
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
              ? `${6.5 + Math.random() - 1}s`
              : `${2 + Math.random() * 0.33 - 0.165}s`
          } cubic-bezier(0, 0.46, 0.09, 1)`;
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
          const dimension = !isVertical ? width : height;

          const middleElement = Math.ceil(dimension / ((!isVertical ? itemWidth : itemHeight) * 2));
          reduxDispatch(setStartMiddleItem(middleElement - 1));
        }
      },
      [direction]
    );

    useEffect(() => {
      setMiddleDueToResizedCarousel(carouselDimensions.width, carouselDimensions.height);
    }, [carouselDimensions, setMiddleDueToResizedCarousel]);

    useEffect(() => {
      if (!carouselContainerRef.current || !attachObserver) return;

      const carouselRefTemp = carouselContainerRef.current;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          reduxDispatch(setDimensions({ width, height }));
          break;
        }
      });

      resizeObserver.observe(carouselContainerRef.current);

      // Cleanup function
      return () => {
        if (carouselRefTemp) {
          resizeObserver.unobserve(carouselRefTemp);
        }
      };
    }, [attachObserver, reduxDispatch, setMiddleDueToResizedCarousel]);

    return (
      <div
        className={`relative rounded-md h-full flex-grow w-full bg-navbar_bg border-2 border-color_stroke_1`}
      >
        {index === 0 && (
          <div
            className={`h-full absolute flex z-20 ${
              direction === Direction.HORIZONTAL
                ? "w-full justify-center h-max -top-2 inset-x-0 mx-auto "
                : "h-full items-center -left-2 inset-y-0 my-auto"
            }`}
          >
            <TriangleIcon isVertical={direction !== Direction.HORIZONTAL} firstIcon={true} />
          </div>
        )}
        {index === numCases - 1 && (
          <div
            className={`absolute flex items-center z-20 ${
              direction === Direction.HORIZONTAL
                ? "w-full justify-center h-max -bottom-2 inset-x-0 mx-auto"
                : "h-full -right-2 inset-y-0 my-auto"
            }`}
          >
            <TriangleIcon isVertical={direction !== Direction.HORIZONTAL} firstIcon={false} />
          </div>
        )}
        <div
          className={`mt-md flex rounded-sm flex-col gap-xs`}
          style={{ height: isVertical ? `${itemHeight * 1.5}px` : `${itemHeight * 1.25}px` }}
        >
          <div
            className="relative flex h-full w-full overflow-clip items-center justify-center"
            ref={carouselContainerRef}
          >
            <div
              ref={carouselRef}
              className={`flex absolute overflow-visible ${
                isVertical ? "flex-col top-0" : "flex-row left-0"
              }`}
              style={carouselStyle}
            >
              {items &&
                items.map((item, index) => (
                  <CarouselItem
                    key={index}
                    item={item}
                    isMiddle={index === (middleItem === 0 ? startMiddleItem : middleItem)}
                    isFinal={index === DISTANCE_IN_ITEMS + startMiddleItem}
                    animationEnd={state.animationStage === 2 || state.animationStage === 3}
                    animationStart={state.animationStage === 1}
                    dimension={{ width: itemWidth, height: itemHeight }}
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
