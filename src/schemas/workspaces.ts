import { z } from 'zod';

// ============================================================================
// Workspace (Owner)
// ============================================================================

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  type: z.enum(['user', 'team']),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const WorkspaceWithCursorSchema = z.object({
  owner: WorkspaceSchema,
  cursor: z.string(),
});
export type WorkspaceWithCursor = z.infer<typeof WorkspaceWithCursorSchema>;

// ============================================================================
// Team Member
// ============================================================================

export const TeamMemberRoleSchema = z.enum(['ADMIN', 'MEMBER', 'VIEWER']);
export type TeamMemberRole = z.infer<typeof TeamMemberRoleSchema>;

export const TeamMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.enum(['active', 'pending']),
  role: TeamMemberRoleSchema,
  mfaEnabled: z.boolean().optional(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// ============================================================================
// Team Member Input
// ============================================================================

export const UpdateTeamMemberInputSchema = z.object({
  role: TeamMemberRoleSchema,
});
export type UpdateTeamMemberInput = z.infer<typeof UpdateTeamMemberInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListWorkspacesParams {
  cursor?: string;
  limit?: number;
}
