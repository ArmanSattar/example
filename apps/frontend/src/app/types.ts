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

export interface IFilters {
  category: string[];
  rarity: string[];
  order: string[];
  price: string[];
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

if (!process.env.NEXT_PUBLIC_HOUSE_WALLET_PUBLIC_KEY) {
  throw new Error("House wallet address not provided");
}

if (!process.env.NEXT_PUBLIC_WALLETS_API_URL) {
  throw new Error("Wallets API URL not provided");
}

if (!process.env.NEXT_PUBLIC_GET_CASES_URL) {
  throw new Error("Get cases URL not provided");
}
export const GET_CASES_URL = process.env.NEXT_PUBLIC_GET_CASES_URL;
export const HOUSE_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOUSE_WALLET_PUBLIC_KEY;
export const WALLETS_API_URL = process.env.NEXT_PUBLIC_WALLETS_API_URL;
