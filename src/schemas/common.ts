import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const RegionSchema = z.enum(['frankfurt', 'oregon', 'ohio', 'singapore', 'virginia']);
export type Region = z.infer<typeof RegionSchema>;

export const PlanSchema = z.enum([
  'starter',
  'starter_plus',
  'standard',
  'standard_plus',
  'pro',
  'pro_plus',
  'pro_max',
  'pro_ultra',
  'free',
  'custom',
]);
export type Plan = z.infer<typeof PlanSchema>;

export const PaidPlanSchema = z.enum([
  'starter',
  'standard',
  'pro',
  'pro_plus',
  'pro_max',
  'pro_ultra',
]);
export type PaidPlan = z.infer<typeof PaidPlanSchema>;

export const BuildPlanSchema = z.enum(['starter', 'performance']);
export type BuildPlan = z.infer<typeof BuildPlanSchema>;

export const ServiceTypeSchema = z.enum([
  'static_site',
  'web_service',
  'private_service',
  'background_worker',
  'cron_job',
]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const ServiceRuntimeSchema = z.enum([
  'docker',
  'elixir',
  'go',
  'node',
  'python',
  'ruby',
  'rust',
  'image',
]);
export type ServiceRuntime = z.infer<typeof ServiceRuntimeSchema>;

export const AutoDeploySchema = z.enum(['yes', 'no']);
export type AutoDeploy = z.infer<typeof AutoDeploySchema>;

export const NotifySettingSchema = z.enum(['default', 'notify', 'ignore']);
export type NotifySetting = z.infer<typeof NotifySettingSchema>;

export const SuspenderTypeSchema = z.enum([
  'admin',
  'billing',
  'user',
  'parent_service',
  'stuck_crashlooping',
  'hipaa_enablement',
  'unknown',
]);
export type SuspenderType = z.infer<typeof SuspenderTypeSchema>;

export const SuspendedStatusSchema = z.enum(['suspended', 'not_suspended']);
export type SuspendedStatus = z.infer<typeof SuspendedStatusSchema>;

export const ProtectedStatusSchema = z.enum(['protected', 'not_protected']);
export type ProtectedStatus = z.infer<typeof ProtectedStatusSchema>;

export const DeployStatusSchema = z.enum([
  'created',
  'build_in_progress',
  'update_in_progress',
  'live',
  'deactivated',
  'build_failed',
  'update_failed',
  'canceled',
  'pre_deploy_in_progress',
  'pre_deploy_failed',
]);
export type DeployStatus = z.infer<typeof DeployStatusSchema>;

export const DeployTriggerSchema = z.enum([
  'api',
  'blueprint_sync',
  'deploy_hook',
  'deployed_by_render',
  'manual',
  'new_commit',
  'rollback',
  'service_resumed',
  'service_updated',
  'other',
]);
export type DeployTrigger = z.infer<typeof DeployTriggerSchema>;

// ============================================================================
// Common Objects
// ============================================================================

export const ErrorSchema = z.object({
  id: z.string().optional(),
  message: z.string().optional(),
});
export type RenderErrorType = z.infer<typeof ErrorSchema>;

export const CursorSchema = z.object({
  cursor: z.string(),
});
export type Cursor = z.infer<typeof CursorSchema>;

export const BuildFilterSchema = z.object({
  paths: z.array(z.string()),
  ignoredPaths: z.array(z.string()),
});
export type BuildFilter = z.infer<typeof BuildFilterSchema>;

export const ImageSchema = z.object({
  ownerId: z.string(),
  registryCredentialId: z.string().optional(),
  imagePath: z.string(),
});
export type Image = z.infer<typeof ImageSchema>;

// ============================================================================
// Environment Variables
// ============================================================================

export const EnvVarSchema = z.object({
  key: z.string(),
  value: z.string(),
});
export type EnvVar = z.infer<typeof EnvVarSchema>;

export const EnvVarKeyValueSchema = z.object({
  key: z.string(),
  value: z.string(),
});
export type EnvVarKeyValue = z.infer<typeof EnvVarKeyValueSchema>;

export const EnvVarGenerateValueSchema = z.object({
  key: z.string(),
  generateValue: z.literal(true),
});
export type EnvVarGenerateValue = z.infer<typeof EnvVarGenerateValueSchema>;

export const EnvVarInputSchema = z.union([EnvVarKeyValueSchema, EnvVarGenerateValueSchema]);
export type EnvVarInput = z.infer<typeof EnvVarInputSchema>;

export const EnvVarWithCursorSchema = z.object({
  cursor: z.string(),
  envVar: EnvVarSchema,
});
export type EnvVarWithCursor = z.infer<typeof EnvVarWithCursorSchema>;

// ============================================================================
// Secret Files
// ============================================================================

export const SecretFileInputSchema = z.object({
  name: z.string(),
  content: z.string(),
});
export type SecretFileInput = z.infer<typeof SecretFileInputSchema>;

export const SecretFileSchema = z.object({
  name: z.string(),
});
export type SecretFile = z.infer<typeof SecretFileSchema>;

export const SecretFileWithCursorSchema = z.object({
  cursor: z.string(),
  secretFile: SecretFileSchema,
});
export type SecretFileWithCursor = z.infer<typeof SecretFileWithCursorSchema>;

// ============================================================================
// Registry Credentials
// ============================================================================

export const RegistryCredentialSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type RegistryCredentialSummary = z.infer<typeof RegistryCredentialSummarySchema>;

// ============================================================================
// Cursor-wrapped response helper
// ============================================================================

/**
 * Create a cursor-wrapped schema for paginated responses
 */
export function cursorWrapped<T extends z.ZodTypeAny>(
  itemSchema: T,
  itemKey: string,
): z.ZodObject<{
  cursor: z.ZodString;
  [key: string]: T | z.ZodString;
}> {
  return z.object({
    cursor: z.string(),
    [itemKey]: itemSchema,
  }) as z.ZodObject<{
    cursor: z.ZodString;
    [key: string]: T | z.ZodString;
  }>;
}
