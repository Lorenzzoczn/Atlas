import type { Product, ProductStatus } from "@/types";
import { MOCK_NOW } from "@/config/site";
import { connectedMarketplaces, productCatalog } from "./catalog";
import { createRng, float, int, weighted } from "./random";

const STATUS: readonly (readonly [ProductStatus, number])[] = [
  ["ativo", 74],
  ["pausado", 13],
  ["revisao", 8],
  ["encerrado", 5],
];

function sparkline(seed: number, length = 14) {
  const rng = createRng(seed);
  const out: number[] = [];
  let value = float(rng, 40, 90, 0);
  for (let i = 0; i < length; i++) {
    value = Math.max(8, value + float(rng, -12, 14, 0));
    out.push(Math.round(value));
  }
  return out;
}

/** 90 SKUs: the 30-item catalog listed across 3 marketplaces each. */
export const products: Product[] = productCatalog.flatMap((item, catalogIndex) =>
  Array.from({ length: 3 }, (_, variant) => {
    const index = catalogIndex * 3 + variant;
    const rng = createRng(9001 + index * 37);

    const marketplace =
      connectedMarketplaces[(catalogIndex + variant) % connectedMarketplaces.length];
    const price = Number((item.price * float(rng, 0.94, 1.09, 3)).toFixed(2));
    const cost = Number((item.cost * float(rng, 0.97, 1.04, 3)).toFixed(2));
    const fees = price * float(rng, 0.11, 0.19, 3);
    const profit = price - cost - fees;
    const stock = weighted(rng, [
      [int(rng, 0, 4), 12],
      [int(rng, 5, 40), 46],
      [int(rng, 41, 220), 42],
    ]);
    // Sized so the 90 SKUs together land on the reference scale documented in
    // mock/analytics.ts (~40 mil visitas e ~1.000 pedidos por 30 dias).
    const visits = int(rng, 120, 1000);
    const sold = Math.max(0, Math.round(visits * float(rng, 0.008, 0.062, 4)));

    return {
      id: `prd_${String(index + 1).padStart(4, "0")}`,
      sku: `ATL-${item.brand.slice(0, 3).toUpperCase()}-${String(catalogIndex + 1).padStart(3, "0")}-${["A", "B", "C"][variant]}`,
      title: item.title,
      category: item.category,
      brand: item.brand,
      marketplace,
      status: weighted(rng, STATUS),
      price,
      cost,
      margin: Number(((profit / price) * 100).toFixed(1)),
      stock,
      reserved: Math.min(stock, int(rng, 0, 12)),
      reorderPoint: int(rng, 8, 30),
      sold30d: sold,
      revenue30d: Number((sold * price).toFixed(2)),
      visits30d: visits,
      conversion: Number(((sold / visits) * 100).toFixed(2)),
      rating: float(rng, 3.6, 5, 1),
      reviews: int(rng, 4, 940),
      buyBox: rng() > 0.38,
      trend: sparkline(2200 + index),
    } satisfies Product;
  }),
);

export const productMap = new Map(products.map((p) => [p.id, p]));

export const lowStockProducts = products
  .filter((p) => p.status === "ativo" && p.stock <= p.reorderPoint)
  .sort((a, b) => a.stock - b.stock);

export const topProducts = [...products]
  .sort((a, b) => b.revenue30d - a.revenue30d)
  .slice(0, 10);

/** Days of cover left at the current 30-day sales pace. */
export const coverageDays = (product: Product) =>
  product.sold30d === 0
    ? 999
    : Math.round((product.stock / (product.sold30d / 30)) * 10) / 10;

export const stockValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);

export const categoryPerformance = [
  ...products
    .reduce((acc, p) => {
      const entry = acc.get(p.category) ?? {
        category: p.category,
        revenue: 0,
        units: 0,
        skus: 0,
        margin: 0,
      };
      entry.revenue += p.revenue30d;
      entry.units += p.sold30d;
      entry.skus += 1;
      entry.margin += p.margin;
      acc.set(p.category, entry);
      return acc;
    }, new Map<string, { category: string; revenue: number; units: number; skus: number; margin: number }>())
    .values(),
]
  .map((entry) => ({
    ...entry,
    revenue: Math.round(entry.revenue),
    margin: Number((entry.margin / entry.skus).toFixed(1)),
  }))
  .sort((a, b) => b.revenue - a.revenue);

export const productUpdatedAt = MOCK_NOW.toISOString();
