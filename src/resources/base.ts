import type { ZodSchema } from 'zod';
import { RenderValidationError } from '../errors.js';
import type { HttpClient } from '../http.js';

/**
 * Base class for all resource clients
 */
export abstract class BaseResource {
  protected readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Check if debug mode is enabled (via the http client)
   */
  protected get isDebugEnabled(): boolean {
    return (this.http as any).debug === true;
  }

  /**
   * Log debug information if debug mode is enabled
   */
  protected log(message: string, ...args: unknown[]): void {
    if (this.isDebugEnabled) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Validate response data against a Zod schema
   */
  protected validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      if (this.isDebugEnabled) {
        this.log('✗ Validation failed:', result.error.errors);
        this.log('  Data received:', JSON.stringify(data).slice(0, 500));
      }
      throw new RenderValidationError(
        `Response validation failed: ${result.error.message}`,
        result.error.errors,
      );
    }
    if (this.isDebugEnabled) {
      this.log('✓ Validation successful');
    }
    return result.data;
  }

  /**
   * Validate an array of items against a Zod schema
   */
  protected validateArray<T>(schema: ZodSchema<T>, data: unknown[]): T[] {
    if (this.isDebugEnabled) {
      this.log(`Validating array of ${data.length} items`);
    }
    return data.map((item, index) => {
      const result = schema.safeParse(item);
      if (!result.success) {
        if (this.isDebugEnabled) {
          this.log(`✗ Validation failed at index ${index}:`, result.error.errors);
          this.log(`  Data received:`, JSON.stringify(item).slice(0, 500));
        }
        throw new RenderValidationError(
          `Response validation failed at index ${index}: ${result.error.message}`,
          result.error.errors,
        );
      }
      return result.data;
    });
  }
}
