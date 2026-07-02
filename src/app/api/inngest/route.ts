/**
 * Inngest Webhook Route Handler
 *
 * This is the single endpoint that Inngest Cloud calls to deliver
 * function invocations. It must be a POST handler at /api/inngest.
 *
 * Replaces the dedicated BullMQ worker process entirely.
 * No Redis, no separate deployment — Inngest handles orchestration.
 */

import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  analysisFunction,
  compatibilityFunction,
  cleanupCron,
} from "@/inngest/functions";

// Configure Vercel to allow these serverless functions to run for up to 60s
// This prevents timeouts during long Inngest steps.
export const maxDuration = 60;

export async function GET() {
  return Response.json({ ok: true }, { status: 200 });
}

export const { POST, PUT } = serve({
  client: inngest,
  functions: [
    analysisFunction,
    compatibilityFunction,
    cleanupCron,
  ],
});
