import type {
  Automation,
  AutomationTrigger,
  Competitor,
  Customer,
  CustomerTier,
  MovementType,
  StockMovement,
  Transaction,
  TransactionType,
} from "@/types";
import { MOCK_NOW } from "@/config/site";
import {
  buyerNames,
  cities,
  connectedMarketplaces,
  operators,
  warehouses,
} from "./catalog";
import { products } from "./products";
import { createRng, daysAgo, float, int, pick, weighted } from "./random";

/* ------------------------------------------------------------------ stock */

const MOVEMENT: readonly (readonly [MovementType, number])[] = [
  ["saida", 58],
  ["entrada", 26],
  ["ajuste", 10],
  ["devolucao", 6],
];

export const stockMovements: StockMovement[] = Array.from(
  { length: 120 },
  (_, index) => {
    const rng = createRng(2400 + index * 53);
    const product = pick(rng, products);
    const type = weighted(rng, MOVEMENT);
    const quantity = int(rng, 1, type === "entrada" ? 90 : 14);

    return {
      id: `mov_${String(index + 1).padStart(4, "0")}`,
      sku: product.sku,
      product: product.title,
      type,
      quantity: type === "saida" ? -quantity : quantity,
      balance: product.stock + int(rng, -6, 24),
      warehouse: pick(rng, warehouses),
      operator: pick(rng, operators),
      createdAt: daysAgo(MOCK_NOW, float(rng, 0, 44, 3)),
    } satisfies StockMovement;
  },
).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

/** Fixed split of the physical inventory across the distribution centres. */
const WAREHOUSE_SHARE = [0.34, 0.26, 0.21, 0.12, 0.07];

const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);

export const warehouseSummary = warehouses.map((name, i) => {
  const rng = createRng(3800 + i * 41);
  const share = WAREHOUSE_SHARE[i];
  return {
    name,
    // A SKU can sit in more than one centre, so these do not sum to 90.
    skus: Math.max(6, Math.round(products.length * share * float(rng, 1.1, 1.6, 2))),
    units: Math.round(totalUnits * share),
    value: Math.round(totalValue * share),
    occupancy: float(rng, 38, 94, 1),
  };
});

/* ---------------------------------------------------------------- finance */

const TX_TYPES: readonly (readonly [TransactionType, number])[] = [
  ["receita", 44],
  ["taxa", 22],
  ["frete", 14],
  ["custo", 14],
  ["ads", 6],
];

const TX_LABEL: Record<TransactionType, string> = {
  receita: "Repasse de venda",
  taxa: "Comissão do canal",
  frete: "Frete e logística",
  custo: "Custo de mercadoria",
  ads: "Investimento em mídia",
};

export const transactions: Transaction[] = Array.from(
  { length: 140 },
  (_, index) => {
    const rng = createRng(5600 + index * 67);
    const type = weighted(rng, TX_TYPES);
    const magnitude =
      type === "receita" ? float(rng, 180, 4200, 2) : float(rng, 22, 1400, 2);

    return {
      id: `tx_${String(index + 1).padStart(4, "0")}`,
      description: TX_LABEL[type],
      reference: `#${int(rng, 2000000, 2999999)}${int(rng, 1000, 9999)}`,
      marketplace: pick(rng, connectedMarketplaces),
      type,
      amount: Number((type === "receita" ? magnitude : -magnitude).toFixed(2)),
      status: weighted(rng, [
        ["liquidado", 62],
        ["previsto", 30],
        ["retido", 8],
      ] as const),
      date: daysAgo(MOCK_NOW, float(rng, -18, 60, 3)),
    } satisfies Transaction;
  },
).sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const cashflowForecast = Array.from({ length: 30 }, (_, i) => {
  const rng = createRng(7200 + i * 37);
  const inflow = Math.round(float(rng, 18_000, 52_000, 0));
  const outflow = Math.round(float(rng, 11_000, 34_000, 0));
  return {
    date: new Date(MOCK_NOW.getTime() + i * 86400000).toISOString().slice(0, 10),
    entrada: inflow,
    saida: -outflow,
    saldo: inflow - outflow,
  };
});

/** Últimos 90 dias — soma ~66% da receita do mesmo período. */
export const costBreakdown = [
  { name: "Custo de mercadoria", value: 1_031_400, color: "var(--color-brand-500)" },
  { name: "Comissões do canal", value: 420_600, color: "var(--color-accent)" },
  { name: "Frete e logística", value: 236_550, color: "var(--color-info)" },
  { name: "Mídia paga", value: 262_800, color: "var(--color-warning)" },
  { name: "Impostos", value: 220_780, color: "var(--color-danger)" },
  { name: "Operacional", value: 86_920, color: "var(--color-subtle)" },
];

