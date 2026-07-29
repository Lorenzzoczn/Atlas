"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartNoAxesCombined, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import {
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  axisProps,
} from "@/components/charts/chart-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ConversionFunnel,
  CompetitiveRadar,
} from "@/features/dashboard/dashboard-charts";
import {
  cohortRetention,
  compareYears,
  funnelStages,
  marginDistribution,
  priceElasticity,
  radarDimensions,
  trafficSources,
} from "@/mock/analytics";
import { categoryPerformance } from "@/mock/products";
import { currency, currencyCompact, number, percent } from "@/utils/format";

function CohortGrid() {
  return (
    <div className="surface-card rounded-card p-5">
      <h2 className="font-display text-[15px] font-semibold tracking-tight">
        Retenção por coorte
      </h2>
      <p className="mt-1 text-[12.5px] text-muted">
        Percentual de compradores que voltaram a comprar em cada semana seguinte
      </p>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="flex gap-1.5 pl-24">
            {Array.from({ length: 6 }, (_, week) => (
              <span
                key={week}
                className="flex-1 text-center text-[10.5px] text-subtle"
              >
                S{week}
              </span>
            ))}
          </div>

          {cohortRetention.map((row) => (
            <div key={row.cohort} className="mt-1.5 flex items-center gap-1.5">
              <span className="w-24 shrink-0 text-[11.5px] text-muted">
                {row.cohort}
              </span>
              {row.values.map((value, index) => (
                <span
                  key={index}
                  className={cn(
                    "grid h-9 flex-1 place-items-center rounded-md font-mono text-[11px] tabular-nums",
                    value === null && "border border-dashed border-border text-subtle",
                  )}
                  style={
                    value === null
                      ? undefined
                      : {
                          background: `color-mix(in oklab, var(--primary) ${Math.round(value * 0.85)}%, var(--surface-2))`,
                          color: value > 55 ? "white" : "var(--muted)",
                        }
                  }
                >
                  {value === null ? "—" : `${value.toFixed(0)}%`}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsView() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Visão geral"
        title="Análises"
        description="Funil, coortes, elasticidade de preço e comparativos que explicam o comportamento da sua operação."
        icon={ChartNoAxesCombined}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Download />
              Exportar análise
            </Button>
            <Button size="sm">
              <Sparkles />
              Interpretar com IA
            </Button>
          </>
        }
      />

      <Tabs defaultValue="desempenho">
        <TabsList>
          <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
          <TabsTrigger value="conversao">Conversão</TabsTrigger>
          <TabsTrigger value="precificacao">Precificação</TabsTrigger>
        </TabsList>

        <TabsContent value="desempenho" className="space-y-4">
          <div className="surface-card rounded-card">
            <div className="p-5 pb-2">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Comparativo anual
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">
                Receita mensal deste ano frente ao anterior
              </p>
            </div>
            <ChartFrame height={280} className="px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={compareYears}
                  margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 6" />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis
                    {...axisProps}
                    width={58}
                    tickFormatter={(value: number) => currencyCompact(value)}
                  />
                  <Tooltip
                    content={<ChartTooltip formatter={(value) => currency(value)} />}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={28}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-[11.5px] text-muted">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="anterior"
                    name="Ano anterior"
                    fill="var(--color-surface-3)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={26}
                  />
                  <Bar
                    dataKey="atual"
                    name="Ano atual"
                    fill="var(--color-brand-500)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="surface-card rounded-card p-5">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Desempenho por categoria
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">
                Receita, unidades e margem média nos últimos 30 dias
              </p>

              <ul className="mt-5 space-y-3">
                {categoryPerformance.slice(0, 8).map((entry) => {
                  const max = categoryPerformance[0].revenue;
                  return (
                    <li key={entry.category}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className="text-[12.5px] text-muted">
                          {entry.category}
                        </span>
                        <span className="flex items-baseline gap-3">
                          <Badge
                            tone={entry.margin >= 30 ? "success" : "warning"}
                            size="sm"
                          >
                            {percent(entry.margin, 0)}
                          </Badge>
                          <span className="w-20 text-right font-mono text-[12.5px] tabular-nums">
                            <Money value={entry.revenue} compact />
                          </span>
                        </span>
                      </div>
                      <Progress value={(entry.revenue / max) * 100} size="xs" />
                      <p className="mt-1 text-[10.5px] text-subtle">
                        {number(entry.units)} unidades · {entry.skus} SKUs
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <CohortGrid />
          </div>
        </TabsContent>

        <TabsContent value="conversao" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ConversionFunnel stages={funnelStages} />
            <CompetitiveRadar data={radarDimensions} />
          </div>

          <div className="surface-card rounded-card p-5">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">
              Origem do tráfego
            </h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Visitas e taxa de conversão por fonte
            </p>

            <div className="mt-5 space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="flex items-center gap-4">
                  <span className="w-44 shrink-0 truncate text-[12.5px] text-muted">
                    {source.source}
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded-lg bg-surface-2">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-brand-500 to-accent"
                      style={{ width: `${source.share * 2.3}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right font-mono text-[12px] tabular-nums text-muted">
                    {number(source.visits)}
                  </span>
                  <Badge
                    tone={source.conversion >= 5 ? "success" : "neutral"}
                    size="sm"
                    className="w-16 justify-center"
                  >
                    {percent(source.conversion)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="precificacao" className="space-y-4">
          <div className="surface-card rounded-card">
            <div className="p-5 pb-2">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Curva de elasticidade
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">
                Unidades vendidas e lucro projetado por faixa de preço
              </p>
            </div>
            <ChartFrame height={292} className="px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceElasticity}
                  margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="elastic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 6" />
                  <XAxis
                    dataKey="price"
                    {...axisProps}
                    tickFormatter={(value: number) => currencyCompact(value)}
                  />
                  <YAxis yAxisId="left" {...axisProps} width={46} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    {...axisProps}
                    width={56}
                    tickFormatter={(value: number) => currencyCompact(value)}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(value, name) =>
                          name === "Unidades" ? number(value) : currency(value)
                        }
                        labelFormatter={(label) => `Preço ${currency(Number(label))}`}
                      />
                    }
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="units"
                    name="Unidades"
                    stroke="var(--color-brand-400)"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="profit"
                    name="Lucro projetado"
                    stroke="var(--color-success)"
                    strokeWidth={2.2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
            <div className="border-t border-border px-5 py-3">
              <ChartLegend
                items={[
                  { label: "Unidades vendidas", color: "var(--color-brand-400)" },
                  { label: "Lucro projetado", color: "var(--color-success)" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="surface-card rounded-card">
              <div className="p-5 pb-2">
                <h2 className="font-display text-[15px] font-semibold tracking-tight">
                  Distribuição de margem
                </h2>
                <p className="mt-1 text-[12.5px] text-muted">
                  Quantidade de SKUs por faixa de margem de contribuição
                </p>
              </div>
              <ChartFrame height={232} className="px-2 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={marginDistribution}
                    margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="bucket" {...axisProps} interval={1} />
                    <YAxis {...axisProps} width={32} />
                    <Tooltip
                      content={
                        <ChartTooltip formatter={(value) => `${number(value)} SKUs`} />
                      }
                    />
                    <Bar dataKey="skus" name="SKUs" radius={[4, 4, 0, 0]} maxBarSize={38}>
                      {marginDistribution.map((entry, index) => (
                        <Cell
                          key={entry.bucket}
                          fill={
                            index < 2
                              ? "var(--color-danger)"
                              : index < 4
                                ? "var(--color-warning)"
                                : "var(--color-brand-500)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartFrame>
            </div>

            <div className="surface-card rounded-card">
              <div className="p-5 pb-2">
                <h2 className="font-display text-[15px] font-semibold tracking-tight">
                  Tendência de lucro acumulado
                </h2>
                <p className="mt-1 text-[12.5px] text-muted">
                  Projeção com base na elasticidade observada
                </p>
              </div>
              <ChartFrame height={232} className="px-2 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={priceElasticity}
                    margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="profit-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 6" />
                    <XAxis
                      dataKey="price"
                      {...axisProps}
                      tickFormatter={(value: number) => currencyCompact(value)}
                    />
                    <YAxis
                      {...axisProps}
                      width={56}
                      tickFormatter={(value: number) => currencyCompact(value)}
                    />
                    <Tooltip
                      content={<ChartTooltip formatter={(value) => currency(value)} />}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Lucro"
                      stroke="var(--color-success)"
                      strokeWidth={2}
                      fill="url(#profit-area)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartFrame>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
