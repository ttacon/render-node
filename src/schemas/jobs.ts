import { z } from 'zod';

// ============================================================================
// Job
// ============================================================================

export const JobStatusSchema = z.enum(['pending', 'running', 'succeeded', 'failed', 'canceled']);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  startCommand: z.string().optional(),
  planId: z.string().optional(),
  status: JobStatusSchema,
  createdAt: z.string(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
});
export type Job = z.infer<typeof JobSchema>;

export const JobWithCursorSchema = z.object({
  job: JobSchema,
  cursor: z.string(),
});
export type JobWithCursor = z.infer<typeof JobWithCursorSchema>;

// ============================================================================
// Job Input
// ============================================================================

export const CreateJobInputSchema = z.object({
  startCommand: z.string(),
  planId: z.string().optional(),
});
export type CreateJobInput = z.infer<typeof CreateJobInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListJobsParams {
  status?: JobStatus;
  createdBefore?: string;
  createdAfter?: string;
  startedBefore?: string;
  startedAfter?: string;
  finishedBefore?: string;
  finishedAfter?: string;
  cursor?: string;
  limit?: number;
}
