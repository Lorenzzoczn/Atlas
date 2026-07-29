"use client";

import { useMemo, useState } from "react";
import { Pause, Play, Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar, StatStrip } from "@/components/data/data-toolbar";
import { ChannelChip } from "@/components/data/channel-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Money } from "@/components/ui/money";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/toggle";
import { Hint } from "@/components/ui/tooltip";
import { marketplaces } from "@/mock/catalog";
import { campaigns as seedCampaigns } from "@/mock/operations";
import type { CampaignStatus } from "@/types";
import { currency, formatDate, number, percent } from "@/utils/format";

const STATUS_META: Record<
  CampaignStatus,
  { label: string; tone: "success" | "warning" | "neutral" | "brand" }
> = {
  ativa: { label: "Ativa", tone: "success" },
  pausada: { label: "Pausada", tone: "warning" },
  encerrada: { label: "Encerrada", tone: "neutral" },
  rascunho: { label: "Rascunho", tone: "brand" },
};

export function CampaignsView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [channel, setChannel] = useState("todos");
  const [paused, setPaused] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return seedCampaigns.filter((campaign) => {
      if (status !== "todos" && campaign.status !== status) return false;
      if (channel !== "todos" && campaign.marketplace !== channel) return false;
      if (!term) return true;
      return (
        campaign.name.toLowerCase().includes(term) ||
        campaign.objective.toLowerCase().includes(term)
      );
    });
  }, [search, status, channel]);

  const active = seedCampaigns.filter((c) => c.status === "ativa").length;
  const totalBudget = seedCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpend = seedCampaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = seedCampaigns.reduce((sum, c) => sum + c.revenue, 0);

  const isPaused = (id: string, original: CampaignStatus) =>
    paused.includes(id) ? true : original !== "ativa";

  const toggle = (id: string, name: string, currentlyRunning: boolean) => {
    setPaused((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    toast.success(currentlyRunning ? "Campanha pausada" : "Campanha reativada", {
      description: name,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Crescimento"
        title="Campanhas"
        description="Orçamento, ritmo de gasto e retorno de cada campanha ativa nos seus canais."
        icon={Target}
        actions={
          <Button size="sm">
            <Plus />
            Nova campanha
          </Button>
        }
      />

      <StatStrip
        items={[
          { label: "Campanhas ativas", value: `${active} de ${seedCampaigns.length}` },
          { label: "Orçamento total", value: <Money value={totalBudget} /> },
          { label: "Investido", value: <Money value={totalSpend} /> },
          { label: "Receita atribuída", value: <Money value={totalRevenue} />, tone: "success" },
          {
            label: "ROAS consolidado",
            value: (totalRevenue / totalSpend).toFixed(2).replace(".", ","),
            tone: "success",
          },
          { label: "ACOS", value: percent((totalSpend / totalRevenue) * 100) },
        ]}
      />

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Buscar campanha ou objetivo…"
          filters={[
            {
              id: "status",
              label: "Status",
              value: status,
              options: [
                { value: "todos", label: "Todos os status" },
                ...(Object.keys(STATUS_META) as CampaignStatus[]).map((key) => ({
                  value: key,
                  label: STATUS_META[key].label,
                })),
              ],
              onChange: setStatus,
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
              onChange: setChannel,
            },
          ]}
          onExport={() => undefined}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhuma campanha encontrada"
            description="Ajuste os filtros ou crie uma nova campanha para começar a investir."
            action={{ label: "Nova campanha" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((campaign, index) => {
              const running = !isPaused(campaign.id, campaign.status);
              const pace = (campaign.spend / campaign.budget) * 100;

              return (
                <Reveal
                  as="article"
                  key={campaign.id}
                  y={14}
                  duration={0.4}
                  delay={stagger(index, 0.04, 0.3)}
                  className={cn(
                    "surface-card rounded-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong",
                    !running && "opacity-75",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium">
                        {campaign.name}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-[11px] text-subtle">
                        <ChannelChip id={campaign.marketplace} showName={false} />
                        {campaign.objective}
                      </p>
                    </div>
                    <Hint label={running ? "Pausar campanha" : "Reativar campanha"}>
                      <span className="shrink-0">
                        <Switch
                          checked={running}
                          onCheckedChange={() =>
                            toggle(campaign.id, campaign.name, running)
                          }
                          aria-label={running ? "Pausar" : "Reativar"}
                        />
                      </span>
                    </Hint>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      tone={running ? "success" : STATUS_META[campaign.status].tone}
                      size="sm"
                    >
                      {running ? <Play /> : <Pause />}
                      {running ? "Ativa" : STATUS_META[campaign.status].label}
                    </Badge>
                    <Badge tone={campaign.roas >= 5 ? "success" : "warning"} size="sm">
                      ROAS {campaign.roas.toFixed(1).replace(".", ",")}
                    </Badge>
                    <Badge tone={campaign.acos <= 18 ? "brand" : "danger"} size="sm">
                      ACOS {percent(campaign.acos, 0)}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-baseline justify-between text-[11.5px]">
                      <span className="text-subtle">Consumo do orçamento</span>
                      <span className="font-mono tabular-nums text-muted">
                        {currency(campaign.spend)} / {currency(campaign.budget)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, pace)}
                      size="sm"
                      tone={pace > 92 ? "warning" : "brand"}
                    />
                  </div>

                  <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-4 text-center">
                    {[
                      ["Impressões", number(campaign.impressions)],
                      ["Cliques", number(campaign.clicks)],
                      ["CTR", percent(campaign.ctr, 2)],
                      ["Conversões", number(campaign.conversions)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[9.5px] uppercase tracking-wide text-subtle">
                          {label}
                        </dt>
                        <dd className="mt-0.5 font-mono text-[12px] tabular-nums">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[10.5px] text-subtle">
                      Desde {formatDate(campaign.startedAt)}
                    </span>
                    <span className="font-mono text-[13px] font-medium tabular-nums text-success">
                      <Money value={campaign.revenue} compact />
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
