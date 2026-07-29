import type { Metadata } from "next";
import { CompetitorsView } from "@/features/competitors/competitors-view";

export const metadata: Metadata = { title: "Concorrentes" };

export default function CompetitorsPage() {
  return <CompetitorsView />;
}
