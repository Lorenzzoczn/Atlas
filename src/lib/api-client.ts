"use client";

import {
  getSession,
  setSession,
  toStoredSession,
  type StoredSession,
} from "@/store/session-store";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Rotas públicas (login, registro) não mandam token nem tentam renovar. */
  anonymous?: boolean;
  signal?: AbortSignal;
}

/**
 * Renovação em andamento. Quando várias telas disparam requisições ao mesmo
 * tempo e o token vence, todas aguardam o mesmo refresh — mandar vários
 * derrubaria a sessão, porque o backend trata reapresentação de refresh token
 * como credencial vazada.
 */
let refreshing: Promise<StoredSession | null> | null = null;

async function refreshSession(): Promise<StoredSession | null> {
  const current = getSession();
  if (!current) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });

  if (!response.ok) {
    setSession(null);
    return null;
  }

  const tokens = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };

  const next = toStoredSession(tokens);
  setSession(next);
  return next;
}

function ensureFreshSession(): Promise<StoredSession | null> {
  const current = getSession();
  if (!current) return Promise.resolve(null);
  if (current.expiresAt > Date.now()) return Promise.resolve(current);

  refreshing ??= refreshSession().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, anonymous, signal } = options;

  const session = anonymous ? null : await ensureFreshSession();

  const send = (token?: string) =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

  let response = await send(session?.accessToken);

  // O token pode ter sido revogado no servidor mesmo dentro da validade —
  // logout em outro dispositivo, troca de senha. Uma tentativa de renovar.
  if (response.status === 401 && !anonymous && session) {
    refreshing ??= refreshSession().finally(() => {
      refreshing = null;
    });
    const renewed = await refreshing;
    if (renewed) response = await send(renewed.accessToken);
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload as { code?: string; message?: string; details?: unknown } | null;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? `Falha na requisição (${response.status})`,
      error?.details,
    );
  }

  return payload as T;
}

export type QueryParams = {
  // `interface` não casa com `Record<string, …>` (falta index signature), então
  // o parâmetro é um objeto aberto e a validação acontece na leitura.
  readonly [key: string]: string | number | boolean | undefined | null;
};

/** Monta query string ignorando valores vazios, para não poluir a URL. */
export function query(params: QueryParams) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== "todos") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
