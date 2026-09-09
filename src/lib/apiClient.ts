/**
 * Thin REST client for the Primeform HMI Express API.
 * The base URL is configuration, never hardcoded to a deployed host.
 */
export const API_BASE_URL = (
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:3000"
).replace(/\/$/, "");

export class HmiApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export async function apiRequest<T>(
  path: string,
  init?: { method?: "GET" | "POST" | "PATCH"; body?: unknown },
): Promise<T> {
  let response: Response;

  const requestInit: RequestInit = { method: init?.method ?? "GET" };
  if (init?.body !== undefined) {
    requestInit.headers = { "Content-Type": "application/json" };
    requestInit.body = JSON.stringify(init.body);
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, requestInit);
  } catch {
    throw new HmiApiError("SERVICE_UNAVAILABLE", "Unable to communicate with the HMI service.", 0);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new HmiApiError(
      payload?.error?.code ?? "REQUEST_FAILED",
      payload?.error?.message ?? "The HMI service rejected the request.",
      response.status,
    );
  }

  return payload.data as T;
}
