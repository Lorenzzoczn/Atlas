import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { AtlasMark } from "@/components/brand/atlas-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="dot-bg absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000_0%,transparent_65%)]" />
        <div className="absolute left-1/2 top-1/3 size-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative max-w-md text-center">
        <AtlasMark size={64} className="mx-auto" />

        <p className="mt-8 font-display text-[64px] font-semibold leading-none tracking-[-0.05em] text-gradient">
          404
        </p>
        <h1 className="mt-3 font-display text-[20px] font-semibold tracking-tight">
          Esta rota não existe no mapa
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          A página que você procurou foi movida, renomeada ou nunca esteve aqui.
          Volte ao painel para continuar de onde parou.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <ArrowLeft />
              Voltar ao dashboard
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/suporte">
              <Compass />
              Falar com o suporte
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
