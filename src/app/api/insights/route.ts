import { NextResponse } from "next/server";
import { insightScore, insights } from "@/mock/intelligence";
import { MOCK_NOW } from "@/config/site";

/** GET /api/insights?severity=critico */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity");

  const items = severity
    ? insights.filter((insight) => insight.severity === severity)
    : insights;

  return NextResponse.json({
    items,
    score: insightScore,
    generatedAt: MOCK_NOW.toISOString(),
  });
}
