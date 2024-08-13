import { z } from "zod";
import { BaseCaseItemSchema, BaseCaseSchema } from "../game-engine/types";

const SpinPayloadSchema = z.object({
  caseModel: BaseCaseSchema,
  serverSeed: z.string(),
  clientSeed: z.string(),
  spins: z.number().int().min(1).max(4).positive(),
});

const SpinResultSchema = z.object({
  rewardItem: BaseCaseItemSchema,
  rollValue: z.number().positive().min(1).max(99999),
});
// Request Schemas
export const CreateSpinPayloadRequestSchema = SpinPayloadSchema;
export const GetSpinPayloadByServerSeedRequestSchema = SpinPayloadSchema.pick({ serverSeed: true });
export const GetSpinPayloadByClientSeedRequestSchema = SpinPayloadSchema.pick({ clientSeed: true });

// Query Schemas
export const SpinPayloadQuerySchema = z.object({
  caseModel: z.string().optional(),
  serverSeed: z.string().optional(),
  clientSeed: z.string().optional(),
});

// Response Schemas
export const CreateSpinPayloadResponseSchema = SpinPayloadSchema;
export const GetSpinPayloadByServerSeedResponseSchema = SpinPayloadSchema;
export const GetSpinPayloadByClientSeedResponseSchema = SpinPayloadSchema;

export const SpinResponseSchema = z.object({
  caseItems: z.array(SpinResultSchema),
  serverSeed: z.string(),
});
// Export the schemas and types
export { SpinPayloadSchema };

export type SpinPayload = z.infer<typeof SpinPayloadSchema>;
export type SpinResponse = z.infer<typeof SpinResponseSchema>;
