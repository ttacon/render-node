import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  EnvGroupSchema,
  EnvGroupWithCursorSchema,
  CreateEnvGroupInputSchema,
  UpdateEnvGroupInputSchema,
  type EnvGroup,
  type EnvGroupWithCursor,
  type CreateEnvGroupInput,
  type UpdateEnvGroupInput,
  type ListEnvGroupsParams,
} from '../schemas/envGroups.js';
import { EnvVarSchema, SecretFileSchema, type EnvVar, type SecretFile } from '../schemas/common.js';

/**
 * Environment Groups resource client
 *
 * Manage environment variable groups that can be shared across services.
 */
export class EnvGroupsResource extends BaseResource {
  /**
   * List environment groups
   */
  async list(params?: ListEnvGroupsParams): Promise<PaginatedResponse<EnvGroup>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.name) query.name = params.name;
    if (params?.ownerId) {
      query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
    }
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<EnvGroupWithCursor[]>('/env-groups', query);
    const validated = this.validateArray(EnvGroupWithCursorSchema, response.data);

    const items: CursorResponse<EnvGroup>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.envGroup,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all environment groups
   */
  async *listAll(
    params?: ListEnvGroupsParams & AutoPaginateOptions
  ): AsyncGenerator<EnvGroup, void, unknown> {
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

      const response = await this.http.get<EnvGroupWithCursor[]>('/env-groups', query);
      const validated = this.validateArray(EnvGroupWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.envGroup;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.envGroup })));
      if (!cursor) break;
    }
  }

  /**
   * Create a new environment group
   */
  async create(input: CreateEnvGroupInput): Promise<EnvGroup> {
    const validated = this.validate(CreateEnvGroupInputSchema, input);
    const response = await this.http.post<EnvGroup>('/env-groups', validated);
    return this.validate(EnvGroupSchema, response.data);
  }

  /**
   * Retrieve an environment group by ID
   */
  async retrieve(envGroupId: string): Promise<EnvGroup> {
    const response = await this.http.get<EnvGroup>(`/env-groups/${envGroupId}`);
    return this.validate(EnvGroupSchema, response.data);
  }

  /**
   * Update an environment group
   */
  async update(envGroupId: string, input: UpdateEnvGroupInput): Promise<EnvGroup> {
    const validated = this.validate(UpdateEnvGroupInputSchema, input);
    const response = await this.http.patch<EnvGroup>(`/env-groups/${envGroupId}`, validated);
    return this.validate(EnvGroupSchema, response.data);
  }

  /**
   * Delete an environment group
   */
  async delete(envGroupId: string): Promise<void> {
    await this.http.delete(`/env-groups/${envGroupId}`);
  }

  /**
   * Link a service to an environment group
   */
  async linkService(envGroupId: string, serviceId: string): Promise<void> {
    await this.http.post(`/env-groups/${envGroupId}/services/${serviceId}`);
  }

  /**
   * Unlink a service from an environment group
   */
  async unlinkService(envGroupId: string, serviceId: string): Promise<void> {
    await this.http.delete(`/env-groups/${envGroupId}/services/${serviceId}`);
  }

  /**
   * Retrieve an environment variable from a group
   */
  async retrieveEnvVar(envGroupId: string, key: string): Promise<EnvVar> {
    const response = await this.http.get<EnvVar>(`/env-groups/${envGroupId}/env-vars/${key}`);
    return this.validate(EnvVarSchema, response.data);
  }

  /**
   * Update an environment variable in a group
   */
  async updateEnvVar(envGroupId: string, key: string, value: string): Promise<EnvVar> {
    const response = await this.http.put<EnvVar>(`/env-groups/${envGroupId}/env-vars/${key}`, {
      value,
    });
    return this.validate(EnvVarSchema, response.data);
  }

  /**
   * Delete an environment variable from a group
   */
  async deleteEnvVar(envGroupId: string, key: string): Promise<void> {
    await this.http.delete(`/env-groups/${envGroupId}/env-vars/${key}`);
  }

  /**
   * Retrieve a secret file from a group
   */
  async retrieveSecretFile(envGroupId: string, name: string): Promise<SecretFile> {
    const response = await this.http.get<SecretFile>(
      `/env-groups/${envGroupId}/secret-files/${name}`
    );
    return this.validate(SecretFileSchema, response.data);
  }

  /**
   * Update a secret file in a group
   */
  async updateSecretFile(envGroupId: string, name: string, content: string): Promise<SecretFile> {
    const response = await this.http.put<SecretFile>(
      `/env-groups/${envGroupId}/secret-files/${name}`,
      { content }
    );
    return this.validate(SecretFileSchema, response.data);
  }

  /**
   * Delete a secret file from a group
   */
  async deleteSecretFile(envGroupId: string, name: string): Promise<void> {
    await this.http.delete(`/env-groups/${envGroupId}/secret-files/${name}`);
  }
}
