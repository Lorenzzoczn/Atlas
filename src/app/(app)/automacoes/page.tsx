import type { Metadata } from "next";
import { AutomationsView } from "@/features/automations/automations-view";

export const metadata: Metadata = { title: "Automações" };

export default function AutomationsPage() {
  return <AutomationsView />;
}
