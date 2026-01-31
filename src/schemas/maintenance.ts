import { z } from 'zod';

// ============================================================================
// Maintenance
// ============================================================================

export const MaintenanceRunSchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  resourceType: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']),
  scheduledAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  description: z.string().optional(),
});
export type MaintenanceRun = z.infer<typeof MaintenanceRunSchema>;

export const MaintenanceRunWithCursorSchema = z.object({
  maintenanceRun: MaintenanceRunSchema,
  cursor: z.string(),
});
export type MaintenanceRunWithCursor = z.infer<typeof MaintenanceRunWithCursorSchema>;

export const UpdateMaintenanceInputSchema = z.object({
  scheduledAt: z.string(),
});
export type UpdateMaintenanceInput = z.infer<typeof UpdateMaintenanceInputSchema>;

export interface ListMaintenanceParams {
  resourceId?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  cursor?: string;
  limit?: number;
}
