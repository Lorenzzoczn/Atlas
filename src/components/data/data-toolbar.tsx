"use client";

import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { number } from "@/utils/format";

export interface FilterConfig {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function DataToolbar({
  search,
  onSearchChange,
  placeholder = "Buscar…",
  filters = [],
  columns,
  onExport,
  children,
  className,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterConfig[];
  columns?: {
    all: { id: string; label: string }[];
    visible: string[];
    onToggle: (id: string) => void;
  };
  onExport?: () => void;
  children?: ReactNode;
  className?: string;
}) {
  const activeFilters = filters.filter((f) => f.value !== "todos").length;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center",
        className,
      )}
    >
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={placeholder}
        icon={<Search />}
        suffix={
          search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="pointer-events-auto text-subtle transition-colors hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="size-3.5" />
            </button>
          ) : undefined
        }
        className="lg:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Select key={filter.id} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="w-auto min-w-36">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {activeFilters > 0 && (
          <Badge tone="brand" size="lg">
            <ListFilter />
            {activeFilters} {activeFilters === 1 ? "filtro" : "filtros"}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 lg:ml-auto">
        {children}

        {columns && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 />
                <span className="hidden sm:inline">Colunas</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
              {columns.all.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={columns.visible.includes(column.id)}
                  onCheckedChange={() => columns.onToggle(column.id)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Window of at most 5 page buttons centred on the current page.
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const visible = Array.from(
    { length: Math.min(5, pages) },
    (_, index) => start + index,
  ).filter((value) => value <= pages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-[12px] text-subtle">
        Exibindo <span className="font-medium text-foreground">{number(from)}</span>–
        <span className="font-medium text-foreground">{number(to)}</span> de{" "}
        <span className="font-medium text-foreground">{number(total)}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>

        {visible.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onPageChange(value)}
            className={cn(
              "size-8 rounded-lg font-mono text-[12px] tabular-nums transition-colors",
              value === page
                ? "border border-primary/30 bg-primary/12 text-primary"
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {value}
          </button>
        ))}

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

/** Compact summary strip shown above data tables. */
export function StatStrip({
  items,
  className,
}: {
  items: { label: string; value: ReactNode; tone?: "default" | "success" | "danger" }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-8 gap-y-3 rounded-card border border-border bg-surface-2/40 px-5 py-3.5",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-subtle">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-0.5 font-mono text-[15px] font-medium tabular-nums",
              item.tone === "success" && "text-success",
              item.tone === "danger" && "text-danger",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
