import { randomUUID } from "crypto";
import { BaseCaseItem, CaseItemRarity, CaseItemWear, CaseType, ICase } from "@solspin/types";

const mockCsgoCaseItem1: BaseCaseItem = {
  price: 2998.81,
  chance: 0.012, // 1.20%
  id: "1",
  type: "weapon",
  name: "AK-47 | Gold Arabesque",
  imagePath: "https://example.com/ak47_gold_arabesque.png",
  rollNumbers: [0, 11],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.MINIMAL_WEAR,
};

const mockCsgoCaseItem2: BaseCaseItem = {
  price: 2875.02,
  chance: 0.025, // 2.50%
  id: "2",
  type: "weapon",
  name: "M9 Bayonet | Lore",
  imagePath: "https://example.com/m9_bayonet_lore.png",
  rollNumbers: [12, 36],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.MINIMAL_WEAR,
};

const mockCsgoCaseItem3: BaseCaseItem = {
  price: 2164.85,
  chance: 0.028, // 2.80%
  id: "3",
  type: "weapon",
  name: "Butterfly Knife | Tiger Tooth",
  imagePath: "https://example.com/butterfly_knife_tiger_tooth.png",
  rollNumbers: [37, 64],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.MINIMAL_WEAR,
};

const mockCsgoCaseItem4: BaseCaseItem = {
  price: 2051.09,
  chance: 0.03, // 3.00%
  id: "4",
  type: "gloves",
  name: "Sport Gloves | Superconductor",
  imagePath: "https://example.com/sport_gloves_superconductor.png",
  rollNumbers: [65, 94],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FIELD_TESTED,
};

const mockCsgoCaseItem5: BaseCaseItem = {
  price: 1830.57,
  chance: 0.045, // 4.50%
  id: "5",
  type: "weapon",
  name: "Butterfly Knife | Case Hardened",
  imagePath: "https://example.com/butterfly_knife_case_hardened.png",
  rollNumbers: [95, 139],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FACTORY_NEW,
};

const mockCsgoCaseItem6: BaseCaseItem = {
  price: 1402.36,
  chance: 0.08, // 8.00%
  id: "6",
  type: "weapon",
  name: "Karambit | Blue Steel",
  imagePath: "https://example.com/karambit_blue_steel.png",
  rollNumbers: [140, 219],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FACTORY_NEW,
};

const mockCsgoCaseItem7: BaseCaseItem = {
  price: 828.57,
  chance: 0.18, // 18.00%
  id: "7",
  type: "gloves",
  name: "Driver Gloves | Black Tie",
  imagePath: "https://example.com/driver_gloves_black_tie.png",
  rollNumbers: [220, 399],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.MINIMAL_WEAR,
};

const mockCsgoCaseItem8: BaseCaseItem = {
  price: 552.38,
  chance: 0.455, // 45.50%
  id: "8",
  type: "weapon",
  name: "Talon Knife | Case Hardened",
  imagePath: "https://example.com/talon_knife_case_hardened.png",
  rollNumbers: [400, 854],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.BATTLE_SCARRED,
};

const mockCsgoCaseItem9: BaseCaseItem = {
  price: 417.49,
  chance: 1.345, // 134.50%
  id: "9",
  type: "weapon",
  name: "Stiletto Knife | Blue Steel",
  imagePath: "https://example.com/stiletto_knife_blue_steel.png",
  rollNumbers: [855, 2199],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.MINIMAL_WEAR,
};

const mockCsgoCaseItem10: BaseCaseItem = {
  price: 331.86,
  chance: 3.89, // 389.00%
  id: "10",
  type: "weapon",
  name: "Survival Knife | Case Hardened",
  imagePath: "https://example.com/survival_knife_case_hardened.png",
  rollNumbers: [2200, 6089],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.MINIMAL_WEAR,
};

const mockCsgoCaseItem11: BaseCaseItem = {
  price: 322.43,
  chance: 5.0, // 500.00%
  id: "11",
  type: "weapon",
  name: "Falchion Knife | Case Hardened",
  imagePath: "https://example.com/falchion_knife_case_hardened.png",
  rollNumbers: [6090, 11089],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FACTORY_NEW,
};

const mockCsgoCaseItem12: BaseCaseItem = {
  price: 301.81,
  chance: 7.75, // 775.00%
  id: "12",
  type: "weapon",
  name: "Ursus Knife | Case Hardened",
  imagePath: "https://example.com/ursus_knife_case_hardened.png",
  rollNumbers: [11090, 18639],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FIELD_TESTED,
};

