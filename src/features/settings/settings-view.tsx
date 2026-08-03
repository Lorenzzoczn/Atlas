"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Building2,
  Check,
  Copy,
  CreditCard,
  Eye,
  KeyRound,
  Palette,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  TableWrap,
} from "@/components/ui/table";
import { apiKeys, billingHistory, planUsage, teamMembers } from "@/mock/session";
import { formatDate, number } from "@/utils/format";
import { Money } from "@/components/ui/money";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-card p-5">
      <h2 className="font-display text-[15px] font-semibold tracking-tight">
        {title}
      </h2>
      {description && <p className="mt-1 text-[12.5px] text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked = true,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium">{label}</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={label} />
    </div>
  );
}

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);

  const copyKey = (id: string, prefix: string) => {
    navigator.clipboard?.writeText(`${prefix}••••••••••••••••`);
    setCopied(id);
    toast.success("Prefixo copiado", {
      description: "A chave completa só é exibida no momento da criação.",
    });
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Configurações"
        description="Dados da empresa, equipe, plano, chaves de API e preferências da interface."
        icon={Settings}
      />

      <Tabs defaultValue="geral">
        <TabsList className="flex-wrap">
          <TabsTrigger value="geral">
            <Building2 className="size-3.5" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="equipe">
            <Users className="size-3.5" />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="faturamento">
            <CreditCard className="size-3.5" />
            Faturamento
          </TabsTrigger>
          <TabsTrigger value="api">
            <KeyRound className="size-3.5" />
            API
          </TabsTrigger>
          <TabsTrigger value="aparencia">
            <Palette className="size-3.5" />
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <SettingsSection
            title="Dados da empresa"
            description="Usados em relatórios, notas e comunicações com os canais."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Razão social">
                <Input defaultValue="Atlas Retail Group Comércio LTDA" />
              </Field>
              <Field label="Nome fantasia">
                <Input defaultValue="Atlas Retail Group" />
              </Field>
              <Field label="CNPJ">
                <Input defaultValue="42.118.905/0001-64" />
              </Field>
              <Field label="Regime tributário">
                <Select defaultValue="simples">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Simples Nacional</SelectItem>
                    <SelectItem value="presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="real">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="E-mail financeiro">
                <Input defaultValue="financeiro@atlascommerce.com.br" type="email" />
              </Field>
              <Field label="Fuso horário">
                <Select defaultValue="sp">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp">America/São_Paulo (GMT-3)</SelectItem>
                    <SelectItem value="mn">America/Manaus (GMT-4)</SelectItem>
                    <SelectItem value="fn">America/Noronha (GMT-2)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="ghost" size="sm">
                Descartar
              </Button>
              <Button size="sm" onClick={() => toast.success("Dados atualizados")}>
                Salvar alterações
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Cálculo de resultado"
            description="Como o Atlas apura lucro, impostos e custos operacionais."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Alíquota de imposto" hint="Aplicada sobre a receita bruta">
                <Input defaultValue="7,6" suffix={<span>%</span>} />
              </Field>
              <Field label="Custo operacional" hint="Rateio fixo por pedido">
                <Input defaultValue="4,20" icon={<span className="text-[11px]">R$</span>} />
              </Field>
              <Field label="Margem mínima" hint="Piso respeitado pelo repricing">
                <Input defaultValue="12,0" suffix={<span>%</span>} />
              </Field>
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="equipe" className="space-y-4">
          <SettingsSection
            title="Membros do workspace"
            description="Quem tem acesso ao Atlas Retail Group e com qual permissão."
          >
            <div className="mb-4 flex justify-end">
              <Button size="sm">
                <Plus />
                Convidar membro
              </Button>
            </div>

            <TableWrap className="-mx-5">
              <Table>
                <THead>
                  <tr>
                    <TH>Membro</TH>
                    <TH>Função</TH>
                    <TH>Status</TH>
                    <TH>Última atividade</TH>
                    <TH className="w-10" />
                  </tr>
                </THead>
                <TBody>
                  {teamMembers.map((member) => (
                    <TR key={member.id}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} size="sm" hue={216} />
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-medium">
                              {member.name}
                            </p>
                            <p className="truncate text-[10.5px] text-subtle">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <span className="text-[12px] text-muted">{member.role}</span>
                      </TD>
                      <TD>
                        <Badge
                          tone={member.status === "ativo" ? "success" : "warning"}
                          size="sm"
                        >
                          {member.status === "ativo" ? "Ativo" : "Convidado"}
                        </Badge>
                      </TD>
                      <TD>
                        <span className="text-[11.5px] text-subtle">
                          {member.lastSeen}
                        </span>
                      </TD>
                      <TD>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remover ${member.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <SettingsSection
              title="Plano atual"
              description="Scale · faturamento mensal, cancelamento a qualquer momento."
            >
              <div className="ring-aurora rounded-xl bg-surface-2/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge tone="brand" size="lg">
                      Plano Scale
                    </Badge>
                    <p className="mt-3 font-display text-[26px] font-semibold tracking-tight">
                      <Money value={1490} />
                      <span className="ml-1 text-[13px] font-normal text-subtle">
                        /mês
                      </span>
                    </p>
                    <p className="mt-1 text-[12px] text-subtle">
                      Próxima cobrança em 01/08/2026
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Alterar plano
                  </Button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {planUsage.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-[12.5px] text-muted">{item.label}</span>
                      <span className="font-mono text-[12px] tabular-nums text-subtle">
                        {number(item.used)} / {number(item.limit)}
                      </span>
                    </div>
                    <Progress
                      value={(item.used / item.limit) * 100}
                      size="xs"
                      tone={item.used / item.limit > 0.8 ? "warning" : "brand"}
                    />
                  </div>
                ))}
              </div>
            </SettingsSection>

            <SettingsSection title="Histórico de faturas">
              <ul className="divide-y divide-border">
                {billingHistory.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium">{invoice.period}</p>
                      <p className="mt-0.5 font-mono text-[10.5px] text-subtle">
                        {invoice.id} · {formatDate(invoice.date)}
                      </p>
                    </div>
                    <span className="font-mono text-[12.5px] tabular-nums">
                      <Money value={invoice.amount} />
                    </span>
                    <Badge tone="success" size="sm">
                      Pago
                    </Badge>
                    <Button variant="ghost" size="icon-sm" aria-label="Ver fatura">
                      <Eye />
                    </Button>
                  </li>
                ))}
              </ul>
            </SettingsSection>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <SettingsSection
            title="Chaves de API"
            description="Use-as para integrar o Atlas ao seu ERP, BI ou operação logística."
          >
            <div className="mb-4 flex justify-end">
              <Button size="sm">
                <Plus />
                Gerar nova chave
              </Button>
            </div>

            <ul className="space-y-3">
              {apiKeys.map((key) => (
                <li
                  key={key.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2/40 p-4 sm:flex-row sm:items-center"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-3 text-subtle">
                    <KeyRound className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium">{key.label}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-subtle">
                      {key.prefix}••••••••••••••••
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {key.scopes.map((scope) => (
                        <Badge key={scope} tone="outline" size="sm">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10.5px] text-subtle">
                      usada {key.lastUsed}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => copyKey(key.id, key.prefix)}
                      aria-label="Copiar prefixo"
                    >
                      {copied === key.id ? <Check /> : <Copy />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Revogar chave">
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </SettingsSection>

          <SettingsSection
            title="Webhooks"
            description="Eventos enviados para o seu endpoint em tempo real."
          >
            <Field label="URL de destino">
              <Input
                defaultValue="https://erp.atlas-retail.com.br/webhooks/atlas"
                type="url"
              />
            </Field>
            <div className="mt-4">
              <Label className="mb-2 block">Eventos assinados</Label>
              <ToggleRow
                label="pedido.criado"
                description="Disparado assim que um pedido é importado de qualquer canal."
              />
              <ToggleRow
                label="estoque.baixo"
                description="Quando um SKU cruza o ponto de pedido configurado."
              />
              <ToggleRow
                label="repasse.liberado"
                description="Quando um canal libera valores para saque."
                defaultChecked={false}
              />
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-4">
          <SettingsSection
            title="Tema da interface"
            description="A preferência fica salva neste navegador."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "dark", label: "Escuro", hint: "Padrão do Atlas" },
                  { value: "light", label: "Claro", hint: "Alto contraste diurno" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all duration-200",
                    theme === option.value
                      ? "border-primary/50 bg-primary/8 shadow-glow"
                      : "border-border bg-surface-2/40 hover:border-border-strong",
                  )}
                >
                  <div
                    className={cn(
                      "mb-3 h-20 rounded-lg border",
                      option.value === "dark"
                        ? "border-zinc-800 bg-zinc-950"
                        : "border-zinc-200 bg-zinc-50",
                    )}
                  >
                    <div className="flex h-full gap-1.5 p-2.5">
                      <div
                        className={cn(
                          "w-8 rounded",
                          option.value === "dark" ? "bg-zinc-800" : "bg-zinc-200",
                        )}
                      />
                      <div className="flex-1 space-y-1.5">
                        <div
                          className={cn(
                            "h-2 w-2/3 rounded",
                            option.value === "dark" ? "bg-zinc-800" : "bg-zinc-200",
                          )}
                        />
                        <div className="h-2 w-1/3 rounded bg-indigo-500/70" />
                      </div>
                    </div>
                  </div>
                  <p className="flex items-center gap-2 text-[13px] font-medium">
                    {option.label}
                    {theme === option.value && (
                      <Check className="size-3.5 text-primary" />
                    )}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-subtle">{option.hint}</p>
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="Preferências de exibição">
            <ToggleRow
              label="Valores compactos"
              description="Mostra R$ 1,2 mil em vez de R$ 1.234,00 em cards e gráficos."
            />
            <ToggleRow
              label="Animações reduzidas"
              description="Diminui transições e movimentos em telas com muitos dados."
              defaultChecked={false}
            />
            <ToggleRow
              label="Densidade compacta nas tabelas"
              description="Mais linhas visíveis por tela, com menos espaçamento vertical."
              defaultChecked={false}
            />
          </SettingsSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
