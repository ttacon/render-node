import { z } from 'zod';
import { RegionSchema, SuspendedStatusSchema, SuspenderTypeSchema } from './common.js';
import { CidrBlockAndDescriptionSchema } from './services.js';

// ============================================================================
// Key Value Enums
// ============================================================================

export const KeyValuePlanSchema = z.enum([
  'free',
  'starter',
  'standard',
  'pro',
  'pro_plus',
  'custom',
]);
export type KeyValuePlan = z.infer<typeof KeyValuePlanSchema>;

export const MaxmemoryPolicySchema = z.enum([
  'noeviction',
  'allkeys_lru',
  'allkeys_lfu',
  'volatile_lru',
  'volatile_lfu',
  'allkeys_random',
  'volatile_random',
  'volatile_ttl',
]);
export type MaxmemoryPolicy = z.infer<typeof MaxmemoryPolicySchema>;

export const KeyValueStatusSchema = z.enum(['creating', 'available', 'unavailable', 'suspended']);
export type KeyValueStatus = z.infer<typeof KeyValueStatusSchema>;

// ============================================================================
// Key Value Owner
// ============================================================================

export const KeyValueOwnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  type: z.enum(['user', 'team']).optional(),
});
export type KeyValueOwner = z.infer<typeof KeyValueOwnerSchema>;

// ============================================================================
// Key Value
// ============================================================================

export const KeyValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string().optional(),
  owner: KeyValueOwnerSchema,
  region: RegionSchema,
  plan: KeyValuePlanSchema,
  status: KeyValueStatusSchema,
  maxmemoryPolicy: MaxmemoryPolicySchema,
  suspended: SuspendedStatusSchema,
  suspenders: z.array(SuspenderTypeSchema),
  dashboardUrl: z.string(),
  environmentId: z.string().optional(),
  ipAllowList: z.array(CidrBlockAndDescriptionSchema).optional(),
});
export type KeyValue = z.infer<typeof KeyValueSchema>;

export const KeyValueWithCursorSchema = z.object({
  keyValue: KeyValueSchema,
  cursor: z.string(),
});
export type KeyValueWithCursor = z.infer<typeof KeyValueWithCursorSchema>;

// ============================================================================
// Key Value Connection Info
// ============================================================================

export const KeyValueConnectionInfoSchema = z.object({
  internalConnectionString: z.string(),
  externalConnectionString: z.string(),
});
export type KeyValueConnectionInfo = z.infer<typeof KeyValueConnectionInfoSchema>;

// ============================================================================
// Key Value Input Types
// ============================================================================

export const CreateKeyValueInputSchema = z.object({
  name: z.string(),
  ownerId: z.string(),
  plan: KeyValuePlanSchema.optional(),
  region: z.string().optional(),
  environmentId: z.string().optional(),
  maxmemoryPolicy: MaxmemoryPolicySchema.optional(),
  ipAllowList: z.array(CidrBlockAndDescriptionSchema).optional(),
});
export type CreateKeyValueInput = z.infer<typeof CreateKeyValueInputSchema>;

export const UpdateKeyValueInputSchema = z.object({
  name: z.string().optional(),
  plan: KeyValuePlanSchema.optional(),
  maxmemoryPolicy: MaxmemoryPolicySchema.optional(),
  ipAllowList: z.array(CidrBlockAndDescriptionSchema).optional(),
});
export type UpdateKeyValueInput = z.infer<typeof UpdateKeyValueInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListKeyValueParams {
  name?: string;
  status?: 'creating' | 'available' | 'unavailable' | 'suspended';
  region?: string;
  suspended?: 'suspended' | 'not_suspended';
  createdBefore?: string;
  createdAfter?: string;
  updatedBefore?: string;
  updatedAfter?: string;
  ownerId?: string | string[];
  environmentId?: string;
  cursor?: string;
  limit?: number;
}
