import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";

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
    Array.from({ length: 71 }, (_, index) => {
      if (index === 55 && itemsWon) {
        return itemsWon[rootIndex];
      }

      const roll = Math.floor(Math.random() * 100000);
      return { ...binarySearch(baseCase.items, roll) };
    })
  );
};

export { generateClientSeed, generateCases };