const mockCsgoCaseItem13: BaseCaseItem = {
  price: 285.91,
  chance: 13.15, // 1315.00%
  id: "13",
  type: "weapon",
  name: "StatTrak™ Bowie Knife | Case Hardened",
  imagePath: "https://example.com/bowie_knife_case_hardened.png",
  rollNumbers: [18640, 31789],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FIELD_TESTED,
};

const mockCsgoCaseItem14: BaseCaseItem = {
  price: 256.86,
  chance: 16.0, // 1600.00%
  id: "14",
  type: "gloves",
  name: "Moto Gloves | Smoke Out",
  imagePath: "https://example.com/moto_gloves_smoke_out.png",
  rollNumbers: [31790, 47789],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FIELD_TESTED,
};

const mockCsgoCaseItem15: BaseCaseItem = {
  price: 233.37,
  chance: 15.0, // 1500.00%
  id: "15",
  type: "weapon",
  name: "AK-47 | Jet Set",
  imagePath: "https://example.com/ak47_jet_set.png",
  rollNumbers: [47790, 62789],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.FACTORY_NEW,
};

const mockCsgoCaseItem16: BaseCaseItem = {
  price: 136.81,
  chance: 9.61, // 961.00%
  id: "16",
  type: "weapon",
  name: "Survival Knife | Night Stripe",
  imagePath: "https://example.com/survival_knife_night_stripe.png",
  rollNumbers: [62790, 72399],
  rarity: CaseItemRarity.EXTROARDINARY,
  wear: CaseItemWear.BATTLE_SCARRED,
};

const mockCsgoCaseItem17: BaseCaseItem = {
  price: 63.37,
  chance: 7.45, // 745.00%
  id: "17",
  type: "weapon",
  name: "StatTrak™ M4A1-S | Guardian",
  imagePath: "https://example.com/m4a1s_guardian.png",
  rollNumbers: [72400, 79899],
  rarity: CaseItemRarity.RESTRICTED,
  wear: CaseItemWear.BATTLE_SCARRED,
};

const mockCsgoCaseItem18: BaseCaseItem = {
  price: 20.96,
  chance: 19.95, // 1995.00%
  id: "18",
  type: "weapon",
  name: "Tec-9 | Hades",
  imagePath: "https://example.com/tec9_hades.png",
  rollNumbers: [79900, 99899],
  rarity: CaseItemRarity.MIL_SPEC,
  wear: CaseItemWear.FACTORY_NEW,
};

const mockCase: ICase = {
  type: CaseType.CSGO,
  name: "pot-of-gold",
  price: 220,
  id: randomUUID(),
  imagePath: "https://example.com/bravo_case.png",
  rarity: CaseItemRarity.COVERT,
  highestPrice: 2998.81,
  lowestPrice: 20.96,
  tag: "Hot",
  items: [
    mockCsgoCaseItem1,
    mockCsgoCaseItem2,
    mockCsgoCaseItem3,
    mockCsgoCaseItem4,
    mockCsgoCaseItem5,
    mockCsgoCaseItem6,
    mockCsgoCaseItem7,
    mockCsgoCaseItem8,
    mockCsgoCaseItem9,
    mockCsgoCaseItem10,
    mockCsgoCaseItem11,
    mockCsgoCaseItem12,
    mockCsgoCaseItem13,
    mockCsgoCaseItem14,
    mockCsgoCaseItem15,
    mockCsgoCaseItem16,
    mockCsgoCaseItem17,
    mockCsgoCaseItem18,
  ],
  itemPrefixSums: [
    11, 36, 64, 94, 139, 219, 399, 854, 2199, 6089, 11089, 18639, 31789, 47789, 62789, 72399, 79899,
    99899,
  ],
};

export {
  mockCsgoCaseItem1,
  mockCsgoCaseItem2,
  mockCsgoCaseItem3,
  mockCsgoCaseItem4,
  mockCsgoCaseItem5,
  mockCsgoCaseItem6,
  mockCsgoCaseItem7,
  mockCsgoCaseItem8,
  mockCsgoCaseItem9,
  mockCsgoCaseItem10,
  mockCsgoCaseItem11,
  mockCsgoCaseItem12,
  mockCsgoCaseItem13,
  mockCsgoCaseItem14,
  mockCsgoCaseItem15,
  mockCsgoCaseItem16,
  mockCsgoCaseItem17,
  mockCsgoCaseItem18,
  mockCase,
};
