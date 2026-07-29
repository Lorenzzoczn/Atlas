import { NextResponse } from "next/server";
import { z } from "zod";
import { askAtlas } from "@/services/atlas-api";

const bodySchema = z.object({
  question: z.string().min(2).max(600),
});

/**
 * POST /api/atlas
 *
 * Stands in for the future model call. The response is canned, but the request
 * shape and validation already match what the real endpoint will accept.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Pergunta inválida", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const answer = await askAtlas(parsed.data.question);

  return NextResponse.json({
    answer,
    model: "atlas-mock-v1",
    createdAt: new Date().toISOString(),
  });
}
