"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Activity,
  Camera,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/toggle";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { activityFeed } from "@/mock/intelligence";
import { sessionUser } from "@/mock/session";
import { useAuth } from "@/providers/auth-provider";
import { MOCK_NOW } from "@/config/site";
import { formatDate, relativeTime } from "@/utils/format";

const profileSchema = z.object({
  name: z.string().min(3, "Informe pelo menos 3 caracteres"),
  email: z.string().email("Informe um e-mail válido"),
  phone: z
    .string()
    .min(14, "Use o formato (11) 90000-0000")
    .max(16, "Telefone muito longo"),
  role: z.string().min(2, "Informe o seu cargo"),
  bio: z.string().max(240, "Máximo de 240 caracteres").optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const SESSIONS = [
  { id: "s1", device: "Chrome · Windows 11", location: "São Paulo, SP", current: true, lastSeen: "agora" },
  { id: "s2", device: "Safari · iPhone 16", location: "São Paulo, SP", current: false, lastSeen: "há 3 h" },
  { id: "s3", device: "Edge · Windows 11", location: "Campinas, SP", current: false, lastSeen: "há 2 d" },
];

export function ProfileView() {
  const { signOut } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: sessionUser.name,
      email: sessionUser.email,
      phone: "(11) 98842-3117",
      role: sessionUser.role,
      bio: "Responsável pela operação multicanal do Atlas Retail Group. Foco em margem, giro de estoque e expansão para novos marketplaces.",
    },
  });

  const onSubmit = async (values: ProfileForm) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("Perfil atualizado", { description: values.name });
    reset(values);
  };

  const entries: TimelineEntry[] = activityFeed
    .filter((event) => event.actor === sessionUser.name || event.actor === "Atlas AI")
    .slice(0, 5)
    .map((event) => ({
      id: event.id,
      title: `${event.action} ${event.target}`,
      meta: `${event.channel} · ${relativeTime(event.createdAt, MOCK_NOW)}`,
      tone: "brand",
    }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Conta"
        title="Perfil"
        description="Seus dados, preferências de acesso e sessões ativas na plataforma."
        icon={User}
        actions={
          <Button variant="danger" size="sm" onClick={signOut}>
            <LogOut />
            Encerrar sessão
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <section className="surface-card rounded-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <Avatar
                  name={sessionUser.name}
                  hue={sessionUser.avatarHue}
                  size="xl"
                />
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border border-border bg-surface text-subtle transition-colors hover:text-foreground"
                  aria-label="Alterar foto"
                >
                  <Camera className="size-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-[17px] font-semibold tracking-tight">
                  {sessionUser.name}
                </p>
                <p className="mt-0.5 text-[12.5px] text-muted">{sessionUser.email}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <Badge tone="brand" size="sm">
                    {sessionUser.role}
                  </Badge>
                  <Badge tone="success" size="sm">
                    Plano {sessionUser.plan}
                  </Badge>
                  <Badge tone="outline" size="sm">
                    Desde {formatDate(sessionUser.memberSince)}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          <section className="surface-card rounded-card p-5">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">
              Informações pessoais
            </h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Esses dados aparecem para os outros membros do workspace.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nome completo" error={errors.name?.message}>
                <Input {...register("name")} invalid={!!errors.name} />
              </Field>
              <Field label="Cargo" error={errors.role?.message}>
                <Input {...register("role")} invalid={!!errors.role} />
              </Field>
              <Field label="E-mail" error={errors.email?.message}>
                <Input
                  {...register("email")}
                  type="email"
                  icon={<Mail />}
                  invalid={!!errors.email}
                />
              </Field>
              <Field label="Telefone" error={errors.phone?.message}>
                <Input
                  {...register("phone")}
                  icon={<Phone />}
                  invalid={!!errors.phone}
                />
              </Field>
            </div>

            <Field
              label="Sobre"
              hint="Máximo de 240 caracteres"
              error={errors.bio?.message}
              className="mt-4"
            >
              <Textarea {...register("bio")} />
            </Field>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => reset()}
                disabled={!isDirty}
              >
                Descartar
              </Button>
              <Button type="submit" size="sm" loading={isSubmitting} disabled={!isDirty}>
                Salvar alterações
              </Button>
            </div>
          </section>
        </form>

        <div className="space-y-4">
          <section className="surface-card rounded-card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" />
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Segurança
              </h2>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-3.5">
                <div>
                  <p className="text-[12.5px] font-medium">
                    Autenticação em dois fatores
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    Ativa via aplicativo autenticador
                  </p>
                </div>
                <Switch defaultChecked aria-label="Autenticação em dois fatores" />
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-border pb-3.5">
                <div>
                  <p className="text-[12.5px] font-medium">Alertas de novo acesso</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    Avisa por e-mail quando um dispositivo novo entra
                  </p>
                </div>
                <Switch defaultChecked aria-label="Alertas de novo acesso" />
              </div>

              <Button variant="outline" size="sm" className="w-full">
                Alterar senha
              </Button>
            </div>
          </section>

          <section className="surface-card rounded-card p-5">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-primary" />
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Sessões ativas
              </h2>
            </div>

            <ul className="mt-4 divide-y divide-border">
              {SESSIONS.map((session) => (
                <li key={session.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px]">{session.device}</p>
                    <p className="mt-0.5 text-[10.5px] text-subtle">
                      {session.location} · {session.lastSeen}
                    </p>
                  </div>
                  {session.current ? (
                    <Badge tone="success" size="sm">
                      Atual
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="xs">
                      Encerrar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-card rounded-card p-5">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-accent" />
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                Sua atividade
              </h2>
            </div>
            <div className="mt-4">
              <Timeline entries={entries} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
