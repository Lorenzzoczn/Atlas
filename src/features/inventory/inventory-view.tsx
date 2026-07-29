"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Clock,
  RotateCcw,
  Settings2,
  TriangleAlert,
  Upload,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar } from "@/components/data/data-toolbar";
import { ChannelChip } from "@/components/data/channel-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Money } from "@/components/ui/money";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { coverageDays, lowStockProducts, products, stockValue } from "@/mock/products";
import { stockMovements, warehouseSummary } from "@/mock/operations";
import { MOCK_NOW } from "@/config/site";
import type { MovementType } from "@/types";
import { formatDateTime, number, percent, relativeTime } from "@/utils/format";

const MOVEMENT_META: Record<
  MovementType,
  { label: string; tone: "success" | "danger" | "warning" | "brand" }
> = {
  entrada: { label: "Entrada", tone: "success" },
  saida: { label: "Saída", tone: "danger" },
  ajuste: { label: "Ajuste", tone: "warning" },
  devolucao: { label: "Devolução", tone: "brand" },
};

export function InventoryView() {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("todos");

  const criticalProducts = useMemo(
    () =>
      products
        .filter((p) => p.status === "ativo")
        .map((product) => ({ product, coverage: coverageDays(product) }))
        .filter((entry) => entry.coverage < 30)
        .sort((a, b) => a.coverage - b.coverage)
        .slice(0, 12),
    [],
  );

  const movements = useMemo(() => {
    const term = search.trim().toLowerCase();
    return stockMovements
      .filter((movement) => {
        if (movementType !== "todos" && movement.type !== movementType) return false;
        if (!term) return true;
        return (
          movement.product.toLowerCase().includes(term) ||
          movement.sku.toLowerCase().includes(term)
        );
      })
      .slice(0, 24);
  }, [search, movementType]);

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const reserved = products.reduce((sum, p) => sum + p.reserved, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação"
        title="Estoque"
        description="Cobertura projetada, ruptura iminente e histórico de movimentação por centro de distribuição."
        icon={Boxes}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Settings2 />
              Regras de reposição
            </Button>
            <Button size="sm">
              <Upload />
              Importar inventário
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Valor imobilizado"
          value={stockValue}
          previous={stockValue * 0.91}
          icon={Warehouse}
          hint="Soma do custo unitário multiplicado pelo saldo de cada SKU."
        />
        <KpiCard
          index={1}
          label="Unidades em estoque"
          value={totalUnits}
          previous={totalUnits * 1.06}
          format="number"
          icon={Boxes}
          footer={`${number(reserved)} unidades reservadas`}
        />
        <KpiCard
          index={2}
          label="SKUs abaixo do ponto de pedido"
          value={lowStockProducts.length}
          previous={lowStockProducts.length - 3}
          format="number"
          icon={TriangleAlert}
          invert
          footer="Reposição sugerida disponível"
        />
        <KpiCard
          index={3}
          label="Cobertura média"
          value={
            criticalProducts.length
              ? criticalProducts.reduce((s, e) => s + e.coverage, 0) /
                criticalProducts.length
              : 0
          }
          format="number"
          icon={Clock}
          footer="Dias de venda com o saldo atual"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {warehouseSummary.map((warehouse, index) => (
          <Reveal
            key={warehouse.name}
            y={14}
            duration={0.4}
            delay={stagger(index, 0.05)}
            className="surface-card rounded-card p-4"
          >
            <div className="flex items-center gap-2">
              <Warehouse className="size-3.5 text-subtle" />
              <p className="truncate text-[12.5px] font-medium">{warehouse.name}</p>
            </div>
            <p className="mt-2.5 font-display text-[19px] font-semibold tracking-tight">
              <Money value={warehouse.value} compact />
            </p>
            <p className="mt-0.5 text-[11px] text-subtle">
              {number(warehouse.skus)} SKUs · {number(warehouse.units)} un.
            </p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10.5px]">
                <span className="text-subtle">Ocupação</span>
                <span className="font-mono tabular-nums text-muted">
                  {percent(warehouse.occupancy, 0)}
                </span>
              </div>
              <Progress
                value={warehouse.occupancy}
                size="xs"
                tone={warehouse.occupancy > 85 ? "warning" : "brand"}
              />
            </div>
          </Reveal>
        ))}
      </div>

      <Tabs defaultValue="cobertura">
        <TabsList>
          <TabsTrigger value="cobertura">
            <TriangleAlert className="size-3.5" />
            Risco de ruptura
          </TabsTrigger>
          <TabsTrigger value="movimentacoes">
            <RotateCcw className="size-3.5" />
            Movimentações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cobertura">
          <div className="surface-card overflow-hidden rounded-card">
            <div className="flex items-center justify-between gap-4 border-b border-border p-4">
              <div>
                <h2 className="font-display text-[15px] font-semibold tracking-tight">
                  Cobertura projetada
                </h2>
                <p className="mt-1 text-[12.5px] text-muted">
                  Dias de venda restantes no ritmo dos últimos 30 dias
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Gerar pedido de compra
              </Button>
            </div>

            <TableWrap>
              <Table>
                <THead>
                  <tr>
                    <TH>Produto</TH>
                    <TH>Canal</TH>
                    <TH align="right">Saldo</TH>
                    <TH align="right">Reservado</TH>
                    <TH align="right">Ponto de pedido</TH>
                    <TH align="right">Giro diário</TH>
                    <TH>Cobertura</TH>
                  </tr>
                </THead>
                <TBody>
                  {criticalProducts.map(({ product, coverage }) => {
                    const severity =
                      coverage <= 7 ? "danger" : coverage <= 15 ? "warning" : "success";
                    return (
                      <TR key={product.id} interactive>
                        <TD>
                          <p className="max-w-[280px] truncate text-[12.5px] font-medium">
                            {product.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                            {product.sku}
                          </p>
                        </TD>
                        <TD>
                          <ChannelChip id={product.marketplace} showName={false} />
                        </TD>
                        <TDNum
                          className={cn(
                            product.stock <= product.reorderPoint && "text-danger",
                          )}
                        >
                          {number(product.stock)}
                        </TDNum>
                        <TDNum className="text-subtle">{number(product.reserved)}</TDNum>
                        <TDNum className="text-subtle">
                          {number(product.reorderPoint)}
                        </TDNum>
                        <TDNum className="text-muted">
                          {(product.sold30d / 30).toFixed(1).replace(".", ",")}
                        </TDNum>
                        <TD>
                          <div className="flex items-center gap-2.5">
                            <Progress
                              value={Math.min(100, (coverage / 30) * 100)}
                              size="xs"
                              tone={severity}
                              className="w-24"
                              animated={false}
                            />
                            <Badge tone={severity} size="sm">
                              {coverage.toFixed(1).replace(".", ",")} d
                            </Badge>
                          </div>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableWrap>
          </div>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <div className="surface-card overflow-hidden rounded-card">
            <DataToolbar
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar por produto ou SKU…"
              filters={[
                {
                  id: "tipo",
                  label: "Tipo",
                  value: movementType,
                  options: [
                    { value: "todos", label: "Todos os tipos" },
                    ...(Object.keys(MOVEMENT_META) as MovementType[]).map((key) => ({
                      value: key,
                      label: MOVEMENT_META[key].label,
                    })),
                  ],
                  onChange: setMovementType,
                },
              ]}
            />

            {movements.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="Nenhuma movimentação"
                description="Não há registros para os filtros selecionados neste período."
              />
            ) : (
              <TableWrap>
                <Table>
                  <THead>
                    <tr>
                      <TH>Data</TH>
                      <TH>Produto</TH>
                      <TH>Tipo</TH>
                      <TH align="right">Quantidade</TH>
                      <TH align="right">Saldo após</TH>
                      <TH>Local</TH>
                      <TH>Responsável</TH>
                    </tr>
                  </THead>
                  <TBody>
                    {movements.map((movement) => (
                      <TR key={movement.id} interactive>
                        <TD>
                          <p className="text-[12.5px]">
                            {formatDateTime(movement.createdAt)}
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-subtle">
                            {relativeTime(movement.createdAt, MOCK_NOW)}
                          </p>
                        </TD>
                        <TD>
                          <p className="max-w-[240px] truncate text-[12.5px]">
                            {movement.product}
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                            {movement.sku}
                          </p>
                        </TD>
                        <TD>
                          <Badge tone={MOVEMENT_META[movement.type].tone} size="sm">
                            {MOVEMENT_META[movement.type].label}
                          </Badge>
                        </TD>
                        <TDNum
                          className={
                            movement.quantity > 0 ? "text-success" : "text-danger"
                          }
                        >
                          <span className="inline-flex items-center gap-1">
                            {movement.quantity > 0 ? (
                              <ArrowUpRight className="size-3" />
                            ) : (
                              <ArrowDownRight className="size-3" />
                            )}
                            {number(Math.abs(movement.quantity))}
                          </span>
                        </TDNum>
                        <TDNum className="text-muted">{number(movement.balance)}</TDNum>
                        <TD>
                          <span className="text-[12px] text-muted">
                            {movement.warehouse}
                          </span>
                        </TD>
                        <TD>
                          <span className="text-[12px] text-muted">
                            {movement.operator}
                          </span>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
