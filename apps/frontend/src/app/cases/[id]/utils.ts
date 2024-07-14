// import { v4 as uuidv4 } from "uuid";
// import { BaseCaseItem } from "@solspin/game-engine-types";
// import { CAROUSEL_LENGTH, exampleCase, MAX_ROLL_NUMBER, WINNING_ITEM_POSITION } from "./constants";
//
// export const generateClientSeed = async (): Promise<string> => {
//   const array = new Uint8Array(16);
//   crypto.getRandomValues(array);
//   return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
// };
//
// export const generateItemWon = (items: BaseCaseItem[]): BaseCaseItem => {
//   const roll = Math.floor(Math.random() * 100000); // Generate a random number between 0 and 99999
//   const selectedItem = items.find(
//     (item) => roll >= item.rollNumbers[0] && roll <= item.rollNumbers[1]
//   );
//
//   if (!selectedItem) {
//     throw new Error("No item found for roll number: " + roll);
//   }
//   return selectedItem;
// };
//
// export const generateCases = (itemsWon: BaseCaseItem[] | null[]): BaseCaseItem[][] => {
//   let endItems: BaseCaseItem[] = itemsWon.map((item, index) => {
//     if (item) {
//       return item;
//     } else {
//       return generateItemWon(exampleCase.items);
//     }
//   });
//
//   return endItems.map((endItem) => {
//     return Array.from({ length: CAROUSEL_LENGTH }, (_, index) => {
//       if (index === WINNING_ITEM_POSITION + 1) {
//         return { ...endItem, id: uuidv4() };
//       }
//       const roll = Math.floor(Math.random() * (MAX_ROLL_NUMBER + 1));
//       const selectedItem = exampleCase.items.find(
//         (item) => roll >= item.rollNumbers[0] && roll <= item.rollNumbers[1]
//       );
//
//       if (!selectedItem) {
//         throw new Error("No item found for roll number: " + roll);
//       }
//       return { ...selectedItem, id: uuidv4() };
//     });
//   });
// };
