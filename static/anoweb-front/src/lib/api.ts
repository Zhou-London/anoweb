const env = (import.meta as any).env || {};
const API_BASE = (env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export function apiUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let message = res.statusText || `Request failed with ${res.status}`;
    const contentType = res.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        const data = (await res.json()) as Record<string, string>;
        message = data.error || data.message || message;
      } else {
        const text = await res.text();
        message = text || message;
      }
    } catch {
      // ignore parse errors and fall back to defaults
    }

    throw new Error(message);
  }
  return res;
}

export async function apiFetch(input: string, init?: RequestInit) {
  const target = apiUrl(input);
  const response = await fetch(target, init);
  return handleResponse(response);
}

export async function apiJson<T>(input: string, init?: RequestInit) {
  const res = await apiFetch(input, init);
  return (await res.json()) as T;
}
