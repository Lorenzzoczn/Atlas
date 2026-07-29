"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import {
  Banknote,
  Download,
  Landmark,
  PiggyBank,
  Receipt,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar } from "@/components/data/data-toolbar";
import { ChannelChip } from "@/components/data/channel-chip";
import {
  ChartFrame,
  ChartTooltip,
  axisProps,
} from "@/components/charts/chart-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Progress } from "@/components/ui/progress";
import {
  TBody,
  TD,
  TDNum,
  TH,
  THead,
  TR,
  Table,
  TableWrap,
} from "@/components/ui/table";
import { KpiCard } from "@/features/dashboard/kpi-card";
import {
  cashflowForecast,
  costBreakdown,
  receivables,
  transactions,
} from "@/mock/operations";
import { kpiSeries, seriesTotals } from "@/mock/analytics";
import type { TransactionType } from "@/types";
import { currency, currencyCompact, formatDate, number, percent } from "@/utils/format";

const TX_META: Record<
  TransactionType,
  { label: string; tone: "success" | "danger" | "warning" | "brand" | "accent" }
> = {
  receita: { label: "Receita", tone: "success" },
  taxa: { label: "Taxa", tone: "danger" },
  frete: { label: "Frete", tone: "warning" },
  custo: { label: "Custo", tone: "brand" },
  ads: { label: "Mídia", tone: "accent" },
};

