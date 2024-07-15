import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";

const DISTANCE_IN_ITEMS = 30;
const ITEM_WIDTH = 192;
const ITEM_HEIGHT = 192;
const NUMBER_OF_ITEMS = 51;

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

const generateCases = (
  numCases: number,
  itemsWon: BaseCaseItem[] | null,
  baseCase: BaseCase
): BaseCaseItem[][] => {
  return Array.from({ length: numCases }, (_, rootIndex) =>
    Array.from({ length: NUMBER_OF_ITEMS }, (_, index) => {
      if (index === DISTANCE_IN_ITEMS && itemsWon) {
        return itemsWon[rootIndex];
      }

      const roll = Math.floor(Math.random() * 100000);
      return { ...binarySearch(baseCase.items, roll) };
    })
  );
};

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export type AnimationCalculation = {
  distance: number;
  tickerOffset: number;
};

const animationDistanceBounds = {
  lower: (DISTANCE_IN_ITEMS - 0.5) * ITEM_WIDTH,
  upper: (DISTANCE_IN_ITEMS + 0.5) * ITEM_WIDTH,
  midpoint: DISTANCE_IN_ITEMS * ITEM_WIDTH,
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

const dummyItems = Array.from({ length: NUMBER_OF_ITEMS }, (_, index) => ({}));
const itemOffsets = dummyItems.map((_, index) => index * ITEM_WIDTH);

export {
  generateClientSeed,
  generateCases,
  itemOffsets,
  animationDistanceBounds,
  animationCalculation,
  DISTANCE_IN_ITEMS,
  ITEM_WIDTH,
  ITEM_HEIGHT,
  NUMBER_OF_ITEMS,
};
