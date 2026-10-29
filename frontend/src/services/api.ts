const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configuredApiBaseUrl || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: QueryParams;
  token?: string | null;
}

export type ApiCallOptions = Omit<
  ApiRequestOptions,
  "body" | "query" | "method"
>;

interface ApiErrorOptions {
  status?: number;
  code?: string;
  details?: unknown;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code;
    this.details = options.details;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (!query) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item !== undefined && item !== null) {
        url.searchParams.append(key, String(item));
      }
    }
  }

  return url.toString();
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("json")) {
    return text;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(data: unknown, response: Response): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (isRecord(data)) {
    const nestedError = isRecord(data.error) ? data.error : undefined;
    const message =
      data.message ??
      data.detail ??
      data.title ??
      nestedError?.message ??
      data.error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return response.statusText || `Request failed with status ${response.status}`;
}

function getErrorCode(data: unknown): string | undefined {
  if (!isRecord(data)) {
    return undefined;
  }

  if (typeof data.code === "string") {
    return data.code;
  }

  if (typeof data.error === "string") {
    return data.error;
  }

  if (isRecord(data.error) && typeof data.error.code === "string") {
    return data.error.code;
  }

  return undefined;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, query, token, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;

  if (body !== undefined) {
    if (isRawBody(body)) {
      requestBody = body;
    } else {
      if (!requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
      }

      requestBody = JSON.stringify(body);
    }
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: requestHeaders,
      body: requestBody,
    });
  } catch (caught) {
    if (isAbortError(caught)) {
      throw caught;
    }

    throw new ApiError("Unable to reach the API server.", { cause: caught });
  }

  let data: unknown;

  try {
    data = await parseResponseBody(response);
  } catch (caught) {
    if (isAbortError(caught)) {
      throw caught;
    }

    throw new ApiError("Failed to read the API response.", {
      status: response.status,
      cause: caught,
    });
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, response), {
      status: response.status,
      code: getErrorCode(data),
      details: data,
    });
  }

  return data as T;
}

export type ResourceFilters = {
  search?: string;
  type?: string;
  location?: string;
  status?: string;
  available?: boolean;
  page?: number;
  limit?: number;
};

export interface Resource {
  id: string;
  name: string;
  description?: string;
  type?: string;
  location?: string;
  capacity?: number;
  status?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "checked_in"
  | "checked_out"
  | (string & {});

export interface BookingRequestPayload {
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  purpose?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  restrictions?: string[];
  [key: string]: unknown;
}

export interface CheckInPayload {
  userId?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface CheckOutPayload {
  userId?: string;
  notes?: string;
  [key: string]: unknown;
}

export type AuditLogFilters = {
  userId?: string;
  resourceId?: string;
  bookingId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  userId?: string;
  resourceId?: string;
  bookingId?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export function fetchResources(
  filters?: ResourceFilters,
  options?: ApiCallOptions,
): Promise<Resource[]> {
  return apiRequest<Resource[]>("/resources", {
    ...options,
    query: filters,
  });
}

export function submitBookingRequest(
  payload: BookingRequestPayload,
  options?: ApiCallOptions,
): Promise<Booking> {
  return apiRequest<Booking>("/bookings", {
    ...options,
    method: "POST",
    body: payload,
  });
}

export function checkUserEligibility(
  userId: string,
  resourceId?: string,
  options?: ApiCallOptions,
): Promise<EligibilityResult> {
  return apiRequest<EligibilityResult>(
    `/users/${encodeURIComponent(userId)}/eligibility`,
    {
      ...options,
      query: resourceId ? { resourceId } : undefined,
    },
  );
}

export function checkInBooking(
  bookingId: string,
  payload: CheckInPayload = {},
  options?: ApiCallOptions,
): Promise<Booking> {
  return apiRequest<Booking>(
    `/bookings/${encodeURIComponent(bookingId)}/check-in`,
    {
      ...options,
      method: "POST",
      body: payload,
    },
  );
}

export function checkOutBooking(
  bookingId: string,
  payload: CheckOutPayload = {},
  options?: ApiCallOptions,
): Promise<Booking> {
  return apiRequest<Booking>(
    `/bookings/${encodeURIComponent(bookingId)}/check-out`,
    {
      ...options,
      method: "POST",
      body: payload,
    },
  );
}

export function fetchAuditLogs(
  filters?: AuditLogFilters,
  options?: ApiCallOptions,
): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>("/audit-logs", {
    ...options,
    query: filters,
  });
}
