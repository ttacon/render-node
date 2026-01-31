import { z } from 'zod';
import { EnvVarSchema, SecretFileSchema } from './common.js';

// ============================================================================
// Environment Group
// ============================================================================

export const EnvGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  envVars: z.array(EnvVarSchema),
  secretFiles: z.array(SecretFileSchema),
  serviceLinks: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
      }),
    )
    .optional(),
});
export type EnvGroup = z.infer<typeof EnvGroupSchema>;

export const EnvGroupWithCursorSchema = z.object({
  envGroup: EnvGroupSchema,
  cursor: z.string(),
});
export type EnvGroupWithCursor = z.infer<typeof EnvGroupWithCursorSchema>;

// ============================================================================
// Environment Group Input
// ============================================================================

export const CreateEnvGroupInputSchema = z.object({
  name: z.string(),
  ownerId: z.string(),
  envVars: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  secretFiles: z
    .array(
      z.object({
        name: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});
export type CreateEnvGroupInput = z.infer<typeof CreateEnvGroupInputSchema>;

export const UpdateEnvGroupInputSchema = z.object({
  name: z.string().optional(),
  envVars: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  secretFiles: z
    .array(
      z.object({
        name: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});
export type UpdateEnvGroupInput = z.infer<typeof UpdateEnvGroupInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListEnvGroupsParams {
  name?: string;
  ownerId?: string | string[];
  cursor?: string;
  limit?: number;
}
