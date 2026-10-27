import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "Missing VITE_API_URL environment variable. Copy .env.example to .env and set it to your FastAPI backend URL (e.g. http://localhost:8000).",
  );
}

const DEFAULT_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly payload?: unknown;

  constructor(status: number, message: string, code?: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
};

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, query, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const url = new URL(API_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const hasFormData = formData !== undefined;
  if (body !== undefined && !hasFormData) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fetchBody = hasFormData
      ? formData
      : body !== undefined
        ? JSON.stringify(body)
        : undefined;

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: fetchBody,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        (payload as { detail?: string } | undefined)?.detail ??
        `Request failed with status ${response.status}`;
      const code = (payload as { code?: string } | undefined)?.code;
      throw new ApiError(response.status, message, code, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, `Request timed out after ${timeoutMs}ms`);
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network request failed",
      "NETWORK_ERROR",
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
}

function get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
  return request<T>(path, { ...options, method: "GET" });
}

function post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
  return request<T>(path, { ...options, method: "POST", body });
}

export const api = {
  get,
  post,
};
