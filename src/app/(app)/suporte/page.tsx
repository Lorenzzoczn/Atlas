import type { Metadata } from "next";
import { SupportView } from "@/features/support/support-view";

export const metadata: Metadata = { title: "Suporte" };

export default function SupportPage() {
  return <SupportView />;
}
