/**
 * POST /api/compatibility
 * Calculates compatibility between the current user and a shared user's profile.
 * Expects { shareId: string } in the body.
 */

import { auth } from "@/lib/auth";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { runCompatibilityComparison } from "@/lib/compatibility/runner";
import { checkRateLimit } from "@/lib/rate-limiter";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.accessToken || !session.spotifyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`user:${session.spotifyId}`, "compatibility");
  if (!rl.allowed) {
    return Response.json(
      { error: `Rate limit exceeded. Try again after ${new Date(rl.resetAt).toLocaleTimeString()}.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = await request.json();
  const { shareId } = body;

  if (!shareId) {
    return Response.json({ error: "shareId is required" }, { status: 400 });
  }

  // Ensure user exists
  const user = await db.user.findUnique({ where: { spotifyId: session.spotifyId } });
  if (!user) {
    return Response.json({ error: "User not found, please run analysis first." }, { status: 400 });
  }

  try {
    const result = await runCompatibilityComparison({
      currentUserId: user.id,
      currentSpotifyId: session.spotifyId,
      accessToken: session.accessToken as string,
      shareCardId: shareId,
    });

    return Response.json({ status: "completed", data: result });
  } catch (err) {
    if (err instanceof Error && err.message === "Share card not found or expired") {
      return Response.json({ error: err.message }, { status: 404 });
    }

    console.warn("[compatibility] Direct comparison failed, falling back to background job:", err);
  }

  // Prevent active job duplication for fallback background work.
  const activeJob = await db.jobStatus.findFirst({
    where: {
      id: { contains: user.id },
      status: "processing",
      type: "compatibility",
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
    },
  });

  if (activeJob) {
    return Response.json({
      error: "A compatibility analysis is already running. Please wait.",
      jobId: activeJob.id,
    }, { status: 429 });
  }

  const jobId = `compat-${user.id}-${shareId}-${Date.now()}`;

  // Create job status row in Supabase before firing the event
  // This enables the GET handler to immediately find the job
  await db.jobStatus.create({
    data: {
      id: jobId,
      type: "compatibility",
      status: "processing",
      progress: "Starting compatibility analysis...",
    },
  });

  await inngest.send({
    name: "moodify/compatibility.requested",
    data: {
      jobId,
      user1Id: user.id,
      shareCardId: shareId,
      user1SpotifyId: session.spotifyId,
      accessToken: session.accessToken as string,
      refreshToken: session.refreshToken as string,
    },
  });

  return Response.json({ jobId, status: "processing" });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return Response.json({ error: "Missing jobId parameter" }, { status: 400 });
  }

  // Replaces: compatibilityQueue.getJob(jobId) + job.getState() + job.returnvalue
  let jobStatus;
  try {
    jobStatus = await db.jobStatus.findUnique({ where: { id: jobId } });
  } catch (e) {
    console.warn("Failed to query jobStatus:", e);
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  if (!jobStatus) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  if (jobStatus.status === "completed") {
    return Response.json({ status: "completed", data: jobStatus.result });
  } else if (jobStatus.status === "failed") {
    return Response.json({ status: "failed", error: jobStatus.error }, { status: 500 });
  } else {
    // "processing" — return current progress message
    return Response.json({ status: jobStatus.status, progress: jobStatus.progress });
  }
}
