"use client";

import { useState } from "react";
import {
  BookOpen,
  CircleQuestionMark,
  MessageSquare,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Reveal, stagger } from "@/components/ui/reveal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { faqItems, helpTopics, tickets } from "@/mock/intelligence";
import { MOCK_NOW } from "@/config/site";
import { relativeTime } from "@/utils/format";

const STATUS_META = {
  aberto: { label: "Aberto", tone: "brand" },
  andamento: { label: "Em andamento", tone: "warning" },
  resolvido: { label: "Resolvido", tone: "success" },
} as const;

const PRIORITY_META = {
  alta: { label: "Alta", tone: "danger" },
  media: { label: "Média", tone: "warning" },
  baixa: { label: "Baixa", tone: "neutral" },
} as const;

function NewTicketDialog() {
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("media");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (!subject.trim()) return;
    setOpen(false);
    setSubject("");
    setMessage("");
    toast.success("Chamado registrado", {
      description: "Nossa equipe responde em até 4 horas úteis.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Abrir chamado
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir um chamado</DialogTitle>
          <DialogDescription>
            Descreva o que aconteceu. Quanto mais contexto, mais rápida a resolução.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Field label="Assunto">
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Ex.: divergência no repasse do Mercado Livre"
            />
          </Field>

          <Field label="Prioridade">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Descrição"
            hint="Inclua códigos de pedido, SKUs ou prints quando fizer sentido."
          >
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Conte o que você esperava e o que aconteceu…"
              className="min-h-32"
            />
          </Field>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={submit} disabled={!subject.trim()}>
            <Send />
            Enviar chamado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SupportView() {
  const [query, setQuery] = useState("");

  const topics = helpTopics.filter((topic) =>
    query.trim()
      ? topic.title.toLowerCase().includes(query.toLowerCase()) ||
        topic.description.toLowerCase().includes(query.toLowerCase())
      : true,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Ajuda"
        title="Suporte"
        description="Central de conhecimento, chamados abertos e resposta rápida do time Atlas."
        icon={CircleQuestionMark}
        actions={<NewTicketDialog />}
      />

      <div className="ring-aurora surface-card rounded-card p-6 text-center">
        <h2 className="font-display text-[19px] font-semibold tracking-tight">
          Como podemos ajudar?
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] text-muted">
          Busque em 72 artigos ou fale direto com um especialista em marketplaces.
        </p>
        <div className="mx-auto mt-5 max-w-lg">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar na central de ajuda…"
            icon={<Search />}
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic, index) => (
          <Reveal
            as="article"
            key={topic.title}
            y={14}
            duration={0.4}
            delay={stagger(index, 0.05)}
            className="group/card surface-card cursor-pointer rounded-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong"
          >
            <span className="grid size-9 place-items-center rounded-xl border border-border bg-surface-2 text-subtle transition-colors group-hover/card:border-primary/35 group-hover/card:bg-primary/10 group-hover/card:text-primary">
              <BookOpen className="size-4" />
            </span>
            <p className="mt-3.5 text-[13.5px] font-medium">{topic.title}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              {topic.description}
            </p>
            <p className="mt-3 text-[11px] text-subtle">{topic.articles} artigos</p>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-card overflow-hidden rounded-card">
          <div className="flex items-center justify-between gap-4 border-b border-border p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Seus chamados
              </h2>
            </div>
            <Badge tone="neutral" size="sm">
              {tickets.filter((t) => t.status !== "resolvido").length} em aberto
            </Badge>
          </div>

          <ul className="divide-y divide-border">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="cursor-pointer p-4 transition-colors hover:bg-surface-2/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12.5px] font-medium leading-snug">
                    {ticket.subject}
                  </p>
                  <Badge tone={STATUS_META[ticket.status].tone} size="sm">
                    {STATUS_META[ticket.status].label}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-subtle">
                  <span className="font-mono">#{ticket.id.replace("tkt_", "")}</span>
                  <span>{ticket.channel}</span>
                  <span
                    className={cn(
                      ticket.priority === "alta" && "text-danger",
                      ticket.priority === "media" && "text-warning",
                    )}
                  >
                    Prioridade {PRIORITY_META[ticket.priority].label.toLowerCase()}
                  </span>
                  <span>{ticket.messages} mensagens</span>
                  <span className="ml-auto">
                    {relativeTime(ticket.updatedAt, MOCK_NOW)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card rounded-card p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            Perguntas frequentes
          </h2>
          <p className="mb-4 mt-1 text-[12.5px] text-muted">
            As dúvidas mais comuns de quem está começando
          </p>

          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
