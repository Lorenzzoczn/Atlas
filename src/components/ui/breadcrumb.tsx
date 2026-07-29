import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Trilha de navegação" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5 text-[12.5px]">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="text-subtle transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "font-medium text-foreground" : "text-subtle"}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3 text-border-strong" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
