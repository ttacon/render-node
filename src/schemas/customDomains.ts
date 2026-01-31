import { z } from 'zod';

// ============================================================================
// Custom Domain
// ============================================================================

export const CustomDomainServerSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type CustomDomainServer = z.infer<typeof CustomDomainServerSchema>;

export const CustomDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  domainType: z.enum(['apex', 'subdomain']),
  publicSuffix: z.string(),
  redirectForName: z.string(),
  verificationStatus: z.enum(['verified', 'unverified']),
  createdAt: z.string(),
  server: CustomDomainServerSchema.optional(),
});
export type CustomDomain = z.infer<typeof CustomDomainSchema>;

export const CustomDomainWithCursorSchema = z.object({
  customDomain: CustomDomainSchema,
  cursor: z.string(),
});
export type CustomDomainWithCursor = z.infer<typeof CustomDomainWithCursorSchema>;

// ============================================================================
// Custom Domain Input
// ============================================================================

export const CreateCustomDomainInputSchema = z.object({
  name: z.string(),
});
export type CreateCustomDomainInput = z.infer<typeof CreateCustomDomainInputSchema>;

// ============================================================================
// List Params
// ============================================================================

export interface ListCustomDomainsParams {
  name?: string;
  domainType?: 'apex' | 'subdomain';
  verificationStatus?: 'verified' | 'unverified';
  createdBefore?: string;
  createdAfter?: string;
  cursor?: string;
  limit?: number;
}
