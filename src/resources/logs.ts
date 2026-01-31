import { BaseResource } from './base.js';
import { LogEntrySchema, type LogEntry, type ListLogsParams } from '../schemas/logs.js';

/**
 * Logs resource client
 */
export class LogsResource extends BaseResource {
  /**
   * Query logs for resources
   */
  async list(params?: ListLogsParams): Promise<LogEntry[]> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.resourceIds) query.resourceIds = params.resourceIds.join(',');
    if (params?.ownerId) query.ownerId = params.ownerId;
    if (params?.severity) query.severity = params.severity;
    if (params?.startTime) query.startTime = params.startTime;
    if (params?.endTime) query.endTime = params.endTime;
    if (params?.direction) query.direction = params.direction;
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<LogEntry[]>('/logs', query);
    return this.validateArray(LogEntrySchema, response.data);
  }

  /**
   * Get log values/counts
   */
  async values(params?: ListLogsParams): Promise<unknown> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.resourceIds) query.resourceIds = params.resourceIds.join(',');
    if (params?.ownerId) query.ownerId = params.ownerId;
    if (params?.severity) query.severity = params.severity;
    if (params?.startTime) query.startTime = params.startTime;
    if (params?.endTime) query.endTime = params.endTime;

    const response = await this.http.get<unknown>('/logs/values', query);
    return response.data;
  }
}
