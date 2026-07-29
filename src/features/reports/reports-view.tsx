"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Download, FileText, Plus, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { DataToolbar } from "@/components/data/data-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Hint } from "@/components/ui/tooltip";
import { reports } from "@/mock/intelligence";
import { MOCK_NOW } from "@/config/site";
import { relativeTime } from "@/utils/format";

const FORMAT_TONE = {
  PDF: "danger",
  XLSX: "success",
  CSV: "brand",
} as const;

export function ReportsView() {
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("todos");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports.filter((report) => {
      if (format !== "todos" && report.format !== format) return false;
      if (!term) return true;
      return (
        report.name.toLowerCase().includes(term) ||
        report.description.toLowerCase().includes(term)
      );
    });
  }, [search, format]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Relatórios"
        description="Exportações recorrentes e sob demanda, prontas para o time financeiro e para o contador."
        icon={FileText}
        actions={
          <Button size="sm">
            <Plus />
            Novo relatório
          </Button>
        }
      />

      <div className="surface-card overflow-hidden rounded-card">
        <DataToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Buscar relatório…"
          filters={[
            {
              id: "formato",
              label: "Formato",
              value: format,
              options: [
                { value: "todos", label: "Todos os formatos" },
                { value: "PDF", label: "PDF" },
                { value: "XLSX", label: "Planilha XLSX" },
                { value: "CSV", label: "CSV" },
              ],
              onChange: setFormat,
            },
          ]}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum relatório encontrado"
            description="Ajuste a busca ou crie um novo relatório a partir de um modelo."
            action={{ label: "Novo relatório" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((report, index) => (
              <Reveal
                as="article"
                key={report.id}
                y={14}
                duration={0.4}
                delay={stagger(index, 0.05)}
                className="group/card surface-card flex flex-col rounded-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl border font-mono text-[9.5px] font-bold",
                      report.format === "PDF" && "border-danger/30 bg-danger/12 text-danger",
                      report.format === "XLSX" && "border-success/30 bg-success/12 text-success",
                      report.format === "CSV" && "border-brand-500/30 bg-brand-500/12 text-brand-400",
                    )}
                  >
                    {report.format}
                  </span>
                  <Badge tone={FORMAT_TONE[report.format]} size="sm">
                    {report.size}
                  </Badge>
                </div>

                <p className="mt-3.5 text-[13.5px] font-medium leading-snug">
                  {report.name}
                </p>
                <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-muted">
                  {report.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="outline" size="sm">
                    {report.scope}
                  </Badge>
                  <Badge tone="neutral" size="sm">
                    <CalendarClock />
                    {report.schedule}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                  <span className="text-[10.5px] text-subtle">
                    Atualizado {relativeTime(report.updatedAt, MOCK_NOW)}
                  </span>
                  <div className="flex gap-1">
                    <Hint label="Compartilhar">
                      <Button variant="ghost" size="icon-sm" aria-label="Compartilhar">
                        <Share2 />
                      </Button>
                    </Hint>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        toast.success("Download iniciado", { description: report.name })
                      }
                    >
                      <Download />
                      Baixar
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
