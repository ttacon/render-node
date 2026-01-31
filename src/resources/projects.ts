import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  ProjectSchema,
  ProjectWithCursorSchema,
  CreateProjectInputSchema,
  UpdateProjectInputSchema,
  type Project,
  type ProjectWithCursor,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ListProjectsParams,
} from '../schemas/projects.js';

/**
 * Projects resource client
 */
export class ProjectsResource extends BaseResource {
  async list(params?: ListProjectsParams): Promise<PaginatedResponse<Project>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.name) query.name = params.name;
    if (params?.ownerId) {
      query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
    }
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<ProjectWithCursor[]>('/projects', query);
    const validated = this.validateArray(ProjectWithCursorSchema, response.data);

    const items: CursorResponse<Project>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.project,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAll(
    params?: ListProjectsParams & AutoPaginateOptions
  ): AsyncGenerator<Project, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (restParams.name) query.name = restParams.name;
      if (restParams.ownerId) {
        query.ownerId = Array.isArray(restParams.ownerId)
          ? restParams.ownerId.join(',')
          : restParams.ownerId;
      }
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<ProjectWithCursor[]>('/projects', query);
      const validated = this.validateArray(ProjectWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.project;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.project })));
      if (!cursor) break;
    }
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const validated = this.validate(CreateProjectInputSchema, input);
    const response = await this.http.post<Project>('/projects', validated);
    return this.validate(ProjectSchema, response.data);
  }

  async retrieve(projectId: string): Promise<Project> {
    const response = await this.http.get<Project>(`/projects/${projectId}`);
    return this.validate(ProjectSchema, response.data);
  }

  async update(projectId: string, input: UpdateProjectInput): Promise<Project> {
    const validated = this.validate(UpdateProjectInputSchema, input);
    const response = await this.http.patch<Project>(`/projects/${projectId}`, validated);
    return this.validate(ProjectSchema, response.data);
  }

  async delete(projectId: string): Promise<void> {
    await this.http.delete(`/projects/${projectId}`);
  }
}
