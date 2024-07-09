export type ICaseItem = {
  type: string;
  name: string;
  wear: string;
  price: number;
  rarity: string;
  chance: number;
  rollNumbers: number[];
  imagePath: string;
};

export type ICase = {
  name: string;
  price: number;
  rarity: string;
  highestPrice: number;
  lowestPrice: number;
  tag: string;
  image: string;
  items: ICaseItem[];
};

export type ICarouselItem = {
  name: string;
  price: number;
  rarity: string;
  imagePath: string;
};

export enum CaseItemRarity {
  CONSUMER_GRADE = "Consumer Grade",
  INDUSTRIAL_GRADE = "Industrial Grade",
  MIL_SPEC = "Mil-Spec",
  RESTRICTED = "Restricted",
  CLASSIFIED = "Classified",
  COVERT = "Covert",
  EXTROARDINARY = "Extraordinary",
  CONTRABAND = "Contraband",
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

if (!process.env.NEXT_PUBLIC_HOUSE_WALLET_PUBLIC_KEY) {
  throw new Error("House wallet address not provided");
}

if (!process.env.NEXT_PUBLIC_WALLETS_API_URL) {
  throw new Error("Wallets API URL not provided");
}

export const HOUSE_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOUSE_WALLET_PUBLIC_KEY;
export const WALLETS_API_URL = process.env.NEXT_PUBLIC_WALLETS_API_URL;