export function FinanceView() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("todos");

  const totals = useMemo(() => seriesTotals(kpiSeries.slice(-30)), []);
  const previous = useMemo(() => seriesTotals(kpiSeries.slice(-60, -30)), []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions
      .filter((tx) => {
        if (type !== "todos" && tx.type !== type) return false;
        if (!term) return true;
        return (
          tx.description.toLowerCase().includes(term) ||
          tx.reference.toLowerCase().includes(term)
        );
      })
      .slice(0, 20);
  }, [search, type]);

  const totalCosts = costBreakdown.reduce((sum, item) => sum + item.value, 0);
  const totalReceivable = receivables.reduce((sum, item) => sum + item.value, 0);

  const dre = [
    { label: "Receita bruta", value: totals.revenue, kind: "positive" as const },
    { label: "(-) Comissões do canal", value: -totals.revenue * 0.144, kind: "negative" as const },
    { label: "(-) Frete e logística", value: -totals.revenue * 0.081, kind: "negative" as const },
    { label: "(-) Custo da mercadoria", value: -totals.revenue * 0.352, kind: "negative" as const },
    { label: "(-) Mídia paga", value: -totals.adSpend, kind: "negative" as const },
    { label: "(-) Impostos", value: -totals.revenue * 0.076, kind: "negative" as const },
  ];
  const netResult = dre.reduce((sum, line) => sum + line.value, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Crescimento"
        title="Financeiro"
        description="Repasses, custos, projeção de caixa e o resultado consolidado da operação."
        icon={Wallet}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Receipt />
              Conciliar repasses
            </Button>
            <Button size="sm">
              <Download />
              Exportar DRE
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Receita bruta"
          value={totals.revenue}
          previous={previous.revenue}
          icon={Banknote}
        />
        <KpiCard
          index={1}
          label="Resultado líquido"
          value={netResult}
          previous={netResult * 0.86}
          icon={PiggyBank}
          footer={`Margem de ${percent((netResult / totals.revenue) * 100)}`}
        />
        <KpiCard
          index={2}
          label="Custos e taxas"
          value={totalCosts}
          previous={totalCosts * 0.94}
          icon={TrendingDown}
          invert
          footer="Acumulado dos últimos 90 dias"
        />
        <KpiCard
          index={3}
          label="A receber"
          value={totalReceivable}
          previous={totalReceivable * 1.04}
          icon={Landmark}
          footer={`${number(receivables.reduce((s, r) => s + r.count, 0))} pedidos aguardando liberação`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="surface-card rounded-card xl:col-span-2">
          <div className="p-5 pb-2">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">
              Projeção de caixa · 30 dias
            </h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Entradas previstas de repasses contra saídas programadas
            </p>
          </div>
          <ChartFrame height={272} className="px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cashflowForecast}
                margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
                stackOffset="sign"
              >
                <CartesianGrid vertical={false} strokeDasharray="3 6" />
                <XAxis
                  dataKey="date"
                  {...axisProps}
                  minTickGap={26}
                  tickFormatter={(value: string) => value.slice(8, 10)}
                />
                <YAxis
                  {...axisProps}
                  width={56}
                  tickFormatter={(value: number) => currencyCompact(value)}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value) => currency(Math.abs(value))}
                      labelFormatter={(label) => formatDate(String(label))}
                    />
                  }
                />
                <Bar
                  dataKey="entrada"
                  name="Entradas"
                  stackId="cash"
                  fill="var(--color-success)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="saida"
                  name="Saídas"
                  stackId="cash"
                  fill="var(--color-danger)"
                  radius={[0, 0, 3, 3]}
                  maxBarSize={16}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke="var(--color-brand-400)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartFrame>
        </div>

        <div className="surface-card rounded-card p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Estrutura de custos
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">Distribuição dos últimos 90 dias</p>

          <ChartFrame height={180} className="mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="92%"
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {costBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip formatter={(value) => currency(value)} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ul className="mt-4 space-y-2">
            {costBreakdown.map((item) => (
              <li key={item.name} className="flex items-center gap-2.5 text-[12px]">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="flex-1 truncate text-muted">{item.name}</span>
                <span className="font-mono tabular-nums text-subtle">
                  {((item.value / totalCosts) * 100).toFixed(0)}%
                </span>
                <span className="w-16 text-right font-mono tabular-nums">
                  <Money value={item.value} compact />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-card rounded-card p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Recebíveis
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Valores retidos pelos canais até a liberação
          </p>

          <div className="mt-5 space-y-4">
            {receivables.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] text-muted">{item.label}</span>
                  <span className="font-mono text-[13px] font-medium tabular-nums">
                    <Money value={item.value} />
                  </span>
                </div>
                <Progress
                  value={(item.value / totalReceivable) * 100}
                  size="sm"
                  tone={item.label.includes("disputa") ? "danger" : "brand"}
                />
                <p className="mt-1 text-[10.5px] text-subtle">
                  {number(item.count)} pedidos
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-[12.5px] text-muted">Total previsto</span>
            <span className="font-display text-[17px] font-semibold tracking-tight">
              <Money value={totalReceivable} />
            </span>
          </div>
        </div>

        <div className="surface-card rounded-card p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Demonstrativo de resultado
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Consolidado dos últimos 30 dias, todos os canais
          </p>

          <dl className="mt-5 space-y-1">
            {dre.map((line) => {
              const share = Math.abs(line.value / totals.revenue) * 100;
              return (
                <div
                  key={line.label}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2/60 sm:gap-4"
                >
                  <dt className="min-w-0 flex-1 truncate text-[12.5px] text-muted sm:w-52 sm:flex-none">
                    {line.label}
                  </dt>
                  <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3 sm:block">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        line.kind === "positive" ? "bg-success" : "bg-danger/70",
                      )}
                      style={{ width: `${Math.min(100, share)}%` }}
                    />
                  </div>
                  <dd
                    className={cn(
                      "shrink-0 text-right font-mono text-[12.5px] tabular-nums sm:w-28",
                      line.kind === "positive" ? "text-success" : "text-danger",
                    )}
                  >
                    <Money value={line.value} />
                  </dd>
                </div>
              );
            })}

            <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-surface-2/60 px-2 py-3 sm:gap-4">
              <dt className="min-w-0 flex-1 text-[13px] font-medium sm:w-52 sm:flex-none">
                Resultado líquido
              </dt>
              <div className="hidden flex-1 sm:block" />
              <dd className="shrink-0 text-right font-mono text-[15px] font-semibold tabular-nums text-success sm:w-28">
                <Money value={netResult} />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Buscar por descrição ou referência…"
          filters={[
            {
              id: "tipo",
              label: "Tipo",
              value: type,
              options: [
                { value: "todos", label: "Todos os lançamentos" },
                ...(Object.keys(TX_META) as TransactionType[]).map((key) => ({
                  value: key,
                  label: TX_META[key].label,
                })),
              ],
              onChange: setType,
            },
          ]}
          onExport={() => undefined}
        />

        <TableWrap>
          <Table>
            <THead>
              <tr>
                <TH>Data</TH>
                <TH>Lançamento</TH>
                <TH>Canal</TH>
                <TH>Tipo</TH>
                <TH>Status</TH>
                <TH align="right">Valor</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((tx) => (
                <TR key={tx.id} interactive>
                  <TD>
                    <span className="text-[12.5px]">{formatDate(tx.date)}</span>
                  </TD>
                  <TD>
                    <p className="text-[12.5px]">{tx.description}</p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                      {tx.reference}
                    </p>
                  </TD>
                  <TD>
                    <ChannelChip id={tx.marketplace} showName={false} />
                  </TD>
                  <TD>
                    <Badge tone={TX_META[tx.type].tone} size="sm">
                      {TX_META[tx.type].label}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge
                      tone={
                        tx.status === "liquidado"
                          ? "success"
                          : tx.status === "retido"
                            ? "danger"
                            : "neutral"
                      }
                      size="sm"
                    >
                      {tx.status === "liquidado"
                        ? "Liquidado"
                        : tx.status === "retido"
                          ? "Retido"
                          : "Previsto"}
                    </Badge>
                  </TD>
                  <TDNum className={tx.amount >= 0 ? "text-success" : "text-danger"}>
                    <Money value={tx.amount} />
                  </TDNum>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
      </div>
    </div>
  );
}
