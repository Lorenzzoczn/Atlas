import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketplacesView } from "@/features/marketplaces/marketplaces-view";
import { LoadingState } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Marketplaces" };

export default function MarketplacesPage() {
  // A view lê `?connection=` para avisar o resultado do callback do OAuth, e
  // `useSearchParams` exige um limite de Suspense na renderização estática.
  return (
    <Suspense fallback={<LoadingState label="Carregando canais…" />}>
      <MarketplacesView />
    </Suspense>
  );
}
