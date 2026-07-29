import { cn } from "@/lib/utils";
import { marketplaceMap } from "@/mock/catalog";
import type { MarketplaceId, OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

export function ChannelChip({
  id,
  showName = true,
  className,
}: {
  id: MarketplaceId;
  showName?: boolean;
  className?: string;
}) {
  const channel = marketplaceMap[id];
  if (!channel) return null;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="grid size-5 shrink-0 place-items-center rounded-[5px] text-[9px] font-bold text-black/80"
        style={{ background: channel.color }}
      >
        {channel.abbr}
      </span>
      {showName && (
        <span className="truncate text-[12.5px] text-muted">{channel.name}</span>
      )}
    </span>
  );
}

const ORDER_TONES: Record<OrderStatus, "neutral" | "brand" | "accent" | "success" | "danger"> = {
  pendente: "neutral",
  pronto: "brand",
  transito: "accent",
  entregue: "success",
  cancelado: "danger",
};

const ORDER_LABELS: Record<OrderStatus, string> = {
  pendente: "Pendente",
  pronto: "Pronto",
  transito: "Em trânsito",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={ORDER_TONES[status]} size="sm">
      {ORDER_LABELS[status]}
    </Badge>
  );
}

/** Coloured delta text used in tables: green up, red down. */
export function DeltaText({
  value,
  invert,
  suffix = "%",
  className,
}: {
  value: number;
  invert?: boolean;
  suffix?: string;
  className?: string;
}) {
  const positive = invert ? value < 0 : value > 0;
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        value === 0 ? "text-subtle" : positive ? "text-success" : "text-danger",
        className,
      )}
    >
      {value > 0 ? "+" : ""}
      {value.toFixed(1).replace(".", ",")}
      {suffix}
    </span>
  );
}
