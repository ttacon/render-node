import type { AutoPaginateOptions, CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  type CreatePostgresInput,
  CreatePostgresInputSchema,
  type CreatePostgresUserInput,
  CreatePostgresUserInputSchema,
  type ListPostgresParams,
  type Postgres,
  type PostgresConnectionInfo,
  PostgresConnectionInfoSchema,
  type PostgresExport,
  PostgresExportSchema,
  type PostgresRecoveryInfo,
  PostgresRecoveryInfoSchema,
  PostgresSchema,
  type PostgresUser,
  PostgresUserSchema,
  type PostgresWithCursor,
  PostgresWithCursorSchema,
  type RecoverPostgresInput,
  RecoverPostgresInputSchema,
  type UpdatePostgresInput,
  UpdatePostgresInputSchema,
} from '../schemas/postgres.js';
import { BaseResource } from './base.js';

/**
 * Build query parameters for list postgres endpoint
 */
function buildListQuery(
  params?: ListPostgresParams,
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.name) query.name = params.name;
  if (params.status) query.status = params.status;
  if (params.region) query.region = params.region;
  if (params.suspended) query.suspended = params.suspended;
  if (params.createdBefore) query.createdBefore = params.createdBefore;
  if (params.createdAfter) query.createdAfter = params.createdAfter;
  if (params.updatedBefore) query.updatedBefore = params.updatedBefore;
  if (params.updatedAfter) query.updatedAfter = params.updatedAfter;
  if (params.ownerId) {
    query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
  }
  if (params.environmentId) query.environmentId = params.environmentId;
  if (params.includeReplicas !== undefined) query.includeReplicas = params.includeReplicas;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Postgres resource client
 *
 * Manage Postgres databases.
 */
export class PostgresResource extends BaseResource {
  /**
   * List Postgres databases
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of databases
   */
  async list(params?: ListPostgresParams): Promise<PaginatedResponse<Postgres>> {
    const query = buildListQuery(params);
    const response = await this.http.get<PostgresWithCursor[]>('/postgres', query);

    const validated = this.validateArray(PostgresWithCursorSchema, response.data);

    const items: CursorResponse<Postgres>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.postgres,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all Postgres databases
   */
  async *listAll(
    params?: ListPostgresParams & AutoPaginateOptions,
  ): AsyncGenerator<Postgres, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<PostgresWithCursor[]>('/postgres', query);
      const validated = this.validateArray(PostgresWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.postgres;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.postgres })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Create a new Postgres database
   *
   * @param input - Database configuration
   * @returns The created database
   */
  async create(input: CreatePostgresInput): Promise<Postgres> {
    const validated = this.validate(CreatePostgresInputSchema, input);
    const response = await this.http.post<Postgres>('/postgres', validated);
    return this.validate(PostgresSchema, response.data);
  }

  /**
   * Retrieve a Postgres database by ID
   *
   * @param postgresId - The database ID
   * @returns The database
   */
  async retrieve(postgresId: string): Promise<Postgres> {
    const response = await this.http.get<Postgres>(`/postgres/${postgresId}`);
    return this.validate(PostgresSchema, response.data);
  }

  /**
   * Update a Postgres database
   *
   * @param postgresId - The database ID
   * @param input - Fields to update
   * @returns The updated database
   */
  async update(postgresId: string, input: UpdatePostgresInput): Promise<Postgres> {
    const validated = this.validate(UpdatePostgresInputSchema, input);
    const response = await this.http.patch<Postgres>(`/postgres/${postgresId}`, validated);
    return this.validate(PostgresSchema, response.data);
  }

  /**
   * Delete a Postgres database
   *
   * @param postgresId - The database ID
   */
  async delete(postgresId: string): Promise<void> {
    await this.http.delete(`/postgres/${postgresId}`);
  }

