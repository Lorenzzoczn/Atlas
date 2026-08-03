"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AtlasMark } from "@/components/brand/atlas-mark";
import { useAuth } from "@/providers/auth-provider";

/**
 * Guarda das rotas do painel.
 *
 * Enquanto a sessão é verificada, mostra a marca em vez de piscar o conteúdo —
 * renderizar o painel e depois arrancá-lo seria pior que esperar meio segundo.
 * Sem sessão, redireciona para o login guardando o destino pretendido.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "visitante") return;

    const target =
      pathname && pathname !== "/"
        ? `/login?próximo=${encodeURIComponent(pathname)}`
        : "/login";

    router.replace(target);
  }, [status, pathname, router]);

  if (status === "autenticado") return <>{children}</>;

  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <AtlasMark size={44} />
        <p className="text-[12.5px] text-subtle">
          {status === "carregando" ? "Verificando sua sessão…" : "Redirecionando…"}
        </p>
      </div>
    </div>
  );
}
