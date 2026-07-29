import type { Metadata } from "next";
import { AtlasAiView } from "@/features/atlas-ai/atlas-ai-view";

export const metadata: Metadata = { title: "Atlas AI" };

export default function AtlasAiPage() {
  return <AtlasAiView />;
}
