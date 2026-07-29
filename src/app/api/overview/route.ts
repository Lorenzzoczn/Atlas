import { NextResponse } from "next/server";
import { seriesForRange, seriesTotals } from "@/mock/analytics";
import { marketplaceBreakdown, orderStatusBreakdown } from "@/mock/orders";
import { MOCK_NOW } from "@/config/site";

const RANGES: Record<string, number> = { hoje: 1, "7d": 7, "30d": 30, "90d": 90 };

/**
 * GET /api/overview?range=30d
 *
 * Mock endpoint backed by the deterministic fixture layer. It exists so the
 * client contract is already in place when the real data source arrives.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "30d";
  const days = RANGES[range] ?? 30;

  const current = seriesForRange(days);
  const previous = seriesForRange(days * 2).slice(0, days);

  const currentTotals = seriesTotals(current);
  const previousTotals = seriesTotals(previous);

  return NextResponse.json({
    range,
    generatedAt: MOCK_NOW.toISOString(),
    totals: currentTotals,
    previous: previousTotals,
    series: current,
    channels: marketplaceBreakdown,
    orderStatus: orderStatusBreakdown,
  });
}
