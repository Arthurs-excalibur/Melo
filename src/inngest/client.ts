/**
 * Inngest Client
 *
 * Singleton Inngest client used throughout the app.
 * Replaces the BullMQ queue + Upstash Redis connection.
 */

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "moodify",
});
