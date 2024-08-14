import * as z from "zod";
import { EventProvider } from "../types";

export const schema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number(), // Can be positive or negative. Equal to Outcome Amount - Amount Bet.
});

export type type = z.infer<typeof schema>;

export const event: EventProvider = {
  name: "BetTransaction",
  schema: schema,
};
