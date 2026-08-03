import type { Metadata } from "next";
import { ShipmentsView } from "@/features/shipments/shipments-view";

export const metadata: Metadata = { title: "Envios" };

export default function ShipmentsPage() {
  return <ShipmentsView />;
}
