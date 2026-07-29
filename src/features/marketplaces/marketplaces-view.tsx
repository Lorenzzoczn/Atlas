"use client";

import {
  Activity,
  Check,
  Link2,
  Plug,
  RefreshCw,
  Settings2,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Progress } from "@/components/ui/progress";
import { StatStrip } from "@/components/data/data-toolbar";
import { Reveal, stagger } from "@/components/ui/reveal";
import { marketplaces } from "@/mock/catalog";
import { marketplaceBreakdown } from "@/mock/orders";
import { MOCK_NOW } from "@/config/site";
import { number, percent, relativeTime } from "@/utils/format";

const CAPABILITIES: Record<string, string[]> = {
  "mercado-livre": ["Pedidos", "Estoque", "Anúncios", "Mensagens", "Ads"],
  shopee: ["Pedidos", "Estoque", "Anúncios", "Ads"],
  amazon: ["Pedidos", "Estoque", "Anúncios"],
  magalu: ["Pedidos", "Estoque"],
  "tiktok-shop": ["Pedidos", "Anúncios", "Ads"],
  shopify: ["Pedidos", "Estoque", "Clientes"],
  woocommerce: ["Pedidos", "Estoque"],
  nuvemshop: ["Pedidos", "Estoque", "Clientes"],
};

export function MarketplacesView() {
  const connected = marketplaces.filter((m) => m.connected);
  const available = marketplaces.filter((m) => !m.connected);

  const revenueByChannel = new Map(
    marketplaceBreakdown.map((entry) => [entry.id, entry]),
  );

  const avgHealth =
    connected.reduce((sum, m) => sum + m.health, 0) / connected.length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Marketplaces"
        description="Estado das integrações, permissões concedidas e saúde da sincronização de cada canal."
        icon={Store}
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast.success("Sincronização iniciada", {
                description: `${connected.length} canais serão atualizados.`,
              })
            }
          >
            <RefreshCw />
            Sincronizar todos
          </Button>
        }
      />

      <StatStrip
        items={[
          { label: "Canais conectados", value: `${connected.length} de ${marketplaces.length}` },
          { label: "Contas ativas", value: number(connected.reduce((s, m) => s + m.accounts, 0)) },
          { label: "Saúde média", value: percent(avgHealth, 0), tone: "success" },
          { label: "Última sincronização", value: relativeTime(connected[0].syncedAt, MOCK_NOW) },
        ]}
      />

      <section>
        <h2 className="mb-3 font-display text-[15px] font-semibold tracking-tight">
          Canais conectados
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connected.map((channel, index) => {
            const revenue = revenueByChannel.get(channel.id);
            return (
              <Reveal
                as="article"
                key={channel.id}
                y={14}
                duration={0.4}
                delay={stagger(index, 0.05)}
                className="group/card surface-card rounded-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold text-black/80"
                      style={{ background: channel.color }}
                    >
                      {channel.abbr}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium">{channel.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-subtle">
                        <StatusDot tone="success" pulse />
                        {channel.accounts}{" "}
                        {channel.accounts === 1 ? "conta ativa" : "contas ativas"}
                      </p>
                    </div>
                  </div>
                  <Badge tone="success" size="sm">
                    <Check />
                    Conectado
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                    <span className="text-subtle">Saúde da integração</span>
                    <span className="font-mono tabular-nums text-muted">
                      {channel.health}%
                    </span>
                  </div>
                  <Progress
                    value={channel.health}
                    size="xs"
                    tone={
                      channel.health >= 90
                        ? "success"
                        : channel.health >= 75
                          ? "brand"
                          : "warning"
                    }
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {CAPABILITIES[channel.id]?.map((capability) => (
                    <Badge key={capability} tone="outline" size="sm">
                      {capability}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-[10.5px] text-subtle">Receita 30d</p>
                    <p className="font-mono text-[15px] font-medium tabular-nums">
                      {revenue ? <Money value={revenue.revenue} compact /> : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10.5px] text-subtle">Sincronizado</p>
                    <p className="text-[11.5px] text-muted">
                      {relativeTime(channel.syncedAt, MOCK_NOW)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Settings2 />
                    Configurar
                  </Button>
                  <Button variant="outline" size="icon-sm" aria-label="Sincronizar">
                    <RefreshCw />
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-[15px] font-semibold tracking-tight">
          Disponíveis para conexão
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {available.map((channel, index) => (
            <Reveal
              as="article"
              key={channel.id}
              y={14}
              duration={0.4}
              delay={stagger(index, 0.05)}
              className={cn(
                "rounded-card border border-dashed border-border bg-surface-2/30 p-5",
                "transition-colors duration-300 hover:border-primary/40 hover:bg-surface-2/60",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold text-black/70 opacity-60"
                  style={{ background: channel.color }}
                >
                  {channel.abbr}
                </span>
                <div>
                  <p className="text-[14px] font-medium">{channel.name}</p>
                  <p className="mt-0.5 text-[11px] text-subtle">Não conectado</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {CAPABILITIES[channel.id]?.map((capability) => (
                  <Badge key={capability} tone="outline" size="sm">
                    {capability}
                  </Badge>
                ))}
              </div>

              <Button
                variant="subtle"
                size="sm"
                className="mt-4 w-full"
                onClick={() =>
                  toast.info(`Conectar ${channel.name}`, {
                    description: "O fluxo de autorização entra na próxima fase.",
                  })
                }
              >
                <Plug />
                Conectar canal
              </Button>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="surface-card rounded-card p-5">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Registro de sincronização
          </h2>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {connected.map((channel) => (
            <li key={channel.id} className="flex items-center gap-3 py-3">
              <span
                className="grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-bold text-black/80"
                style={{ background: channel.color }}
              >
                {channel.abbr}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px]">
                  {channel.name} · sincronização concluída sem divergências
                </p>
                <p className="mt-0.5 text-[10.5px] text-subtle">
                  {relativeTime(channel.syncedAt, MOCK_NOW)} · {channel.accounts}{" "}
                  {channel.accounts === 1 ? "conta" : "contas"}
                </p>
              </div>
              <Badge tone="success" size="sm">
                <Link2 />
                OK
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
