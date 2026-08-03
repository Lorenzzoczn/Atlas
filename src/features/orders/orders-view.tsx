"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  CircleAlert,
  MapPin,
  Package,
  Plug,
  Printer,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar, Pagination, StatStrip } from "@/components/data/data-toolbar";
import { ChannelChip, OrderStatusBadge } from "@/components/data/channel-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Money } from "@/components/ui/money";
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
import {
  channelIdOf,
  commerceApi,
  queryKeys,
  type OrderFilters,
  type OrderRow,
} from "@/services/atlas-backend";
import type { OrderStatus } from "@/types";
import { currency, formatDateTime, number, percent } from "@/utils/format";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "READY_TO_SHIP", label: "Pronto para enviar" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "RETURNED", label: "Devolvido" },
];

const CHANNEL_OPTIONS = [
  { value: "todos", label: "Todos os canais" },
  { value: "MERCADO_LIVRE", label: "Mercado Livre" },
  { value: "SHOPEE", label: "Shopee" },
  { value: "AMAZON", label: "Amazon" },
  { value: "MAGALU", label: "Magalu" },
  { value: "TIKTOK_SHOP", label: "TikTok Shop" },
];

/** O backend serializa Decimal como string para não perder precisão. */
const toNumber = (value: string | null) => (value === null ? null : Number(value));

/** Mapeia o status do backend para o vocabulário visual já existente. */
const STATUS_TO_BADGE: Record<string, OrderStatus> = {
  PENDING: "pendente",
  PAID: "pronto",
  READY_TO_SHIP: "pronto",
  SHIPPED: "transito",
  DELIVERED: "entregue",
  CANCELLED: "cancelado",
  RETURNED: "cancelado",
};

const PAGE_SIZE = 15;

