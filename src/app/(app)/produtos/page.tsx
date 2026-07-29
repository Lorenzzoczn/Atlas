import type { Metadata } from "next";
import { ProductsView } from "@/features/products/products-view";

export const metadata: Metadata = { title: "Produtos" };

export default function ProductsPage() {
  return <ProductsView />;
}