export const receivables = [
  { label: "A liberar em 7 dias", value: 214_380, count: 212 },
  { label: "A liberar em 15 dias", value: 361_940, count: 358 },
  { label: "A liberar em 30 dias", value: 468_210, count: 462 },
  { label: "Retido em disputa", value: 21_640, count: 21 },
];

/* -------------------------------------------------------------- customers */

const TIERS: readonly (readonly [CustomerTier, number])[] = [
  ["novo", 34],
  ["recorrente", 38],
  ["vip", 14],
  ["em-risco", 14],
];

export const customers: Customer[] = Array.from({ length: 84 }, (_, index) => {
  const rng = createRng(6100 + index * 43);
  const name = buyerNames[index % buyerNames.length];
  const location = pick(rng, cities);
  const tier = weighted(rng, TIERS);
  const orderCount =
    tier === "vip" ? int(rng, 8, 26) : tier === "recorrente" ? int(rng, 3, 7) : int(rng, 1, 2);
  const ticket = float(rng, 620, 1480, 2);

  return {
    id: `cus_${String(index + 1).padStart(4, "0")}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z ]/g, "").split(" ").slice(0, 2).join(".")}@exemplo.com.br`,
    city: location.city,
    state: location.state,
    tier,
    orders: orderCount,
    spent: Number((orderCount * ticket).toFixed(2)),
    ticket: Number(ticket.toFixed(2)),
    lastOrderAt: daysAgo(MOCK_NOW, tier === "em-risco" ? float(rng, 92, 210, 2) : float(rng, 0, 60, 2)),
    nps: int(rng, tier === "em-risco" ? 2 : 6, 10),
  } satisfies Customer;
}).sort((a, b) => b.spent - a.spent);

export const customerTierSummary = (
  ["vip", "recorrente", "novo", "em-risco"] as CustomerTier[]
).map((tier) => {
  const list = customers.filter((c) => c.tier === tier);
  return {
    tier,
    count: list.length,
    revenue: Math.round(list.reduce((s, c) => s + c.spent, 0)),
  };
});

/* -------------------------------------------------------------- campaigns */

const OBJECTIVES = [
  "Escalar vendas",
  "Aumentar visibilidade",
  "Liquidar estoque",
  "Lançamento de produto",
  "Defender Buy Box",
];

export const campaigns = Array.from({ length: 18 }, (_, index) => {
  const rng = createRng(4700 + index * 59);
  // Calibrado para ~9% da receita em mídia e ROAS consolidado em torno de 4.
  const impressions = int(rng, 8_000, 240_000);
  const ctr = float(rng, 0.4, 3.8, 2);
  const clicks = Math.round((impressions * ctr) / 100);
  const cpc = float(rng, 0.42, 3.4, 2);
  const spend = Number((clicks * cpc).toFixed(2));
  const conversions = Math.round((clicks * float(rng, 0.3, 1.5, 2)) / 100);
  const revenue = Number((conversions * float(rng, 620, 1180, 2)).toFixed(2));

  return {
    id: `cmp_${String(index + 1).padStart(3, "0")}`,
    name: `${pick(rng, OBJECTIVES)} · ${pick(rng, ["Verão", "Q3", "Black", "Sempre Ativa", "Reforço"])} ${index + 1}`,
    marketplace: pick(rng, connectedMarketplaces),
    objective: pick(rng, OBJECTIVES),
    status: weighted(rng, [
      ["ativa", 58],
      ["pausada", 22],
      ["encerrada", 14],
      ["rascunho", 6],
    ] as const),
    budget: Math.round(spend * float(rng, 1.1, 1.9, 2)),
    spend,
    revenue,
    acos: Number(((spend / Math.max(revenue, 1)) * 100).toFixed(1)),
    roas: Number((revenue / Math.max(spend, 1)).toFixed(2)),
    clicks,
    impressions,
    ctr,
    cpc,
    conversions,
    startedAt: daysAgo(MOCK_NOW, float(rng, 4, 180, 2)),
  };
}).sort((a, b) => b.revenue - a.revenue);

