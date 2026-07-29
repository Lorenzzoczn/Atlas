"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  CalendarDays,
  Plus,
  Radar,
  ShoppingCart,
  Tag,
  Timer,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { StatStrip } from "@/components/data/data-toolbar";
import {
  ChartFrame,
  ChartTooltip,
  axisProps,
} from "@/components/charts/chart-kit";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/toggle";
import { automationRuns, automations as seed } from "@/mock/operations";
import { MOCK_NOW } from "@/config/site";
import type { AutomationTrigger } from "@/types";
import { formatDateShort, number, percent, relativeTime } from "@/utils/format";

const TRIGGER_META: Record<
  AutomationTrigger,
  { label: string; icon: LucideIcon; tone: string }
> = {
  preco: { label: "Preço", icon: Tag, tone: "border-brand-500/30 bg-brand-500/12 text-brand-400" },
  estoque: { label: "Estoque", icon: Boxes, tone: "border-warning/30 bg-warning/12 text-warning" },
  pedido: { label: "Pedido", icon: ShoppingCart, tone: "border-info/30 bg-info/12 text-info" },
  concorrente: { label: "Concorrente", icon: Radar, tone: "border-danger/30 bg-danger/12 text-danger" },
  agenda: { label: "Agenda", icon: CalendarDays, tone: "border-success/30 bg-success/12 text-success" },
};

export function AutomationsView() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(seed.map((automation) => [automation.id, automation.enabled])),
  );

  const activeCount = Object.values(enabled).filter(Boolean).length;
  const totalRuns = seed.reduce((sum, a) => sum + a.runs, 0);
  const savedHours = seed.reduce((sum, a) => sum + a.savedHours, 0);
  const avgSuccess = seed.reduce((sum, a) => sum + a.successRate, 0) / seed.length;

  const toggle = (id: string, name: string) => {
    setEnabled((prev) => {
      const next = !prev[id];
      toast.success(next ? "Automação ativada" : "Automação pausada", {
        description: name,
      });
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Automações"
        description="Regras que observam a operação e agem sozinhas, dentro dos limites que você define."
        icon={Workflow}
        actions={
          <Button size="sm">
            <Plus />
            Criar automação
          </Button>
        }
      />

      <StatStrip
        items={[
          { label: "Automações ativas", value: `${activeCount} de ${seed.length}` },
          { label: "Execuções totais", value: number(totalRuns) },
          { label: "Taxa de sucesso", value: percent(avgSuccess), tone: "success" },
          { label: "Horas economizadas", value: `${savedHours.toFixed(0)} h` },
        ]}
      />

      <div className="surface-card rounded-card">
        <div className="p-5 pb-2">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Execuções nos últimos 14 dias
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Volume diário e falhas registradas
          </p>
        </div>
        <ChartFrame height={200} className="px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={automationRuns}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 6" />
              <XAxis
                dataKey="date"
                {...axisProps}
                tickFormatter={(value: string) => formatDateShort(value)}
              />
              <YAxis {...axisProps} width={36} />
              <Tooltip
                content={
                  <ChartTooltip
                    labelFormatter={(label) => formatDateShort(String(label))}
                    formatter={(value) => number(value)}
                  />
                }
              />
              <Bar
                dataKey="execucoes"
                name="Execuções"
                stackId="runs"
                fill="var(--color-brand-500)"
                radius={[0, 0, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="falhas"
                name="Falhas"
                stackId="runs"
                fill="var(--color-danger)"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {seed.map((automation, index) => {
          const meta = TRIGGER_META[automation.trigger];
          const Icon = meta.icon;
          const isOn = enabled[automation.id];

          return (
            <Reveal
              as="article"
              key={automation.id}
              y={14}
              duration={0.4}
              delay={stagger(index, 0.05)}
              className={cn(
                "surface-card rounded-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong",
                !isOn && "opacity-70",
              )}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl border",
                    meta.tone,
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13.5px] font-medium leading-snug">
                      {automation.name}
                    </p>
                    <Switch
                      checked={isOn}
                      onCheckedChange={() => toggle(automation.id, automation.name)}
                      aria-label={isOn ? "Desativar automação" : "Ativar automação"}
                    />
                  </div>

                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                    {automation.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone="outline" size="sm">
                      Gatilho: {meta.label}
                    </Badge>
                    <Badge tone={isOn ? "success" : "neutral"} size="sm">
                      <StatusDot tone={isOn ? "success" : "neutral"} pulse={isOn} />
                      {isOn ? "Ativa" : "Pausada"}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3.5">
                    <div>
                      <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-subtle">
                        <Zap className="size-2.5" />
                        Execuções
                      </dt>
                      <dd className="mt-0.5 font-mono text-[13px] tabular-nums">
                        {number(automation.runs)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-subtle">
                        Sucesso
                      </dt>
                      <dd className="mt-0.5 font-mono text-[13px] tabular-nums text-success">
                        {percent(automation.successRate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-subtle">
                        <Timer className="size-2.5" />
                        Economia
                      </dt>
                      <dd className="mt-0.5 font-mono text-[13px] tabular-nums">
                        {automation.savedHours.toFixed(1).replace(".", ",")} h
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-[10.5px] text-subtle">
                    Última execução {relativeTime(automation.lastRunAt, MOCK_NOW)}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
