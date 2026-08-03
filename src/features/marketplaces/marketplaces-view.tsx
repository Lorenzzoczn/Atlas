"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Check,
  Link2,
  Plug,
  RefreshCw,
  Store,
  TriangleAlert,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { StatStrip } from "@/components/data/data-toolbar";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/progress";
import { Reveal, stagger } from "@/components/ui/reveal";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  integrationsApi,
  queryKeys,
  type MarketplaceAccount,
  type MarketplaceProvider,
} from "@/services/atlas-backend";
import { formatDateTime, number, percent, relativeTime } from "@/utils/format";

const CHANNEL_COLORS: Record<MarketplaceProvider, string> = {
  MERCADO_LIVRE: "#f2c94c",
  SHOPEE: "#f97362",
  AMAZON: "#7dd3fc",
  MAGALU: "#60a5fa",
  TIKTOK_SHOP: "#f472b6",
  SHOPIFY: "#4ade80",
  WOOCOMMERCE: "#c084fc",
  NUVEMSHOP: "#38bdf8",
};

const CHANNEL_ABBR: Record<MarketplaceProvider, string> = {
  MERCADO_LIVRE: "ML",
  SHOPEE: "SH",
  AMAZON: "AZ",
  MAGALU: "MG",
  TIKTOK_SHOP: "TT",
  SHOPIFY: "SP",
  WOOCOMMERCE: "WC",
  NUVEMSHOP: "NS",
};

const STATUS_LABEL: Record<MarketplaceAccount["status"], string> = {
  CONNECTED: "Conectado",
  PENDING: "Pendente",
  EXPIRED: "Autorização expirada",
  REVOKED: "Revogado",
  ERROR: "Com erro",
};

/** Lê o retorno do callback e transforma em aviso, uma vez só. */
function useConnectionFeedback() {
  const params = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const outcome = params.get("connection");
    if (!outcome) return;

    if (outcome === "sucesso") {
      toast.success("Canal conectado", {
        description: `${params.get("conta") ?? "Conta"} sincronizando pela primeira vez.`,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    } else {
      toast.error("Não foi possível conectar", {
        description: params.get("motivo") ?? "Tente novamente em instantes.",
      });
    }

    // Limpa a query string para o aviso não repetir a cada navegação.
    window.history.replaceState({}, "", window.location.pathname);
  }, [params, queryClient]);
}

