"use client";

import { useMemo, useState } from "react";
import {
  Crown,
  Eye,
  LayoutGrid,
  List,
  Package,
  Plus,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar, Pagination, StatStrip } from "@/components/data/data-toolbar";
import { ChannelChip } from "@/components/data/channel-chip";
import { Sparkline } from "@/components/charts/chart-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Money } from "@/components/ui/money";
import { Progress } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/tabs";
import {
  TBody,
  TD,
  TDNum,
  TH,
  THead,
  TR,
  Table,
  TableWrap,
  type SortDirection,
} from "@/components/ui/table";
import { categories, marketplaces } from "@/mock/catalog";
import { products } from "@/mock/products";
import type { Product, ProductStatus } from "@/types";
import { number, percent } from "@/utils/format";

const STATUS_META: Record<
  ProductStatus,
  { label: string; tone: "success" | "neutral" | "warning" | "danger" }
> = {
  ativo: { label: "Ativo", tone: "success" },
  pausado: { label: "Pausado", tone: "neutral" },
  revisao: { label: "Em revisão", tone: "warning" },
  encerrado: { label: "Encerrado", tone: "danger" },
};

type SortKey = "revenue30d" | "margin" | "stock" | "conversion" | "sold30d";

const PAGE_SIZE = 12;

