import { z } from 'zod';

// ============================================================================
// Blueprint
// ============================================================================

export const BlueprintStatusSchema = z.enum(['synced', 'syncing', 'error', 'paused']);
export type BlueprintStatus = z.infer<typeof BlueprintStatusSchema>;

export const BlueprintResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    'static_site',
    'web_service',
    'private_service',
    'background_worker',
    'cron_job',
    'redis',
    'key_value',
    'postgres',
    'environment_group',
  ]),
});
export type BlueprintResource = z.infer<typeof BlueprintResourceSchema>;

export const BlueprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: BlueprintStatusSchema,
  autoSync: z.boolean(),
  repo: z.string(),
  branch: z.string(),
  lastSync: z.string().optional(),
  resources: z.array(BlueprintResourceSchema).optional(),
});
export type Blueprint = z.infer<typeof BlueprintSchema>;

export const BlueprintWithCursorSchema = z.object({
  blueprint: BlueprintSchema,
  cursor: z.string(),
});
export type BlueprintWithCursor = z.infer<typeof BlueprintWithCursorSchema>;

// ============================================================================
// Blueprint Sync
// ============================================================================

export const BlueprintSyncSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});
export type BlueprintSync = z.infer<typeof BlueprintSyncSchema>;

export const BlueprintSyncWithCursorSchema = z.object({
  sync: BlueprintSyncSchema,
  cursor: z.string(),
});
export type BlueprintSyncWithCursor = z.infer<typeof BlueprintSyncWithCursorSchema>;

// ============================================================================
// Blueprint Input
// ============================================================================

export const UpdateBlueprintInputSchema = z.object({
  name: z.string().optional(),
  autoSync: z.boolean().optional(),
});
export type UpdateBlueprintInput = z.infer<typeof UpdateBlueprintInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListBlueprintsParams {
  ownerId?: string | string[];
  cursor?: string;
  limit?: number;
}

export interface ListBlueprintSyncsParams {
  cursor?: string;
  limit?: number;
}
