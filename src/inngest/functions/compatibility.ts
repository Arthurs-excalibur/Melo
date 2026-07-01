/**
 * Inngest: Compatibility Function
 *
 * Background fallback for compatibility checks. The API route also calls the
 * same runner directly so local/dev usage does not depend on Inngest polling.
 */

import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { runCompatibilityComparison } from "@/lib/compatibility/runner";

interface CompatibilityRequestedEvent {
  name: "moodify/compatibility.requested";
  data: {
    jobId: string;
    user1Id: string;
    shareCardId: string;
    user1SpotifyId: string;
    accessToken: string;
    refreshToken: string;
  };
}

interface FailureEventShape {
  data?: {
    event?: {
      data?: {
        jobId?: string;
      };
    };
  };
}

export const compatibilityFunction = inngest.createFunction(
  {
    id: "generate-compatibility",
    name: "Generate Compatibility Score",
    retries: 3,
    triggers: [{ event: "moodify/compatibility.requested" }],
    onFailure: async ({ event, error }) => {
      const jobId = (event as FailureEventShape).data?.event?.data?.jobId;
      if (!jobId) return;

      await db.jobStatus.update({
        where: { id: jobId },
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : "Compatibility run failed after retries.",
        },
      });
    },
  },
  async ({ event, step }) => {
    const { jobId, user1Id, shareCardId, user1SpotifyId, accessToken } =
      event.data as CompatibilityRequestedEvent["data"];

    const result = await step.run("run-compatibility-comparison", async () => {
      await db.jobStatus.update({
        where: { id: jobId },
        data: { progress: "Comparing music profiles..." },
      });

      return runCompatibilityComparison({
        currentUserId: user1Id,
        currentSpotifyId: user1SpotifyId,
        accessToken,
        shareCardId,
      });
    });

    await step.run("store-compatibility-result", async () => {
      await db.jobStatus.update({
        where: { id: jobId },
        data: {
          status: "completed",
          progress: null,
          result: JSON.parse(JSON.stringify(result)),
        },
      });
    });
  }
);
