"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { AtlasLogoVertical, AtlasMark } from "@/components/brand/atlas-mark";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/toggle";
import { Field, Input, Label } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { siteConfig } from "@/config/site";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  // O backend exige 10; validar aqui com o mesmo piso evita uma ida à rede
  // para receber a mesma recusa.
  password: z.string().min(10, "A senha precisa ter ao menos 10 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const HIGHLIGHTS = [
  {
    title: "Lucro real, não faturamento",
    detail:
      "Comissão, frete, imposto e custo da mercadoria descontados pedido a pedido.",
  },
  {
    title: "Um painel para todos os canais",
    detail:
      "Mercado Livre, Shopee, Amazon, Magalu e TikTok Shop na mesma visão consolidada.",
  },
  {
    title: "O Atlas AI trabalha enquanto você dorme",
    detail:
      "Encontra margem negativa, prevê ruptura e reage ao concorrente automaticamente.",
  },
];

export function LoginView() {
  const { signIn, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    // O provider já guarda a mensagem de erro para exibição; aqui só evitamos
    // que a rejeição vire "unhandled".
    await signIn(values.email, values.password).catch(() => undefined);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* ------------------------------------------------------------ form */}
      <div className="relative flex items-center justify-center px-5 py-10 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/3 size-[420px] rounded-full bg-primary/10 blur-[110px]" />
        </div>

        <Reveal y={18} duration={0.6} className="relative w-full max-w-sm">
          <AtlasLogoVertical size={52} className="mb-8" />

          <div className="text-center">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">
              Entre na sua conta
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              {siteConfig.tagline}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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

            <Field label="Senha" error={errors.password?.message}>
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                icon={<Lock />}
                invalid={!!errors.password}
                autoComplete="current-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="pointer-events-auto transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                }
              />
            </Field>

            <div className="flex items-center justify-between">
              <Label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-muted">
                <Checkbox defaultChecked />
                Manter conectado
              </Label>
              <button
                type="button"
                className="text-[12.5px] text-primary transition-colors hover:text-primary-strong"
              >
                Esqueci a senha
              </button>
            </div>

            {authError && (
              <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
                {authError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              {isSubmitting ? "Entrando…" : "Entrar no Atlas"}
              {!isSubmitting && <ArrowRight />}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-border bg-surface-2/50 p-3.5 text-center">
            <p className="text-[11.5px] leading-relaxed text-subtle">
              Ainda não tem conta nesta instância? Crie a primeira pelo endpoint{" "}
              <code className="font-mono">POST /auth/register</code> — ela nasce como
              proprietária da organização.
            </p>
          </div>

          <p className="mt-6 text-center text-[12.5px] text-muted">
            Ainda não tem conta?{" "}
            <button
              type="button"
              className="font-medium text-primary transition-colors hover:text-primary-strong"
            >
              Fale com o time comercial
            </button>
          </p>
        </Reveal>
      </div>

      {/* --------------------------------------------------------- showcase */}
      <div className="relative hidden overflow-hidden border-l border-border bg-background-elevated lg:block">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="grid-bg absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]" />
          <div className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />
          <div className="absolute bottom-0 right-0 size-[380px] rounded-full bg-accent/8 blur-[120px]" />
        </div>

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <Badge tone="brand" size="lg">
              <Sparkles />
              Atlas AI incluído
            </Badge>
          </div>

          <div className="flex justify-center py-8">
            <Reveal y={0} duration={0.8} delay={0.2} className="relative">
              <div className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-primary/20 blur-2xl" />
              <AtlasMark size={168} />
            </Reveal>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.03em]">
              Inteligência que impulsiona{" "}
              <span className="text-brand-gradient">cada venda</span>.
            </h2>

            <ul className="mt-8 space-y-5">
              {HIGHLIGHTS.map((item, index) => (
                <Reveal
                  as="li"
                  key={item.title}
                  x={-12}
                  y={0}
                  duration={0.5}
                  delay={0.4 + index * 0.12}
                  className="flex gap-3"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-[13.5px] font-medium">{item.title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                      {item.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-6 border-t border-border pt-6">
              {[
                ["18,4 mil", "pedidos processados"],
                ["R$ 18,6 mi", "em receita analisada"],
                ["8", "marketplaces suportados"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-[17px] font-semibold tracking-tight">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-subtle">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
