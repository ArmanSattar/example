"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Image from "next/image";
import { ICase } from "../../hooks/useCases";
import CarouselItem from "./CarouselItem";

type AnimationCalculation = {
  distance: number;
  tickerOffset: number;
};

interface CaseCarouselProps {
  cases: ICase[];
  isDemoClicked: boolean;
  numCases: number;
  onAnimationComplete: () => void;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const itemWidth = 176;
const distanceInItems = 20;
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
  ({ cases, isDemoClicked, numCases, onAnimationComplete }) => {
    const MemoizedCarouselItem = React.memo(CarouselItem);
    const [state, dispatch] = useReducer(carouselReducer, {
      animationStage: 0,
      offset: { distance: 0, tickerOffset: 0 },
    });
    const currentPositionRef = useRef(0);
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const [middleItem, setMiddleItem] = useState<number>(0);
    console.log("rendering carousel");

    const updatePosition = useCallback((position: number) => {
      currentPositionRef.current = position;
      calculateMiddleItem();

      console.log("Current position", currentPositionRef.current, middleItem);
    }, []);

    useEffect(() => {
      if ((state.animationStage === 3 || state.animationStage === 0) && isDemoClicked) {
        dispatch(Action.RESET);
      }
    }, [cases, isDemoClicked]);

    useEffect(() => {
      if (isDemoClicked && state.animationStage === 0) {
        dispatch(Action.START_ANIMATION);
      }
    }, [isDemoClicked, state.animationStage]);

    useEffect(() => {
      const handleTransitionEnd = () => {
        if (state.animationStage === 1) {
          dispatch(Action.FIRST_STAGE_END);
        } else if (state.animationStage === 2) {
          console.log("Second stage end");
          onAnimationComplete();
          dispatch(Action.SECOND_STAGE_END);
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
          const position = numCases > 1 ? matrix.m42 : matrix.m41; // m42 for Y, m41 for X
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
    }, [state.animationStage, numCases]);

    const carouselStyle = useMemo(() => {
      const { distance, tickerOffset } = state.offset;
      const transformDistance =
        state.animationStage === 1
          ? distance
          : state.animationStage === 2 || state.animationStage === 3
          ? distance - tickerOffset
          : 0;

      return {
        "--transform-distance": `${transformDistance}px`,
        transform:
          numCases > 1
            ? `translateY(var(--transform-distance))`
            : `translateX(var(--transform-distance))`,
        transition:
          state.animationStage === 1
            ? "transform 5s cubic-bezier(0, 0.49, 0.1, 1)"
            : state.animationStage === 2
            ? "transform 1s"
            : "none",
      } as React.CSSProperties & { "--transform-distance": string };
    }, [state.animationStage, state.offset, numCases]);

    const calculateMiddleItem = () => {
      const adjustedPosition = Math.abs(currentPositionRef.current);

      const itemOffsets = cases.map((_, index) => index * itemWidth);
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
        <Image
          src={numCases > 1 ? "/icons/down-arrow.svg" : "/icons/right-arrow.svg"}
          alt={numCases > 1 ? "Arrow Down" : "Arrow Right"}
          width={24}
          height={24}
          className={`absolute ${
            numCases > 1 ? "inset-y-0 left-[-10px] my-auto" : "inset-x-0 top-[-10px] mx-auto"
          } z-10 transition-colors duration-1000 text-yellow-2 bg-amber-300`}
        />
        <div
          className={`mt-md flex overflow-hidden rounded-sm flex-col gap-xs h-[310px] xl:h-[180px] ${
            numCases > 1 ? "xl:h-[310px]" : ""
          }`}
        >
          <div className="relative mx-auto my-0 flex h-full items-center justify-center overflow-hidden bg-dark-4 w-full">
            <div
              ref={carouselRef}
              className={`flex carousel-animation ${
                numCases > 1 ? "flex-row sm:flex-col" : "sm:flex-row flex-col"
              }`}
              style={carouselStyle}
            >
              {cases.map((item, index) => (
                <MemoizedCarouselItem
                  key={index}
                  {...item}
                  isMiddle={index === Math.round(cases.length / 2) - 1 + middleItem}
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
