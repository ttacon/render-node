import { z } from 'zod';

// ============================================================================
// User
// ============================================================================

export const UserSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
});
export type User = z.infer<typeof UserSchema>;
