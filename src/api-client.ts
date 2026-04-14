import axios, { type AxiosInstance } from "axios";
import { getToken, getApiUrl } from "./config.js";

let _client: AxiosInstance | null = null;

export function getClient(): AxiosInstance {
  if (_client) return _client;

  const token = getToken();
  const apiUrl = getApiUrl();

  _client = axios.create({
    baseURL: `${apiUrl}/cli/v1`,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "manycontacts-mcp/1.0.0",
      ...(token ? { "cli-token": token } : {}),
    },
  });

  _client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response) {
        const data = error.response.data;
        const msg =
          data?.error || data?.message || `HTTP ${error.response.status}`;
        throw new Error(msg);
      }
      throw error;
    }
  );

  return _client;
}

export async function apiGet(path: string, params?: Record<string, unknown>) {
  return getClient().get(path, { params }) as Promise<unknown>;
}

export async function apiPost(path: string, body?: Record<string, unknown>) {
  return getClient().post(path, body) as Promise<unknown>;
}

export async function apiPut(path: string, body?: Record<string, unknown>) {
  return getClient().put(path, body) as Promise<unknown>;
}

export async function apiDelete(path: string) {
  return getClient().delete(path) as Promise<unknown>;
}
