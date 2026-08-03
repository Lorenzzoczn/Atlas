"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Copy, MapPin, Package, Plug, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination, StatStrip } from "@/components/data/data-toolbar";
import { ChannelChip } from "@/components/data/channel-chip";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/tabs";
import { SkeletonRows } from "@/components/ui/skeleton";
import {
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  TableWrap,
} from "@/components/ui/table";
import { channelIdOf, commerceApi, queryKeys } from "@/services/atlas-backend";
import { formatDate, number } from "@/utils/format";

const PAGE_SIZE = 15;

/** Status do canal → rótulo e tom. O canal manda em inglês e em snake_case. */
const STATUS_META: Record<string, { label: string; tone: "neutral" | "brand" | "accent" | "success" | "danger" }> = {
  pending: { label: "Pendente", tone: "neutral" },
  handling: { label: "Preparando", tone: "neutral" },
  ready_to_ship: { label: "Pronto para enviar", tone: "brand" },
  shipped: { label: "Em trânsito", tone: "accent" },
  delivered: { label: "Entregue", tone: "success" },
  not_delivered: { label: "Não entregue", tone: "danger" },
  cancelled: { label: "Cancelado", tone: "danger" },
};

function logisticLabel(type: string | null) {
  const labels: Record<string, string> = {
    fulfillment: "Full",
    self_service: "Flex",
    cross_docking: "Coleta",
    drop_off: "Agência",
  };
  return type ? (labels[type] ?? type) : "—";
}

export function ShipmentsView() {
  const [view, setView] = useState<"todos" | "pendentes">("todos");
  const [page, setPage] = useState(1);

  const filters = {
    pending: view === "pendentes" || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const shipmentsQuery = useQuery({
    queryKey: queryKeys.shipments(filters),
    queryFn: () => commerceApi.shipments(filters),
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.shipmentsSummary,
    queryFn: commerceApi.shipmentsSummary,
  });

  const items = shipmentsQuery.data?.items ?? [];
  const summary = summaryQuery.data;

  const copyTracking = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success("Código de rastreio copiado");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação"
        title="Envios"
        description="Rastreio, transportadora e prazo de cada envio, junto do pedido de origem."
        icon={Truck}
        actions={
          <Segmented
            size="sm"
            value={view}
            onChange={(value) => {
              setView(value);
              setPage(1);
            }}
            options={[
              { value: "todos", label: "Todos" },
              { value: "pendentes", label: "Em trânsito" },
            ]}
          />
        }
      />

      {summary && summary.total > 0 && (
        <StatStrip
          items={[
            { label: "Envios", value: number(summary.total) },
            { label: "Entregues", value: number(summary.delivered), tone: "success" },
            { label: "Em trânsito", value: number(summary.inTransit) },
            {
              label: "Taxa de entrega",
              value: `${((summary.delivered / summary.total) * 100).toFixed(0)}%`,
              tone: "success",
            },
          ]}
        />
      )}

      <div className="surface-card overflow-hidden rounded-card">
        {shipmentsQuery.isError ? (
          <ErrorState onRetry={() => void shipmentsQuery.refetch()} />
        ) : shipmentsQuery.isLoading ? (
          <SkeletonRows rows={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={view === "pendentes" ? Package : Plug}
            title={view === "pendentes" ? "Nenhum envio em trânsito" : "Nenhum envio ainda"}
            description={
              view === "pendentes"
                ? "Todos os envios registrados já foram entregues."
                : "Os envios aparecem aqui conforme os pedidos são sincronizados dos seus canais."
            }
          />
        ) : (
          <TableWrap className={cn(shipmentsQuery.isPlaceholderData && "opacity-60")}>
            <Table>
              <THead>
                <tr>
                  <TH>Pedido</TH>
                  <TH>Canal</TH>
                  <TH>Destino</TH>
                  <TH>Logística</TH>
                  <TH>Status</TH>
                  <TH>Rastreio</TH>
                  <TH>Datas</TH>
                </tr>
              </THead>

              <TBody>
                {items.map((shipment) => {
                  const meta = shipment.status
                    ? (STATUS_META[shipment.status] ?? { label: shipment.status, tone: "neutral" as const })
                    : { label: "sem status", tone: "neutral" as const };

                  return (
                    <TR key={shipment.id} interactive>
                      <TD>
                        <p className="font-mono text-[12.5px] font-medium">
                          {shipment.order.code ?? shipment.order.id.slice(0, 8)}
                        </p>
                        <p className="mt-0.5 max-w-[150px] truncate text-[11px] text-subtle">
                          {shipment.order.buyerName ?? "—"}
                        </p>
                      </TD>

                      <TD>
                        <ChannelChip id={channelIdOf(shipment.order.provider)} showName={false} />
                      </TD>

                      <TD>
                        {shipment.order.city ? (
                          <span className="flex items-center gap-1 text-[12px] text-muted">
                            <MapPin className="size-2.5 shrink-0" />
                            {shipment.order.city} · {shipment.order.state}
                          </span>
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </TD>

                      <TD>
                        <Badge
                          tone={shipment.logisticType === "fulfillment" ? "brand" : "neutral"}
                          size="sm"
                        >
                          {logisticLabel(shipment.logisticType)}
                        </Badge>
                      </TD>

                      <TD>
                        <Badge tone={meta.tone} size="sm">
                          {meta.label}
                        </Badge>
                      </TD>

                      <TD>
                        {shipment.trackingCode ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              copyTracking(shipment.trackingCode!);
                            }}
                            className="group inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted transition-colors hover:text-foreground"
                          >
                            {shipment.trackingCode}
                            <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                        {shipment.carrier && (
                          <p className="mt-0.5 text-[10.5px] text-subtle">{shipment.carrier}</p>
                        )}
                      </TD>

                      <TD>
                        <div className="space-y-0.5 text-[11px]">
                          {shipment.shippedAt && (
                            <p className="text-muted">
                              enviado {formatDate(shipment.shippedAt)}
                            </p>
                          )}
                          {shipment.deliveredAt ? (
                            <p className="text-success">
                              entregue {formatDate(shipment.deliveredAt)}
                            </p>
                          ) : shipment.estimatedAt ? (
                            <p className="text-subtle">
                              previsto {formatDate(shipment.estimatedAt)}
                            </p>
                          ) : null}
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        )}

        {shipmentsQuery.data && shipmentsQuery.data.meta.total > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={shipmentsQuery.data.meta.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
