import { z } from 'zod';

// ============================================================================
// Header
// ============================================================================

export const HeaderSchema = z.object({
  id: z.string(),
  path: z.string(),
  name: z.string(),
  value: z.string(),
});
export type Header = z.infer<typeof HeaderSchema>;

export const HeaderWithCursorSchema = z.object({
  header: HeaderSchema,
  cursor: z.string(),
});
export type HeaderWithCursor = z.infer<typeof HeaderWithCursorSchema>;

// ============================================================================
// Header Input
// ============================================================================

export const HeaderInputSchema = z.object({
  path: z.string(),
  name: z.string(),
  value: z.string(),
});
export type HeaderInput = z.infer<typeof HeaderInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListHeadersParams {
  path?: string;
  name?: string;
  cursor?: string;
  limit?: number;
}
