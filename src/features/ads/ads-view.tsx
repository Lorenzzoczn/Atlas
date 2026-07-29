"use client";

import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MousePointerClick, Megaphone, Percent, Target, Zap } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ChannelChip } from "@/components/data/channel-chip";
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
import { KpiCard } from "@/features/dashboard/kpi-card";
import { adsSeries, campaigns } from "@/mock/operations";
import { currency, currencyCompact, formatDateShort, number, percent } from "@/utils/format";

export function AdsView() {
  const spend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const revenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const impressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  const acos = (spend / revenue) * 100;
  const roas = revenue / spend;
  const ctr = (clicks / impressions) * 100;

  const byChannel = [
    ...campaigns
      .reduce((acc, campaign) => {
        const entry = acc.get(campaign.marketplace) ?? { spend: 0, revenue: 0 };
        entry.spend += campaign.spend;
        entry.revenue += campaign.revenue;
        acc.set(campaign.marketplace, entry);
        return acc;
      }, new Map<string, { spend: number; revenue: number }>())
      .entries(),
  ]
    .map(([id, value]) => ({ id, ...value, roas: value.revenue / value.spend }))
    .sort((a, b) => b.revenue - a.revenue);

  const maxRevenue = Math.max(...byChannel.map((c) => c.revenue));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Crescimento"
        title="Publicidade"
        description="Quanto você investe em mídia, quanto isso devolve e onde o retorno está concentrado."
        icon={Megaphone}
        actions={
          <Button size="sm" asChild>
            <Link href="/campanhas">
              <Target />
              Gerenciar campanhas
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Investimento"
          value={spend}
          previous={spend * 0.82}
          icon={Megaphone}
          invert
          footer="Últimos 30 dias"
        />
        <KpiCard
          index={1}
          label="Receita atribuída"
          value={revenue}
          previous={revenue * 0.94}
          icon={Zap}
          footer={`${number(conversions)} conversões`}
        />
        <KpiCard
          index={2}
          label="ACOS"
          value={acos}
          previous={acos * 0.88}
          format="percent"
          icon={Percent}
          invert
          hint="Custo de publicidade sobre a receita gerada. Quanto menor, melhor."
        />
        <KpiCard
          index={3}
          label="ROAS"
          value={roas}
          previous={roas * 1.09}
          format="ratio"
          icon={Target}
          footer={`CTR de ${percent(ctr, 2)}`}
        />
      </div>

      <div className="surface-card rounded-card">
        <div className="p-5 pb-2">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Investimento × receita atribuída
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Evolução diária com o ACOS sobreposto
          </p>
        </div>

        <ChartFrame height={296} className="px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={adsSeries}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="ads-revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ads-spend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 6" />
              <XAxis
                dataKey="date"
                {...axisProps}
                minTickGap={26}
                tickFormatter={(value: string) => formatDateShort(value)}
              />
              <YAxis
                {...axisProps}
                width={56}
                tickFormatter={(value: number) => currencyCompact(value)}
              />
              <YAxis
                yAxisId="acos"
                orientation="right"
                {...axisProps}
                width={40}
                tickFormatter={(value: number) => `${value}%`}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    labelFormatter={(label) => formatDateShort(String(label))}
                    formatter={(value, name) =>
                      name === "ACOS" ? `${value.toFixed(1)}%` : currency(value)
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="receita"
                name="Receita atribuída"
                stroke="var(--color-accent)"
                strokeWidth={2.2}
                fill="url(#ads-revenue)"
              />
              <Area
                type="monotone"
                dataKey="investimento"
                name="Investimento"
                stroke="var(--color-brand-400)"
                strokeWidth={2}
                fill="url(#ads-spend)"
              />
              <Line
                yAxisId="acos"
                type="monotone"
                dataKey="acos"
                name="ACOS"
                stroke="var(--color-warning)"
                strokeWidth={1.6}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartFrame>

        <div className="border-t border-border px-5 py-3">
          <ChartLegend
            items={[
              { label: "Receita atribuída", color: "var(--color-accent)" },
              { label: "Investimento", color: "var(--color-brand-400)" },
              { label: "ACOS", color: "var(--color-warning)" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-card rounded-card p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Retorno por canal
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Receita atribuída e ROAS de cada marketplace
          </p>

          <div className="mt-5 space-y-4">
            {byChannel.map((entry) => (
              <div key={entry.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <ChannelChip id={entry.id as never} />
                  <span className="flex items-baseline gap-3">
                    <Badge tone={entry.roas >= 5 ? "success" : "warning"} size="sm">
                      ROAS {entry.roas.toFixed(1).replace(".", ",")}
                    </Badge>
                    <span className="w-20 text-right font-mono text-[12.5px] tabular-nums">
                      <Money value={entry.revenue} compact />
                    </span>
                  </span>
                </div>
                <Progress value={(entry.revenue / maxRevenue) * 100} size="xs" />
                <p className="mt-1 text-[10.5px] text-subtle">
                  Investimento de {currency(entry.spend)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-card p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Melhores campanhas
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Ordenadas por receita atribuída no período
          </p>

          <ul className="mt-5 space-y-3">
            {campaigns.slice(0, 5).map((campaign, index) => (
              <li
                key={campaign.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 p-3"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 font-mono text-[11px] font-bold text-subtle">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{campaign.name}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[10.5px] text-subtle">
                    <MousePointerClick className="size-2.5" />
                    {number(campaign.clicks)} cliques · CTR {percent(campaign.ctr, 2)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[12.5px] tabular-nums">
                    <Money value={campaign.revenue} compact />
                  </p>
                  <p className="font-mono text-[10.5px] tabular-nums text-success">
                    ROAS {campaign.roas.toFixed(1).replace(".", ",")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
