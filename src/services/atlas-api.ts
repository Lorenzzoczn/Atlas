import { rangeDays, type DateRangeKey } from "@/config/ranges";
import { seriesForRange, seriesTotals } from "@/mock/analytics";
import { orders, summarize } from "@/mock/orders";
import { insights } from "@/mock/intelligence";
import { products } from "@/mock/products";
import { MOCK_NOW } from "@/config/site";

/** Simulated network latency so loading states are actually exercised. */
const latency = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms));

export interface OverviewResponse {
  range: DateRangeKey;
  current: ReturnType<typeof seriesTotals>;
  previous: ReturnType<typeof seriesTotals>;
  orders: number;
  ticket: number;
  margin: number;
}

export async function fetchOverview(range: DateRangeKey): Promise<OverviewResponse> {
  await latency();
  const days = rangeDays[range];
  const current = seriesForRange(days);
  const previous = seriesForRange(days * 2).slice(0, days);

  const currentTotals = seriesTotals(current);
  const previousTotals = seriesTotals(previous);

  return {
    range,
    current: currentTotals,
    previous: previousTotals,
    orders: currentTotals.orders,
    ticket: currentTotals.orders ? currentTotals.revenue / currentTotals.orders : 0,
    margin: currentTotals.revenue
      ? (currentTotals.profit / currentTotals.revenue) * 100
      : 0,
  };
}

export interface OrderQuery {
  search?: string;
  status?: string;
  marketplace?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchOrders({
  search = "",
  status = "todos",
  marketplace = "todos",
  page = 1,
  pageSize = 12,
}: OrderQuery = {}) {
  await latency(320);
  const term = search.trim().toLowerCase();

  const filtered = orders.filter((order) => {
    if (status !== "todos" && order.status !== status) return false;
    if (marketplace !== "todos" && order.marketplace !== marketplace) return false;
    if (!term) return true;
    return (
      order.code.toLowerCase().includes(term) ||
      order.buyer.toLowerCase().includes(term) ||
      order.items.some((item) => item.title.toLowerCase().includes(term))
    );
  });

  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    summary: summarize(filtered),
  };
}

export async function fetchProducts(search = "") {
  await latency(300);
  const term = search.trim().toLowerCase();
  if (!term) return products;
  return products.filter(
    (product) =>
      product.title.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term),
  );
}

export async function fetchInsights() {
  await latency(500);
  return insights;
}

/**
 * Canned Atlas AI reply. The real implementation will stream from a model;
 * here the response is picked from a small set keyed by intent.
 */
export async function askAtlas(question: string) {
  await latency(1400);
  const q = question.toLowerCase();

  if (q.includes("margem") || q.includes("lucro")) {
    return "A margem de contribuição consolidada está em 35,2%, 2,8 pontos acima do mesmo período do mês anterior. Periféricos e Casa puxam o resultado para cima, enquanto Energia opera 6,4 pontos abaixo da média por causa do frete subsidiado. Reduzir o subsídio nessa categoria devolveria cerca de R$ 7.900 por mês sem impacto relevante na conversão.";
  }
  if (q.includes("estoque") || q.includes("repor") || q.includes("ruptura")) {
    return "Cinco SKUs estão com cobertura projetada abaixo do lead time do fornecedor. O caso mais crítico é a Air Fryer Culina 8L, com 1,2 dia de cobertura e R$ 42,3 mil de receita mensal exposta. Posso consolidar o pedido de compra por fornecedor considerando lote mínimo e histórico de atraso.";
  }
  if (q.includes("concorr") || q.includes("buy box") || q.includes("preço")) {
    return "Você mantém a Buy Box em 62% dos anúncios monitorados, queda de 8,1 pontos em 7 dias. O TechPrime Oficial assumiu a posição em 4 SKUs de Periféricos após reduzir preços entre 3% e 6%. Sua estrutura de custo permite acompanhar até -3,2% preservando o piso de margem configurado.";
  }
  if (q.includes("canal") || q.includes("marketplace")) {
    return "Mercado Livre concentra 46% da receita com margem líquida de 31,4%. Shopee vem em seguida com 24% da receita, porém margem de 27,8% por causa do frete subsidiado. Amazon é o canal mais rentável em termos relativos, com 38,1% de margem, e ainda opera com apenas 9% do seu catálogo publicado — é a maior alavanca disponível hoje.";
  }
  if (q.includes("meta")) {
    return "Faltam R$ 61.080 para bater a meta de faturamento do mês, com 4 dias úteis restantes. No ritmo atual você chega a 82% do objetivo. Três movimentos fecham a lacuna: escalar as duas campanhas com ROAS acima de 6, ativar o repricing defensivo nos 4 SKUs sem Buy Box e liberar o cupom de recompra para os 118 clientes recorrentes inativos há mais de 45 dias.";
  }

  return "Analisei os dados dos últimos 30 dias. A operação está saudável, com nota 78 de 100 no índice de saúde comercial. Os dois pontos de atenção são estoque, penalizado por cinco SKUs próximos da ruptura, e rentabilidade, afetada por nove anúncios operando abaixo do custo real. Posso detalhar qualquer um desses pontos ou simular o impacto de uma correção.";
}

export const dataFreshness = MOCK_NOW.toISOString();
