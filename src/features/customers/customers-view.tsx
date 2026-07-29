"use client";

import { useMemo, useState } from "react";
import { Heart, Mail, Repeat, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar, Pagination } from "@/components/data/data-toolbar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
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
import { customerTierSummary, customers } from "@/mock/operations";
import { MOCK_NOW } from "@/config/site";
import type { CustomerTier } from "@/types";
import { formatDate, number, relativeTime } from "@/utils/format";

const TIER_META: Record<
  CustomerTier,
  { label: string; tone: "brand" | "success" | "neutral" | "danger"; hue: number }
> = {
  vip: { label: "VIP", tone: "brand", hue: 258 },
  recorrente: { label: "Recorrente", tone: "success", hue: 152 },
  novo: { label: "Novo", tone: "neutral", hue: 205 },
  "em-risco": { label: "Em risco", tone: "danger", hue: 8 },
};

const PAGE_SIZE = 12;

export function CustomersView() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("todos");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter((customer) => {
      if (tier !== "todos" && customer.tier !== tier) return false;
      if (!term) return true;
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.city.toLowerCase().includes(term)
      );
    });
  }, [search, tier]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = customers.reduce((sum, c) => sum + c.spent, 0);
  const avgTicket = customers.reduce((sum, c) => sum + c.ticket, 0) / customers.length;
  const repeatRate =
    (customers.filter((c) => c.orders > 1).length / customers.length) * 100;
  const avgNps = customers.reduce((sum, c) => sum + c.nps, 0) / customers.length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação"
        title="Clientes"
        description="Quem compra, quanto gasta e quem está prestes a deixar de comprar."
        icon={Users}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Mail />
              Campanha de recompra
            </Button>
            <Button size="sm">
              <Sparkles />
              Segmentar com IA
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Receita da base"
          value={totalRevenue}
          previous={totalRevenue * 0.88}
          icon={Users}
        />
        <KpiCard
          index={1}
          label="Ticket médio"
          value={avgTicket}
          previous={avgTicket * 0.96}
          icon={Heart}
        />
        <KpiCard
          index={2}
          label="Taxa de recompra"
          value={repeatRate}
          previous={repeatRate * 0.93}
          format="percent"
          icon={Repeat}
          footer={`${number(customers.filter((c) => c.orders > 1).length)} compradores recorrentes`}
        />
        <KpiCard
          index={3}
          label="NPS médio"
          value={avgNps}
          previous={avgNps * 0.98}
          format="number"
          icon={Sparkles}
          footer="Escala de 0 a 10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {customerTierSummary.map((entry, index) => {
          const meta = TIER_META[entry.tier];
          const share = (entry.count / customers.length) * 100;
          return (
            <Reveal
              key={entry.tier}
              y={14}
              duration={0.4}
              delay={stagger(index, 0.05)}
              className="surface-card rounded-card p-4"
            >
              <div className="flex items-center justify-between">
                <Badge tone={meta.tone} size="md">
                  {meta.label}
                </Badge>
                <span className="font-mono text-[11px] tabular-nums text-subtle">
                  {share.toFixed(0)}%
                </span>
              </div>
              <p className="mt-3 font-display text-[22px] font-semibold tracking-tight">
                {number(entry.count)}
              </p>
              <p className="text-[11px] text-subtle">clientes</p>
              <p className="mt-2 font-mono text-[12.5px] tabular-nums text-muted">
                <Money value={entry.revenue} compact /> em receita
              </p>
              <Progress
                value={share}
                size="xs"
                tone={meta.tone === "danger" ? "danger" : "brand"}
                className="mt-3"
              />
            </Reveal>
          );
        })}
      </div>

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por nome, e-mail ou cidade…"
          filters={[
            {
              id: "tier",
              label: "Segmento",
              value: tier,
              options: [
                { value: "todos", label: "Todos os segmentos" },
                ...(Object.keys(TIER_META) as CustomerTier[]).map((key) => ({
                  value: key,
                  label: TIER_META[key].label,
                })),
              ],
              onChange: (value) => {
                setTier(value);
                setPage(1);
              },
            },
          ]}
          onExport={() => undefined}
        />

        {paged.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            description="Ajuste a busca ou selecione outro segmento para ver resultados."
          />
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <tr>
                  <TH>Cliente</TH>
                  <TH>Localização</TH>
                  <TH>Segmento</TH>
                  <TH align="right">Pedidos</TH>
                  <TH align="right">Ticket médio</TH>
                  <TH align="right">Total gasto</TH>
                  <TH align="right">NPS</TH>
                  <TH>Última compra</TH>
                </tr>
              </THead>
              <TBody>
                {paged.map((customer) => (
                  <TR key={customer.id} interactive>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={customer.name}
                          hue={TIER_META[customer.tier].hue}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium">
                            {customer.name}
                          </p>
                          <p className="mt-0.5 truncate text-[10.5px] text-subtle">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <span className="text-[12px] text-muted">
                        {customer.city} · {customer.state}
                      </span>
                    </TD>
                    <TD>
                      <Badge tone={TIER_META[customer.tier].tone} size="sm">
                        {TIER_META[customer.tier].label}
                      </Badge>
                    </TD>
                    <TDNum>{number(customer.orders)}</TDNum>
                    <TDNum>
                      <Money value={customer.ticket} />
                    </TDNum>
                    <TDNum className="text-success">
                      <Money value={customer.spent} />
                    </TDNum>
                    <TDNum
                      className={cn(
                        customer.nps >= 9
                          ? "text-success"
                          : customer.nps >= 7
                            ? "text-warning"
                            : "text-danger",
                      )}
                    >
                      {customer.nps}
                    </TDNum>
                    <TD>
                      <p className="text-[12px]">{formatDate(customer.lastOrderAt)}</p>
                      <p className="mt-0.5 text-[10.5px] text-subtle">
                        {relativeTime(customer.lastOrderAt, MOCK_NOW)}
                      </p>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}

        {filtered.length > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
