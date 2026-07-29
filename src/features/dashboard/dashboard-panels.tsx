"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Bot,
  Crown,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Progress, RadialProgress } from "@/components/ui/progress";
import { Sparkline } from "@/components/charts/chart-kit";
import { Reveal, stagger } from "@/components/ui/reveal";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import type { ActivityEvent, Goal, Insight, Product } from "@/types";
import { MOCK_NOW } from "@/config/site";
import { currency, number, percent, relativeTime } from "@/utils/format";

/* ----------------------------------------------------------- alert banner */

export function AlertBanner({
  title,
  detail,
  href,
  actionLabel,
}: {
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Reveal
      y={-8}
      duration={0.4}
      className="relative flex flex-col gap-3 overflow-hidden rounded-card border border-warning/25 bg-warning/[0.07] p-4 sm:flex-row sm:items-center"
    >
      <span className="absolute inset-y-0 left-0 w-0.5 bg-warning" />
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-warning/30 bg-warning/12">
        <TriangleAlert className="size-4 text-warning" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-muted">{detail}</p>
      </div>
      <Button size="sm" variant="secondary" asChild className="shrink-0">
        <Link href={href}>
          {actionLabel}
          <ArrowRight />
        </Link>
      </Button>
    </Reveal>
  );
}

/* --------------------------------------------------------------- insights */

const SEVERITY = {
  critico: { tone: "danger", label: "Crítico", icon: TriangleAlert },
  atencao: { tone: "warning", label: "Atenção", icon: Zap },
  oportunidade: { tone: "success", label: "Oportunidade", icon: TrendingUp },
  info: { tone: "brand", label: "Informação", icon: Lightbulb },
} as const;

