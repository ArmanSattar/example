// Enum value representing each microservice
import { BaseCaseItem } from "@solspin/game-engine-types";

export const enum Service {
  BETTING = "betting_service",
  GAME = "game_service",
  ORCHESTRATION = "orchestration_service",
  TREASURY = "treasury_service",
  USER = "user_service",
  WALLET = "wallet_service",
}

export enum CaseItemWear {
  FACTORY_NEW = "Factory New",
  MINIMAL_WEAR = "Minimal Wear",
  FIELD_TESTED = "Field Tested",
  WELL_WORN = "Well Worn",
  BATTLE_SCARRED = "Battle Scarred",
  NOT_APPLICABLE = "Not Applicable",
}

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

export enum CaseType {
  CSGO = "csgo",
  NFT = "nft",
}

export interface CsgoCaseItem extends BaseCaseItem {
  is_stattrak: boolean;
  is_souvenir: boolean;
  item_wear: string;
}

export type NftCaseItem = BaseCaseItem;

export type CaseItem = CsgoCaseItem | NftCaseItem;
