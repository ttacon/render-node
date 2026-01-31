import { z } from 'zod';

// ============================================================================
// Disk
// ============================================================================

export const DiskSchema = z.object({
  id: z.string(),
  name: z.string(),
  sizeGB: z.number(),
  mountPath: z.string(),
  serviceId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Disk = z.infer<typeof DiskSchema>;

export const DiskWithCursorSchema = z.object({
  disk: DiskSchema,
  cursor: z.string(),
});
export type DiskWithCursor = z.infer<typeof DiskWithCursorSchema>;

// ============================================================================
// Disk Input
// ============================================================================

export const CreateDiskInputSchema = z.object({
  name: z.string(),
  sizeGB: z.number(),
  mountPath: z.string(),
  serviceId: z.string(),
});
export type CreateDiskInput = z.infer<typeof CreateDiskInputSchema>;

export const UpdateDiskInputSchema = z.object({
  name: z.string().optional(),
  sizeGB: z.number().optional(),
  mountPath: z.string().optional(),
});
export type UpdateDiskInput = z.infer<typeof UpdateDiskInputSchema>;

// ============================================================================
// Disk Snapshot
// ============================================================================

export const DiskSnapshotSchema = z.object({
  id: z.string(),
  diskId: z.string(),
  createdAt: z.string(),
  sizeGB: z.number().optional(),
});
export type DiskSnapshot = z.infer<typeof DiskSnapshotSchema>;

export const RestoreSnapshotInputSchema = z.object({
  snapshotId: z.string(),
});
export type RestoreSnapshotInput = z.infer<typeof RestoreSnapshotInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListDisksParams {
  serviceId?: string;
  cursor?: string;
  limit?: number;
}

export interface ListSnapshotsParams {
  cursor?: string;
  limit?: number;
}
