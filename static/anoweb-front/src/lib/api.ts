const env = (import.meta as any).env || {};
const API_BASE = (env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export function apiUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request failed with ${res.status}`);
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
