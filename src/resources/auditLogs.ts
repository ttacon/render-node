import type { AutoPaginateOptions, CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  type AuditLog,
  type AuditLogWithCursor,
  AuditLogWithCursorSchema,
  type ListAuditLogsParams,
} from '../schemas/auditLogs.js';
import { BaseResource } from './base.js';

function buildQuery(
  params?: ListAuditLogsParams,
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};
  const query: Record<string, string | number | boolean | undefined> = {};
  if (params.action) query.action = params.action;
  if (params.resourceType) query.resourceType = params.resourceType;
  if (params.resourceId) query.resourceId = params.resourceId;
  if (params.actorId) query.actorId = params.actorId;
  if (params.startTime) query.startTime = params.startTime;
  if (params.endTime) query.endTime = params.endTime;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;
  return query;
}

/**
 * Audit Logs resource client
 */
export class AuditLogsResource extends BaseResource {
  async listForOwner(
    ownerId: string,
    params?: ListAuditLogsParams,
  ): Promise<PaginatedResponse<AuditLog>> {
    const response = await this.http.get<AuditLogWithCursor[]>(
      `/owners/${ownerId}/audit-logs`,
      buildQuery(params),
    );
    const validated = this.validateArray(AuditLogWithCursorSchema, response.data);

    const items: CursorResponse<AuditLog>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.auditLog,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAllForOwner(
    ownerId: string,
    params?: ListAuditLogsParams & AutoPaginateOptions,
  ): AsyncGenerator<AuditLog, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const response = await this.http.get<AuditLogWithCursor[]>(
        `/owners/${ownerId}/audit-logs`,
        buildQuery({ ...restParams, cursor, limit }),
      );
      const validated = this.validateArray(AuditLogWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.auditLog;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.auditLog })));
      if (!cursor) break;
    }
  }

  async listForOrganization(
    orgId: string,
    params?: ListAuditLogsParams,
  ): Promise<PaginatedResponse<AuditLog>> {
    const response = await this.http.get<AuditLogWithCursor[]>(
      `/organizations/${orgId}/audit-logs`,
      buildQuery(params),
    );
    const validated = this.validateArray(AuditLogWithCursorSchema, response.data);

    const items: CursorResponse<AuditLog>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.auditLog,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAllForOrganization(
    orgId: string,
    params?: ListAuditLogsParams & AutoPaginateOptions,
  ): AsyncGenerator<AuditLog, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const response = await this.http.get<AuditLogWithCursor[]>(
        `/organizations/${orgId}/audit-logs`,
        buildQuery({ ...restParams, cursor, limit }),
      );
      const validated = this.validateArray(AuditLogWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.auditLog;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.auditLog })));
      if (!cursor) break;
    }
  }
}
