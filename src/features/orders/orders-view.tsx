"use client";

import { Fragment, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  CircleAlert,
  CreditCard,
  Link2,
  MapPin,
  Package,
  Plus,
  Printer,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar, Pagination, StatStrip } from "@/components/data/data-toolbar";
import { ChannelChip, OrderStatusBadge } from "@/components/data/channel-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/toggle";
import { EmptyState } from "@/components/ui/feedback";
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
import { fetchOrders } from "@/services/atlas-api";
import { marketplaces } from "@/mock/catalog";
import { orderStatusLabel, paymentLabel } from "@/mock/orders";
import { currency, formatDateTime, number, percent } from "@/utils/format";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  ...(Object.keys(orderStatusLabel) as (keyof typeof orderStatusLabel)[]).map(
    (status) => ({ value: status, label: orderStatusLabel[status] }),
  ),
];

const CHANNEL_OPTIONS = [
  { value: "todos", label: "Todos os canais" },
  ...marketplaces
    .filter((m) => m.connected)
    .map((m) => ({ value: m.id, label: m.name })),
];

const PAGE_SIZE = 10;

export function OrdersView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [marketplace, setMarketplace] = useState("todos");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["orders", { search, status, marketplace, page }],
    queryFn: () =>
      fetchOrders({ search, status, marketplace, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const reset = () => {
    setPage(1);
    setExpanded(null);
  };

  const items = data?.items ?? [];
  const allSelected = items.length > 0 && selected.length === items.length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação"
        title="Pedidos"
        description="Acompanhe cada venda, do pagamento à entrega, com a rentabilidade calculada linha a linha."
        icon={ShoppingCart}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Printer />
              Imprimir etiquetas
            </Button>
            <Button size="sm">
              <Plus />
              Registrar venda externa
            </Button>
          </>
        }
      />

      {data && (
        <StatStrip
          items={[
            { label: "Pedidos", value: number(data.summary.orders) },
            { label: "Faturamento", value: <Money value={data.summary.revenue} /> },
            {
              label: "Lucro estimado",
              value: <Money value={data.summary.profit} />,
              tone: "success",
            },
            { label: "Taxas do canal", value: <Money value={data.summary.fees} />, tone: "danger" },
            { label: "Margem", value: percent(data.summary.margin) },
            { label: "Ticket médio", value: <Money value={data.summary.ticket} /> },
          ]}
        />
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
              value: marketplace,
              options: CHANNEL_OPTIONS,
              onChange: (value) => {
                setMarketplace(value);
                reset();
              },
            },
          ]}
          onExport={() =>
            toast.success("Exportação agendada", {
              description: "O arquivo estará disponível em Relatórios.",
            })
          }
        >
          {selected.length > 0 && (
            <Badge tone="brand" size="lg">
              {selected.length} selecionados
            </Badge>
          )}
        </DataToolbar>

        {isLoading ? (
          <SkeletonRows rows={PAGE_SIZE} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum pedido encontrado"
            description="Ajuste a busca ou os filtros para ver outros resultados neste período."
            action={{
              label: "Limpar filtros",
              onClick: () => {
                setSearch("");
                setStatus("todos");
                setMarketplace("todos");
                reset();
              },
            }}
          />
        ) : (
          <TableWrap className={cn(isPlaceholderData && "opacity-60 transition-opacity")}>
            <Table>
              <THead>
                <tr>
                  <TH className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() =>
                        setSelected(allSelected ? [] : items.map((o) => o.id))
                      }
                      aria-label="Selecionar todos"
                    />
                  </TH>
                  <TH>Pedido</TH>
                  <TH>Canal</TH>
                  <TH>Comprador</TH>
                  <TH>Status</TH>
                  <TH>Pagamento</TH>
                  <TH align="right">Receita</TH>
                  <TH align="right">Lucro</TH>
                  <TH align="right">Margem</TH>
                  <TH className="w-10" />
                </tr>
              </THead>

              <TBody>
                {items.map((order) => {
                  const open = expanded === order.id;
                  const missingCost = order.cost === null;

                  return (
                    <Fragment key={order.id}>
                      <TR
                        interactive
                        onClick={() => setExpanded(open ? null : order.id)}
                        className={cn(open && "bg-surface-2/60")}
                      >
                        <TD onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={selected.includes(order.id)}
                            onCheckedChange={() =>
                              setSelected((prev) =>
                                prev.includes(order.id)
                                  ? prev.filter((id) => id !== order.id)
                                  : [...prev, order.id],
                              )
                            }
                            aria-label={`Selecionar pedido ${order.code}`}
                          />
                        </TD>

                        <TD>
                          <p className="font-mono text-[12.5px] font-medium">
                            {order.code}
                          </p>
                          <p className="mt-0.5 text-[11px] text-subtle">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </TD>

                        <TD>
                          <ChannelChip id={order.marketplace} showName={false} />
                          <span className="ml-1.5 text-[11px] text-subtle">
                            {order.account}
                          </span>
                        </TD>

                        <TD>
                          <p className="max-w-[160px] truncate text-[12.5px]">
                            {order.buyer}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-subtle">
                            <MapPin className="size-2.5" />
                            {order.city} · {order.state}
                          </p>
                        </TD>

                        <TD>
                          <OrderStatusBadge status={order.status} />
                        </TD>

                        <TD>
                          <span className="text-[12px] text-muted">
                            {paymentLabel[order.payment]}
                          </span>
                        </TD>

                        <TDNum>
                          <Money value={order.revenue} />
                        </TDNum>

                        <TDNum
                          className={
                            missingCost
                              ? "text-warning"
                              : order.profit >= 0
                                ? "text-success"
                                : "text-danger"
                          }
                        >
                          <span className="inline-flex items-center gap-1">
                            {missingCost && <CircleAlert className="size-3" />}
                            <Money value={order.profit} />
                          </span>
                        </TDNum>

                        <TDNum className="text-muted">{percent(order.margin)}</TDNum>

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
                          <tr key={`${order.id}-detail`}>
                            <td colSpan={10} className="p-0">
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
                                      {order.items.map((item, index) => (
                                        <li
                                          key={`${item.sku}-${index}`}
                                          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                                        >
                                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-subtle">
                                            <Package className="size-4" />
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-[12.5px]">
                                              {item.title}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                                              {item.sku} · {item.quantity}×
                                            </p>
                                          </div>
                                          {item.cost === null ? (
                                            <Button variant="subtle" size="xs">
                                              <Link2 />
                                              Vincular custo
                                            </Button>
                                          ) : (
                                            <span className="font-mono text-[11.5px] text-subtle">
                                              custo {currency(item.cost)}
                                            </span>
                                          )}
                                          <span className="w-20 text-right font-mono text-[12.5px] tabular-nums">
                                            {currency(item.unitPrice * item.quantity)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>

                                    {order.tags.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-1.5">
                                        {order.tags.map((tag) => (
                                          <Badge key={tag} tone="outline" size="sm">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                                      Composição do resultado
                                    </p>
                                    <dl className="space-y-2 rounded-xl border border-border bg-surface p-4 text-[12.5px]">
                                      {[
                                        ["Receita bruta", order.revenue, "text-foreground"],
                                        ["Comissão do canal", -order.fees, "text-danger"],
                                        ["Frete", -order.shipping, "text-danger"],
                                        [
                                          "Custo da mercadoria",
                                          order.cost === null ? null : -order.cost,
                                          "text-danger",
                                        ],
                                      ].map(([label, value, tone]) => (
                                        <div
                                          key={String(label)}
                                          className="flex items-center justify-between"
                                        >
                                          <dt className="text-muted">{String(label)}</dt>
                                          <dd
                                            className={cn(
                                              "font-mono tabular-nums",
                                              value === null ? "text-warning" : String(tone),
                                            )}
                                          >
                                            {value === null
                                              ? "não vinculado"
                                              : currency(Number(value))}
                                          </dd>
                                        </div>
                                      ))}
                                      <div className="flex items-center justify-between border-t border-border pt-2">
                                        <dt className="font-medium">Lucro líquido</dt>
                                        <dd className="font-mono font-medium tabular-nums text-success">
                                          {currency(order.profit)}
                                        </dd>
                                      </div>
                                    </dl>

                                    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3 text-[12px] text-muted">
                                      <Truck className="size-3.5 shrink-0 text-subtle" />
                                      Liberação prevista em{" "}
                                      {formatDateTime(order.releaseAt)}
                                    </div>

                                    <div className="flex gap-2">
                                      <Button variant="secondary" size="sm" className="flex-1">
                                        <Printer />
                                        Etiqueta
                                      </Button>
                                      <Button variant="outline" size="sm" className="flex-1">
                                        <CreditCard />
                                        Custos
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        )}

        {data && data.total > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data.total}
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
