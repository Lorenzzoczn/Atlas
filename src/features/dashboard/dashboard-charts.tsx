"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  axisProps,
} from "@/components/charts/chart-kit";
import { Segmented } from "@/components/ui/tabs";
import { Money } from "@/components/ui/money";
import type { KpiPoint } from "@/types";
import { currencyCompact, currency, formatDateShort, number } from "@/utils/format";

/* ------------------------------------------------ revenue / profit overview */

type Metric = "revenue" | "profit" | "orders";

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: "revenue", label: "Receita" },
  { value: "profit", label: "Lucro" },
  { value: "orders", label: "Pedidos" },
];

export function RevenueChart({ data }: { data: KpiPoint[] }) {
  const [metric, setMetric] = useState<Metric>("revenue");

  const totals = useMemo(
    () => ({
      revenue: data.reduce((s, d) => s + d.revenue, 0),
      profit: data.reduce((s, d) => s + d.profit, 0),
      orders: data.reduce((s, d) => s + d.orders, 0),
    }),
    [data],
  );

  const isCurrency = metric !== "orders";

  return (
    <div className="surface-card rounded-card">
      <div className="flex flex-col gap-4 p-5 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight">
            Evolução do período
          </h3>
          <p className="mt-1 text-[12.5px] text-muted">
            Receita bruta, lucro líquido e volume de pedidos por dia
          </p>
          <p className="mt-3 font-display text-[24px] font-semibold leading-none tracking-[-0.03em]">
            {isCurrency ? (
              <Money value={totals[metric]} />
            ) : (
              <span className="tabular-nums">{number(totals.orders)}</span>
            )}
          </p>
        </div>
        <Segmented
          options={METRIC_OPTIONS}
          value={metric}
          onChange={setMetric}
          size="sm"
        />
      </div>

      <ChartFrame height={300} className="px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="atlas-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.34} />
                <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 6" />
            <XAxis
              dataKey="date"
              {...axisProps}
              minTickGap={28}
              tickFormatter={(value: string) => formatDateShort(value)}
            />
            <YAxis
              {...axisProps}
              width={54}
              tickFormatter={(value: number) =>
                isCurrency ? currencyCompact(value) : number(value)
              }
            />
            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(label) => formatDateShort(String(label))}
                  formatter={(value, name) =>
                    name === "Pedidos" ? number(value) : currency(value)
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey={metric}
              name={METRIC_OPTIONS.find((o) => o.value === metric)!.label}
              stroke="var(--color-brand-400)"
              strokeWidth={2.2}
              fill="url(#atlas-area)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
            />
            {metric === "revenue" && (
              <Line
                type="monotone"
                dataKey="profit"
                name="Lucro"
                stroke="var(--color-accent)"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
            {metric === "orders" && (
              <Bar dataKey="orders" name="Pedidos" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} maxBarSize={14} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

/* ------------------------------------------------------------ channel share */

export function ChannelDonut({
  data,
  subtitle = "Distribuição no período selecionado",
}: {
  data: { id: string; name: string; color: string; revenue: number; orders: number }[];
  subtitle?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="surface-card flex h-full flex-col rounded-card p-5">
      <h3 className="font-display text-[15px] font-semibold tracking-tight">
        Receita por canal
      </h3>
      <p className="mt-1 text-[12.5px] text-muted">{subtitle}</p>

      <div className="relative mt-2">
        <ChartFrame height={190}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="name"
                innerRadius="66%"
                outerRadius="94%"
                paddingAngle={3}
                stroke="var(--background)"
                strokeWidth={2}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<ChartTooltip formatter={(value) => currency(value)} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartFrame>

        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-[10.5px] uppercase tracking-[0.12em] text-subtle">Total</p>
            <p className="font-display text-[18px] font-semibold tracking-tight">
              <Money value={total} compact />
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {data.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="flex-1 truncate text-muted">{entry.name}</span>
            <span className="font-mono tabular-nums text-subtle">
              {((entry.revenue / total) * 100).toFixed(0)}%
            </span>
            <span className="w-16 text-right font-mono tabular-nums text-foreground">
              <Money value={entry.revenue} compact />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- funnel */

export function ConversionFunnel({
  stages,
}: {
  stages: { stage: string; value: number; color: string }[];
}) {
  const top = stages[0].value;

  return (
    <div className="surface-card rounded-card p-5">
      <h3 className="font-display text-[15px] font-semibold tracking-tight">
        Funil de conversão
      </h3>
      <p className="mt-1 text-[12.5px] text-muted">
        Da visita ao pedido pago · últimos 30 dias
      </p>

      <div className="mt-5 space-y-3">
        {stages.map((stage, index) => {
          const ratio = stage.value / top;
          const stepDrop =
            index === 0 ? null : (stage.value / stages[index - 1].value) * 100;

          return (
            <div key={stage.stage}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] text-muted">{stage.stage}</span>
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[13px] font-medium tabular-nums">
                    {number(stage.value)}
                  </span>
                  {stepDrop !== null && (
                    <span className="font-mono text-[11px] tabular-nums text-subtle">
                      {stepDrop.toFixed(1).replace(".", ",")}%
                    </span>
                  )}
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-lg bg-surface-2">
                <div
                  className="wipe-x h-full rounded-lg"
                  style={
                    {
                      width: `${ratio * 100}%`,
                      "--reveal-delay": `${index * 0.08}s`,
                      background: `linear-gradient(90deg, ${stage.color}, color-mix(in oklab, ${stage.color} 55%, transparent))`,
                    } as CSSProperties
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-[12.5px] text-muted">Conversão total</span>
        <span className="font-display text-[17px] font-semibold tracking-tight text-success">
          {((stages[stages.length - 1].value / top) * 100)
            .toFixed(2)
            .replace(".", ",")}
          %
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- radar */

export function CompetitiveRadar({
  data,
}: {
  data: { dimension: string; atlas: number; mercado: number }[];
}) {
  return (
    <div className="surface-card rounded-card p-5">
      <h3 className="font-display text-[15px] font-semibold tracking-tight">
        Posição competitiva
      </h3>
      <p className="mt-1 text-[12.5px] text-muted">
        Sua operação frente à média dos concorrentes monitorados
      </p>

      <ChartFrame height={252} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Sua operação"
              dataKey="atlas"
              stroke="var(--color-brand-400)"
              fill="var(--color-brand-500)"
              fillOpacity={0.28}
              strokeWidth={2}
            />
            <Radar
              name="Média do mercado"
              dataKey="mercado"
              stroke="var(--color-accent)"
              fill="var(--color-accent)"
              fillOpacity={0.12}
              strokeWidth={1.6}
            />
            <Tooltip content={<ChartTooltip formatter={(value) => `${value}`} />} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartLegend
        className="mt-1 justify-center"
        items={[
          { label: "Sua operação", color: "var(--color-brand-400)" },
          { label: "Média do mercado", color: "var(--color-accent)" },
        ]}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ heatmap */

export function SalesHeatmap({
  cells,
  max,
  weekdays,
  className,
}: {
  cells: { day: number; hour: number; value: number }[];
  max: number;
  weekdays: string[];
  className?: string;
}) {
  const grid = useMemo(() => {
    const map = new Map<string, number>();
    for (const cell of cells) map.set(`${cell.day}-${cell.hour}`, cell.value);
    return map;
  }, [cells]);

  return (
    <div className={cn("surface-card rounded-card p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight">
            Mapa de calor de vendas
          </h3>
          <p className="mt-1 text-[12.5px] text-muted">
            Pedidos por hora e dia da semana · acumulado de 90 dias
          </p>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="text-[10.5px] text-subtle">menos</span>
          {[0.12, 0.32, 0.55, 0.78, 1].map((step) => (
            <span
              key={step}
              className="size-2.5 rounded-[3px]"
              style={{
                background: `color-mix(in oklab, var(--primary) ${step * 100}%, var(--surface-2))`,
              }}
            />
          ))}
          <span className="text-[10.5px] text-subtle">mais</span>
        </div>
      </div>

      <div className="mt-5 w-full overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="flex gap-1">
            <div className="w-8 shrink-0" />
            <div className="grid flex-1 grid-cols-24 gap-1">
              {Array.from({ length: 24 }, (_, hour) => (
                <span
                  key={hour}
                  className="text-center text-[8.5px] tabular-nums text-subtle"
                >
                  {hour % 3 === 0 ? hour : ""}
                </span>
              ))}
            </div>
          </div>

          {weekdays.map((label, day) => (
            <div key={label} className="mt-1 flex items-center gap-1">
              <span className="w-8 shrink-0 text-[10.5px] text-subtle">{label}</span>
              <div className="grid flex-1 grid-cols-24 gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const value = grid.get(`${day}-${hour}`) ?? 0;
                  const intensity = value / max;
                  return (
                    <span
                      key={hour}
                      title={`${label} ${hour}h · ${value} pedidos`}
                      className="reveal aspect-square rounded-[3px] transition-transform duration-150 hover:scale-125 hover:ring-1 hover:ring-primary"
                      style={
                        {
                          "--reveal-y": "0px",
                          "--reveal-duration": "0.3s",
                          "--reveal-delay": `${(day * 24 + hour) * 0.0015}s`,
                          background: `color-mix(in oklab, var(--primary) ${Math.round(intensity * 92)}%, var(--surface-2))`,
                        } as CSSProperties
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
