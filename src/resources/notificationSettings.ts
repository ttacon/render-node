import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse } from '../pagination.js';
import { createPaginatedResponse } from '../pagination.js';
import {
  NotificationSettingsSchema,
  NotificationOverrideSchema,
  NotificationOverrideWithCursorSchema,
  UpdateNotificationSettingsInputSchema,
  UpdateNotificationOverrideInputSchema,
  type NotificationSettings,
  type NotificationOverride,
  type NotificationOverrideWithCursor,
  type UpdateNotificationSettingsInput,
  type UpdateNotificationOverrideInput,
} from '../schemas/notificationSettings.js';

/**
 * Notification Settings resource client
 */
export class NotificationSettingsResource extends BaseResource {
  async retrieve(ownerId: string): Promise<NotificationSettings> {
    const response = await this.http.get<NotificationSettings>(
      `/notification-settings/owners/${ownerId}`
    );
    return this.validate(NotificationSettingsSchema, response.data);
  }

  async update(
    ownerId: string,
    input: UpdateNotificationSettingsInput
  ): Promise<NotificationSettings> {
    const validated = this.validate(UpdateNotificationSettingsInputSchema, input);
    const response = await this.http.patch<NotificationSettings>(
      `/notification-settings/owners/${ownerId}`,
      validated
    );
    return this.validate(NotificationSettingsSchema, response.data);
  }

  async listOverrides(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<NotificationOverride>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<NotificationOverrideWithCursor[]>(
      '/notification-settings/overrides',
      query
    );
    const validated = this.validateArray(NotificationOverrideWithCursorSchema, response.data);

    const items: CursorResponse<NotificationOverride>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.notificationOverride,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async retrieveServiceOverride(serviceId: string): Promise<NotificationOverride> {
    const response = await this.http.get<NotificationOverride>(
      `/notification-settings/overrides/services/${serviceId}`
    );
    return this.validate(NotificationOverrideSchema, response.data);
  }

  async updateServiceOverride(
    serviceId: string,
    input: UpdateNotificationOverrideInput
  ): Promise<NotificationOverride> {
    const validated = this.validate(UpdateNotificationOverrideInputSchema, input);
    const response = await this.http.patch<NotificationOverride>(
      `/notification-settings/overrides/services/${serviceId}`,
      validated
    );
    return this.validate(NotificationOverrideSchema, response.data);
  }
}
