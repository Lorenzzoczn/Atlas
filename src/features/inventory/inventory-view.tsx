"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Boxes, ExternalLink, Package, Plug, TriangleAlert, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar, Pagination, StatStrip } from "@/components/data/data-toolbar";
import { ChannelChip } from "@/components/data/channel-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Money } from "@/components/ui/money";
import { Progress } from "@/components/ui/progress";
import { SkeletonRows } from "@/components/ui/skeleton";
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
import { channelIdOf, commerceApi, queryKeys } from "@/services/atlas-backend";
import { number, percent } from "@/utils/format";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "CLOSED", label: "Encerrado" },
  { value: "UNDER_REVIEW", label: "Em revisão" },
];

const LOGISTIC_OPTIONS = [
  { value: "todos", label: "Todos os tipos" },
  { value: "fulfillment", label: "Full" },
  { value: "self_service", label: "Flex" },
  { value: "cross_docking", label: "Coleta" },
  { value: "drop_off", label: "Agência" },
];

const PAGE_SIZE = 15;

/** Traduz o tipo logístico do canal para o nome que o vendedor usa. */
function logisticLabel(type: string | null) {
  const labels: Record<string, string> = {
    fulfillment: "Full",
    self_service: "Flex",
    cross_docking: "Coleta",
    drop_off: "Agência",
    xd_drop_off: "Agência",
  };
  return type ? (labels[type] ?? type) : "—";
}

