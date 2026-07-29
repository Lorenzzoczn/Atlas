"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { workspaces } from "@/mock/session";
import { useUi } from "@/store/ui-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { workspaceId, setWorkspaceId } = useUi();
  const active = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];

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
          aria-label="Trocar workspace"
        >
          <span
            className="grid size-7 shrink-0 place-items-center rounded-lg font-display text-[11px] font-bold text-white"
            style={{
              background: "linear-gradient(140deg, var(--atlas-indigo-500), var(--atlas-cyan-500))",
            }}
          >
            {active.name.slice(0, 2).toUpperCase()}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[12.5px] font-medium leading-tight">
                  {active.name}
                </span>
                <span className="block text-[10.5px] leading-tight text-subtle">
                  Plano {active.plan} · {active.channels} canais
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => setWorkspaceId(workspace.id)}
            className="gap-3"
          >
            <span
              className="grid size-6 shrink-0 place-items-center rounded-md font-display text-[10px] font-bold text-white"
              style={{
                background: "linear-gradient(140deg, var(--atlas-indigo-500), var(--atlas-cyan-500))",
              }}
            >
              {workspace.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-foreground">
                {workspace.name}
              </span>
              <span className="block text-[10.5px] text-subtle">
                {workspace.members} membros
              </span>
            </span>
            {workspace.id === active.id && <Check className="!size-3.5 !text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus />
          Criar novo workspace
          <Badge tone="brand" size="sm" className="ml-auto">
            Scale
          </Badge>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
