"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import {
  authApi,
  type AuthOrganization,
  type AuthSession,
  type AuthUser,
} from "@/services/atlas-backend";
import {
  getServerSession,
  getSession,
  setSession,
  subscribeToSession,
  toStoredSession,
} from "@/store/session-store";

type AuthStatus = "carregando" | "autenticado" | "visitante";

interface AuthState {
  user: AuthUser | null;
  organization: AuthOrganization | null;
  /** Canais de venda conectados. Alimenta o cabeçalho sem uma segunda chamada. */
  connectedChannels: number;
  permissions: string[];
  status: AuthStatus;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Autenticação real contra o backend.
 *
 * O par de tokens vive em `session-store` (fora do React, lido por
 * `useSyncExternalStore`), e os dados do usuário vêm de `/auth/me` — assim uma
 * sessão retomada de outra aba já chega com permissões corretas, sem depender
 * do que estava em memória.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const session = useSyncExternalStore(subscribeToSession, getSession, getServerSession);

  /**
   * Na hidratação o snapshot ainda é o do servidor — sempre `null`, porque o
   * servidor não vê o localStorage. Sem esta trava o primeiro efeito do
   * AuthGuard já leria "visitante" e chutaria para o login quem estava logado.
   */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Só consulta quando há token; sem ele o usuário é visitante e nada é pedido.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me", session?.accessToken?.slice(-12)],
    queryFn: authApi.me,
    enabled: Boolean(session),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const result: AuthSession = await authApi.login(email, password);
        setSession(toStoredSession(result.tokens));
        // Descarta cache da sessão anterior: outra organização, outros dados.
        queryClient.clear();
        router.push("/");
      } catch (cause) {
        const message =
          cause instanceof ApiError
            ? cause.message
            : "Não foi possível entrar. Tente novamente.";
        setError(message);
        throw cause;
      }
    },
    [queryClient, router],
  );

  const signOut = useCallback(() => {
    // Avisa o servidor para revogar a sessão, mas não espera: se a rede
    // falhar, o usuário ainda precisa sair da interface.
    void authApi.logout().catch(() => undefined);
    setSession(null);
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router]);

  const status: AuthStatus = !hydrated
    ? "carregando"
    : !session
      ? "visitante"
      : isLoading
        ? "carregando"
        : isError
          ? "visitante"
          : "autenticado";

  const permissions = useMemo(() => data?.permissions ?? [], [data]);

  const can = useCallback(
    (permission: string) => data?.isOwner === true || permissions.includes(permission),
    [data, permissions],
  );

  const value = useMemo<AuthState>(
    () => ({
      user: data
        ? {
            id: data.userId,
            name: data.name,
            email: data.email,
            avatarUrl: null,
            emailVerified: true,
            mfaEnabled: false,
          }
        : null,
      organization: data
        ? {
            id: data.organizationId,
            name: data.organization?.name ?? "",
            slug: data.organization?.slug ?? "",
            plan: data.organization?.plan ?? "",
            roleKey: data.roleKey,
            isOwner: data.isOwner,
          }
        : null,
      connectedChannels: data?.organization?.connectedChannels ?? 0,
      permissions,
      status,
      error,
      signIn,
      signOut,
      can,
    }),
    [data, permissions, status, error, signIn, signOut, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return context;
}
