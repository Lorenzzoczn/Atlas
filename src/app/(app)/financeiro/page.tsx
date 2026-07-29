import type { Metadata } from "next";
import { FinanceView } from "@/features/finance/finance-view";

export const metadata: Metadata = { title: "Financeiro" };

export default function FinancePage() {
  return <FinanceView />;
}
