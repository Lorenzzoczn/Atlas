"use client";

import Link from "next/link";
import {
  Bell,
  Boxes,
  Bot,
  Megaphone,
  ShoppingCart,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_NOW } from "@/config/site";
import { notifications } from "@/mock/intelligence";
import { relativeTime } from "@/utils/format";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ICONS = {
  pedido: ShoppingCart,
  estoque: Boxes,
  financeiro: Wallet,
  ads: Megaphone,
  sistema: TriangleAlert,
  ia: Bot,
} as const;

const TONES = {
  pedido: "text-info bg-info/12 border-info/25",
  estoque: "text-warning bg-warning/12 border-warning/25",
  financeiro: "text-success bg-success/12 border-success/25",
  ads: "text-accent bg-accent/12 border-accent/25",
  sistema: "text-danger bg-danger/12 border-danger/25",
  ia: "text-primary bg-primary/12 border-primary/25",
} as const;

export function NotificationsMenu() {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-lg border border-border bg-surface-2/50 text-muted transition-colors hover:border-border-strong hover:text-foreground"
          aria-label={`Notificações${unread ? `, ${unread} não lidas` : ""}`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9.5px] font-bold text-primary-foreground ring-2 ring-background">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-display text-[14px] font-semibold">Notificações</p>
            <p className="text-[11.5px] text-subtle">{unread} não lidas</p>
          </div>
          <Button variant="ghost" size="xs">
            Marcar todas
          </Button>
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {notifications.map((item) => {
            const Icon = ICONS[item.category];
            return (
              <div
                key={item.id}
                className={cn(
                  "flex gap-3 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-surface-2/60",
                  !item.read && "bg-primary/[0.045]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border",
                    TONES[item.category],
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium leading-snug text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                  <p className="mt-1 text-[10.5px] text-subtle">
                    {relativeTime(item.createdAt, MOCK_NOW)}
                  </p>
                </div>
                {!item.read && (
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/notificacoes">Ver central de notificações</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