export function InventoryView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [logisticType, setLogisticType] = useState("todos");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);

  const filters = {
    search: search.trim() || undefined,
    status: status === "todos" ? undefined : status,
    logisticType: logisticType === "todos" ? undefined : logisticType,
    lowStock: lowStock || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const listingsQuery = useQuery({
    queryKey: queryKeys.listings(filters),
    queryFn: () => commerceApi.listings(filters),
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.inventorySummary,
    queryFn: commerceApi.inventorySummary,
  });

  const items = listingsQuery.data?.items ?? [];
  const summary = summaryQuery.data;
  const noFilters = !search && status === "todos" && logisticType === "todos" && !lowStock;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação"
        title="Estoque"
        description="Disponibilidade por anúncio, tipo logístico e alerta de saldo baixo, direto dos seus canais."
        icon={Boxes}
        actions={
          <Button
            variant={lowStock ? "subtle" : "secondary"}
            size="sm"
            onClick={() => {
              setLowStock((v) => !v);
              setPage(1);
            }}
          >
            <TriangleAlert />
            {lowStock ? "Mostrando saldo baixo" : "Só saldo baixo"}
          </Button>
        }
      />

      {summary && summary.activeListings > 0 && (
        <StatStrip
          items={[
            { label: "Anúncios ativos", value: number(summary.activeListings) },
            { label: "Unidades disponíveis", value: number(summary.unitsAvailable) },
            { label: "Unidades vendidas", value: number(summary.unitsSold) },
            {
              label: "Saldo baixo",
              value: number(summary.lowStockListings),
              tone: summary.lowStockListings > 0 ? "danger" : "default",
            },
          ]}
        />
      )}

      {summary && summary.byLogistic.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.byLogistic.map((entry) => (
            <div key={entry.logisticType} className="surface-card rounded-card p-4">
              <div className="flex items-center gap-2">
                <Warehouse className="size-3.5 text-subtle" />
                <p className="text-[12.5px] font-medium">{logisticLabel(entry.logisticType)}</p>
              </div>
              <p className="mt-2.5 font-display text-[19px] font-semibold tracking-tight">
                {number(entry.units)}
              </p>
              <p className="mt-0.5 text-[11px] text-subtle">
                unidades em {number(entry.listings)} anúncios
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por título, SKU ou código do anúncio…"
          filters={[
            {
              id: "status",
              label: "Status",
              value: status,
              options: STATUS_OPTIONS,
              onChange: (value) => {
                setStatus(value);
                setPage(1);
              },
            },
            {
              id: "logistica",
              label: "Tipo logístico",
              value: logisticType,
              options: LOGISTIC_OPTIONS,
              onChange: (value) => {
                setLogisticType(value);
                setPage(1);
              },
            },
          ]}
        />

        {listingsQuery.isError ? (
          <ErrorState onRetry={() => void listingsQuery.refetch()} />
        ) : listingsQuery.isLoading ? (
          <SkeletonRows rows={8} />
        ) : items.length === 0 && noFilters ? (
          <EmptyState
            icon={Plug}
            title="Nenhum anúncio sincronizado"
            description="Conecte um canal para importar seu catálogo com preço, saldo e tipo logístico."
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum anúncio encontrado"
            description="Ajuste a busca ou os filtros para ver outros resultados."
            action={{
              label: "Limpar filtros",
              onClick: () => {
                setSearch("");
                setStatus("todos");
                setLogisticType("todos");
                setLowStock(false);
                setPage(1);
              },
            }}
          />
        ) : (
          <TableWrap className={cn(listingsQuery.isPlaceholderData && "opacity-60")}>
            <Table>
              <THead>
                <tr>
                  <TH>Anúncio</TH>
                  <TH>Canal</TH>
                  <TH>Logística</TH>
                  <TH align="right">Preço</TH>
                  <TH align="right">Disponível</TH>
                  <TH align="right">Vendidos</TH>
                  <TH align="right">Saúde</TH>
                  <TH className="w-10" />
                </tr>
              </THead>

              <TBody>
                {items.map((listing) => {
                  const low = listing.availableQty <= 5;
                  return (
                    <TR key={listing.id} interactive>
                      <TD>
                        <p className="max-w-[300px] truncate text-[12.5px] font-medium">
                          {listing.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                          {listing.externalId}
                          {listing.product?.sku ? ` · ${listing.product.sku}` : ""}
                        </p>
                      </TD>

                      <TD>
                        <ChannelChip id={channelIdOf(listing.account.provider)} showName={false} />
                      </TD>

                      <TD>
                        <Badge
                          tone={listing.isFulfillment ? "brand" : listing.isFlex ? "accent" : "neutral"}
                          size="sm"
                        >
                          {logisticLabel(listing.logisticType)}
                        </Badge>
                      </TD>

                      <TDNum>
                        {listing.price ? <Money value={Number(listing.price)} /> : "—"}
                      </TDNum>

                      <TDNum className={cn(low && "text-danger")}>
                        <span className="inline-flex items-center gap-1.5">
                          {low && <TriangleAlert className="size-3" />}
                          {number(listing.availableQty)}
                        </span>
                      </TDNum>

                      <TDNum className="text-muted">{number(listing.soldQty)}</TDNum>

                      <TD align="right">
                        {listing.healthPercent === null ? (
                          <span className="text-subtle">—</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Progress
                              value={listing.healthPercent}
                              size="xs"
                              tone={listing.healthPercent >= 80 ? "success" : "warning"}
                              className="w-16"
                              animated={false}
                            />
                            <span className="w-10 font-mono text-[11px] tabular-nums text-muted">
                              {percent(listing.healthPercent, 0)}
                            </span>
                          </div>
                        )}
                      </TD>

                      <TD>
                        {listing.permalink && (
                          <a
                            href={listing.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-subtle transition-colors hover:text-primary"
                            aria-label="Abrir anúncio no canal"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        )}

        {listingsQuery.data && listingsQuery.data.meta.total > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={listingsQuery.data.meta.total}
            onPageChange={setPage}
          />
        )}
      </div>

      {items.length === 0 && noFilters && !listingsQuery.isLoading && (
        <p className="text-center text-[12.5px] text-subtle">
          <Link href="/marketplaces" className="text-primary hover:underline">
            Ir para Marketplaces
          </Link>{" "}
          e conectar sua primeira conta.
        </p>
      )}
    </div>
  );
}
