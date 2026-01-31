import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  WebhookSchema,
  WebhookWithCursorSchema,
  CreateWebhookInputSchema,
  UpdateWebhookInputSchema,
  WebhookEventWithCursorSchema,
  type Webhook,
  type WebhookWithCursor,
  type CreateWebhookInput,
  type UpdateWebhookInput,
  type WebhookEvent,
  type WebhookEventWithCursor,
  type ListWebhooksParams,
  type ListWebhookEventsParams,
} from '../schemas/webhooks.js';

/**
 * Webhooks resource client
 */
export class WebhooksResource extends BaseResource {
  async list(params?: ListWebhooksParams): Promise<PaginatedResponse<Webhook>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<WebhookWithCursor[]>('/webhooks', query);
    const validated = this.validateArray(WebhookWithCursorSchema, response.data);

    const items: CursorResponse<Webhook>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.webhook,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAll(
    params?: ListWebhooksParams & AutoPaginateOptions
  ): AsyncGenerator<Webhook, void, unknown> {
    const { cursor: initialCursor, limit, maxItems } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<WebhookWithCursor[]>('/webhooks', query);
      const validated = this.validateArray(WebhookWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.webhook;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.webhook })));
      if (!cursor) break;
    }
  }

  async create(input: CreateWebhookInput): Promise<Webhook> {
    const validated = this.validate(CreateWebhookInputSchema, input);
    const response = await this.http.post<Webhook>('/webhooks', validated);
    return this.validate(WebhookSchema, response.data);
  }

  async retrieve(webhookId: string): Promise<Webhook> {
    const response = await this.http.get<Webhook>(`/webhooks/${webhookId}`);
    return this.validate(WebhookSchema, response.data);
  }

  async update(webhookId: string, input: UpdateWebhookInput): Promise<Webhook> {
    const validated = this.validate(UpdateWebhookInputSchema, input);
    const response = await this.http.patch<Webhook>(`/webhooks/${webhookId}`, validated);
    return this.validate(WebhookSchema, response.data);
  }

  async delete(webhookId: string): Promise<void> {
    await this.http.delete(`/webhooks/${webhookId}`);
  }

  async listEvents(
    webhookId: string,
    params?: ListWebhookEventsParams
  ): Promise<PaginatedResponse<WebhookEvent>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<WebhookEventWithCursor[]>(
      `/webhooks/${webhookId}/events`,
      query
    );
    const validated = this.validateArray(WebhookEventWithCursorSchema, response.data);

    const items: CursorResponse<WebhookEvent>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.webhookEvent,
    }));

    return createPaginatedResponse(items, params?.limit);
  }
}
