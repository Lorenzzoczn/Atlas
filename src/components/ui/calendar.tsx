"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_NOW } from "@/config/site";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function buildMonth(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = first.getUTCDay();

  const cells: (number | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export function Calendar({
  value,
  onChange,
  className,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}) {
  const [cursor, setCursor] = useState(
    () => new Date(Date.UTC(MOCK_NOW.getUTCFullYear(), MOCK_NOW.getUTCMonth(), 1)),
  );

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const cells = buildMonth(year, month);

  const shift = (delta: number) =>
    setCursor(new Date(Date.UTC(year, month + delta, 1)));

  const select = (day: number) => {
    const date = new Date(Date.UTC(year, month, day));
    if (!value.from || (value.from && value.to)) {
      onChange({ from: date, to: null });
    } else if (date < value.from) {
      onChange({ from: date, to: value.from });
    } else {
      onChange({ from: value.from, to: date });
    }
  };

  const isSame = (a: Date | null, day: number) =>
    !!a &&
    a.getUTCFullYear() === year &&
    a.getUTCMonth() === month &&
    a.getUTCDate() === day;

  const inRange = (day: number) => {
    if (!value.from || !value.to) return false;
    const date = Date.UTC(year, month, day);
    return date > value.from.getTime() && date < value.to.getTime();
  };

  return (
    <div className={cn("w-64 select-none", className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="grid size-7 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-foreground"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-[13px] font-medium">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="grid size-7 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-foreground"
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day, i) => (
          <span
            key={i}
            className="grid h-7 place-items-center text-[10.5px] font-semibold uppercase text-subtle"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, index) => {
          if (day === null) return <span key={index} className="h-8" />;
          const start = isSame(value.from, day);
          const end = isSame(value.to, day);
          const middle = inRange(day);
          const today =
            year === MOCK_NOW.getUTCFullYear() &&
            month === MOCK_NOW.getUTCMonth() &&
            day === MOCK_NOW.getUTCDate();

          return (
            <button
              key={index}
              type="button"
              onClick={() => select(day)}
              className={cn(
                "relative grid h-8 place-items-center rounded-lg text-[12.5px] transition-colors",
                "hover:bg-surface-3",
                middle && "bg-primary/12 text-foreground",
                (start || end) && "bg-primary text-primary-foreground hover:bg-primary",
                !start && !end && !middle && "text-muted",
                today && !start && !end && "font-semibold text-primary",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
