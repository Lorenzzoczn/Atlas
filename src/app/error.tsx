"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where the error would be forwarded to monitoring.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-danger/25 bg-danger/10">
          <TriangleAlert className="size-6 text-danger" />
        </div>
        <h1 className="mt-5 font-display text-[20px] font-semibold tracking-tight">
          Algo saiu do previsto
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          A tela não conseguiu carregar. Tente novamente — se o erro persistir, o
          time de suporte consegue ver o identificador abaixo.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-subtle">
            digest: {error.digest}
          </p>
        )}
        <Button className="mt-6" onClick={reset}>
          <RefreshCw />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
