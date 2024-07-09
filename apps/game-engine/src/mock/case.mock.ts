import { BaseCaseItem, CaseItemRarity, CaseItemWear, ICase } from "@solspin/types";
import { CaseType } from "../enums/caseType";
import { randomUUID } from "crypto";

const mockCsgoCaseItem1: BaseCaseItem = {
  id: 1,
  price: 10.5,
  chance: 0.05, // 5%
  type: "AK-47",
  name: "Redline",
  imagePath: "https://example.com/ak47_redline.png",
  rollNumbers: [0, 4999],
  rarity: CaseItemRarity.COVERT,
  wear: CaseItemWear.FIELD_TESTED,
};

const mockCsgoCaseItem2: BaseCaseItem = {
  id: 2,
  price: 15,
  chance: 0.1, // 10%
  type: "AWP",
  name: "Asiimov",
  imagePath: "https://example.com/awp_asiimov.png",
  rollNumbers: [5000, 14999],
  rarity: CaseItemRarity.CLASSIFIED,
  wear: CaseItemWear.MINIMAL_WEAR,
};

const mockCsgoCaseItem3: BaseCaseItem = {
  id: 3,
  price: 5,
  chance: 0.2, // 20%
  type: "Desert Eagle",
  name: "Blaze",
  imagePath: "https://example.com/deagle_blaze.png",
  rollNumbers: [15000, 34999],
  rarity: CaseItemRarity.RESTRICTED,
  wear: CaseItemWear.FACTORY_NEW,
};

const mockNftCaseItem1: BaseCaseItem = {
  id: 4,
  price: 20,
  chance: 0.01, // 1%
  type: "NFT",
  name: "CryptoPunk #1234",
  imagePath: "https://example.com/cryptopunk_1234.png",
  rollNumbers: [35000, 35999],
  rarity: CaseItemRarity.CONTRABAND,
  wear: CaseItemWear.NOT_APPLICABLE,
};

const mockNftCaseItem2: BaseCaseItem = {
  id: 5,
  price: 18,
  chance: 0.05, // 5%
  type: "NFT",
  name: "Bored Ape #5678",
  imagePath: "https://example.com/boredape_5678.png",
  rollNumbers: [36000, 40999],
  rarity: CaseItemRarity.COVERT,
  wear: CaseItemWear.NOT_APPLICABLE,
};

const mockNftCaseItem3: BaseCaseItem = {
  id: 6,
  price: 12,
  chance: 0.59, // 59%
  type: "NFT",
  name: "Art Block #9012",
  imagePath: "https://example.com/artblock_9012.png",
  rollNumbers: [41000, 99999],
  rarity: CaseItemRarity.MIL_SPEC,
  wear: CaseItemWear.NOT_APPLICABLE,
};

const mockCase: ICase = {
  type: CaseType.CSGO,
  name: "test-case",
  id: randomUUID(),
  price: 2.5,
  imagePath: "https://example.com/bravo_case.png",
  rarity: CaseItemRarity.COVERT,
  highestPrice: 20,
  lowestPrice: 5,
  tag: "Hot",
  items: [
    mockCsgoCaseItem1,
    mockCsgoCaseItem2,
    mockCsgoCaseItem3,
    mockNftCaseItem1,
    mockNftCaseItem2,
    mockNftCaseItem3,
  ],
  itemPrefixSums: [4999, 14999, 34999, 35999, 40999, 99999],
};

export {
  mockCsgoCaseItem1,
  mockCsgoCaseItem2,
  mockCsgoCaseItem3,
  mockNftCaseItem1,
  mockNftCaseItem2,
  mockNftCaseItem3,
  mockCase,
};
