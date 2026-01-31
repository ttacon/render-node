import type { CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse } from '../pagination.js';
import {
  type ListMaintenanceParams,
  type MaintenanceRun,
  MaintenanceRunSchema,
  type MaintenanceRunWithCursor,
  MaintenanceRunWithCursorSchema,
  type UpdateMaintenanceInput,
  UpdateMaintenanceInputSchema,
} from '../schemas/maintenance.js';
import { BaseResource } from './base.js';

/**
 * Maintenance resource client
 */
export class MaintenanceResource extends BaseResource {
  async list(params?: ListMaintenanceParams): Promise<PaginatedResponse<MaintenanceRun>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.resourceId) query.resourceId = params.resourceId;
    if (params?.status) query.status = params.status;
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<MaintenanceRunWithCursor[]>('/maintenance', query);
    const validated = this.validateArray(MaintenanceRunWithCursorSchema, response.data);

    const items: CursorResponse<MaintenanceRun>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.maintenanceRun,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async retrieve(maintenanceRunId: string): Promise<MaintenanceRun> {
    const response = await this.http.get<MaintenanceRun>(`/maintenance/${maintenanceRunId}`);
    return this.validate(MaintenanceRunSchema, response.data);
  }

  async update(maintenanceRunId: string, input: UpdateMaintenanceInput): Promise<MaintenanceRun> {
    const validated = this.validate(UpdateMaintenanceInputSchema, input);
    const response = await this.http.patch<MaintenanceRun>(
      `/maintenance/${maintenanceRunId}`,
      validated,
    );
    return this.validate(MaintenanceRunSchema, response.data);
  }

  async trigger(maintenanceRunId: string): Promise<MaintenanceRun> {
    const response = await this.http.post<MaintenanceRun>(
      `/maintenance/${maintenanceRunId}/trigger`,
    );
    return this.validate(MaintenanceRunSchema, response.data);
  }
}
