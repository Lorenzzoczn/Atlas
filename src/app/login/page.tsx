import type { Metadata } from "next";
import { LoginView } from "@/features/auth/login-view";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse o painel de inteligência comercial do Atlas Commerce.",
};

export default function LoginPage() {
  return <LoginView />;
}
