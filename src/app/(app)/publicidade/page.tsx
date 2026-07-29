import type { Metadata } from "next";
import { AdsView } from "@/features/ads/ads-view";

export const metadata: Metadata = { title: "Publicidade" };

export default function AdsPage() {
  return <AdsView />;
}
