// constants.ts

import { BaseCase, CaseType } from "@solspin/game-engine-types";
import { CaseItemRarity } from "@solspin/types";

export const exampleCase: BaseCase = {
  name: "Watson Power",
  price: 5.42,
  rarity: "Extraordinary",
  highestPrice: 123.23,
  lowestPrice: 0.98,
  tag: "Hot",
  type: CaseType.NFT,
  imagePath: "/cases/dota_3.svg",
  items: [
    {
      id: "item1",
      name: "Gloves | Cobalt Gloves",
      wear: "Factory New",
      price: 42.42,
      rarity: CaseItemRarity.EXTROARDINARY,
      chance: 0.0001,
      rollNumbers: [0, 9],
      imagePath: "/cases/gloves.svg",
    },
    {
      id: "item2",
      name: "AK-47 | Hyper Beast",
      wear: "Minimal Wear",
      price: 27.28,
      rarity: CaseItemRarity.COVERT,
      chance: 0.005,
      rollNumbers: [10, 509],
      imagePath: "/cases/ak47-pink.svg",
    },
    {
      id: "item3",
      name: "AUG | Momentum",
      wear: "Well Worn",
      price: 42.42,
      rarity: CaseItemRarity.COVERT,
      chance: 0.005,
      rollNumbers: [510, 1009],
      imagePath: "/cases/aug.svg",
    },
    {
      id: "item4",
      name: "AK-47 | Asiimov",
      wear: "Field Tested",
      price: 42.42,
      rarity: CaseItemRarity.COVERT,
      chance: 0.02,
      rollNumbers: [1010, 3009],
      imagePath: "/cases/ak47-orange.svg",
    },
    {
      id: "item5",
      name: "USP-S | Neo-Noir",
      wear: "Factory New",
      price: 123.23,
      rarity: CaseItemRarity.CLASSIFIED,
      chance: 0.04,
      rollNumbers: [3010, 7009],
      imagePath: "/cases/usp.svg",
    },
    {
      id: "item6",
      name: "Five-Seven | Graffiti",
      wear: "Battle Scarred",
      price: 42.42,
      rarity: CaseItemRarity.RESTRICTED,
      chance: 0.08,
      rollNumbers: [7010, 15009],
      imagePath: "/cases/five-seven.svg",
    },
    {
      id: "item7",
      name: "Famas | Neural Net",
      wear: "Battle Scarred",
      price: 42.42,
      rarity: CaseItemRarity.MIL_SPEC,
      chance: 0.16,
      rollNumbers: [15010, 31009],
      imagePath: "/cases/gun.svg",
    },
    {
      id: "item8",
      name: "Tec-9 | Decimator",
      wear: "Field Tested",
      price: 42.42,
      rarity: CaseItemRarity.INDUSTRIAL_GRADE,
      chance: 0.32,
      rollNumbers: [31010, 63009],
      imagePath: "/cases/tec-9.svg",
    },
    {
      id: "item9",
      name: "Talon Knife | Doppler",
      wear: "Factory New",
      price: 2400.21,
      rarity: CaseItemRarity.COVERT,
      chance: 0.3699,
      rollNumbers: [63010, 99999],
      imagePath: "/cases/talon-knife.webp",
    },
  ],
  id: "802ce14b-cae8-4ca7-a5be-3b4634c541e1",
  itemPrefixSums: [0.0001, 0.0051, 0.0101, 0.0301, 0.0701, 0.1501, 0.3101, 0.6301, 1.0],
};

// Sort the items by chance
exampleCase.items = exampleCase.items.sort((a, b) => a.chance - b.chance);

export const MAX_ROLL_NUMBER = 99999;
export const CAROUSEL_LENGTH = 51;
export const WINNING_ITEM_POSITION = 44; // 24 + 20
