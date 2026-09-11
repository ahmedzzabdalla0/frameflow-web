const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.32:3568";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  return parseResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return parseResponse<T>(res);
}

export function mediaUrl(path: string): string {
  return `${API_BASE}${path}`;
}