export function OrdersView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [provider, setProvider] = useState("todos");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filters: OrderFilters = {
    search: search.trim() || undefined,
    status: status === "todos" ? undefined : status,
    provider: provider === "todos" ? undefined : provider,
    page,
    pageSize: PAGE_SIZE,
  };

  const ordersQuery = useQuery({
    queryKey: queryKeys.orders(filters),
    queryFn: () => commerceApi.orders(filters),
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.ordersSummary({ status: filters.status, provider: filters.provider }),
    queryFn: () =>
      commerceApi.ordersSummary({ status: filters.status, provider: filters.provider }),
  });

  const reset = () => {
    setPage(1);
    setExpanded(null);
  };

  const items = ordersQuery.data?.items ?? [];
  const summary = summaryQuery.data;
  const isEmptyWithoutFilters =
    !ordersQuery.isLoading && items.length === 0 && !search && status === "todos" && provider === "todos";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação"
        title="Pedidos"
        description="Vendas sincronizadas dos seus canais, com a rentabilidade calculada linha a linha."
        icon={ShoppingCart}
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/marketplaces">
              <Plug />
              Gerenciar canais
            </Link>
          </Button>
        }
      />

      {summary && summary.orders > 0 && (
        <>
          <StatStrip
            items={[
              { label: "Pedidos", value: number(summary.orders) },
              { label: "Faturamento", value: <Money value={summary.revenue} /> },
              { label: "Lucro", value: <Money value={summary.profit} />, tone: "success" },
              { label: "Taxas do canal", value: <Money value={summary.fees} />, tone: "danger" },
              { label: "Margem", value: percent(summary.margin) },
              { label: "Ticket médio", value: <Money value={summary.averageTicket} /> },
            ]}
          />

          {summary.missingCost.orders > 0 && (
            <div className="flex flex-col gap-3 rounded-card border border-warning/25 bg-warning/[0.07] p-4 sm:flex-row sm:items-center">
              <CircleAlert className="size-4 shrink-0 text-warning" />
              <p className="min-w-0 flex-1 text-[13px]">
                <span className="font-medium">
                  {number(summary.missingCost.orders)} pedidos sem custo vinculado
                </span>
                <span className="text-muted">
                  {" "}
                  — {currency(summary.missingCost.revenue)} de receita sem custo associado. O
                  lucro exibido está superestimado até que os SKUs sejam vinculados.
                </span>
              </p>
            </div>
          )}
        </>
      )}

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            reset();
          }}
          placeholder="Buscar por código, comprador ou produto…"
          filters={[
            {
              id: "status",
              label: "Status",
              value: status,
              options: STATUS_OPTIONS,
              onChange: (value) => {
                setStatus(value);
                reset();
              },
            },
            {
              id: "canal",
              label: "Canal",
              value: provider,
              options: CHANNEL_OPTIONS,
              onChange: (value) => {
                setProvider(value);
                reset();
              },
            },
          ]}
        />

        {ordersQuery.isError ? (
          <ErrorState
            title="Não foi possível carregar os pedidos"
            description="Verifique se a API está no ar e tente novamente."
            onRetry={() => void ordersQuery.refetch()}
          />
        ) : ordersQuery.isLoading ? (
          <SkeletonRows rows={8} />
        ) : isEmptyWithoutFilters ? (
          <EmptyState
            icon={Plug}
            title="Nenhum pedido ainda"
            description="Conecte um canal de vendas para que os pedidos apareçam aqui automaticamente. A primeira carga traz os últimos 90 dias."
            action={{ label: "Conectar um canal", onClick: () => undefined }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum pedido encontrado"
            description="Ajuste a busca ou os filtros para ver outros resultados."
            action={{
              label: "Limpar filtros",
              onClick: () => {
                setSearch("");
                setStatus("todos");
                setProvider("todos");
                reset();
              },
            }}
          />
        ) : (
          <TableWrap className={cn(ordersQuery.isPlaceholderData && "opacity-60 transition-opacity")}>
            <Table>
              <THead>
                <tr>
                  <TH>Pedido</TH>
                  <TH>Canal</TH>
                  <TH>Comprador</TH>
                  <TH>Status</TH>
                  <TH align="right">Receita</TH>
                  <TH align="right">Lucro</TH>
                  <TH className="w-10" />
                </tr>
              </THead>

              <TBody>
                {items.map((order) => (
                  <OrderRowItem
                    key={order.id}
                    order={order}
                    open={expanded === order.id}
                    onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                  />
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}

        {ordersQuery.data && ordersQuery.data.meta.total > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={ordersQuery.data.meta.total}
            onPageChange={(value) => {
              setPage(value);
              setExpanded(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function OrderRowItem({
  order,
  open,
  onToggle,
}: {
  order: OrderRow;
  open: boolean;
  onToggle: () => void;
}) {
  const revenue = Number(order.grossAmount);
  const profit = toNumber(order.netProfit);
  const missingCost = order.costAmount === null;
  const shipment = order.shipments[0];

  return (
    <Fragment>
      <TR interactive onClick={onToggle} className={cn(open && "bg-surface-2/60")}>
        <TD>
          <p className="font-mono text-[12.5px] font-medium">
            {order.externalCode ?? order.externalId}
          </p>
          <p className="mt-0.5 text-[11px] text-subtle">{formatDateTime(order.placedAt)}</p>
        </TD>

        <TD>
          <ChannelChip id={channelIdOf(order.account.provider)} showName={false} />
          <span className="ml-1.5 text-[11px] text-subtle">{order.account.nickname}</span>
        </TD>

        <TD>
          <p className="max-w-[160px] truncate text-[12.5px]">{order.buyerName ?? "—"}</p>
          {order.shippingCity && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-subtle">
              <MapPin className="size-2.5" />
              {order.shippingCity} · {order.shippingState}
            </p>
          )}
        </TD>

        <TD>
          <OrderStatusBadge status={STATUS_TO_BADGE[order.status] ?? "pendente"} />
        </TD>

        <TDNum>
          <Money value={revenue} />
        </TDNum>

        <TDNum className={missingCost ? "text-warning" : profit && profit >= 0 ? "text-success" : "text-danger"}>
          {missingCost ? (
            <span className="inline-flex items-center gap-1" title="Sem custo vinculado">
              <CircleAlert className="size-3" />
              —
            </span>
          ) : (
            <Money value={profit ?? 0} />
          )}
        </TDNum>

        <TD>
          <ChevronDown
            className={cn(
              "size-4 text-subtle transition-transform duration-200",
              open && "rotate-180 text-primary",
            )}
          />
        </TD>
      </TR>

      <AnimatePresence initial={false}>
        {open && (
          <tr>
            <td colSpan={7} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden bg-surface-2/40"
              >
                <div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_1fr]">
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                      Itens do pedido
                    </p>
                    <ul className="space-y-2.5">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-subtle">
                            <Package className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12.5px]">{item.title}</p>
                            <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                              {item.sku ?? "sem SKU"} · {item.quantity}×
                            </p>
                          </div>
                          {item.unitCost === null && (
                            <Badge tone="warning" size="sm">
                              sem custo
                            </Badge>
                          )}
                          <span className="w-20 text-right font-mono text-[12.5px] tabular-nums">
                            {currency(Number(item.unitPrice) * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                      Composição do resultado
                    </p>
                    <dl className="space-y-2 rounded-xl border border-border bg-surface p-4 text-[12.5px]">
                      <Line label="Receita bruta" value={revenue} tone="foreground" />
                      <Line label="Comissão do canal" value={-Number(order.feeAmount)} tone="danger" />
                      <Line label="Frete" value={-Number(order.shippingCost)} tone="danger" />
                      {missingCost ? (
                        <div className="flex items-center justify-between">
                          <dt className="text-muted">Custo da mercadoria</dt>
                          <dd className="font-mono text-warning">não vinculado</dd>
                        </div>
                      ) : (
                        <Line
                          label="Custo da mercadoria"
                          value={-Number(order.costAmount)}
                          tone="danger"
                        />
                      )}
                      <div className="flex items-center justify-between border-t border-border pt-2">
                        <dt className="font-medium">Lucro líquido</dt>
                        <dd
                          className={cn(
                            "font-mono font-medium tabular-nums",
                            missingCost ? "text-warning" : "text-success",
                          )}
                        >
                          {missingCost ? "indisponível" : currency(profit ?? 0)}
                        </dd>
                      </div>
                    </dl>

                    {shipment && (
                      <div className="rounded-xl border border-border bg-surface p-3 text-[12px]">
                        <p className="flex items-center gap-2 text-muted">
                          <Truck className="size-3.5 shrink-0 text-subtle" />
                          {shipment.logisticType ?? "envio"} ·{" "}
                          {shipment.status ?? "sem status"}
                        </p>
                        {shipment.trackingCode && (
                          <p className="mt-1.5 font-mono text-[11px] text-subtle">
                            rastreio {shipment.trackingCode}
                          </p>
                        )}
                      </div>
                    )}

                    <Button variant="secondary" size="sm" className="w-full">
                      <Printer />
                      Imprimir etiqueta
                    </Button>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </Fragment>
  );
}

function Line({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "foreground" | "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd
        className={cn(
          "font-mono tabular-nums",
          tone === "danger" ? "text-danger" : "text-foreground",
        )}
      >
        {currency(value)}
      </dd>
    </div>
  );
}
