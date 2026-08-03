"use client";

/**
 * Sessão real: guarda o par de tokens emitido pelo backend.
 *
 * Vive fora do React para que `useSyncExternalStore` leia sem efeito — o mesmo
 * arranjo da versão simulada, agora com tokens de verdade.
 *
 * Os tokens ficam em `localStorage`. É o suficiente para esta fase, mas não é
 * o destino final: cookie `httpOnly` protegeria contra XSS, e é para lá que
 * isso deve ir quando o backend passar a servir o front no mesmo domínio.
 */

const STORAGE_KEY = "atlas.session";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** Epoch em ms; usado para renovar antes de o servidor recusar. */
  expiresAt: number;
}

const listeners = new Set<() => void>();

let snapshot: StoredSession | null = null;
let loaded = false;

function read(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed.accessToken && parsed.refreshToken ? parsed : null;
  } catch {
    return null;
  }
}

export function getSession(): StoredSession | null {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    snapshot = read();
  }
  return snapshot;
}

export function getServerSession(): StoredSession | null {
  return null;
}

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSession(session: StoredSession | null) {
  snapshot = session;
  loaded = true;

  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Armazenamento indisponível (aba anônima, cota): a sessão em memória
    // ainda vale até o refresh da página.
  }

  for (const listener of listeners) listener();
}

/** Converte a resposta de login/refresh no formato guardado. */
export function toStoredSession(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}): StoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    // 30s de folga: evita mandar um token que expira no meio do voo.
    expiresAt: Date.now() + (tokens.expiresIn - 30) * 1000,
  };
}
