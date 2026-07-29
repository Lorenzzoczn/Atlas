"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, secondaryNavigation, type NavItem } from "@/config/navigation";
import { useUi } from "@/store/ui-store";
import { AtlasMark, AtlasWordmark } from "@/components/brand/atlas-mark";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { WorkspaceSwitcher } from "./workspace-switcher";

const EXPANDED = 268;
const COLLAPSED = 76;

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-medium",
        "transition-colors duration-200",
        active ? "text-foreground" : "text-muted hover:bg-surface-2/70 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl border border-primary/25 bg-primary/12"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      {active && !collapsed && (
        <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon
        className={cn(
          "relative z-10 size-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "text-subtle group-hover:text-foreground",
        )}
      />
      {!collapsed && (
        <>
          <span className="relative z-10 flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <Badge
              tone={active ? "brand" : "neutral"}
              size="sm"
              className="relative z-10"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
      {collapsed && item.badge !== undefined && (
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );

  return collapsed ? (
    <Hint label={item.label} side="right">
      {link}
    </Hint>
  ) : (
    link
  );
}

function SidebarBody({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { setCommandOpen } = useUi();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className={cn("px-4 pb-3", collapsed && "px-3")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <div className={cn("px-4 pb-4", collapsed && "px-3")}>
        {collapsed ? (
          <Hint label="Buscar · ⌘K" side="right">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="grid h-9 w-full place-items-center rounded-xl border border-border bg-surface-2/50 text-subtle transition-colors hover:border-border-strong hover:text-foreground"
              aria-label="Buscar"
            >
              <Search className="size-4" />
            </button>
          </Hint>
        ) : (
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="group flex h-9 w-full items-center gap-2.5 rounded-xl border border-border bg-surface-2/50 px-3 text-[12.5px] text-subtle transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Search className="size-3.5" />
            <span className="flex-1 text-left">Buscar ou executar…</span>
            <kbd className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-subtle">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 pb-4",
          collapsed && "px-3",
        )}
      >
        {navigation.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-subtle/80">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-2 mb-2 h-px bg-border" />}
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className={cn("space-y-1 border-t border-border px-4 py-3", collapsed && "px-3")}>
        {secondaryNavigation.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden px-4 pb-4"
          >
            <div className="ring-aurora rounded-xl bg-surface-2/60 p-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-accent" />
                <span className="text-[12px] font-semibold">Créditos Atlas AI</span>
              </div>
              <p className="mt-1 text-[11px] text-subtle">
                412 de 2.000 consultas usadas neste ciclo
              </p>
              <Progress value={412} max={2000} size="xs" className="mt-2.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUi();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? COLLAPSED : EXPANDED }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-background-elevated/80 backdrop-blur-xl lg:flex"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 px-4",
          sidebarCollapsed && "justify-center px-0",
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <AtlasMark size={30} />
          {!sidebarCollapsed && <AtlasWordmark />}
        </Link>
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="ml-auto grid size-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Recolher menu"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="flex justify-center pb-3">
          <Hint label="Expandir menu" side="right">
            <button
              type="button"
              onClick={toggleSidebar}
              className="grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
              aria-label="Expandir menu"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          </Hint>
        </div>
      )}

      <SidebarBody collapsed={sidebarCollapsed} />
    </motion.aside>
  );
}

export function MobileSidebar() {
  const { mobileNavOpen, setMobileNavOpen } = useUi();

  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-background-elevated lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center px-4">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2.5"
              >
                <AtlasMark size={30} />
                <AtlasWordmark />
              </Link>
            </div>
            <SidebarBody collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export const sidebarWidths = { EXPANDED, COLLAPSED };
