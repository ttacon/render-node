/**
 * Base error class for all Render API errors
 */
export class RenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RenderError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error response from the Render API
 */
export interface RenderErrorResponse {
  id?: string;
  message?: string;
  type?: string;
}

/**
 * Base class for API errors with HTTP status codes
 */
export class RenderApiError extends RenderError {
  public readonly status: number;
  public readonly response?: RenderErrorResponse;
  public readonly requestId?: string;

  constructor(message: string, status: number, response?: RenderErrorResponse, requestId?: string) {
    super(message);
    this.name = 'RenderApiError';
    this.status = status;
    this.response = response;
    this.requestId = requestId;
  }
}

/**
 * 400 Bad Request - Invalid request parameters
 */
export class RenderBadRequestError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 400, response, requestId);
    this.name = 'RenderBadRequestError';
  }
}

/**
 * 401 Unauthorized - Invalid or missing API key
 */
export class RenderAuthError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 401, response, requestId);
    this.name = 'RenderAuthError';
  }
}

/**
 * 402 Payment Required - Payment is required for this action
 */
export class RenderPaymentRequiredError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 402, response, requestId);
    this.name = 'RenderPaymentRequiredError';
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class RenderForbiddenError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 403, response, requestId);
    this.name = 'RenderForbiddenError';
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class RenderNotFoundError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 404, response, requestId);
    this.name = 'RenderNotFoundError';
  }
}

/**
 * 406 Not Acceptable - Request format not supported
 */
export class RenderNotAcceptableError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 406, response, requestId);
    this.name = 'RenderNotAcceptableError';
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate name)
 */
export class RenderConflictError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 409, response, requestId);
    this.name = 'RenderConflictError';
  }
}

/**
 * 410 Gone - Resource no longer available
 */
export class RenderGoneError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 410, response, requestId);
    this.name = 'RenderGoneError';
  }
}

/**
 * 429 Rate Limit - Too many requests
 */
export class RenderRateLimitError extends RenderApiError {
  public readonly retryAfter?: number;

  constructor(
    message: string,
    response?: RenderErrorResponse,
    requestId?: string,
    retryAfter?: number,
  ) {
    super(message, 429, response, requestId);
    this.name = 'RenderRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * 500 Internal Server Error - Server-side error
 */
export class RenderServerError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 500, response, requestId);
    this.name = 'RenderServerError';
  }
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
export class RenderServiceUnavailableError extends RenderApiError {
  constructor(message: string, response?: RenderErrorResponse, requestId?: string) {
    super(message, 503, response, requestId);
    this.name = 'RenderServiceUnavailableError';
  }
}

/**
 * Network or connection error
 */
export class RenderNetworkError extends RenderError {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'RenderNetworkError';
    this.cause = cause;
  }
}

/**
 * Request timeout error
 */
export class RenderTimeoutError extends RenderError {
  public readonly timeout: number;

  constructor(message: string, timeout: number) {
    super(message);
    this.name = 'RenderTimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Response validation error (Zod parsing failed)
 */
export class RenderValidationError extends RenderError {
  public readonly errors: unknown;

  constructor(message: string, errors: unknown) {
    super(message);
    this.name = 'RenderValidationError';
    this.errors = errors;
  }
}

/**
 * Create the appropriate error class based on HTTP status code
 */
export function createApiError(
  status: number,
  message: string,
  response?: RenderErrorResponse,
  requestId?: string,
  retryAfter?: number,
): RenderApiError {
  switch (status) {
    case 400:
      return new RenderBadRequestError(message, response, requestId);
    case 401:
      return new RenderAuthError(message, response, requestId);
    case 402:
      return new RenderPaymentRequiredError(message, response, requestId);
    case 403:
      return new RenderForbiddenError(message, response, requestId);
    case 404:
      return new RenderNotFoundError(message, response, requestId);
    case 406:
      return new RenderNotAcceptableError(message, response, requestId);
    case 409:
      return new RenderConflictError(message, response, requestId);
    case 410:
      return new RenderGoneError(message, response, requestId);
    case 429:
      return new RenderRateLimitError(message, response, requestId, retryAfter);
    case 500:
      return new RenderServerError(message, response, requestId);
    case 503:
      return new RenderServiceUnavailableError(message, response, requestId);
    default:
      return new RenderApiError(message, status, response, requestId);
  }
}
