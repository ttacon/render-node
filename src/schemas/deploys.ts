import { z } from 'zod';
import { DeployStatusSchema, DeployTriggerSchema } from './common.js';

// ============================================================================
// Deploy Commit
// ============================================================================

export const DeployCommitSchema = z.object({
  id: z.string(),
  message: z.string().optional(),
  createdAt: z.string().optional(),
});
export type DeployCommit = z.infer<typeof DeployCommitSchema>;

// ============================================================================
// Deploy Image
// ============================================================================

export const DeployImageSchema = z.object({
  ref: z.string().optional(),
  sha: z.string().optional(),
  registryCredential: z.string().optional(),
});
export type DeployImage = z.infer<typeof DeployImageSchema>;

// ============================================================================
// Deploy
// ============================================================================

export const DeploySchema = z.object({
  id: z.string(),
  commit: DeployCommitSchema.optional(),
  image: DeployImageSchema.optional(),
  status: DeployStatusSchema.optional(),
  trigger: DeployTriggerSchema.optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Deploy = z.infer<typeof DeploySchema>;

export const DeployWithCursorSchema = z.object({
  deploy: DeploySchema,
  cursor: z.string(),
});
export type DeployWithCursor = z.infer<typeof DeployWithCursorSchema>;

// ============================================================================
// Deploy Input Types
// ============================================================================

export const CreateDeployInputSchema = z.object({
  /**
   * Defaults to "clear" - Whether to clear the build cache before deploying
   */
  clearCache: z.enum(['clear', 'do_not_clear']).optional(),
  /**
   * The Git commit ID to deploy. If not provided, uses the latest commit.
   */
  commitId: z.string().optional(),
  /**
   * The image URL to deploy. Only used for Docker-based services.
   */
  imageUrl: z.string().optional(),
});
export type CreateDeployInput = z.infer<typeof CreateDeployInputSchema>;

export const RollbackDeployInputSchema = z.object({
  /**
   * The deploy ID to roll back to
   */
  deployId: z.string(),
});
export type RollbackDeployInput = z.infer<typeof RollbackDeployInputSchema>;

// ============================================================================
// Deploy List Params
// ============================================================================

export interface ListDeploysParams {
  /**
   * Filter to builds that were live at this time
   */
  startTime?: string;
  /**
   * Filter to builds that were live at this time
   */
  endTime?: string;
  cursor?: string;
  limit?: number;
}
