import { NextResponse } from "next/server";
import { orders, summarize } from "@/mock/orders";

/** GET /api/orders?search=&status=&marketplace=&page=&pageSize= */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const status = searchParams.get("status") ?? "todos";
  const marketplace = searchParams.get("marketplace") ?? "todos";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 12));

  const filtered = orders.filter((order) => {
    if (status !== "todos" && order.status !== status) return false;
    if (marketplace !== "todos" && order.marketplace !== marketplace) return false;
    if (!search) return true;
    return (
      order.code.toLowerCase().includes(search) ||
      order.buyer.toLowerCase().includes(search) ||
      order.items.some((item) => item.title.toLowerCase().includes(search))
    );
  });

  const start = (page - 1) * pageSize;

  return NextResponse.json({
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    summary: summarize(filtered),
  });
}
