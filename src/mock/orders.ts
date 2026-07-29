import type { Order, OrderStatus, PaymentMethod } from "@/types";
import { MOCK_NOW } from "@/config/site";
import { buyerNames, cities, marketplaceMap } from "./catalog";
import { products } from "./products";
import { createRng, daysAgo, daysAhead, float, int, pick, weighted } from "./random";

const STATUS: readonly (readonly [OrderStatus, number])[] = [
  ["pendente", 10],
  ["pronto", 24],
  ["transito", 27],
  ["entregue", 33],
  ["cancelado", 6],
];

const PAYMENTS: readonly (readonly [PaymentMethod, number])[] = [
  ["pix", 41],
  ["cartao", 44],
  ["boleto", 9],
  ["saldo", 6],
];

const ACCOUNTS = [
  "Atlas Store Oficial",
  "Atlas Outlet",
  "Nexus Distribuidora",
  "Atlas Prime",
];

const TAG_POOL = [
  "full",
  "frete grátis",
  "primeira compra",
  "recompra",
  "cupom",
  "campanha ads",
  "catálogo",
];

/** ~1.000 pedidos por 30 dias, distribuídos ao longo de uma janela de 90 dias. */
const ORDER_COUNT = 3000;

export const orders: Order[] = Array.from({ length: ORDER_COUNT }, (_, index) => {
  const rng = createRng(4200 + index * 91);
  const status = weighted(rng, STATUS);
  const ageDays = float(rng, 0, 89, 3);
  const location = pick(rng, cities);

  const itemCount = weighted(rng, [
    [1, 72],
    [2, 20],
    [3, 8],
  ]);

  const items = Array.from({ length: itemCount }, () => {
    const product = pick(rng, products);
    const quantity = weighted(rng, [
      [1, 82],
      [2, 13],
      [3, 5],
    ]);
    // ~7% of items arrive without a linked cost — drives the "sem custo" alert.
    const hasCost = rng() > 0.07;
    return {
      sku: product.sku,
      title: product.title,
      quantity,
      unitPrice: product.price,
      cost: hasCost ? product.cost : null,
    };
  });

  const revenue = Number(
    items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0).toFixed(2),
  );
  const feeRate = float(rng, 0.11, 0.18, 4);
  const fees = Number((revenue * feeRate).toFixed(2));
  const shipping = Number(
    (rng() > 0.42 ? float(rng, 12, 46, 2) : 0).toFixed(2),
  );

  const missingCost = items.some((i) => i.cost === null);
  const cost = missingCost
    ? null
    : Number(items.reduce((sum, i) => sum + (i.cost ?? 0) * i.quantity, 0).toFixed(2));

  // Orders without linked costs report gross contribution instead of net profit.
  const profit = Number((revenue - fees - shipping - (cost ?? 0)).toFixed(2));

  return {
    id: `ord_${String(index + 1).padStart(4, "0")}`,
    code: `#${20000 + index * 7}${int(rng, 100000, 999999)}`,
    marketplace: items.length
      ? products.find((p) => p.sku === items[0].sku)!.marketplace
      : "mercado-livre",
    account: pick(rng, ACCOUNTS),
    status,
    payment: weighted(rng, PAYMENTS),
    buyer: pick(rng, buyerNames),
    city: location.city,
    state: location.state,
    createdAt: daysAgo(MOCK_NOW, ageDays),
    releaseAt: daysAhead(MOCK_NOW, Math.max(0, 30 - ageDays)),
    revenue,
    fees,
    shipping,
    cost,
    profit,
    margin: Number(((profit / revenue) * 100).toFixed(1)),
    items,
    tags: Array.from(
      new Set(Array.from({ length: int(rng, 0, 2) }, () => pick(rng, TAG_POOL))),
    ),
  } satisfies Order;
}).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

export const orderStatusLabel: Record<OrderStatus, string> = {
  pendente: "Pendente",
  pronto: "Pronto para enviar",
  transito: "Em trânsito",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const paymentLabel: Record<PaymentMethod, string> = {
  pix: "Pix",
  cartao: "Cartão",
  boleto: "Boleto",
  saldo: "Saldo",
};

const withinDays = (order: Order, days: number) =>
  +new Date(order.createdAt) >= MOCK_NOW.getTime() - days * 86400000;

export const ordersLast30 = orders.filter((o) => withinDays(o, 30));
export const ordersPrev30 = orders.filter(
  (o) => withinDays(o, 60) && !withinDays(o, 30),
);

export const ordersMissingCost = orders.filter((o) => o.cost === null);

export function summarize(list: Order[]) {
  const valid = list.filter((o) => o.status !== "cancelado");
  const revenue = valid.reduce((s, o) => s + o.revenue, 0);
  const profit = valid.reduce((s, o) => s + o.profit, 0);
  const fees = valid.reduce((s, o) => s + o.fees, 0);
  const units = valid.reduce(
    (s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0),
    0,
  );
  return {
    orders: valid.length,
    revenue,
    profit,
    fees,
    units,
    ticket: valid.length ? revenue / valid.length : 0,
    margin: revenue ? (profit / revenue) * 100 : 0,
  };
}

export const orderStatusBreakdown = (
  ["pendente", "pronto", "transito", "entregue", "cancelado"] as OrderStatus[]
).map((status) => ({
  status,
  label: orderStatusLabel[status],
  count: ordersLast30.filter((o) => o.status === status).length,
}));

export const marketplaceBreakdown = [
  ...ordersLast30
    .reduce((acc, order) => {
      const entry = acc.get(order.marketplace) ?? { revenue: 0, orders: 0 };
      entry.revenue += order.revenue;
      entry.orders += 1;
      acc.set(order.marketplace, entry);
      return acc;
    }, new Map<string, { revenue: number; orders: number }>())
    .entries(),
]
  .map(([id, value]) => ({
    id,
    name: marketplaceMap[id as keyof typeof marketplaceMap].name,
    color: marketplaceMap[id as keyof typeof marketplaceMap].color,
    revenue: Math.round(value.revenue),
    orders: value.orders,
  }))
  .sort((a, b) => b.revenue - a.revenue);
