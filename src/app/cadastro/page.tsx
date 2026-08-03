import type { Metadata } from "next";
import { RegisterView } from "@/features/auth/register-view";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta no Atlas Commerce e conecte seus canais de venda.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
