"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { AtlasLogoVertical } from "@/components/brand/atlas-mark";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import { authApi } from "@/services/atlas-backend";
import { setSession, toStoredSession } from "@/store/session-store";

const registerSchema = z
  .object({
    name: z.string().min(3, "Informe seu nome completo").max(120),
    email: z.string().email("Informe um e-mail válido").max(255),
    organizationName: z
      .string()
      .min(2, "Informe o nome da sua empresa")
      .max(120),
    // Mesmo piso do backend: validar aqui evita uma ida à rede para receber a
    // mesma recusa.
    password: z.string().min(10, "A senha precisa ter ao menos 10 caracteres").max(128),
    passwordConfirmation: z.string(),
    inviteCode: z.string().optional(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "As senhas não conferem",
    path: ["passwordConfirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const GARANTIAS = [
  "Sua conta nasce dona da própria organização — ninguém mais enxerga seus dados.",
  "Conectamos seus canais por autorização oficial: sua senha do marketplace nunca passa por aqui.",
  "14 dias de teste, sem cartão.",
];

export function RegisterView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      organizationName: "",
      password: "",
      passwordConfirmation: "",
      inviteCode: "",
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    setErro(null);

    try {
      const sessao = await authApi.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        organizationName: values.organizationName.trim(),
        inviteCode: values.inviteCode?.trim() || undefined,
      });

      // O registro já devolve a sessão: guardar os tokens aqui poupa ao usuário
      // digitar a mesma senha de novo na tela de login.
      setSession(toStoredSession(sessao.tokens));
      queryClient.clear();
      router.push("/");
    } catch (causa) {
      if (causa instanceof ApiError) {
        // Erros de campo viram erro do campo: mensagem no topo do formulário
        // faz o usuário procurar onde errou.
        const campo = (causa.details as { field?: string } | undefined)?.field;

        if (campo === "inviteCode") {
          setError("inviteCode", { message: causa.message });
          return;
        }
        if (campo === "email") {
          setError("email", { message: causa.message });
          return;
        }

        setErro(causa.message);
        return;
      }

      setErro("Não foi possível criar a conta. Tente novamente.");
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,#000_5%,transparent_65%)]" />
        <div className="absolute -top-40 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <Reveal y={18} duration={0.6} className="relative w-full max-w-md">
        <AtlasLogoVertical size={52} className="mb-8" />

        <div className="text-center">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">
            Crie sua conta
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            Leva menos de um minuto. Você conecta seus canais logo depois.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Field label="Seu nome" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Como devemos te chamar"
              icon={<User />}
              invalid={!!errors.name}
              autoComplete="name"
            />
          </Field>

          <Field label="E-mail" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="voce@empresa.com.br"
              icon={<Mail />}
              invalid={!!errors.email}
              autoComplete="email"
            />
          </Field>

          <Field
            label="Nome da empresa"
            error={errors.organizationName?.message}
            hint="Aparece no topo do painel. Pode mudar depois."
          >
            <Input
              {...register("organizationName")}
              placeholder="Minha Loja LTDA"
              icon={<Building2 />}
              invalid={!!errors.organizationName}
              autoComplete="organization"
            />
          </Field>

          <Field
            label="Senha"
            error={errors.password?.message}
            hint="Ao menos 10 caracteres."
          >
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              icon={<Lock />}
              invalid={!!errors.password}
              autoComplete="new-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((valor) => !valor)}
                  className="pointer-events-auto transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              }
            />
          </Field>

          <Field label="Repita a senha" error={errors.passwordConfirmation?.message}>
            <Input
              {...register("passwordConfirmation")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              icon={<Lock />}
              invalid={!!errors.passwordConfirmation}
              autoComplete="new-password"
            />
          </Field>

          <Field
            label="Código de convite"
            error={errors.inviteCode?.message}
            hint="Quem te enviou o link informa o código."
          >
            <Input
              {...register("inviteCode")}
              placeholder="Código recebido"
              icon={<KeyRound />}
              invalid={!!errors.inviteCode}
              autoComplete="off"
            />
          </Field>

          {erro && (
            <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
              {erro}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isSubmitting ? "Criando sua conta…" : "Criar conta"}
            {!isSubmitting && <ArrowRight />}
          </Button>
        </form>

        <ul className="mt-6 space-y-2.5 rounded-xl border border-border bg-surface-2/50 p-4">
          {GARANTIAS.map((texto) => (
            <li key={texto} className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span className="text-[11.5px] leading-relaxed text-subtle">{texto}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-[12.5px] text-muted">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-primary-strong"
          >
            <ArrowLeft className="size-3.5" />
            Já tenho conta
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
