"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Download,
  LayoutDashboard,
  Percent,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUi, rangeDays, rangeLabels } from "@/store/ui-store";
import {
  funnelStages,
  goals,
  heatmapMax,
  hourlyPeak,
  kpiSeries,
  radarDimensions,
  regionSales,
  salesHeatmap,
  seriesTotals,
  weekdayLabels,
} from "@/mock/analytics";
import {
  activityFeed,
  insightScore,
  insights,
} from "@/mock/intelligence";
import {
  marketplaceBreakdown,
  orderStatusBreakdown,
  ordersLast30,
} from "@/mock/orders";
import { topProducts } from "@/mock/products";
import { sessionUser } from "@/mock/session";
import { currency, number } from "@/utils/format";
import {
  ChannelDonut,
  CompetitiveRadar,
  ConversionFunnel,
  RevenueChart,
  SalesHeatmap,
} from "./dashboard-charts";
import { BrazilTileMap } from "./brazil-tile-map";
import {
  ActivityPanel,
  AlertBanner,
  GoalsPanel,
  InsightsPanel,
  StatusBreakdown,
  TopProductsPanel,
} from "./dashboard-panels";
import { KpiCard } from "./kpi-card";

export function DashboardView() {
  const { range } = useUi();
  const days = rangeDays[range];

  const { current, previous, series } = useMemo(() => {
    const window = kpiSeries.slice(-days);
    const prior = kpiSeries.slice(-days * 2, -days);
    return {
      series: window,
      current: seriesTotals(window),
      previous: seriesTotals(prior.length ? prior : window),
    };
  }, [days]);

  const ticket = current.orders ? current.revenue / current.orders : 0;
  const previousTicket = previous.orders ? previous.revenue / previous.orders : 0;
  const margin = current.revenue ? (current.profit / current.revenue) * 100 : 0;
  const previousMargin = previous.revenue
    ? (previous.profit / previous.revenue) * 100
    : 0;

  const trendOf = (key: "revenue" | "profit" | "orders") =>
    series.slice(-14).map((point) => point[key]);

  const missingCost = useMemo(() => {
    const affected = ordersLast30.filter((order) => order.cost === null);
    return {
      count: affected.length,
      revenue: affected.reduce((sum, order) => sum + order.revenue, 0),
    };
  }, []);

  // The channel split keeps its shape from the order records but is rescaled to
  // the selected range, so the donut total always matches the revenue KPI.
  const channels = useMemo(() => {
    const base = marketplaceBreakdown.reduce((sum, item) => sum + item.revenue, 0);
    const factor = base ? current.revenue / base : 1;
    return marketplaceBreakdown.map((item) => ({
      ...item,
      revenue: Math.round(item.revenue * factor),
      orders: Math.round(item.orders * factor),
    }));
  }, [current.revenue]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={rangeLabels[range]}
        title={`Boa tarde, ${sessionUser.firstName}`}
        description="Panorama consolidado da sua operação em todos os canais conectados."
        icon={LayoutDashboard}
        meta={
          <>
            <Badge tone="success" size="lg">
              <StatusDot tone="success" pulse />
              5 canais sincronizados
            </Badge>
            <Badge tone="neutral" size="lg">
              <Clock />
              Pico de vendas às {hourlyPeak.hour}h
            </Badge>
          </>
        }
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Download />
              Exportar
            </Button>
            <Button size="sm" asChild>
              <Link href="/atlas-ai">
                <Sparkles />
                Analisar com IA
              </Link>
            </Button>
          </>
        }
      />

      {missingCost.count > 0 && (
        <AlertBanner
          title={`${number(missingCost.count)} pedidos sem custo vinculado podem distorcer o lucro`}
          detail={`${currency(missingCost.revenue)} em receita estão sem SKU associado nos últimos 30 dias.`}
          href="/pedidos"
          actionLabel="Revisar pedidos"
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Faturamento"
          value={current.revenue}
          previous={previous.revenue}
          icon={Wallet}
          trend={trendOf("revenue")}
          hint="Receita bruta antes de taxas, frete e impostos."
          footer={`${rangeLabels[range]} vs período anterior`}
        />
        <KpiCard
          index={1}
          label="Lucro líquido"
          value={current.profit}
          previous={previous.profit}
          icon={TrendingUp}
          trend={trendOf("profit")}
          hint="Receita menos comissão do canal, frete, custo da mercadoria e impostos."
          footer={`Margem de ${margin.toFixed(1).replace(".", ",")}%`}
        />
        <KpiCard
          index={2}
          label="Pedidos"
          value={current.orders}
          previous={previous.orders}
          format="number"
          icon={ShoppingCart}
          trend={trendOf("orders")}
          footer={`Ticket médio de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ticket)}`}
        />
        <KpiCard
          index={3}
          label="Margem de contribuição"
          value={margin}
          previous={previousMargin}
          format="percent"
          icon={Percent}
          hint="Percentual do faturamento que sobra depois dos custos variáveis."
          footer={`Ticket anterior ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(previousTicket)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RevenueChart data={series} />
        </div>
        <ChannelDonut
          data={channels}
          subtitle={`Distribuição · ${rangeLabels[range].toLowerCase()}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <InsightsPanel
          insights={insights}
          score={insightScore}
          className="xl:col-span-2"
        />
        <div className="space-y-4">
          <GoalsPanel goals={goals} />
          <StatusBreakdown data={orderStatusBreakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalesHeatmap
          cells={salesHeatmap}
          max={heatmapMax}
          weekdays={weekdayLabels}
        />
        <BrazilTileMap data={regionSales} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ConversionFunnel stages={funnelStages} />
        <CompetitiveRadar data={radarDimensions} />
        <ActivityPanel events={activityFeed} />
      </div>

      <TopProductsPanel products={topProducts} />
    </div>
  );
}
