import type { Metadata } from "next";
import { CampaignsView } from "@/features/campaigns/campaigns-view";

export const metadata: Metadata = { title: "Campanhas" };

export default function CampaignsPage() {
  return <CampaignsView />;
}
