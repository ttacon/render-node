import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  RegistryCredentialFullSchema,
  RegistryCredentialWithCursorSchema,
  CreateRegistryCredentialInputSchema,
  UpdateRegistryCredentialInputSchema,
  type RegistryCredentialFull,
  type RegistryCredentialWithCursor,
  type CreateRegistryCredentialInput,
  type UpdateRegistryCredentialInput,
  type ListRegistryCredentialsParams,
} from '../schemas/registryCredentials.js';

/**
 * Registry Credentials resource client
 */
export class RegistryCredentialsResource extends BaseResource {
  async list(
    params?: ListRegistryCredentialsParams
  ): Promise<PaginatedResponse<RegistryCredentialFull>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.ownerId) {
      query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
    }
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<RegistryCredentialWithCursor[]>(
      '/registrycredentials',
      query
    );
    const validated = this.validateArray(RegistryCredentialWithCursorSchema, response.data);

    const items: CursorResponse<RegistryCredentialFull>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.registryCredential,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAll(
    params?: ListRegistryCredentialsParams & AutoPaginateOptions
  ): AsyncGenerator<RegistryCredentialFull, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (restParams.ownerId) {
        query.ownerId = Array.isArray(restParams.ownerId)
          ? restParams.ownerId.join(',')
          : restParams.ownerId;
      }
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<RegistryCredentialWithCursor[]>(
        '/registrycredentials',
        query
      );
      const validated = this.validateArray(RegistryCredentialWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.registryCredential;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(
        validated.map((v) => ({ cursor: v.cursor, item: v.registryCredential }))
      );
      if (!cursor) break;
    }
  }

  async create(input: CreateRegistryCredentialInput): Promise<RegistryCredentialFull> {
    const validated = this.validate(CreateRegistryCredentialInputSchema, input);
    const response = await this.http.post<RegistryCredentialFull>(
      '/registrycredentials',
      validated
    );
    return this.validate(RegistryCredentialFullSchema, response.data);
  }

  async retrieve(credentialId: string): Promise<RegistryCredentialFull> {
    const response = await this.http.get<RegistryCredentialFull>(
      `/registrycredentials/${credentialId}`
    );
    return this.validate(RegistryCredentialFullSchema, response.data);
  }

  async update(
    credentialId: string,
    input: UpdateRegistryCredentialInput
  ): Promise<RegistryCredentialFull> {
    const validated = this.validate(UpdateRegistryCredentialInputSchema, input);
    const response = await this.http.patch<RegistryCredentialFull>(
      `/registrycredentials/${credentialId}`,
      validated
    );
    return this.validate(RegistryCredentialFullSchema, response.data);
  }

  async delete(credentialId: string): Promise<void> {
    await this.http.delete(`/registrycredentials/${credentialId}`);
  }
}
