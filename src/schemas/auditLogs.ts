import { z } from 'zod';

// ============================================================================
// Audit Logs
// ============================================================================

export const AuditLogActorSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  type: z.enum(['user', 'api_key', 'system']).optional(),
});
export type AuditLogActor = z.infer<typeof AuditLogActorSchema>;

export const AuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().optional(),
  resourceName: z.string().optional(),
  actor: AuditLogActorSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditLogWithCursorSchema = z.object({
  auditLog: AuditLogSchema,
  cursor: z.string(),
});
export type AuditLogWithCursor = z.infer<typeof AuditLogWithCursorSchema>;

export interface ListAuditLogsParams {
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  startTime?: string;
  endTime?: string;
  cursor?: string;
  limit?: number;
}
