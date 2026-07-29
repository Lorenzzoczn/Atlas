"use client";

import { useMemo, useState } from "react";
import { Crown, Plus, Radar as RadarIcon, Star, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar, StatStrip } from "@/components/data/data-toolbar";
import { ChannelChip, DeltaText } from "@/components/data/channel-chip";
import { Sparkline } from "@/components/charts/chart-kit";
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
import { CompetitiveRadar } from "@/features/dashboard/dashboard-charts";
import { competitors } from "@/mock/operations";
import { radarDimensions } from "@/mock/analytics";
import { marketplaces } from "@/mock/catalog";
import { number, percent } from "@/utils/format";

const REPUTATION: Record<string, { label: string; tone: "brand" | "warning" | "neutral" | "danger" }> = {
  platinum: { label: "Platinum", tone: "brand" },
  gold: { label: "Ouro", tone: "warning" },
  silver: { label: "Prata", tone: "neutral" },
  bronze: { label: "Bronze", tone: "danger" },
};

export function CompetitorsView() {
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("todos");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return competitors.filter((competitor) => {
      if (channel !== "todos" && competitor.marketplace !== channel) return false;
      if (!term) return true;
      return (
        competitor.seller.toLowerCase().includes(term) ||
        competitor.product.toLowerCase().includes(term)
      );
    });
  }, [search, channel]);

  const cheaper = competitors.filter((c) => c.priceDelta < 0).length;
  const avgBuyBox =
    competitors.reduce((sum, c) => sum + c.buyBoxShare, 0) / competitors.length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Crescimento"
        title="Concorrentes"
        description="Radar de preço, disponibilidade e Buy Box dos vendedores que disputam os seus anúncios."
        icon={RadarIcon}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <TrendingDown />
              Ativar repricing
            </Button>
            <Button size="sm">
              <Plus />
              Monitorar vendedor
            </Button>
          </>
        }
      />

      <StatStrip
        items={[
          { label: "Vendedores monitorados", value: number(competitors.length) },
          { label: "Mais baratos que você", value: number(cheaper), tone: "danger" },
          { label: "Buy Box média deles", value: percent(avgBuyBox) },
          { label: "Sua Buy Box", value: percent(62), tone: "success" },
          { label: "Alertas em 48 h", value: "6" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <CompetitiveRadar data={radarDimensions} />

        <div className="surface-card rounded-card p-5 xl:col-span-2">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Pressão competitiva por vendedor
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Participação na Buy Box dos anúncios em disputa
          </p>

          <div className="mt-5 space-y-3">
            {competitors.slice(0, 6).map((competitor, index) => (
              <Reveal
                key={competitor.id}
                x={-8}
                y={0}
                duration={0.4}
                delay={stagger(index, 0.06)}
                className="flex items-center gap-4"
              >
                <span className="w-40 shrink-0 truncate text-[12.5px]">
                  {competitor.seller}
                </span>
                <Progress
                  value={competitor.buyBoxShare}
                  size="sm"
                  tone={competitor.buyBoxShare > 40 ? "danger" : "brand"}
                />
                <span className="w-14 shrink-0 text-right font-mono text-[12px] tabular-nums text-muted">
                  {percent(competitor.buyBoxShare, 0)}
                </span>
                <Badge tone={REPUTATION[competitor.reputation].tone} size="sm">
                  {REPUTATION[competitor.reputation].label}
                </Badge>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Buscar vendedor ou produto…"
          filters={[
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
              onChange: setChannel,
            },
          ]}
          onExport={() => undefined}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={RadarIcon}
            title="Nenhum concorrente encontrado"
            description="Ajuste os filtros ou adicione novos vendedores ao radar de monitoramento."
          />
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <tr>
                  <TH>Vendedor</TH>
                  <TH>Produto em disputa</TH>
                  <TH>Canal</TH>
                  <TH>Reputação</TH>
                  <TH align="right">Preço</TH>
                  <TH align="right">Diferença</TH>
                  <TH align="right">Estoque</TH>
                  <TH align="right">Vendas 30d</TH>
                  <TH align="right">Buy Box</TH>
                  <TH>Histórico</TH>
                </tr>
              </THead>
              <TBody>
                {filtered.map((competitor) => (
                  <TR key={competitor.id} interactive>
                    <TD>
                      <p className="text-[12.5px] font-medium">{competitor.seller}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-subtle">
                        <Star className="size-2.5 fill-warning text-warning" />
                        {competitor.rating.toFixed(1).replace(".", ",")}
                      </p>
                    </TD>
                    <TD>
                      <p className="max-w-[240px] truncate text-[12.5px] text-muted">
                        {competitor.product}
                      </p>
                    </TD>
                    <TD>
                      <ChannelChip id={competitor.marketplace} showName={false} />
                    </TD>
                    <TD>
                      <Badge tone={REPUTATION[competitor.reputation].tone} size="sm">
                        {REPUTATION[competitor.reputation].label}
                      </Badge>
                    </TD>
                    <TDNum>
                      <Money value={competitor.price} />
                    </TDNum>
                    <TDNum>
                      <DeltaText value={competitor.priceDelta} invert />
                    </TDNum>
                    <TDNum
                      className={cn(competitor.stock === 0 && "text-subtle")}
                    >
                      {competitor.stock === 0 ? "esgotado" : number(competitor.stock)}
                    </TDNum>
                    <TDNum className="text-muted">{number(competitor.sold30d)}</TDNum>
                    <TDNum>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          competitor.buyBoxShare > 40 ? "text-danger" : "text-muted",
                        )}
                      >
                        {competitor.buyBoxShare > 40 && <Crown className="size-3" />}
                        {percent(competitor.buyBoxShare, 0)}
                      </span>
                    </TDNum>
                    <TD>
                      <Sparkline
                        data={competitor.trend}
                        width={64}
                        height={22}
                        tone="auto"
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}
      </div>
    </div>
  );
}
