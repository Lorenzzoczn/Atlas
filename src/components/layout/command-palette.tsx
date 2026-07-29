"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Command as CommandIcon, CornerDownLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { allNavItems, commandActions } from "@/config/navigation";
import { useUi } from "@/store/ui-store";

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUi();
  const router = useRouter();

  const go = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent
        showClose={false}
        className="top-[18%] max-w-xl translate-y-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Busca e comandos</DialogTitle>
        <Command
          loop
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.09em] [&_[cmdk-group-heading]]:text-subtle"
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-subtle" />
            <Command.Input
              placeholder="Buscar páginas, pedidos, produtos ou executar uma ação…"
              className="h-13 flex-1 bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-subtle"
            />
            <kbd className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-subtle">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-[13px] text-subtle">
              Nenhum resultado encontrado.
            </Command.Empty>

            <Command.Group heading="Navegação">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.href}
                    value={`${item.label} ${item.description} ${item.keywords?.join(" ") ?? ""}`}
                    onSelect={() => go(item.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors data-[selected=true]:bg-surface-3 data-[selected=true]:text-foreground"
                  >
                    <Icon className="size-4 shrink-0 text-subtle" />
                    <span className="flex-1 truncate">
                      {item.label}
                      <span className="ml-2 text-[11.5px] text-subtle">
                        {item.description}
                      </span>
                    </span>
                    <CornerDownLeft className="size-3 shrink-0 text-subtle opacity-0 data-[selected=true]:opacity-100" />
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group heading="Ações rápidas">
              {commandActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Command.Item
                    key={action.id}
                    value={`${action.label} ${action.hint}`}
                    onSelect={() => {
                      setCommandOpen(false);
                      toast.info(action.label, {
                        description: "Ação disponível na próxima fase do produto.",
                      });
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors data-[selected=true]:bg-surface-3 data-[selected=true]:text-foreground"
                  >
                    <Icon className="size-4 shrink-0 text-subtle" />
                    <span className="flex-1 truncate">{action.label}</span>
                    <span className="text-[11px] text-subtle">{action.hint}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          <div className="flex items-center gap-4 border-t border-border bg-surface-2/40 px-4 py-2.5 text-[11px] text-subtle">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-surface-3 px-1 font-mono">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-surface-3 px-1 font-mono">↵</kbd>
              abrir
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <CommandIcon className="size-3" />
              Atlas Command
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
