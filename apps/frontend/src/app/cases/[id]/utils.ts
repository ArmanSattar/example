import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DISTANCE_IN_ITEMS, ITEM_HEIGHT, ITEM_WIDTH, NUMBER_OF_ITEMS } from "../../libs/constants";
import { AnimationCalculation } from "../../libs/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const generateClientSeed = async (): Promise<string> => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const binarySearch = (items: BaseCaseItem[], target: number): BaseCaseItem => {
  let left = 0;
  let right = items.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (target < items[mid].rollNumbers[0]) {
      right = mid - 1;
    } else if (target > items[mid].rollNumbers[1]) {
      left = mid + 1;
    } else {
      return items[mid];
    }
  }

  throw new Error("No item found for roll number: " + target);
};

export const getItemDimensions = (
  isHorizontal: boolean,
  numCases: number,
  windowHeight: number
) => {
  const isMobile = windowHeight < 900;

  if (isHorizontal) {
    switch (numCases) {
      case 1:
        return { width: ITEM_WIDTH, height: ITEM_HEIGHT };
      case 2:
        return {
          width: isMobile ? ITEM_WIDTH / 1.5 : ITEM_WIDTH,
          height: isMobile ? ITEM_HEIGHT / 1.5 : ITEM_HEIGHT,
        };
      case 3:
        return {
          width: isMobile ? ITEM_WIDTH / 1.75 : ITEM_WIDTH / 1.25,
          height: isMobile ? ITEM_HEIGHT / 1.75 : ITEM_HEIGHT / 1.25,
        };
      case 4:
        return {
          width: isMobile ? ITEM_WIDTH / 2 : ITEM_WIDTH / 1.5,
          height: isMobile ? ITEM_HEIGHT / 2 : ITEM_HEIGHT / 1.5,
        };
      default:
        return { width: ITEM_WIDTH, height: ITEM_HEIGHT };
    }
  }

  return { width: ITEM_WIDTH, height: ITEM_HEIGHT };
};

const generateCases = (
  numCases: number,
  itemsWon: BaseCaseItem[] | null,
  baseCase: BaseCase,
  startItemIndex = 0,
  cases: BaseCaseItem[][] = []
): BaseCaseItem[][] => {
  const generatedCaseSpins = Array.from({ length: numCases - cases.length }, (_, rootIndex) =>
    Array.from({ length: NUMBER_OF_ITEMS }, (_, index) => {
      if (index === DISTANCE_IN_ITEMS + startItemIndex && itemsWon) {
        return itemsWon[rootIndex];
      }
      const roll = Math.floor(Math.random() * 100000);
      return { ...binarySearch(baseCase.items, roll) };
    })
  );

  return [...cases, ...generatedCaseSpins];
};

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const animationCalculation = (
  currentPosition: number,
  isHorizontal: boolean,
  width: number,
  height: number
): AnimationCalculation => {
  const dimension = isHorizontal ? width : height;
  const distanceInsideCenterItem = currentPosition % dimension;
  const lowerBound = DISTANCE_IN_ITEMS * dimension - distanceInsideCenterItem + 1;
  const upperBound = DISTANCE_IN_ITEMS * dimension + (dimension - distanceInsideCenterItem) - 1;
  const randomAnimationDistance = getRandomInt(lowerBound, upperBound);
  const randomAnimationDistanceMidpoint = (upperBound + lowerBound) / 2;

  return {
    distance: -randomAnimationDistance,
    tickerOffset: randomAnimationDistanceMidpoint - randomAnimationDistance,
  };
};

export const wearToColorAndAbbrev = new Map<string, [string, string]>([
  ["Factory New", ["FN", "text-green-500"]],
  ["Minimal Wear", ["MW", "text-green-400"]],
  ["Field Tested", ["FT", "text-yellow-400"]],
  ["Well Worn", ["WW", "text-orange-400"]],
  ["Battle Scarred", ["BS", "text-red-400"]],
]);

export { generateClientSeed, generateCases, animationCalculation };
