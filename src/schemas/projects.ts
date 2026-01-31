import { z } from 'zod';

// ============================================================================
// Project
// ============================================================================

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectWithCursorSchema = z.object({
  project: ProjectSchema,
  cursor: z.string(),
});
export type ProjectWithCursor = z.infer<typeof ProjectWithCursorSchema>;

// ============================================================================
// Project Input
// ============================================================================

export const CreateProjectInputSchema = z.object({
  name: z.string(),
  ownerId: z.string(),
  environments: z
    .array(
      z.object({
        name: z.string(),
        protectedStatus: z.enum(['protected', 'not_protected']).optional(),
      }),
    )
    .optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = z.object({
  name: z.string().optional(),
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListProjectsParams {
  name?: string;
  ownerId?: string | string[];
  cursor?: string;
  limit?: number;
}
