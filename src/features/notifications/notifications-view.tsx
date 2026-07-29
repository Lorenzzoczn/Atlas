"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  Bot,
  Boxes,
  CheckCheck,
  Megaphone,
  ShoppingCart,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Reveal, stagger } from "@/components/ui/reveal";
import { Segmented } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/toggle";
import { notifications as seed } from "@/mock/intelligence";
import { MOCK_NOW } from "@/config/site";
import { formatDateTime, relativeTime } from "@/utils/format";

const CATEGORY: Record<
  string,
  { label: string; icon: LucideIcon; tone: string }
> = {
  pedido: { label: "Pedidos", icon: ShoppingCart, tone: "border-info/25 bg-info/12 text-info" },
  estoque: { label: "Estoque", icon: Boxes, tone: "border-warning/25 bg-warning/12 text-warning" },
  financeiro: { label: "Financeiro", icon: Wallet, tone: "border-success/25 bg-success/12 text-success" },
  ads: { label: "Publicidade", icon: Megaphone, tone: "border-accent/25 bg-accent/12 text-accent" },
  sistema: { label: "Sistema", icon: TriangleAlert, tone: "border-danger/25 bg-danger/12 text-danger" },
  ia: { label: "Atlas AI", icon: Bot, tone: "border-primary/25 bg-primary/12 text-primary" },
};

const PREFERENCES = [
  { id: "pref_stock", label: "Ruptura de estoque", description: "Quando a cobertura de um SKU cai abaixo do lead time." },
  { id: "pref_margin", label: "Margem negativa", description: "Quando um anúncio passa a operar abaixo do custo real." },
  { id: "pref_buybox", label: "Perda de Buy Box", description: "Quando um concorrente assume a posição em um anúncio monitorado." },
  { id: "pref_payout", label: "Repasses liberados", description: "Quando um canal libera um novo repasse financeiro." },
  { id: "pref_budget", label: "Orçamento de campanha", description: "Quando uma campanha atinge 90% do orçamento diário." },
  { id: "pref_digest", label: "Resumo diário do Atlas AI", description: "Um panorama da operação todo dia às 8h." },
];

export function NotificationsView() {
  const [filter, setFilter] = useState<"todas" | "nao-lidas">("todas");
  const [read, setRead] = useState<string[]>(
    seed.filter((n) => n.read).map((n) => n.id),
  );
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFERENCES.map((p) => [p.id, p.id !== "pref_digest"])),
  );

  const visible = useMemo(
    () =>
      filter === "todas" ? seed : seed.filter((item) => !read.includes(item.id)),
    [filter, read],
  );

  const unread = seed.filter((item) => !read.includes(item.id)).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Notificações"
        description="Tudo o que a operação, as automações e o Atlas AI sinalizaram para você."
        icon={Bell}
        meta={
          <Badge tone={unread ? "brand" : "neutral"} size="lg">
            {unread} não lidas de {seed.length}
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            disabled={unread === 0}
            onClick={() => setRead(seed.map((n) => n.id))}
          >
            <CheckCheck />
            Marcar todas como lidas
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="surface-card overflow-hidden rounded-card">
          <div className="flex items-center justify-between gap-4 border-b border-border p-4">
            <Segmented
              value={filter}
              onChange={setFilter}
              size="sm"
              options={[
                { value: "todas", label: "Todas" },
                { value: "nao-lidas", label: `Não lidas${unread ? ` (${unread})` : ""}` },
              ]}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="Tudo em dia"
              description="Você já leu todas as notificações. Novos alertas aparecem aqui automaticamente."
            />
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((item, index) => {
                const meta = CATEGORY[item.category];
                const Icon = meta.icon;
                const isRead = read.includes(item.id);

                return (
                  <Reveal
                    as="li"
                    key={item.id}
                    y={8}
                    duration={0.35}
                    delay={stagger(index, 0.04)}
                    className={cn(
                      "flex cursor-pointer gap-3.5 p-4 transition-colors hover:bg-surface-2/60",
                      !isRead && "bg-primary/[0.04]",
                    )}
                    onClick={() =>
                      setRead((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id],
                      )
                    }
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border",
                        meta.tone,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-medium leading-snug">
                          {item.title}
                        </p>
                        <Badge tone="outline" size="sm">
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                        {item.detail}
                      </p>
                      <p className="mt-1.5 text-[10.5px] text-subtle">
                        {formatDateTime(item.createdAt)} ·{" "}
                        {relativeTime(item.createdAt, MOCK_NOW)}
                      </p>
                    </div>

                    {!isRead && (
                      <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>

        <div className="surface-card rounded-card p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Preferências de alerta
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Escolha o que merece interromper o seu dia
          </p>

          <ul className="mt-5 space-y-4">
            {PREFERENCES.map((preference) => (
              <li key={preference.id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium">{preference.label}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                    {preference.description}
                  </p>
                </div>
                <Switch
                  checked={prefs[preference.id]}
                  onCheckedChange={(checked) =>
                    setPrefs((prev) => ({ ...prev, [preference.id]: checked }))
                  }
                  aria-label={preference.label}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
