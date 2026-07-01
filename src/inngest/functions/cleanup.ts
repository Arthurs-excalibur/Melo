import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";

export const cleanupCron = inngest.createFunction(
  { 
    id: "cleanup-stale-data", 
    name: "Cleanup Stale Data",
    triggers: [{ cron: "0 0 * * *" }] // Run daily at midnight
  },
  async ({ step }: { step: { run: (label: string, fn: () => Promise<unknown>) => Promise<unknown> } }) => {
    // 1. Delete expired share cards
    const deletedShareCards = await step.run("delete-expired-share-cards", async () => {
      const result = await db.shareCard.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      return result.count;
    });

    // 2. Delete JobStatus records older than 7 days
    const deletedJobStatuses = await step.run("delete-old-job-status", async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await db.jobStatus.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo } },
      });
      return result.count;
    });

    return {
      deletedShareCards,
      deletedJobStatuses,
    };
  }
);
