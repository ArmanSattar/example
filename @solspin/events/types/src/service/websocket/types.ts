import { z } from "zod";

const ConnectionInfoSchema = z.object({
  isAuthenticated: z.boolean(),
  userId: z.string().uuid().optional(),
  serverSeed: z.string().optional(),
  connectionId: z.string(),
});

const ActiveConnectionsSchema = z.object({
  id: z.string(),
  activeConnections: z.number().min(0).positive(),
});
const ChatMessageSchema = z.object({
  messageId: z.string().uuid(),
  message: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(250, { message: "Message cannot exceed 250 characters" })
    .refine((msg) => !/^\s+$/.test(msg), { message: "Message cannot contain only whitespace" }),
  sentAt: z.number().int().positive(),
  userId: z.string().uuid(),
  username: z.string(),
  profileImageUrl: z.string(),
  channel: z.string().optional(),
  expirationTime: z.number(),
});

const WebSocketOrchestrationPayloadSchema = z.object({
  caseId: z.string().uuid(),
  clientSeed: z.string().regex(/^[a-zA-Z0-9]+$/),
  spins: z.number().int().min(1).max(4).positive(),
});

const WebSocketChatMessagePayloadSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(250, { message: "Message cannot exceed 250 characters" })
    .refine((msg) => !/^\s+$/.test(msg), { message: "Message cannot contain only whitespace" }),
});
const WebSocketChatMessageResponseSchema = ChatMessageSchema.pick({
  message: true,
  sentAt: true,
  username: true,
  profileImageUrl: true,
});

export {
  ConnectionInfoSchema,
  ActiveConnectionsSchema,
  WebSocketOrchestrationPayloadSchema,
  WebSocketChatMessagePayloadSchema,
  ChatMessageSchema,
  WebSocketChatMessageResponseSchema,
};

export type ConnectionInfo = z.infer<typeof ConnectionInfoSchema>;
export type ActiveConnections = z.infer<typeof ActiveConnectionsSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type WebSocketOrchestrationPayload = z.infer<typeof WebSocketOrchestrationPayloadSchema>;
export type WebSocketChatMessagePayload = z.infer<typeof WebSocketChatMessagePayloadSchema>;
