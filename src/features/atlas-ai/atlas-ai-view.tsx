"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Lightbulb,
  Paperclip,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { AtlasMark } from "@/components/brand/atlas-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadialProgress } from "@/components/ui/progress";
import { Reveal } from "@/components/ui/reveal";
import { Textarea } from "@/components/ui/input";
import { askAtlas } from "@/services/atlas-api";
import {
  aiCapabilities,
  aiConversation,
  aiSuggestions,
  insightScore,
  insights,
} from "@/mock/intelligence";
import { MOCK_NOW } from "@/config/site";
import type { ChatMessage } from "@/types";
import { currency, delta, relativeTime } from "@/utils/format";

const SEVERITY_ICON = {
  critico: TriangleAlert,
  atencao: Zap,
  oportunidade: TrendingUp,
  info: Lightbulb,
} as const;

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/12">
        <AtlasMark size={16} animated={false} />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-surface-2 px-4 py-3">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="size-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: index * 0.16,
              ease: "easeInOut",
            }}
          />
        ))}
        <span className="ml-2 text-[12px] text-subtle">Atlas está analisando…</span>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <Reveal
      y={12}
      duration={0.4}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-xl border",
          isUser
            ? "border-border bg-surface-3 text-[11px] font-semibold text-muted"
            : "border-primary/30 bg-primary/12",
        )}
      >
        {isUser ? "LC" : <AtlasMark size={16} animated={false} />}
      </span>

      <div className={cn("min-w-0 max-w-[min(680px,88%)]", isUser && "text-right")}>
        <div
          className={cn(
            "inline-block whitespace-pre-line rounded-2xl px-4 py-3 text-left text-[13.5px] leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-surface-2 text-foreground",
          )}
        >
          {message.content}
        </div>

        {message.metrics && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-left"
              >
                <p className="text-[10px] uppercase tracking-wide text-subtle">
                  {metric.label}
                </p>
                <p className="mt-0.5 flex items-baseline gap-1.5 font-mono text-[13px] tabular-nums">
                  {metric.value}
                  {metric.delta !== undefined && (
                    <span
                      className={cn(
                        "text-[10.5px]",
                        metric.delta >= 0 ? "text-success" : "text-danger",
                      )}
                    >
                      {delta(metric.delta)}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="mt-1.5 text-[10.5px] text-subtle">
          {relativeTime(message.createdAt, MOCK_NOW)}
        </p>
      </div>
    </Reveal>
  );
}

export function AtlasAiView() {
  const [messages, setMessages] = useState<ChatMessage[]>(aiConversation);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // Monotonic counter instead of Date.now(): ids stay stable across re-renders.
  const messageCounter = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;

    messageCounter.current += 1;
    const turn = messageCounter.current;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_local_${turn}_user`,
        role: "user",
        content,
        createdAt: MOCK_NOW.toISOString(),
      },
    ]);
    setDraft("");
    setThinking(true);

    const answer = await askAtlas(content);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_local_${turn}_assistant`,
        role: "assistant",
        content: answer,
        createdAt: MOCK_NOW.toISOString(),
      },
    ]);
    setThinking(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Visão geral"
        title="Atlas AI"
        description="O copiloto que lê a sua operação inteira, encontra a causa de cada variação e sugere o próximo movimento."
        icon={Bot}
        meta={
          <>
            <Badge tone="brand" size="lg">
              <Sparkles />
              412 de 2.000 consultas neste ciclo
            </Badge>
            <Badge tone="neutral" size="lg">
              Dados sincronizados há 12 min
            </Badge>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="ring-aurora surface-card flex h-[min(720px,78vh)] flex-col overflow-hidden rounded-card">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <AtlasMark size={30} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium">Conversa com o Atlas</p>
              <p className="text-[11px] text-subtle">
                Contexto: 5 canais · 90 SKUs · últimos 90 dias
              </p>
            </div>
            <Badge tone="success" size="sm">
              online
            </Badge>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <AnimatePresence>{thinking && <ThinkingBubble />}</AnimatePresence>
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {aiSuggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  disabled={thinking}
                  className="rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-[11.5px] text-muted transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="relative">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(draft);
                  }
                }}
                placeholder="Pergunte qualquer coisa sobre a sua operação…"
                className="min-h-[68px] pr-24"
              />
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                <Button variant="ghost" size="icon-sm" aria-label="Anexar arquivo">
                  <Paperclip />
                </Button>
                <Button
                  size="icon-sm"
                  onClick={() => send(draft)}
                  disabled={!draft.trim() || thinking}
                  aria-label="Enviar mensagem"
                >
                  <ArrowUp />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[10.5px] text-subtle">
              Enter envia · Shift + Enter quebra a linha. As respostas desta fase são
              simuladas.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card rounded-card p-5">
            <div className="flex items-center gap-4">
              <RadialProgress
                value={insightScore.value}
                size={88}
                stroke={8}
                label={String(insightScore.value)}
                sublabel="/100"
              />
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold tracking-tight">
                  Saúde comercial
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  Bom, com dois pontos de atenção em estoque e rentabilidade.
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card overflow-hidden rounded-card">
            <div className="border-b border-border p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Descobertas recentes
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">
                Geradas automaticamente nas últimas 24 horas
              </p>
            </div>

            <ul className="max-h-[300px] divide-y divide-border overflow-y-auto">
              {insights.map((insight) => {
                const Icon = SEVERITY_ICON[insight.severity];
                return (
                  <li
                    key={insight.id}
                    className="group flex cursor-pointer gap-3 p-4 transition-colors hover:bg-surface-2/60"
                    onClick={() => send(insight.title)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border",
                        insight.severity === "critico" && "border-danger/30 bg-danger/12 text-danger",
                        insight.severity === "atencao" && "border-warning/30 bg-warning/12 text-warning",
                        insight.severity === "oportunidade" && "border-success/30 bg-success/12 text-success",
                        insight.severity === "info" && "border-primary/30 bg-primary/12 text-primary",
                      )}
                    >
                      <Icon className="size-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium leading-snug">
                        {insight.title}
                      </p>
                      <p className="mt-1 flex items-center gap-3 text-[10.5px] text-subtle">
                        <span>{insight.area}</span>
                        <span className="font-mono">{currency(insight.impact)}</span>
                        <span className="font-mono">{insight.confidence}%</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="surface-card rounded-card p-5">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">
              O que o Atlas faz
            </h2>
            <ul className="mt-4 space-y-3.5">
              {aiCapabilities.map((capability) => (
                <li key={capability.title} className="flex gap-3">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-[12.5px] font-medium">{capability.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                      {capability.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
