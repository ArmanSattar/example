import { z } from "zod";
import { BaseCaseSchema } from "@solspin/game-engine-types";

const SpinPayloadSchema = z.object({
  caseModel: BaseCaseSchema,
  serverSeed: z.string(),
  clientSeed: z.string(),
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

// Export the schemas and types
export { SpinPayloadSchema };

export type SpinPayload = z.infer<typeof SpinPayloadSchema>;
