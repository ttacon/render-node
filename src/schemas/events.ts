import { z } from 'zod';

// ============================================================================
// Events
// ============================================================================

export const EventSchema = z.object({
  id: z.string(),
  type: z.string(),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  timestamp: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type Event = z.infer<typeof EventSchema>;

export const EventWithCursorSchema = z.object({
  event: EventSchema,
  cursor: z.string(),
});
export type EventWithCursor = z.infer<typeof EventWithCursorSchema>;

export interface ListEventsParams {
  cursor?: string;
  limit?: number;
}
