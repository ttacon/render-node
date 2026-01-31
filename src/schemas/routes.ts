import { z } from 'zod';

// ============================================================================
// Route
// ============================================================================

export const RouteTypeSchema = z.enum(['redirect', 'rewrite']);
export type RouteType = z.infer<typeof RouteTypeSchema>;

export const RouteSchema = z.object({
  id: z.string(),
  type: RouteTypeSchema,
  source: z.string(),
  destination: z.string(),
  priority: z.number().optional(),
});
export type Route = z.infer<typeof RouteSchema>;

export const RouteWithCursorSchema = z.object({
  route: RouteSchema,
  cursor: z.string(),
});
export type RouteWithCursor = z.infer<typeof RouteWithCursorSchema>;

// ============================================================================
// Route Input
// ============================================================================

export const RouteInputSchema = z.object({
  type: RouteTypeSchema,
  source: z.string(),
  destination: z.string(),
  priority: z.number().optional(),
});
export type RouteInput = z.infer<typeof RouteInputSchema>;

export const RoutePatchInputSchema = z.object({
  id: z.string(),
  type: RouteTypeSchema.optional(),
  source: z.string().optional(),
  destination: z.string().optional(),
  priority: z.number().optional(),
});
export type RoutePatchInput = z.infer<typeof RoutePatchInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListRoutesParams {
  type?: 'redirect' | 'rewrite';
  source?: string;
  destination?: string;
  cursor?: string;
  limit?: number;
}
