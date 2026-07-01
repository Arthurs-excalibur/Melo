/**
 * GET /api/share/[id]
 * Retrieves a public share card.
 */

import { NextRequest } from "next/server";
import { getShareCard } from "@/lib/share/engine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const card = await getShareCard(id);

  if (!card) {
    return Response.json({ error: "Share card not found or expired" }, { status: 404 });
  }

  return Response.json(card);
}
