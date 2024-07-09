import { ICaseItem, ICase, CaseType } from "@solspin/game-engine-types";
import { randomUUID } from "crypto";

const mockCsgoCaseItem1: ICaseItem = {
  type: "csgo",
  name: "AK-47 | Gold Arabesque",
  wear: "Minimal Wear",
  price: 2998.81,
  rarity: "extraordinary",
  chance: 0.012, // 1.20%
  rollNumbers: [0, 11],
  imagePath: "https://example.com/ak47_gold_arabesque.png",
};

const mockCsgoCaseItem2: ICaseItem = {
  type: "csgo",
  name: "M9 Bayonet | Lore",
  wear: "Minimal Wear",
  price: 2875.02,
  rarity: "extraordinary",
  chance: 0.025, // 2.50%
  rollNumbers: [12, 36],
  imagePath: "https://example.com/m9_bayonet_lore.png",
};

const mockCsgoCaseItem3: ICaseItem = {
  type: "csgo",
  name: "Butterfly Knife | Tiger Tooth",
  wear: "Minimal Wear",
  price: 2164.85,
  rarity: "extraordinary",
  chance: 0.028, // 2.80%
  rollNumbers: [37, 64],
  imagePath: "https://example.com/butterfly_knife_tiger_tooth.png",
};

const mockCsgoCaseItem4: ICaseItem = {
  type: "csgo",
  name: "Sport Gloves | Superconductor",
  wear: "Field-Tested",
  price: 2051.09,
  rarity: "extraordinary",
  chance: 0.03, // 3.00%
  rollNumbers: [65, 94],
  imagePath: "https://example.com/sport_gloves_superconductor.png",
};

const mockCsgoCaseItem5: ICaseItem = {
  type: "csgo",
  name: "Butterfly Knife | Case Hardened",
  wear: "Factory New",
  price: 1830.57,
  rarity: "extraordinary",
  chance: 0.045, // 4.50%
  rollNumbers: [95, 139],
  imagePath: "https://example.com/butterfly_knife_case_hardened.png",
};

const mockCsgoCaseItem6: ICaseItem = {
  type: "csgo",
  name: "Karambit | Blue Steel",
  wear: "Factory New",
  price: 1402.36,
  rarity: "extraordinary",
  chance: 0.08, // 8.00%
  rollNumbers: [140, 219],
  imagePath: "https://example.com/karambit_blue_steel.png",
};

const mockCsgoCaseItem7: ICaseItem = {
  type: "csgo",
  name: "Driver Gloves | Black Tie",
  wear: "Minimal Wear",
  price: 828.57,
  rarity: "extraordinary",
  chance: 0.18, // 18.00%
  rollNumbers: [220, 399],
  imagePath: "https://example.com/driver_gloves_black_tie.png",
};

const mockCsgoCaseItem8: ICaseItem = {
  type: "csgo",
  name: "Talon Knife | Case Hardened",
  wear: "Battle-Scarred",
  price: 552.38,
  rarity: "extraordinary",
  chance: 0.455, // 45.50%
  rollNumbers: [400, 854],
  imagePath: "https://example.com/talon_knife_case_hardened.png",
};

const mockCsgoCaseItem9: ICaseItem = {
  type: "csgo",
  name: "Stiletto Knife | Blue Steel",
  wear: "Minimal Wear",
  price: 417.49,
  rarity: "extraordinary",
  chance: 1.345, // 134.50%
  rollNumbers: [855, 2199],
  imagePath: "https://example.com/stiletto_knife_blue_steel.png",
};

const mockCsgoCaseItem10: ICaseItem = {
  type: "csgo",
  name: "Survival Knife | Case Hardened",
  wear: "Minimal Wear",
  price: 331.86,
  rarity: "extraordinary",
  chance: 3.89, // 389.00%
  rollNumbers: [2200, 6089],
  imagePath: "https://example.com/survival_knife_case_hardened.png",
};

const mockCsgoCaseItem11: ICaseItem = {
  type: "csgo",
  name: "Falchion Knife | Case Hardened",
  wear: "Factory New",
  price: 322.43,
  rarity: "extraordinary",
  chance: 5.0, // 500.00%
  rollNumbers: [6090, 11089],
  imagePath: "https://example.com/falchion_knife_case_hardened.png",
};

const mockCsgoCaseItem12: ICaseItem = {
  type: "csgo",
  name: "Ursus Knife | Case Hardened",
  wear: "Field-Tested",
  price: 301.81,
  rarity: "extraordinary",
  chance: 7.75, // 775.00%
  rollNumbers: [11090, 18639],
  imagePath: "https://example.com/ursus_knife_case_hardened.png",
};

const mockCsgoCaseItem13: ICaseItem = {
  type: "csgo",
  name: "StatTrak™ Bowie Knife | Case Hardened",
  wear: "Field-Tested",
  price: 285.91,
  rarity: "extraordinary",
  chance: 13.15, // 1315.00%
  rollNumbers: [18640, 31789],
  imagePath: "https://example.com/bowie_knife_case_hardened.png",
};

const mockCsgoCaseItem14: ICaseItem = {
  type: "csgo",
  name: "Moto Gloves | Smoke Out",
  wear: "Field-Tested",
  price: 256.86,
  rarity: "extraordinary",
  chance: 16.0, // 1600.00%
  rollNumbers: [31790, 47789],
  imagePath: "https://example.com/moto_gloves_smoke_out.png",
};

const mockCsgoCaseItem15: ICaseItem = {
  type: "csgo",
  name: "AK-47 | Jet Set",
  wear: "Factory New",
  price: 233.37,
  rarity: "extraordinary",
  chance: 15.0, // 1500.00%
  rollNumbers: [47790, 62789],
  imagePath: "https://example.com/ak47_jet_set.png",
};

const mockCsgoCaseItem16: ICaseItem = {
  type: "csgo",
  name: "Survival Knife | Night Stripe",
  wear: "Battle-Scarred",
  price: 136.81,
  rarity: "extraordinary",
  chance: 9.61, // 961.00%
  rollNumbers: [62790, 72399],
  imagePath: "https://example.com/survival_knife_night_stripe.png",
};

const mockCsgoCaseItem17: ICaseItem = {
  type: "csgo",
  name: "StatTrak™ M4A1-S | Guardian",
  wear: "Battle-Scarred",
  price: 63.37,
  rarity: "restricted",
  chance: 7.45, // 745.00%
  rollNumbers: [72400, 79899],
  imagePath: "https://example.com/m4a1s_guardian.png",
};

const mockCsgoCaseItem18: ICaseItem = {
  type: "csgo",
  name: "Tec-9 | Hades",
  wear: "Factory New",
  price: 20.96,
  rarity: "mil-spec",
  chance: 19.95, // 1995.00%
  rollNumbers: [79900, 99899],
  imagePath: "https://example.com/tec9_hades.png",
};

const mockCase: ICase = {
  id: randomUUID(),
  name: "pot-of-gold",
  price: 220,
  rarity: "legendary",
  highestPrice: 2998.81,
  lowestPrice: 20.96,
  tag: "csgo",
  image: "https://example.com/bravo_case.png",
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
