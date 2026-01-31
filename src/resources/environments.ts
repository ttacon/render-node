import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  EnvironmentSchema,
  EnvironmentWithCursorSchema,
  CreateEnvironmentInputSchema,
  UpdateEnvironmentInputSchema,
  AddResourcesInputSchema,
  RemoveResourcesInputSchema,
  type Environment,
  type EnvironmentWithCursor,
  type CreateEnvironmentInput,
  type UpdateEnvironmentInput,
  type AddResourcesInput,
  type RemoveResourcesInput,
  type ListEnvironmentsParams,
} from '../schemas/environments.js';

/**
 * Environments resource client
 */
export class EnvironmentsResource extends BaseResource {
  async list(params?: ListEnvironmentsParams): Promise<PaginatedResponse<Environment>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.projectId) query.projectId = params.projectId;
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<EnvironmentWithCursor[]>('/environments', query);
    const validated = this.validateArray(EnvironmentWithCursorSchema, response.data);

    const items: CursorResponse<Environment>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.environment,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAll(
    params?: ListEnvironmentsParams & AutoPaginateOptions
  ): AsyncGenerator<Environment, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (restParams.projectId) query.projectId = restParams.projectId;
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<EnvironmentWithCursor[]>('/environments', query);
      const validated = this.validateArray(EnvironmentWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.environment;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.environment })));
      if (!cursor) break;
    }
  }

  async create(input: CreateEnvironmentInput): Promise<Environment> {
    const validated = this.validate(CreateEnvironmentInputSchema, input);
    const response = await this.http.post<Environment>('/environments', validated);
    return this.validate(EnvironmentSchema, response.data);
  }

  async retrieve(environmentId: string): Promise<Environment> {
    const response = await this.http.get<Environment>(`/environments/${environmentId}`);
    return this.validate(EnvironmentSchema, response.data);
  }

  async update(environmentId: string, input: UpdateEnvironmentInput): Promise<Environment> {
    const validated = this.validate(UpdateEnvironmentInputSchema, input);
    const response = await this.http.patch<Environment>(
      `/environments/${environmentId}`,
      validated
    );
    return this.validate(EnvironmentSchema, response.data);
  }

  async delete(environmentId: string): Promise<void> {
    await this.http.delete(`/environments/${environmentId}`);
  }

  async addResources(environmentId: string, input: AddResourcesInput): Promise<void> {
    const validated = this.validate(AddResourcesInputSchema, input);
    await this.http.post(`/environments/${environmentId}/resources`, validated);
  }

  async removeResources(environmentId: string, input: RemoveResourcesInput): Promise<void> {
    const validated = this.validate(RemoveResourcesInputSchema, input);
    await this.http.request({
      method: 'DELETE',
      path: `/environments/${environmentId}/resources`,
      body: validated,
    });
  }
}