export const adsSeries = Array.from({ length: 30 }, (_, i) => {
  const rng = createRng(8300 + i * 21);
  const spend = Math.round(float(rng, 1_800, 4_400, 0));
  return {
    date: new Date(MOCK_NOW.getTime() - (29 - i) * 86400000)
      .toISOString()
      .slice(0, 10),
    investimento: spend,
    receita: Math.round(spend * float(rng, 2.2, 6.0, 2)),
    acos: float(rng, 8.4, 28.6, 1),
  };
});

/* ------------------------------------------------------------ competitors */

const SELLERS = [
  "TechPrime Oficial", "MegaDeal Store", "Nord Distribuidora", "CasaViva Shop",
  "Orbit Eletro", "Vitrine Nacional", "PontoZero Store", "HubMax Comercial",
  "Alfa Importados", "Rede Ubá Varejo", "Kaizen Express", "Vetor Digital",
];

export const competitors: Competitor[] = Array.from({ length: 24 }, (_, index) => {
  const rng = createRng(3900 + index * 47);
  const product = pick(rng, products);
  const priceDelta = float(rng, -18, 22, 1);

  return {
    id: `cmp_seller_${index + 1}`,
    seller: SELLERS[index % SELLERS.length],
    marketplace: product.marketplace,
    product: product.title,
    price: Number((product.price * (1 + priceDelta / 100)).toFixed(2)),
    priceDelta,
    stock: int(rng, 0, 480),
    sold30d: int(rng, 12, 940),
    rating: float(rng, 3.4, 5, 1),
    reputation: weighted(rng, [
      ["platinum", 34],
      ["gold", 36],
      ["silver", 20],
      ["bronze", 10],
    ] as const),
    buyBoxShare: float(rng, 2, 68, 1),
    trend: Array.from({ length: 12 }, (_, t) =>
      Math.round(product.price * (1 + float(createRng(index * 100 + t), -0.12, 0.12, 3))),
    ),
  } satisfies Competitor;
}).sort((a, b) => b.buyBoxShare - a.buyBoxShare);

/* ------------------------------------------------------------ automations */

const AUTOMATION_SEED: {
  name: string;
  description: string;
  trigger: AutomationTrigger;
}[] = [
  {
    name: "Repricing defensivo de Buy Box",
    description: "Reduz o preço em até 4% quando um concorrente assume a Buy Box, respeitando a margem mínima configurada.",
    trigger: "concorrente",
  },
  {
    name: "Alerta de ruptura de estoque",
    description: "Notifica o time de compras quando a cobertura projetada cai abaixo de 10 dias.",
    trigger: "estoque",
  },
  {
    name: "Pausar anúncio sem margem",
    description: "Pausa automaticamente SKUs cuja margem de contribuição fica negativa após taxas e frete.",
    trigger: "preco",
  },
  {
    name: "Vincular custo automaticamente",
    description: "Associa o custo do SKU a pedidos importados sem custo vinculado usando o último custo médio.",
    trigger: "pedido",
  },
  {
    name: "Reposição sugerida semanal",
    description: "Gera toda segunda-feira uma lista de reposição baseada na curva ABC e no lead time do fornecedor.",
    trigger: "agenda",
  },
  {
    name: "Escalar campanha performática",
    description: "Aumenta o orçamento diário em 15% quando o ROAS de 7 dias supera 6,0.",
    trigger: "preco",
  },
  {
    name: "Recuperar cliente em risco",
    description: "Dispara cupom personalizado para compradores sem pedidos há mais de 90 dias.",
    trigger: "agenda",
  },
  {
    name: "Bloquear venda sem cobertura",
    description: "Pausa o anúncio quando o estoque físico chega a zero em todos os centros de distribuição.",
    trigger: "estoque",
  },
];

export const automations: Automation[] = AUTOMATION_SEED.map((seed, index) => {
  const rng = createRng(9500 + index * 71);
  return {
    id: `aut_${String(index + 1).padStart(3, "0")}`,
    ...seed,
    enabled: index !== 5 && index !== 7,
    runs: int(rng, 24, 3_400),
    successRate: float(rng, 88.4, 99.8, 1),
    savedHours: float(rng, 2.4, 38.5, 1),
    lastRunAt: daysAgo(MOCK_NOW, float(rng, 0, 3, 3)),
  } satisfies Automation;
});

export const automationRuns = Array.from({ length: 14 }, (_, i) => {
  const rng = createRng(1900 + i * 27);
  return {
    date: new Date(MOCK_NOW.getTime() - (13 - i) * 86400000)
      .toISOString()
      .slice(0, 10),
    execucoes: int(rng, 42, 210),
    falhas: int(rng, 0, 7),
  };
});