export function InsightsPanel({
  insights,
  score,
  className,
}: {
  insights: Insight[];
  score: { value: number; breakdown: { label: string; value: number }[] };
  className?: string;
}) {
  return (
    <div className={cn("ring-aurora surface-card overflow-hidden rounded-card", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-primary/30 bg-primary/12">
            <Bot className="size-[18px] text-primary" />
          </span>
          <div>
            <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight">
              Insights do Atlas AI
              <Badge tone="brand" size="sm">
                <Sparkles />
                IA
              </Badge>
            </h3>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {insights.length} descobertas nas últimas 24 horas
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" asChild className="shrink-0">
          <Link href="/atlas-ai">
            Abrir
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-5 border-b border-border p-5 sm:flex-row sm:items-center">
        <RadialProgress
          value={score.value}
          size={104}
          label={String(score.value)}
          sublabel="de 100"
        />
        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="text-[12.5px] font-medium">Índice de saúde comercial</p>
          {score.breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-[11.5px] text-muted">
                {item.label}
              </span>
              <Progress
                value={item.value}
                size="xs"
                tone={item.value >= 80 ? "success" : item.value >= 65 ? "brand" : "warning"}
              />
              <span className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums text-subtle">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border">
        {insights.slice(0, 4).map((insight, index) => {
          const config = SEVERITY[insight.severity];
          const Icon = config.icon;
          return (
            <Reveal
              as="li"
              key={insight.id}
              x={-6}
              y={0}
              duration={0.4}
              delay={0.1 + stagger(index, 0.07)}
              className="group flex gap-3.5 p-4 transition-colors hover:bg-surface-2/50"
            >
              <span
                className={cn(
                  "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border",
                  insight.severity === "critico" && "border-danger/30 bg-danger/12 text-danger",
                  insight.severity === "atencao" && "border-warning/30 bg-warning/12 text-warning",
                  insight.severity === "oportunidade" && "border-success/30 bg-success/12 text-success",
                  insight.severity === "info" && "border-primary/30 bg-primary/12 text-primary",
                )}
              >
                <Icon className="size-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium leading-snug">{insight.title}</p>
                  <Badge tone={config.tone} size="sm">
                    {config.label}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
                  {insight.detail}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-subtle">
                  <span>
                    Impacto{" "}
                    <span className="font-mono text-foreground">
                      {currency(insight.impact)}
                    </span>
                  </span>
                  <span>
                    Confiança{" "}
                    <span className="font-mono text-foreground">
                      {insight.confidence}%
                    </span>
                  </span>
                  <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {insight.action} →
                  </span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ goals */

export function GoalsPanel({ goals }: { goals: Goal[] }) {
  return (
    <div className="surface-card rounded-card p-5">
      <div className="flex items-center gap-2">
        <Target className="size-4 text-primary" />
        <h3 className="font-display text-[15px] font-semibold tracking-tight">
          Metas do mês
        </h3>
      </div>
      <p className="mt-1 text-[12.5px] text-muted">4 dias úteis restantes no ciclo</p>

      <div className="mt-5 space-y-4">
        {goals.map((goal) => {
          const pct = (goal.current / goal.target) * 100;
          const render = (value: number) =>
            goal.unit === "currency" ? (
              <Money value={value} compact />
            ) : goal.unit === "percent" ? (
              percent(value)
            ) : (
              number(value)
            );

          return (
            <div key={goal.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] text-muted">{goal.label}</span>
                <span className="font-mono text-[12px] tabular-nums">
                  <span className="text-foreground">{render(goal.current)}</span>
                  <span className="text-subtle"> / {render(goal.target)}</span>
                </span>
              </div>
              <Progress
                value={pct}
                tone={pct >= 90 ? "success" : pct >= 65 ? "brand" : "warning"}
                size="sm"
              />
              <p className="mt-1 text-[10.5px] text-subtle">
                {pct.toFixed(0)}% concluído
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- top products */

export function TopProductsPanel({ products }: { products: Product[] }) {
  return (
    <div className="surface-card overflow-hidden rounded-card">
      <div className="flex items-center justify-between gap-4 p-5 pb-4">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-warning" />
          <h3 className="font-display text-[15px] font-semibold tracking-tight">
            Ranking de produtos
          </h3>
        </div>
        <Button size="xs" variant="ghost" asChild>
          <Link href="/produtos">
            Ver todos
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <ul className="divide-y divide-border">
        {products.slice(0, 6).map((product, index) => (
          <Reveal
            as="li"
            key={product.id}
            y={8}
            duration={0.4}
            delay={stagger(index, 0.05)}
            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/50"
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold",
                index === 0 && "bg-warning/15 text-warning",
                index === 1 && "bg-subtle/15 text-muted",
                index === 2 && "bg-danger/12 text-danger",
                index > 2 && "bg-surface-3 text-subtle",
              )}
            >
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium">{product.title}</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                {product.sku} · {number(product.sold30d)} vendas
              </p>
            </div>

            <Sparkline data={product.trend} width={54} height={22} tone="auto" />

            <div className="w-20 shrink-0 text-right">
              <p className="font-mono text-[12.5px] font-medium tabular-nums">
                <Money value={product.revenue30d} compact />
              </p>
              <p className="font-mono text-[10.5px] tabular-nums text-subtle">
                {percent(product.margin, 0)} margem
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------- activity */

export function ActivityPanel({ events }: { events: ActivityEvent[] }) {
  const entries: TimelineEntry[] = events.slice(0, 6).map((event) => ({
    id: event.id,
    title: `${event.actor} ${event.action} ${event.target}`,
    meta: `${event.channel} · ${relativeTime(event.createdAt, MOCK_NOW)}`,
    tone:
      event.actor === "Atlas AI"
        ? "brand"
        : event.actor === "Automação"
          ? "success"
          : "neutral",
    icon:
      event.actor === "Atlas AI" ? Bot : event.actor === "Automação" ? Zap : undefined,
  }));

  return (
    <div className="surface-card rounded-card p-5">
      <h3 className="font-display text-[15px] font-semibold tracking-tight">
        Atividade recente
      </h3>
      <p className="mb-5 mt-1 text-[12.5px] text-muted">
        O que a equipe e as automações fizeram
      </p>
      <Timeline entries={entries} />
    </div>
  );
}

/* ------------------------------------------------------- status breakdown */

export function StatusBreakdown({
  data,
}: {
  data: { status: string; label: string; count: number }[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const tones: Record<string, string> = {
    pendente: "var(--color-subtle)",
    pronto: "var(--color-brand-500)",
    transito: "var(--color-accent)",
    entregue: "var(--color-success)",
    cancelado: "var(--color-danger)",
  };

  return (
    <div className="surface-card rounded-card p-5">
      <h3 className="font-display text-[15px] font-semibold tracking-tight">
        Pedidos por status
      </h3>
      <p className="mt-1 text-[12.5px] text-muted">
        {number(total)} pedidos nos últimos 30 dias
      </p>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        {data.map((item, index) => (
          <span
            key={item.status}
            style={
              {
                width: `${(item.count / total) * 100}%`,
                background: tones[item.status],
                "--reveal-delay": `${index * 0.08}s`,
                "--reveal-duration": "0.8s",
              } as CSSProperties
            }
            className="wipe-x h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2.5">
        {data.map((item) => (
          <li key={item.status} className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: tones[item.status] }}
            />
            <span className="flex-1 text-muted">{item.label}</span>
            <span className="font-mono tabular-nums text-foreground">
              {number(item.count)}
            </span>
            <span className="w-10 text-right font-mono tabular-nums text-subtle">
              {((item.count / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
