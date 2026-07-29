import type { Metadata } from "next";
import { InventoryView } from "@/features/inventory/inventory-view";

export const metadata: Metadata = { title: "Estoque" };

export default function InventoryPage() {
  return <InventoryView />;
}
