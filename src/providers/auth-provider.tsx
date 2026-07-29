"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { sessionUser, type SessionUser } from "@/mock/session";
import {
  getServerSession,
  getSession,
  setSession,
  subscribeToSession,
} from "@/store/session-store";

type AuthStatus = "autenticado" | "visitante";

interface AuthState {
  user: SessionUser | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Simulated authentication. There is no backend in this phase: the session is a
 * flag in localStorage and any password with 6 or more characters is accepted.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState(sessionUser.email);
  const [error, setError] = useState<string | null>(null);

  const active = useSyncExternalStore(
    subscribeToSession,
    getSession,
    getServerSession,
  );

  const signIn = useCallback(
    async (nextEmail: string, password: string) => {
      setError(null);

      if (password.length < 6) {
        setError("A senha precisa ter ao menos 6 caracteres.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 900));

      setEmail(nextEmail || sessionUser.email);
      setSession(true);
      router.push("/");
    },
    [router],
  );

  const signOut = useCallback(() => {
    setSession(false);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      user: active ? { ...sessionUser, email } : null,
      status: active ? "autenticado" : "visitante",
      signIn,
      signOut,
      error,
    }),
    [active, email, signIn, signOut, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return context;
}
