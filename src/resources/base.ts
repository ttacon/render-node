import type { HttpClient } from '../http.js';
import type { ZodSchema } from 'zod';
import { RenderValidationError } from '../errors.js';

/**
 * Base class for all resource clients
 */
export abstract class BaseResource {
  protected readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Validate response data against a Zod schema
   */
  protected validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new RenderValidationError(
        `Response validation failed: ${result.error.message}`,
        result.error.errors
      );
    }
    return result.data;
  }

  /**
   * Validate an array of items against a Zod schema
   */
  protected validateArray<T>(schema: ZodSchema<T>, data: unknown[]): T[] {
    return data.map((item, index) => {
      const result = schema.safeParse(item);
      if (!result.success) {
        throw new RenderValidationError(
          `Response validation failed at index ${index}: ${result.error.message}`,
          result.error.errors
        );
      }
      return result.data;
    });
  }
}
