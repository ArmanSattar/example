"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WindowSize } from "../hooks/useWindowResize";
import { BaseCaseItem } from "@solspin/game-engine-types";

const CarouselItem = dynamic(() => import("./CarouselItem"), { ssr: false });

type AnimationCalculation = {
  distance: number;
  tickerOffset: number;
};

interface CaseCarouselProps {
  items: BaseCaseItem[];
  isSpinClicked: boolean;
  isFastAnimationClicked: boolean;
  numCases: number;
  onAnimationComplete: () => void;
  windowSize: WindowSize;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const itemWidth = 192;
const distanceInItems = 30;
const animationDistanceBounds = {
  lower: (distanceInItems - 0.5) * itemWidth,
  upper: (distanceInItems + 0.5) * itemWidth,
  midpoint: distanceInItems * itemWidth,
};

const animationCalculation = (): AnimationCalculation => {
  const randomAnimationDistance = getRandomInt(
    animationDistanceBounds.lower,
    animationDistanceBounds.upper
  );
  return {
    distance: -randomAnimationDistance,
    tickerOffset: animationDistanceBounds.midpoint - randomAnimationDistance,
  };
};

enum Action {
  RESET,
  START_ANIMATION,
  FIRST_STAGE_END,
  SECOND_STAGE_END,
}

type State = {
  animationStage: number;
  offset: AnimationCalculation;
};

enum Direction {
  HORIZONTAL,
  VERTICAL,
}

function carouselReducer(state: State, action: Action): State {
  switch (action) {
    case Action.RESET:
      return { animationStage: 0, offset: { distance: 0, tickerOffset: 0 } };
    case Action.START_ANIMATION:
      return { ...state, animationStage: 1, offset: animationCalculation() };
    case Action.FIRST_STAGE_END:
      return { ...state, animationStage: 2 };
    case Action.SECOND_STAGE_END:
      return { ...state, animationStage: 3 };
    default:
      return state;
  }
}

const CaseCarousel: React.FC<CaseCarouselProps> = React.memo(
  ({ items, isFastAnimationClicked, numCases, onAnimationComplete, windowSize, isSpinClicked }) => {
    const [state, dispatch] = useReducer(carouselReducer, {
      animationStage: 0,
      offset: { distance: 0, tickerOffset: 0 },
    });
    const animationCompletedRef = useRef(false);
    const currentPositionRef = useRef(0);
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const [middleItem, setMiddleItem] = useState<number>(0);
    const [direction, setDirection] = useState<Direction>(Direction.HORIZONTAL);

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
        console.log("Setting direction", newDirection, direction);
        setDirection(newDirection);
      }
    }, [windowSize, numCases, calculateDirection, direction, items]);

    const updatePosition = useCallback((position: number) => {
      currentPositionRef.current = position;
      calculateMiddleItem();
    }, []);

    useEffect(() => {
      if ((state.animationStage === 3 || state.animationStage === 0) && isSpinClicked) {
        console.log("Resetting carousel", state.animationStage, isSpinClicked);
        dispatch(Action.RESET);
        setMiddleItem(0);
        currentPositionRef.current = 0;

        // Force a reflow
        if (carouselRef.current) {
          void carouselRef.current.offsetHeight;
        }

        // Start animation in the next frame
        requestAnimationFrame(() => {
          dispatch(Action.START_ANIMATION);
          animationCompletedRef.current = false;
        });
      }
    }, [items]);

    useEffect(() => {
      const handleTransitionEnd = () => {
        if (state.animationStage === 1) {
          console.log("First stage end");
          dispatch(Action.FIRST_STAGE_END);
        } else if (state.animationStage === 2 && !animationCompletedRef.current) {
          animationCompletedRef.current = true;
          onAnimationComplete();
          dispatch(Action.SECOND_STAGE_END);
          console.log("Second stage end");
        }
      };

      const carousel = carouselRef.current;
      if (carousel) {
        carousel.addEventListener("transitionend", handleTransitionEnd);
        return () => carousel.removeEventListener("transitionend", handleTransitionEnd);
      }
    }, [state.animationStage, onAnimationComplete]);

    useEffect(() => {
      let animationFrameId: number;

      const animate = () => {
        if (carouselRef.current) {
          const transform = getComputedStyle(carouselRef.current).transform;
          const matrix = new DOMMatrix(transform);
          const position = direction === Direction.VERTICAL ? matrix.m42 : matrix.m41; // m42 for Y, m41 for X
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
          console.log("Stage 0", distance, tickerOffset);
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
    }, [state.animationStage, state.offset, isFastAnimationClicked]);

    const calculateMiddleItem = () => {
      const adjustedPosition = Math.abs(currentPositionRef.current);
      const itemOffsets = items.map((_, index) => index * itemWidth);
      const closestOffset = itemOffsets.reduce((prev, curr) => {
        return Math.abs(curr - adjustedPosition) < Math.abs(prev - adjustedPosition) ? curr : prev;
      });

      const middleItemIndex = itemOffsets.indexOf(closestOffset);
      if (middleItemIndex != middleItem) {
        setMiddleItem(middleItemIndex);
      }
    };

    return (
      <div
        className={`relative ${
          numCases > 1 ? "py-0 lg:py-0" : "lg:py-2"
        } rounded-md main-element flex-grow w-full`}
      >
        <div className={`mt-md flex overflow-hidden rounded-sm flex-col gap-xs h-[310px]`}>
          <div className="relative mx-auto my-0 flex h-full items-center justify-center overflow-hidden bg-dark-4 w-full">
            <div
              ref={carouselRef}
              className={`flex carousel-animation ${
                direction === Direction.VERTICAL ? "flex-col" : "flex-row"
              }`}
              style={carouselStyle}
            >
              {items.map((item, index) => (
                <CarouselItem
                  key={index}
                  item={item}
                  isMiddle={index === Math.round(items.length / 2) - 1 + middleItem}
                  isFinal={index === Math.round(items.length / 2) - 1 + distanceInItems}
                  animationEnd={state.animationStage === 2 || state.animationStage === 3}
                  animationStart={state.animationStage === 1}
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
