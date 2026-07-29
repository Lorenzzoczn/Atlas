"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Eye,
  EyeOff,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { navItemByHref } from "@/config/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useUi, rangeLabels, type DateRangeKey } from "@/store/ui-store";
import { sessionUser } from "@/mock/session";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Segmented } from "@/components/ui/tabs";
import { Hint } from "@/components/ui/tooltip";
import { NotificationsMenu } from "./notifications-menu";
import { ThemeToggle } from "./theme-toggle";

const RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

export function Topbar() {
  const pathname = usePathname();
  const { setMobileNavOpen, range, setRange, privacyMode, togglePrivacy } = useUi();
  const { signOut } = useAuth();

  const current = navItemByHref.get(pathname);
  const crumbs = [
    { label: "Atlas", href: "/" },
    { label: current?.label ?? "Página" },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/72 px-4 backdrop-blur-xl md:px-6">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-2/50 text-muted transition-colors hover:text-foreground lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-4" />
      </button>

      <Breadcrumb items={crumbs} className="hidden sm:block" />

      <div className="ml-auto flex items-center gap-2">
        <Segmented
          options={RANGE_OPTIONS}
          value={range}
          onChange={setRange}
          size="sm"
          className="hidden xl:inline-flex"
        />

        <Hint label={rangeLabels[range]}>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border border-border bg-surface-2/50 text-muted transition-colors hover:border-border-strong hover:text-foreground xl:hidden"
            aria-label="Período"
          >
            <CalendarDays className="size-4" />
          </button>
        </Hint>

        <Hint label="Sincronizar canais">
          <button
            type="button"
            onClick={() =>
              toast.success("Sincronização iniciada", {
                description: "5 canais conectados serão atualizados em segundo plano.",
              })
            }
            className="hidden size-9 place-items-center rounded-lg border border-border bg-surface-2/50 text-muted transition-colors hover:border-border-strong hover:text-foreground sm:grid"
            aria-label="Sincronizar"
          >
            <RefreshCw className="size-4" />
          </button>
        </Hint>

        <Hint label={privacyMode ? "Exibir valores" : "Ocultar valores"}>
          <button
            type="button"
            onClick={togglePrivacy}
            className={cn(
              "hidden size-9 place-items-center rounded-lg border transition-colors sm:grid",
              privacyMode
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-border bg-surface-2/50 text-muted hover:border-border-strong hover:text-foreground",
            )}
            aria-label="Modo privacidade"
          >
            {privacyMode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </Hint>

        <ThemeToggle />
        <NotificationsMenu />

        <Button size="sm" variant="subtle" className="hidden md:inline-flex" asChild>
          <Link href="/atlas-ai">
            <Sparkles />
            Atlas AI
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-0.5 rounded-full outline-none ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-primary/40"
              aria-label="Menu do usuário"
            >
              <Avatar name={sessionUser.name} hue={sessionUser.avatarHue} size="md" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Conta</DropdownMenuLabel>
            <div className="flex items-center gap-3 px-2.5 pb-2.5 pt-1">
              <Avatar name={sessionUser.name} hue={sessionUser.avatarHue} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{sessionUser.name}</p>
                <p className="truncate text-[11px] text-subtle">{sessionUser.email}</p>
              </div>
            </div>
            <div className="px-2.5 pb-2">
              <Badge tone="brand" size="sm">
                Plano {sessionUser.plan}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil">
                <User />
                Meu perfil
                <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracoes">
                <Settings />
                Configurações
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracoes?tab=faturamento">
                <CreditCard />
                Faturamento
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger onSelect={signOut}>
              <LogOut />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
