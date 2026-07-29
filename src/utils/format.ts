const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat("pt-BR");

/**
 * Compact notation is written by hand rather than with `Intl`'s
 * `notation: "compact"`. Node and browsers ship different ICU data, so the same
 * value renders as "R$ 162 mil" on the server and "R$ 162,0 mil" on the client,
 * which breaks hydration.
 */
function compactParts(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1e9) return { value: value / 1e9, suffix: " bi" };
  if (abs >= 1e6) return { value: value / 1e6, suffix: " mi" };
  if (abs >= 1e3) return { value: value / 1e3, suffix: " mil" };
  return { value, suffix: "" };
}

const decimal = (value: number, digits: number) =>
  value.toFixed(digits).replace(".", ",");

/** R$ 1.234,56 */
export const currency = (value: number) => BRL.format(value);

/** R$ 1,2 mil — for axis labels and dense KPI tiles */
export function currencyCompact(value: number) {
  const { value: scaled, suffix } = compactParts(value);
  if (!suffix) return `R$ ${decimal(scaled, 0)}`;
  return `R$ ${decimal(scaled, 1)}${suffix}`;
}

export const number = (value: number) => NUM.format(value);

export function numberCompact(value: number) {
  const { value: scaled, suffix } = compactParts(value);
  if (!suffix) return decimal(scaled, 0);
  return `${decimal(scaled, 1)}${suffix}`;
}

/** 12,4% — `digits` controls precision */
export const percent = (value: number, digits = 1) =>
  `${value.toFixed(digits).replace(".", ",")}%`;

/** +12,4% / -8,1% — always signed, for deltas */
export const delta = (value: number, digits = 1) =>
  `${value > 0 ? "+" : ""}${value.toFixed(digits).replace(".", ",")}%`;

/**
 * The time zone is pinned so a server running in UTC and a browser in BRT
 * produce the same string — otherwise every timestamp is a hydration mismatch.
 */
const TZ = "America/Sao_Paulo";

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

const DATE_TIME = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const DATE_SHORT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: TZ,
});

export const formatDate = (value: string | Date) => DATE.format(new Date(value));

export const formatDateTime = (value: string | Date) =>
  DATE_TIME.format(new Date(value));

export const formatDateShort = (value: string | Date) =>
  DATE_SHORT.format(new Date(value)).replace(".", "");

/** "há 3 h" / "há 2 d" — relative to a fixed reference so SSR and CSR agree */
export function relativeTime(value: string | Date, now: Date | number) {
  const diff = new Date(now).getTime() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days} d`;
  const months = Math.round(days / 30);
  return `há ${months} mês${months > 1 ? "es" : ""}`;
}

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
