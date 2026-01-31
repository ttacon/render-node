import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  WorkspaceSchema,
  WorkspaceWithCursorSchema,
  TeamMemberSchema,
  UpdateTeamMemberInputSchema,
  type Workspace,
  type WorkspaceWithCursor,
  type TeamMember,
  type UpdateTeamMemberInput,
  type ListWorkspacesParams,
} from '../schemas/workspaces.js';

/**
 * Workspaces resource client
 */
export class WorkspacesResource extends BaseResource {
  async list(params?: ListWorkspacesParams): Promise<PaginatedResponse<Workspace>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<WorkspaceWithCursor[]>('/owners', query);
    const validated = this.validateArray(WorkspaceWithCursorSchema, response.data);

    const items: CursorResponse<Workspace>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.owner,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAll(
    params?: ListWorkspacesParams & AutoPaginateOptions
  ): AsyncGenerator<Workspace, void, unknown> {
    const { cursor: initialCursor, limit, maxItems } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<WorkspaceWithCursor[]>('/owners', query);
      const validated = this.validateArray(WorkspaceWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.owner;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.owner })));
      if (!cursor) break;
    }
  }

  async retrieve(ownerId: string): Promise<Workspace> {
    const response = await this.http.get<Workspace>(`/owners/${ownerId}`);
    return this.validate(WorkspaceSchema, response.data);
  }

  async listMembers(ownerId: string): Promise<TeamMember[]> {
    const response = await this.http.get<TeamMember[]>(`/owners/${ownerId}/members`);
    return this.validateArray(TeamMemberSchema, response.data);
  }

  async updateMember(
    ownerId: string,
    userId: string,
    input: UpdateTeamMemberInput
  ): Promise<TeamMember> {
    const validated = this.validate(UpdateTeamMemberInputSchema, input);
    const response = await this.http.patch<TeamMember>(
      `/owners/${ownerId}/members/${userId}`,
      validated
    );
    return this.validate(TeamMemberSchema, response.data);
  }

  async removeMember(ownerId: string, userId: string): Promise<void> {
    await this.http.delete(`/owners/${ownerId}/members/${userId}`);
  }
}
