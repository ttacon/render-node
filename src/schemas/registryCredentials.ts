import { z } from 'zod';

// ============================================================================
// Registry Credential
// ============================================================================

export const RegistryTypeSchema = z.enum(['GITHUB', 'GITLAB', 'DOCKER']);
export type RegistryType = z.infer<typeof RegistryTypeSchema>;

export const RegistryCredentialFullSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  registry: RegistryTypeSchema,
});
export type RegistryCredentialFull = z.infer<typeof RegistryCredentialFullSchema>;

export const RegistryCredentialWithCursorSchema = z.object({
  registryCredential: RegistryCredentialFullSchema,
  cursor: z.string(),
});
export type RegistryCredentialWithCursor = z.infer<typeof RegistryCredentialWithCursorSchema>;

// ============================================================================
// Registry Credential Input
// ============================================================================

export const CreateRegistryCredentialInputSchema = z.object({
  name: z.string(),
  registry: RegistryTypeSchema,
  username: z.string(),
  authToken: z.string(),
  ownerId: z.string(),
});
export type CreateRegistryCredentialInput = z.infer<typeof CreateRegistryCredentialInputSchema>;

export const UpdateRegistryCredentialInputSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  authToken: z.string().optional(),
});
export type UpdateRegistryCredentialInput = z.infer<typeof UpdateRegistryCredentialInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListRegistryCredentialsParams {
  ownerId?: string | string[];
  cursor?: string;
  limit?: number;
}
