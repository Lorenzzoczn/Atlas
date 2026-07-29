import type { Goal, KpiPoint, RegionSales } from "@/types";
import { MOCK_NOW } from "@/config/site";
import { createRng, float } from "./random";

/**
 * ── Reference scale ────────────────────────────────────────────────────────
 * Every dataset in the mock layer is calibrated to one fictional operation so
 * the numbers agree across screens:
 *
 *   ~1.000 pedidos / 30 dias · ticket ~R$ 1.000 · receita ~R$ 1,0 mi / 30 dias
 *   ~40 mil visitas / 30 dias · ~9% da receita investido em mídia · 90 SKUs
 *
 * When you change one generator, re-check the others against these anchors.
 */

/** 90 days of daily series, oldest first. Weekends dip, month-end spikes. */
export const kpiSeries: KpiPoint[] = Array.from({ length: 90 }, (_, i) => {
  const rng = createRng(7700 + i * 13);
  const date = new Date(MOCK_NOW.getTime() - (89 - i) * 86400000);
  const weekday = date.getUTCDay();
  const weekendFactor = weekday === 0 || weekday === 6 ? 0.74 : 1;
  const growth = 1 + (i / 90) * 0.42;
  const payday = date.getUTCDate() <= 6 || date.getUTCDate() >= 27 ? 1.16 : 1;

  const revenue = Math.round(
    24_000 * growth * weekendFactor * payday * float(rng, 0.82, 1.24, 3),
  );
  const margin = float(rng, 0.29, 0.41, 3);
  // Divisor is the average ticket. It is kept in the same band the generated
  // order records produce so the dashboard and the orders table agree.
  const orders = Math.max(1, Math.round(revenue / float(rng, 860, 1180, 2)));
  const visits = Math.round(orders * float(rng, 24, 58, 1));
  const adSpend = Math.round(revenue * float(rng, 0.05, 0.13, 3));

  return {
    date: date.toISOString().slice(0, 10),
    revenue,
    profit: Math.round(revenue * margin),
    orders,
    visits,
    adSpend,
  };
});

export const seriesForRange = (days: number) => kpiSeries.slice(-days);

export function seriesTotals(points: KpiPoint[]) {
  return points.reduce(
    (acc, p) => ({
      revenue: acc.revenue + p.revenue,
      profit: acc.profit + p.profit,
      orders: acc.orders + p.orders,
      visits: acc.visits + p.visits,
      adSpend: acc.adSpend + p.adSpend,
    }),
    { revenue: 0, profit: 0, orders: 0, visits: 0, adSpend: 0 },
  );
}

/** Sales by hour of day × weekday — feeds the dashboard heatmap. */
export const salesHeatmap = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => {
    const rng = createRng(3300 + day * 31 + hour * 7);
    const dayBoost = day === 0 || day === 6 ? 0.72 : 1;
    const peak =
      hour >= 11 && hour <= 14 ? 1.9 : hour >= 19 && hour <= 22 ? 2.2 : hour < 7 ? 0.18 : 1;
    return {
      day,
      hour,
      value: Math.round(14 * dayBoost * peak * float(rng, 0.55, 1.5, 3)),
    };
  }),
).flat();

export const heatmapMax = Math.max(...salesHeatmap.map((c) => c.value));

export const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const funnelStages = [
  { stage: "Visitas", value: 40_480, color: "var(--color-brand-400)" },
  { stage: "Produto visto", value: 17_890, color: "var(--color-brand-500)" },
  { stage: "Adicionou ao carrinho", value: 5_740, color: "var(--color-accent)" },
  { stage: "Checkout iniciado", value: 2_596, color: "var(--color-info)" },
  { stage: "Pedido pago", value: 1_018, color: "var(--color-success)" },
];

export const radarDimensions = [
  { dimension: "Preço", atlas: 88, mercado: 71 },
  { dimension: "Margem", atlas: 82, mercado: 64 },
  { dimension: "Reputação", atlas: 94, mercado: 78 },
  { dimension: "Prazo de envio", atlas: 76, mercado: 82 },
  { dimension: "Buy Box", atlas: 69, mercado: 74 },
  { dimension: "Conversão", atlas: 85, mercado: 66 },
];

