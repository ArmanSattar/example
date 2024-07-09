import { number, z } from "zod";

const CaseType = z.enum(["nft", "csgo"]);

const ICaseItemSchema = z.object({
  type: CaseType,
  name: z.string(),
  wear: z.string(),
  price: z.number(),
  rarity: z.string(),
  chance: z.number(),
  rollNumbers: z.array(z.number()),
  imagePath: z.string().url(),
});

const ICaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  rarity: z.string(),
  highestPrice: z.number(),
  lowestPrice: z.number(),
  tag: z.string(),
  image: z.string().url(),
  items: z.array(ICaseItemSchema),
  itemPrefixSums: z.array(z.number()),
});
export const GetCaseByIdRequestSchema = ICaseSchema.pick({ id: true });

export const GetCaseByIdResponseSchema = ICaseSchema;
export { ICaseItemSchema, ICaseSchema };

export type ICaseItem = z.infer<typeof ICaseItemSchema>;
export type ICase = z.infer<typeof ICaseSchema>;
export type CaseType = z.infer<typeof CaseType>;