export function MarketplacesView() {
  useConnectionFeedback();

  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState<MarketplaceProvider | null>(null);

  const accountsQuery = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: integrationsApi.accounts,
    // Depois de conectar, a carga inicial roda em segundo plano; recarregar de
    // tempos em tempos mostra o progresso sem o usuário atualizar a página.
    refetchInterval: 30_000,
  });

  const catalogQuery = useQuery({
    queryKey: queryKeys.catalog,
    queryFn: integrationsApi.catalog,
    staleTime: 60 * 60 * 1000,
  });

  const connect = useMutation({
    mutationFn: (provider: MarketplaceProvider) =>
      integrationsApi.connect(provider, `${window.location.origin}/marketplaces`),
    onMutate: (provider) => setConnecting(provider),
    onSuccess: ({ authorizationUrl }) => {
      // Navegação de página inteira, não fetch: o vendedor precisa autenticar
      // no domínio do próprio marketplace.
      window.location.href = authorizationUrl;
    },
    onError: (error) => {
      setConnecting(null);
      toast.error("Falha ao iniciar a conexão", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    },
  });

  const sync = useMutation({
    mutationFn: (accountId: string) => integrationsApi.sync(accountId),
    onSuccess: ({ queued }) => {
      toast.success("Sincronização enfileirada", {
        description: `${queued.length} recursos serão atualizados em segundo plano.`,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
    onError: (error) =>
      toast.error("Não foi possível sincronizar", {
        description: error instanceof ApiError ? error.message : undefined,
      }),
  });

  const disconnect = useMutation({
    mutationFn: (accountId: string) => integrationsApi.disconnect(accountId),
    onSuccess: () => {
      toast.success("Canal desconectado", {
        description: "Os pedidos já importados foram preservados.",
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  const accounts = accountsQuery.data ?? [];
  const catalog = catalogQuery.data ?? [];
  const connected = accounts.filter((a) => a.status !== "REVOKED");
  const connectedProviders = new Set(connected.map((a) => a.provider));
  const available = catalog.filter((c) => !connectedProviders.has(c.provider));

  const averageHealth = connected.length
    ? connected.reduce((sum, a) => sum + a.health, 0) / connected.length
    : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Marketplaces"
        description="Conecte suas contas de vendedor. A autenticação acontece no site do próprio canal — o Atlas nunca vê sua senha."
        icon={Store}
        actions={
          <Button
            variant="secondary"
            size="sm"
            disabled={connected.length === 0}
            onClick={() => connected.forEach((a) => sync.mutate(a.id))}
          >
            <RefreshCw />
            Sincronizar todos
          </Button>
        }
      />

      {accountsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {connected.length > 0 && (
            <StatStrip
              items={[
                { label: "Canais conectados", value: `${connected.length} de ${catalog.length}` },
                {
                  label: "Saúde média",
                  value: percent(averageHealth, 0),
                  tone: averageHealth >= 80 ? "success" : "danger",
                },
                {
                  label: "Última sincronização",
                  value: connected[0]?.lastSyncedAt
                    ? relativeTime(connected[0].lastSyncedAt, Date.now())
                    : "nunca",
                },
              ]}
            />
          )}

          <section>
            <h2 className="mb-3 font-display text-[15px] font-semibold tracking-tight">
              Canais conectados
            </h2>

            {connected.length === 0 ? (
              <div className="surface-card rounded-card">
                <EmptyState
                  icon={Plug}
                  title="Nenhum canal conectado"
                  description="Conecte o Mercado Livre para trazer pedidos, anúncios, estoque e envios automaticamente."
                  action={{
                    label: "Conectar Mercado Livre",
                    onClick: () => connect.mutate("MERCADO_LIVRE"),
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {connected.map((account, index) => {
                  const healthy = account.status === "CONNECTED" && account.health >= 70;
                  const needsAttention =
                    account.status === "EXPIRED" || account.status === "ERROR";

                  return (
                    <Reveal
                      as="article"
                      key={account.id}
                      y={14}
                      delay={stagger(index, 0.05)}
                      className={cn(
                        "surface-card rounded-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong",
                        needsAttention && "border-warning/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold text-black/80"
                            style={{ background: CHANNEL_COLORS[account.provider] }}
                          >
                            {CHANNEL_ABBR[account.provider]}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium">
                              {account.nickname ?? "Conta sem apelido"}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-subtle">
                              <StatusDot
                                tone={healthy ? "success" : needsAttention ? "warning" : "neutral"}
                                pulse={healthy}
                              />
                              seller {account.sellerId} · {account.siteId}
                            </p>
                          </div>
                        </div>
                        <Badge tone={healthy ? "success" : needsAttention ? "warning" : "neutral"} size="sm">
                          {healthy && <Check />}
                          {STATUS_LABEL[account.status]}
                        </Badge>
                      </div>

                      {needsAttention && account.lastErrorMessage && (
                        <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/25 bg-warning/10 p-2.5 text-[11.5px] text-warning">
                          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                          {account.lastErrorMessage}
                        </p>
                      )}

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                          <span className="text-subtle">Saúde da integração</span>
                          <span className="font-mono tabular-nums text-muted">
                            {account.health}%
                          </span>
                        </div>
                        <Progress
                          value={account.health}
                          size="xs"
                          tone={account.health >= 90 ? "success" : account.health >= 70 ? "brand" : "warning"}
                        />
                      </div>

                      <dl className="mt-4 space-y-1.5 border-t border-border pt-3.5 text-[11.5px]">
                        <div className="flex justify-between">
                          <dt className="text-subtle">Sincronizado</dt>
                          <dd className="text-muted">
                            {account.lastSyncedAt
                              ? relativeTime(account.lastSyncedAt, Date.now())
                              : "nunca"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-subtle">Token expira</dt>
                          <dd className="text-muted">
                            {account.tokenExpiresAt
                              ? formatDateTime(account.tokenExpiresAt)
                              : "—"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-subtle">Renovação automática</dt>
                          <dd className={account.scopes.includes("offline_access") ? "text-success" : "text-warning"}>
                            {account.scopes.includes("offline_access") ? "ativa" : "sem offline_access"}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          loading={sync.isPending && sync.variables === account.id}
                          onClick={() => sync.mutate(account.id)}
                        >
                          <RefreshCw />
                          Sincronizar
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="Desconectar"
                          loading={disconnect.isPending && disconnect.variables === account.id}
                          onClick={() => disconnect.mutate(account.id)}
                        >
                          <Unplug />
                        </Button>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-display text-[15px] font-semibold tracking-tight">
              Disponíveis para conexão
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {available.map((channel, index) => (
                <Reveal
                  as="article"
                  key={channel.provider}
                  y={14}
                  delay={stagger(index, 0.04)}
                  className={cn(
                    "rounded-card border border-dashed border-border bg-surface-2/30 p-5 transition-colors duration-300",
                    channel.available && "hover:border-primary/40 hover:bg-surface-2/60",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold text-black/70 opacity-60"
                      style={{ background: CHANNEL_COLORS[channel.provider] }}
                    >
                      {CHANNEL_ABBR[channel.provider]}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium">{channel.label}</p>
                      <p className="mt-0.5 text-[11px] text-subtle">
                        {channel.available ? "Pronto para conectar" : "Em breve"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={channel.available ? "subtle" : "outline"}
                    size="sm"
                    className="mt-4 w-full"
                    disabled={!channel.available}
                    loading={connecting === channel.provider}
                    onClick={() => connect.mutate(channel.provider)}
                  >
                    <Plug />
                    {channel.available ? "Conectar conta" : "Ainda não disponível"}
                  </Button>
                </Reveal>
              ))}
            </div>
          </section>

          {connected.length > 0 && <SyncHistory accountId={connected[0].id} />}
        </>
      )}
    </div>
  );
}

function SyncHistory({ accountId }: { accountId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.syncRuns(accountId),
    queryFn: () => integrationsApi.syncRuns(accountId),
    refetchInterval: 30_000,
  });

  if (isLoading) return <LoadingState label="Carregando histórico…" />;
  if (!data?.length) return null;

  return (
    <div className="surface-card rounded-card p-5">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-primary" />
        <h2 className="font-display text-[15px] font-semibold tracking-tight">
          Histórico de sincronização
        </h2>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {data.slice(0, 8).map((run) => (
          <li key={run.id} className="flex items-center gap-3 py-3">
            <Badge
              tone={
                run.status === "COMPLETED"
                  ? "success"
                  : run.status === "FAILED"
                    ? "danger"
                    : run.status === "PARTIAL"
                      ? "warning"
                      : "neutral"
              }
              size="sm"
            >
              {run.status === "COMPLETED" ? <Link2 /> : null}
              {run.resource}
            </Badge>
            <span className="min-w-0 flex-1 truncate text-[12px] text-muted">
              {run.errorMessage ??
                `${number(run.created)} novos · ${number(run.updated)} atualizados` +
                  (run.failed > 0 ? ` · ${number(run.failed)} falhas` : "")}
            </span>
            <span className="shrink-0 text-[10.5px] text-subtle">
              {relativeTime(run.createdAt, Date.now())}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
