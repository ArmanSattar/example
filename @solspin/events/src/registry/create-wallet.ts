import * as z from "zod";
import { EventProvider } from "../types";

export const schema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  walletAddress: z.string(),
});

export type type = z.infer<typeof schema>;

export const event: EventProvider = {
  name: "CreateWallet",
  schema: schema,
};
