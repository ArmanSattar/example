import { z } from "zod";

// Define the schema for User
export const UserSchema = z.object({
  username: z.string(),
  userId: z.string().uuid(),
  discord: z.string(),
  createdAt: z.coerce.date().transform((date) => date.toISOString()),
  updatedAt: z.coerce.date().transform((date) => date.toISOString()),
  level: z.number().int(),
  walletAddress: z.string(),
  muteAllSounds: z.boolean(),
  profileImageUrl: z.string(),
});
export const UpdateFieldsSchema = z
  .object({
    username: z.string().optional(),
    discord: z.string().optional(),
    createdAt: z.coerce
      .date()
      .transform((date) => date.toISOString())
      .optional(),
    updatedAt: z.coerce
      .date()
      .transform((date) => date.toISOString())
      .optional(),
    level: z.number().int().optional(),
    muteAllSounds: z.boolean().optional(),
    profileImageUrl: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "updateFields must contain at least one valid field",
  });

// Request Schemas
export const CreateUserRequestSchema = UserSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  username: true,
  discord: true,
  level: true,
  muteAllSounds: true,
  profileImageUrl: true,
});

// Define the schema for the updateUser request
export const UpdateUserRequestSchema = z.object({
  updateFields: UpdateFieldsSchema,
});
export const GetUserByIdRequestSchema = UserSchema.pick({ userId: true });
export const DeleteUserRequestSchema = UserSchema.pick({ userId: true });

// Response Schemas
export const CreateUserResponseSchema = UserSchema;
export const GetUserByIdResponseSchema = UserSchema;

export type User = z.infer<typeof UserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
