import { NextResponse } from "next/server";
import { categoryPerformance, lowStockProducts, products } from "@/mock/products";

/** GET /api/products?search=&category=&marketplace= */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const category = searchParams.get("category") ?? "todos";
  const marketplace = searchParams.get("marketplace") ?? "todos";

  const items = products.filter((product) => {
    if (category !== "todos" && product.category !== category) return false;
    if (marketplace !== "todos" && product.marketplace !== marketplace) return false;
    if (!search) return true;
    return (
      product.title.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search)
    );
  });

  return NextResponse.json({
    items,
    total: items.length,
    lowStock: lowStockProducts.length,
    categories: categoryPerformance,
  });
}