const STATES = [
  { state: "SP", name: "São Paulo", region: "Sudeste", weight: 100 },
  { state: "RJ", name: "Rio de Janeiro", region: "Sudeste", weight: 52 },
  { state: "MG", name: "Minas Gerais", region: "Sudeste", weight: 44 },
  { state: "ES", name: "Espírito Santo", region: "Sudeste", weight: 14 },
  { state: "PR", name: "Paraná", region: "Sul", weight: 33 },
  { state: "RS", name: "Rio Grande do Sul", region: "Sul", weight: 31 },
  { state: "SC", name: "Santa Catarina", region: "Sul", weight: 27 },
  { state: "BA", name: "Bahia", region: "Nordeste", weight: 24 },
  { state: "PE", name: "Pernambuco", region: "Nordeste", weight: 19 },
  { state: "CE", name: "Ceará", region: "Nordeste", weight: 17 },
  { state: "RN", name: "Rio Grande do Norte", region: "Nordeste", weight: 9 },
  { state: "GO", name: "Goiás", region: "Centro-Oeste", weight: 18 },
  { state: "DF", name: "Distrito Federal", region: "Centro-Oeste", weight: 16 },
  { state: "MT", name: "Mato Grosso", region: "Centro-Oeste", weight: 11 },
  { state: "AM", name: "Amazonas", region: "Norte", weight: 8 },
  { state: "PA", name: "Pará", region: "Norte", weight: 10 },
];

export const regionSales: RegionSales[] = STATES.map((entry, i) => {
  const rng = createRng(5100 + i * 29);
  const orders = Math.round(entry.weight * float(rng, 1.6, 2.6, 2));
  return {
    state: entry.state,
    name: entry.name,
    region: entry.region,
    orders,
    // Revenue per order tracks the same ticket band the order records produce.
    revenue: Math.round(orders * float(rng, 860, 1180, 2)),
  };
}).sort((a, b) => b.revenue - a.revenue);

export const regionTotals = [
  ...regionSales
    .reduce((acc, item) => {
      acc.set(item.region, (acc.get(item.region) ?? 0) + item.revenue);
      return acc;
    }, new Map<string, number>())
    .entries(),
]
  .map(([region, revenue]) => ({ region, revenue }))
  .sort((a, b) => b.revenue - a.revenue);

export const goals: Goal[] = [
  { id: "goal_rev", label: "Faturamento do mês", current: 812_400, target: 1_050_000, unit: "currency" },
  { id: "goal_profit", label: "Lucro líquido", current: 284_340, target: 365_000, unit: "currency" },
  { id: "goal_orders", label: "Pedidos", current: 812, target: 1_100, unit: "number" },
  { id: "goal_margin", label: "Margem de contribuição", current: 35.2, target: 38, unit: "percent" },
];

/** 12-week retention cohort, % of buyers returning. */
export const cohortRetention = Array.from({ length: 6 }, (_, cohort) => {
  const rng = createRng(6600 + cohort * 17);
  return {
    cohort: `Semana ${cohort + 1}`,
    values: Array.from({ length: 6 }, (_, week) =>
      week > 5 - cohort
        ? null
        : Number((100 * Math.exp(-week * float(rng, 0.34, 0.52, 3))).toFixed(1)),
    ),
  };
});

export const hourlyPeak = (() => {
  const totals = new Map<number, number>();
  for (const cell of salesHeatmap) {
    totals.set(cell.hour, (totals.get(cell.hour) ?? 0) + cell.value);
  }
  const [hour, value] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
  return { hour, value };
})();

export const trafficSources = [
  { source: "Busca orgânica", visits: 16_516, share: 40.8, conversion: 4.1 },
  { source: "Anúncios patrocinados", visits: 11_861, share: 29.3, conversion: 5.6 },
  { source: "Recomendação do canal", visits: 6_558, share: 16.2, conversion: 3.2 },
  { source: "Social / creators", visits: 3_441, share: 8.5, conversion: 2.4 },
  { source: "Direto", visits: 2_104, share: 5.2, conversion: 6.9 },
];

export const analyticsGeneratedAt = MOCK_NOW.toISOString();

export const priceElasticity = Array.from({ length: 24 }, (_, i) => {
  const rng = createRng(8800 + i * 11);
  const price = 180 + i * 12;
  return {
    price,
    units: Math.round(420 * Math.exp(-i * 0.11) * float(rng, 0.86, 1.14, 3)),
    profit: Math.round(
      420 * Math.exp(-i * 0.11) * (price - 148) * float(rng, 0.9, 1.1, 3),
    ),
  };
});

export const marginDistribution = Array.from({ length: 10 }, (_, i) => {
  const rng = createRng(9900 + i * 23);
  const center = Math.abs(i - 4.5);
  return {
    bucket: `${i * 10}–${i * 10 + 10}%`,
    skus: Math.max(1, Math.round(28 * Math.exp(-center * 0.42) * float(rng, 0.7, 1.3, 3))),
  };
});

export const compareYears = Array.from({ length: 12 }, (_, i) => {
  const rng = createRng(1200 + i * 19);
  const base = 620_000 + i * 42_000;
  return {
    month: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i],
    atual: Math.round(base * float(rng, 0.9, 1.18, 3)),
    anterior: Math.round(base * float(rng, 0.62, 0.86, 3)),
  };
});
