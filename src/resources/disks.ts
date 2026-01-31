import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  DiskSchema,
  DiskWithCursorSchema,
  CreateDiskInputSchema,
  UpdateDiskInputSchema,
  DiskSnapshotSchema,
  RestoreSnapshotInputSchema,
  type Disk,
  type DiskWithCursor,
  type CreateDiskInput,
  type UpdateDiskInput,
  type DiskSnapshot,
  type RestoreSnapshotInput,
  type ListDisksParams,
  type ListSnapshotsParams,
} from '../schemas/disks.js';

/**
 * Disks resource client
 *
 * Manage persistent disks for services.
 */
export class DisksResource extends BaseResource {
  /**
   * List disks
   */
  async list(params?: ListDisksParams): Promise<PaginatedResponse<Disk>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.serviceId) query.serviceId = params.serviceId;
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<DiskWithCursor[]>('/disks', query);
    const validated = this.validateArray(DiskWithCursorSchema, response.data);

    const items: CursorResponse<Disk>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.disk,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all disks
   */
  async *listAll(
    params?: ListDisksParams & AutoPaginateOptions
  ): AsyncGenerator<Disk, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {
        ...restParams,
        cursor,
        limit,
      };
      const response = await this.http.get<DiskWithCursor[]>('/disks', query);
      const validated = this.validateArray(DiskWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.disk;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.disk })));
      if (!cursor) break;
    }
  }

  /**
   * Create a new disk
   */
  async create(input: CreateDiskInput): Promise<Disk> {
    const validated = this.validate(CreateDiskInputSchema, input);
    const response = await this.http.post<Disk>('/disks', validated);
    return this.validate(DiskSchema, response.data);
  }

  /**
   * Retrieve a disk by ID
   */
  async retrieve(diskId: string): Promise<Disk> {
    const response = await this.http.get<Disk>(`/disks/${diskId}`);
    return this.validate(DiskSchema, response.data);
  }

  /**
   * Update a disk
   */
  async update(diskId: string, input: UpdateDiskInput): Promise<Disk> {
    const validated = this.validate(UpdateDiskInputSchema, input);
    const response = await this.http.patch<Disk>(`/disks/${diskId}`, validated);
    return this.validate(DiskSchema, response.data);
  }

  /**
   * Delete a disk
   */
  async delete(diskId: string): Promise<void> {
    await this.http.delete(`/disks/${diskId}`);
  }

  /**
   * List snapshots for a disk
   */
  async listSnapshots(diskId: string, params?: ListSnapshotsParams): Promise<DiskSnapshot[]> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<DiskSnapshot[]>(`/disks/${diskId}/snapshots`, query);
    return this.validateArray(DiskSnapshotSchema, response.data);
  }

  /**
   * Restore a disk from a snapshot
   */
  async restoreSnapshot(diskId: string, input: RestoreSnapshotInput): Promise<void> {
    const validated = this.validate(RestoreSnapshotInputSchema, input);
    await this.http.post(`/disks/${diskId}/snapshots/restore`, validated);
  }
}
