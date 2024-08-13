import { z } from "zod";

export enum CaseType {
  NFT = "NFT",
  CSGO = "CSGO",
}

// Define the CaseType enum using Zod
const CaseTypeSchema = z.nativeEnum(CaseType);

const CaseItemRarity = z.enum([
  "Consumer Grade",
  "Industrial Grade",
  "Mil Spec",
  "Restricted",
  "Classified",
  "Covert",
  "Extraordinary",
  "Contraband",
]);

const CaseItemWear = z.enum([
  "Factory New",
  "Minimal Wear",
  "Field Tested",
  "Well Worn",
  "Battle Scarred",
  "Not Applicable",
]);

// Define the schema for BaseCaseItem
const BaseCaseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  wear: CaseItemWear,
  price: z.number(),
  rarity: CaseItemRarity,
  chance: z.number(),
  rollNumbers: z.array(z.number()),
  imagePath: z.string(),
});

const BaseCaseSchema = z.object({
  name: z.string(),
  price: z.number(),
  rarity: z.string(),
  highestPrice: z.number(),
  lowestPrice: z.number(),
  tag: z.string(),
  imagePath: z.string(),
  items: z.array(BaseCaseItemSchema),
  type: CaseTypeSchema,
  id: z.string().uuid(),
  itemPrefixSums: z.array(z.number()),
});

const CaseOverviewSchema = BaseCaseSchema;

export const GetCaseByIdRequestSchema = BaseCaseSchema.pick({ id: true });

export const CaseQuerySchema = z.object({
  caseType: CaseTypeSchema.optional(),
  caseName: z.string().optional(),
  casePrice: z.number().positive().optional(),
});

export const GetCaseByIdResponseSchema = BaseCaseSchema;

export { BaseCaseItemSchema, BaseCaseSchema, CaseOverviewSchema };

export type SpinResult = {
  rewardItem: BaseCaseItem;
  rollValue: number;
};
export type BaseCaseItem = z.infer<typeof BaseCaseItemSchema>;
export type BaseCase = z.infer<typeof BaseCaseSchema>;
export type Case = z.infer<typeof BaseCaseSchema>;
export type CaseOverview = z.infer<typeof CaseOverviewSchema>;
