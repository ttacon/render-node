import { z } from 'zod';

// ============================================================================
// Logs
// ============================================================================

export const LogEntrySchema = z.object({
  timestamp: z.string(),
  message: z.string(),
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  instanceId: z.string().optional(),
});
export type LogEntry = z.infer<typeof LogEntrySchema>;

export interface ListLogsParams {
  resourceIds?: string[];
  ownerId?: string;
  severity?: 'debug' | 'info' | 'warn' | 'error';
  startTime?: string;
  endTime?: string;
  direction?: 'forward' | 'backward';
  cursor?: string;
  limit?: number;
}

export interface LogStreamConfig {
  endpoint: string;
  token?: string;
}
