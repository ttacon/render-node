import { z } from 'zod';

// ============================================================================
// Webhook
// ============================================================================

export const WebhookSchema = z.object({
  id: z.string(),
  url: z.string(),
  secret: z.string().optional(),
  enabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Webhook = z.infer<typeof WebhookSchema>;

export const WebhookWithCursorSchema = z.object({
  webhook: WebhookSchema,
  cursor: z.string(),
});
export type WebhookWithCursor = z.infer<typeof WebhookWithCursorSchema>;

// ============================================================================
// Webhook Event
// ============================================================================

export const WebhookEventSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  eventType: z.string(),
  statusCode: z.number().optional(),
  createdAt: z.string(),
  deliveredAt: z.string().optional(),
});
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

export const WebhookEventWithCursorSchema = z.object({
  webhookEvent: WebhookEventSchema,
  cursor: z.string(),
});
export type WebhookEventWithCursor = z.infer<typeof WebhookEventWithCursorSchema>;

// ============================================================================
// Webhook Input
// ============================================================================

export const CreateWebhookInputSchema = z.object({
  url: z.string(),
  secret: z.string().optional(),
  enabled: z.boolean().optional(),
});
export type CreateWebhookInput = z.infer<typeof CreateWebhookInputSchema>;

export const UpdateWebhookInputSchema = z.object({
  url: z.string().optional(),
  secret: z.string().optional(),
  enabled: z.boolean().optional(),
});
export type UpdateWebhookInput = z.infer<typeof UpdateWebhookInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListWebhooksParams {
  cursor?: string;
  limit?: number;
}

export interface ListWebhookEventsParams {
  cursor?: string;
  limit?: number;
}