/** Deterministic gradient stand-in for the product photo. */
function ProductThumb({ product, size = 40 }: { product: Product; size?: number }) {
  const hue = (product.title.charCodeAt(0) * 7 + product.title.length * 13) % 360;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg border border-border font-display text-[11px] font-bold text-white/90"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, hsl(${hue} 62% 42%), hsl(${(hue + 48) % 360} 68% 28%))`,
      }}
    >
      {product.brand.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function ProductsView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");
  const [channel, setChannel] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [view, setView] = useState<"tabela" | "grade">("tabela");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "revenue30d",
    direction: "desc",
  });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = products.filter((product) => {
      if (category !== "todos" && product.category !== category) return false;
      if (channel !== "todos" && product.marketplace !== channel) return false;
      if (status !== "todos" && product.status !== status) return false;
      if (!term) return true;
      return (
        product.title.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term)
      );
    });

    if (!sort.direction) return list;
    return [...list].sort((a, b) =>
      sort.direction === "asc"
        ? a[sort.key] - b[sort.key]
        : b[sort.key] - a[sort.key],
    );
  }, [search, category, channel, status, sort]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(
    () => ({
      skus: filtered.length,
      revenue: filtered.reduce((sum, p) => sum + p.revenue30d, 0),
      units: filtered.reduce((sum, p) => sum + p.sold30d, 0),
      stock: filtered.reduce((sum, p) => sum + p.stock, 0),
      margin: filtered.length
        ? filtered.reduce((sum, p) => sum + p.margin, 0) / filtered.length
        : 0,
      buyBox: filtered.length
        ? (filtered.filter((p) => p.buyBox).length / filtered.length) * 100
        : 0,
    }),
    [filtered],
  );

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "desc" ? "asc" : "desc" }
        : { key, direction: "desc" },
    );

  const resetFilters = () => {
    setSearch("");
    setCategory("todos");
    setChannel("todos");
    setStatus("todos");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos"
        description="Preço, margem, giro e competitividade de cada anúncio publicado nos seus canais."
        icon={Package}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <TrendingUp />
              Simular preços
            </Button>
            <Button size="sm">
              <Plus />
              Novo produto
            </Button>
          </>
        }
      />

      <StatStrip
        items={[
          { label: "SKUs", value: number(totals.skus) },
          { label: "Receita 30d", value: <Money value={totals.revenue} /> },
          { label: "Unidades vendidas", value: number(totals.units) },
          { label: "Margem média", value: percent(totals.margin), tone: "success" },
          { label: "Estoque total", value: number(totals.stock) },
          { label: "Buy Box", value: percent(totals.buyBox, 0) },
        ]}
      />

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por título, SKU ou marca…"
          filters={[
            {
              id: "categoria",
              label: "Categoria",
              value: category,
              options: [
                { value: "todos", label: "Todas as categorias" },
                ...categories.map((item) => ({ value: item, label: item })),
              ],
              onChange: (value) => {
                setCategory(value);
                setPage(1);
              },
            },
            {
              id: "canal",
              label: "Canal",
              value: channel,
              options: [
                { value: "todos", label: "Todos os canais" },
                ...marketplaces
                  .filter((m) => m.connected)
                  .map((m) => ({ value: m.id, label: m.name })),
              ],
              onChange: (value) => {
                setChannel(value);
                setPage(1);
              },
            },
            {
              id: "status",
              label: "Status",
              value: status,
              options: [
                { value: "todos", label: "Todos os status" },
                ...(Object.keys(STATUS_META) as ProductStatus[]).map((key) => ({
                  value: key,
                  label: STATUS_META[key].label,
                })),
              ],
              onChange: (value) => {
                setStatus(value);
                setPage(1);
              },
            },
          ]}
          onExport={() => toast.success("Catálogo exportado para XLSX")}
        >
          <Segmented
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: "tabela", label: "", icon: <List /> },
              { value: "grade", label: "", icon: <LayoutGrid /> },
            ]}
          />
        </DataToolbar>

        {paged.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description="Nenhum SKU corresponde à combinação de busca e filtros selecionada."
            action={{ label: "Limpar filtros", onClick: resetFilters }}
          />
        ) : view === "tabela" ? (
          <TableWrap>
            <Table>
              <THead>
                <tr>
                  <TH>Produto</TH>
                  <TH>Canal</TH>
                  <TH>Status</TH>
                  <TH align="right">Preço</TH>
                  <TH
                    align="right"
                    sortable
                    direction={sort.key === "margin" ? sort.direction : null}
                    onSort={() => toggleSort("margin")}
                  >
                    Margem
                  </TH>
                  <TH
                    align="right"
                    sortable
                    direction={sort.key === "stock" ? sort.direction : null}
                    onSort={() => toggleSort("stock")}
                  >
                    Estoque
                  </TH>
                  <TH
                    align="right"
                    sortable
                    direction={sort.key === "sold30d" ? sort.direction : null}
                    onSort={() => toggleSort("sold30d")}
                  >
                    Vendas 30d
                  </TH>
                  <TH
                    align="right"
                    sortable
                    direction={sort.key === "conversion" ? sort.direction : null}
                    onSort={() => toggleSort("conversion")}
                  >
                    Conversão
                  </TH>
                  <TH
                    align="right"
                    sortable
                    direction={sort.key === "revenue30d" ? sort.direction : null}
                    onSort={() => toggleSort("revenue30d")}
                  >
                    Receita 30d
                  </TH>
                  <TH>Tendência</TH>
                </tr>
              </THead>

              <TBody>
                {paged.map((product) => (
                  <TR key={product.id} interactive>
                    <TD>
                      <div className="flex items-center gap-3">
                        <ProductThumb product={product} />
                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate text-[12.5px] font-medium">
                            {product.title}
                          </p>
                          <p className="mt-0.5 flex items-center gap-2 font-mono text-[10.5px] text-subtle">
                            {product.sku}
                            {product.buyBox && (
                              <span className="inline-flex items-center gap-0.5 text-warning">
                                <Crown className="size-2.5" />
                                Buy Box
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <ChannelChip id={product.marketplace} showName={false} />
                    </TD>
                    <TD>
                      <Badge tone={STATUS_META[product.status].tone} size="sm">
                        {STATUS_META[product.status].label}
                      </Badge>
                    </TD>
                    <TDNum>
                      <Money value={product.price} />
                    </TDNum>
                    <TDNum
                      className={
                        product.margin >= 30
                          ? "text-success"
                          : product.margin >= 15
                            ? "text-warning"
                            : "text-danger"
                      }
                    >
                      {percent(product.margin)}
                    </TDNum>
                    <TDNum
                      className={
                        product.stock <= product.reorderPoint ? "text-danger" : ""
                      }
                    >
                      {number(product.stock)}
                    </TDNum>
                    <TDNum>{number(product.sold30d)}</TDNum>
                    <TDNum className="text-muted">{percent(product.conversion, 2)}</TDNum>
                    <TDNum>
                      <Money value={product.revenue30d} compact />
                    </TDNum>
                    <TD>
                      <Sparkline data={product.trend} width={64} height={22} tone="auto" />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paged.map((product, index) => (
              <Reveal
                as="article"
                key={product.id}
                y={14}
                duration={0.4}
                delay={stagger(index, 0.04, 0.3)}
                className="group/card surface-card rounded-card p-4 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-border-strong"
              >
                <div className="flex items-start gap-3">
                  <ProductThumb product={product} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[12.5px] font-medium leading-snug">
                      {product.title}
                    </p>
                    <p className="mt-1 font-mono text-[10.5px] text-subtle">
                      {product.sku}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <ChannelChip id={product.marketplace} showName={false} />
                  <Badge tone={STATUS_META[product.status].tone} size="sm">
                    {STATUS_META[product.status].label}
                  </Badge>
                  {product.buyBox && (
                    <Badge tone="warning" size="sm">
                      <Crown />
                      Buy Box
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10.5px] text-subtle">Preço</p>
                    <p className="font-display text-[17px] font-semibold tracking-tight">
                      <Money value={product.price} />
                    </p>
                  </div>
                  <Sparkline data={product.trend} tone="auto" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                  <div>
                    <p className="text-[10px] text-subtle">Margem</p>
                    <p className="font-mono text-[12px] tabular-nums text-success">
                      {percent(product.margin, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-subtle">Vendas</p>
                    <p className="font-mono text-[12px] tabular-nums">
                      {number(product.sold30d)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-subtle">Avaliação</p>
                    <p className="flex items-center justify-center gap-0.5 font-mono text-[12px] tabular-nums">
                      <Star className="size-2.5 fill-warning text-warning" />
                      {product.rating.toFixed(1).replace(".", ",")}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10.5px]">
                    <span className="text-subtle">Estoque</span>
                    <span
                      className={cn(
                        "font-mono tabular-nums",
                        product.stock <= product.reorderPoint
                          ? "text-danger"
                          : "text-muted",
                      )}
                    >
                      {number(product.stock)} un.
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (product.stock / 120) * 100)}
                    size="xs"
                    tone={product.stock <= product.reorderPoint ? "danger" : "brand"}
                    animated={false}
                  />
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 w-full opacity-0 transition-opacity group-hover/card:opacity-100"
                >
                  <Eye />
                  Ver detalhes
                </Button>
              </Reveal>
            ))}
          </div>
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
