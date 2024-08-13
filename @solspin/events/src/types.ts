import * as z from "zod";
import { Service } from "../types/src";

export interface EventBody<T> {
  publisher: Service;
  metadata: {
    requestId?: string;
  };
  payload: T;
}

export interface EventProvider {
  name: string;
  schema: z.ZodSchema;
}