  /**
   * Get connection info for a Postgres database
   *
   * @param postgresId - The database ID
   * @returns Connection strings and details
   */
  async connectionInfo(postgresId: string): Promise<PostgresConnectionInfo> {
    const response = await this.http.get<PostgresConnectionInfo>(
      `/postgres/${postgresId}/connection-info`,
    );
    return this.validate(PostgresConnectionInfoSchema, response.data);
  }

  /**
   * Suspend a Postgres database
   *
   * @param postgresId - The database ID
   */
  async suspend(postgresId: string): Promise<void> {
    await this.http.post(`/postgres/${postgresId}/suspend`);
  }

  /**
   * Resume a suspended Postgres database
   *
   * @param postgresId - The database ID
   */
  async resume(postgresId: string): Promise<void> {
    await this.http.post(`/postgres/${postgresId}/resume`);
  }

  /**
   * Restart a Postgres database
   *
   * @param postgresId - The database ID
   */
  async restart(postgresId: string): Promise<void> {
    await this.http.post(`/postgres/${postgresId}/restart`);
  }

  /**
   * Trigger failover to a read replica (high availability databases only)
   *
   * @param postgresId - The database ID
   * @returns The updated database
   */
  async failover(postgresId: string): Promise<Postgres> {
    const response = await this.http.post<Postgres>(`/postgres/${postgresId}/failover`);
    return this.validate(PostgresSchema, response.data);
  }

  /**
   * Get recovery info for a Postgres database
   *
   * @param postgresId - The database ID
   * @returns Recovery information including latest recovery time
   */
  async recoveryInfo(postgresId: string): Promise<PostgresRecoveryInfo> {
    const response = await this.http.get<PostgresRecoveryInfo>(`/postgres/${postgresId}/recovery`);
    return this.validate(PostgresRecoveryInfoSchema, response.data);
  }

  /**
   * Recover a Postgres database to a specific point in time
   *
   * @param postgresId - The database ID
   * @param input - Recovery configuration
   * @returns The new database created from recovery
   */
  async recover(postgresId: string, input: RecoverPostgresInput): Promise<Postgres> {
    const validated = this.validate(RecoverPostgresInputSchema, input);
    const response = await this.http.post<Postgres>(`/postgres/${postgresId}/recovery`, validated);
    return this.validate(PostgresSchema, response.data);
  }

  /**
   * List database users
   *
   * @param postgresId - The database ID
   * @returns List of database users
   */
  async listUsers(postgresId: string): Promise<PostgresUser[]> {
    const response = await this.http.get<PostgresUser[]>(`/postgres/${postgresId}/credentials`);
    return this.validateArray(PostgresUserSchema, response.data);
  }

  /**
   * Create a database user
   *
   * @param postgresId - The database ID
   * @param input - User configuration
   * @returns The created user
   */
  async createUser(postgresId: string, input: CreatePostgresUserInput): Promise<PostgresUser> {
    const validated = this.validate(CreatePostgresUserInputSchema, input);
    const response = await this.http.post<PostgresUser>(
      `/postgres/${postgresId}/credentials`,
      validated,
    );
    return this.validate(PostgresUserSchema, response.data);
  }

  /**
   * Delete a database user
   *
   * @param postgresId - The database ID
   * @param username - The username to delete
   */
  async deleteUser(postgresId: string, username: string): Promise<void> {
    await this.http.delete(`/postgres/${postgresId}/credentials/${username}`);
  }

  /**
   * List database exports
   *
   * @param postgresId - The database ID
   * @returns List of exports
   */
  async listExports(postgresId: string): Promise<PostgresExport[]> {
    const response = await this.http.get<PostgresExport[]>(`/postgres/${postgresId}/export`);
    return this.validateArray(PostgresExportSchema, response.data);
  }

  /**
   * Create a database export
   *
   * @param postgresId - The database ID
   * @returns The created export
   */
  async createExport(postgresId: string): Promise<PostgresExport> {
    const response = await this.http.post<PostgresExport>(`/postgres/${postgresId}/export`);
    return this.validate(PostgresExportSchema, response.data);
  }
}
