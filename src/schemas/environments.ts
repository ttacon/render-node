import { z } from 'zod';
import { ProtectedStatusSchema } from './common.js';

// ============================================================================
// Environment
// ============================================================================

export const EnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  protectedStatus: ProtectedStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Environment = z.infer<typeof EnvironmentSchema>;

export const EnvironmentWithCursorSchema = z.object({
  environment: EnvironmentSchema,
  cursor: z.string(),
});
export type EnvironmentWithCursor = z.infer<typeof EnvironmentWithCursorSchema>;

// ============================================================================
// Environment Input
// ============================================================================

export const CreateEnvironmentInputSchema = z.object({
  name: z.string(),
  projectId: z.string(),
  protectedStatus: ProtectedStatusSchema.optional(),
});
export type CreateEnvironmentInput = z.infer<typeof CreateEnvironmentInputSchema>;

export const UpdateEnvironmentInputSchema = z.object({
  name: z.string().optional(),
  protectedStatus: ProtectedStatusSchema.optional(),
});
export type UpdateEnvironmentInput = z.infer<typeof UpdateEnvironmentInputSchema>;

export const AddResourcesInputSchema = z.object({
  resourceIds: z.array(z.string()),
});
export type AddResourcesInput = z.infer<typeof AddResourcesInputSchema>;

export const RemoveResourcesInputSchema = z.object({
  resourceIds: z.array(z.string()),
});
export type RemoveResourcesInput = z.infer<typeof RemoveResourcesInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListEnvironmentsParams {
  projectId?: string;
  cursor?: string;
  limit?: number;
}
