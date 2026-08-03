"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Traduz o plano do backend para o rótulo que o usuário reconhece. */
const PLANOS: Record<string, string> = {
  TRIAL: "Teste",
  STARTER: "Starter",
  GROWTH: "Growth",
  SCALE: "Scale",
  ENTERPRISE: "Enterprise",
};

export function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { organization, connectedChannels } = useAuth();

  // Enquanto /auth/me não responde, um traço no lugar do nome. Preencher com
  // um valor de exemplo faria cada usuário ver, por um instante, o nome de
  // outra pessoa — foi exatamente o que acontecia aqui.
  const nome = organization?.name || "—";
  const plano = organization?.plan ? (PLANOS[organization.plan] ?? organization.plan) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface-2/50 p-2",
            "transition-colors duration-200 hover:border-border-strong hover:bg-surface-2",
            collapsed && "justify-center px-0",
          )}
          aria-label="Organização atual"
        >
          <span
            className="grid size-7 shrink-0 place-items-center rounded-lg font-display text-[11px] font-bold text-white"
            style={{
              background: "linear-gradient(140deg, var(--atlas-indigo-500), var(--atlas-cyan-500))",
            }}
          >
            {nome.slice(0, 2).toUpperCase()}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[12.5px] font-medium leading-tight">
                  {nome}
                </span>
                <span className="block text-[10.5px] leading-tight text-subtle">
                  {plano
                    ? `Plano ${plano} · ${connectedChannels} ${connectedChannels === 1 ? "canal" : "canais"}`
                    : "Carregando…"}
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organização</DropdownMenuLabel>
        <DropdownMenuItem className="gap-3">
          <span
            className="grid size-6 shrink-0 place-items-center rounded-md font-display text-[10px] font-bold text-white"
            style={{
              background: "linear-gradient(140deg, var(--atlas-indigo-500), var(--atlas-cyan-500))",
            }}
          >
            {nome.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] text-foreground">{nome}</span>
            <span className="block text-[10.5px] text-subtle">
              {organization?.isOwner ? "Você é proprietário" : (organization?.roleKey ?? "")}
            </span>
          </span>
          <Check className="!size-3.5 !text-primary" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
