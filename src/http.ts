import {
  createApiError,
  type RenderErrorResponse,
  RenderNetworkError,
  RenderTimeoutError,
  RenderRateLimitError,
} from './errors.js';

const DEFAULT_BASE_URL = 'https://api.render.com/v1';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export interface HttpClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Override the default timeout for this request
   */
  timeout?: number;
  /**
   * Skip automatic retries for this request
   */
  skipRetry?: boolean;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Delay execution for a given number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build query string from parameters object
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * HTTP client for making requests to the Render API
 */
export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(options: HttpClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(status: number): boolean {
    // Retry on rate limits, server errors, and service unavailable
    return status === 429 || status === 500 || status === 503;
  }

  /**
   * Calculate delay for retry with exponential backoff
   */
  private getRetryDelay(attempt: number, retryAfter?: number): number {
    if (retryAfter) {
      return retryAfter * 1000;
    }
    // Exponential backoff: 1s, 2s, 4s, etc.
    return INITIAL_RETRY_DELAY * 2 ** attempt;
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<RenderErrorResponse | undefined> {
    try {
      const text = await response.text();
      if (!text) return undefined;
      return JSON.parse(text) as RenderErrorResponse;
    } catch {
      return undefined;
    }
  }

  /**
   * Make a request to the Render API
   */
  async request<T>(options: RequestOptions): Promise<HttpResponse<T>> {
    const { method, path, query, body, headers: customHeaders, skipRetry } = options;
    const requestTimeout = options.timeout ?? this.timeout;

    const url = `${this.baseUrl}${path}${buildQueryString(query)}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
      ...customHeaders,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Success responses
        if (response.ok) {
          // Handle 204 No Content
          if (response.status === 204) {
            return {
              data: undefined as T,
              status: response.status,
              headers: response.headers,
            };
          }

          const data = (await response.json()) as T;
          return {
            data,
            status: response.status,
            headers: response.headers,
          };
        }

        // Error response
        const errorResponse = await this.parseErrorResponse(response);
        const requestId = response.headers.get('x-request-id') ?? undefined;
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;

        const errorMessage =
          errorResponse?.message ?? `Request failed with status ${response.status}`;

        // Check if we should retry
        if (!skipRetry && this.isRetryable(response.status) && attempt < this.maxRetries) {
          const retryDelay = this.getRetryDelay(attempt, retryAfter);
          await delay(retryDelay);
          continue;
        }

        throw createApiError(response.status, errorMessage, errorResponse, requestId, retryAfter);
      } catch (error) {
        clearTimeout(timeoutId);

        // If it's already our error type, rethrow
        if (error instanceof RenderRateLimitError || error instanceof Error) {
          if (error.name?.startsWith('Render')) {
            throw error;
          }
        }

        // Handle abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new RenderTimeoutError(
            `Request timed out after ${requestTimeout}ms`,
            requestTimeout
          );

          // Don't retry timeouts
          if (skipRetry || attempt >= this.maxRetries) {
            throw lastError;
          }

          await delay(this.getRetryDelay(attempt));
          continue;
        }

        // Handle network errors
        if (error instanceof TypeError) {
          lastError = new RenderNetworkError(`Network error: ${error.message}`, error);

          // Retry network errors
          if (!skipRetry && attempt < this.maxRetries) {
            await delay(this.getRetryDelay(attempt));
            continue;
          }
          throw lastError;
        }

        // Unknown error
        throw error;
      }
    }

    // Should not reach here, but throw last error if we do
    throw lastError ?? new RenderNetworkError('Request failed after all retries');
  }

  /**
   * Make a GET request
   */
  async get<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'GET', path, query });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'POST', path, body });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, body?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'DELETE', path });
  }
}
