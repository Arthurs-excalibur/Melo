# Production Hardening Prompt for Melo

Act as a **Senior Backend Engineer** and **Production Infrastructure Engineer**.

Your task is to production-harden **Melo**, an AI-powered Spotify music personality application built with:

* Next.js 16 (App Router)
* React 19
* TypeScript
* Prisma
* PostgreSQL (Supabase)
* NextAuth
* Inngest
* OpenRouter AI
* Vercel deployment target

The current application is functional, but before deployment it needs to be hardened for scalability, reliability, cost efficiency, and abuse prevention.

Do **not** change any existing UI, UX, animations, or business logic.

The goal is to improve backend infrastructure while preserving existing behavior.

---

# Objective 1 — Replace In-Memory Cache

The project currently uses an in-memory cache (`Map`-based TTL cache).

Replace it with a shared cache suitable for serverless deployments.

Preferred implementation:

* Upstash Redis

Requirements:

* Create a reusable cache abstraction.
* Keep the existing TTL behavior.
* Preserve the existing cache API where possible to minimize refactoring.
* Support configurable TTL values.

Cache the following:

* Spotify Profile — 24 hours
* Top Artists — 1 hour
* Top Tracks — 1 hour
* Recently Played — 5 minutes
* AI Analysis — 7 days
* Compatibility Results — 24 hours
* Share Cards — 30 days

Ensure:

* Cache keys are namespaced.
* Cache serialization/deserialization is handled safely.
* Failed Redis operations gracefully fall back to the database without crashing requests.
* Cache failures never prevent users from using the application.

---

# Objective 2 — Add Rate Limiting

Protect all expensive endpoints.

Implement Redis-backed rate limiting.

Rate limits should be per authenticated user.

Fallback to IP address when no authenticated session exists.

Apply limits to:

POST /api/analysis

* 5 requests/hour

POST /api/compatibility

* 20 requests/hour

POST /api/export-playlist

* 10 requests/hour

Requirements:

* Return HTTP 429 when exceeded.
* Include appropriate Retry-After headers.
* Return consistent JSON error responses.
* Make limits configurable via environment variables.

Do not rate limit inexpensive GET endpoints.

---

# Objective 3 — Prevent Duplicate Analysis Jobs

Ensure only one AI analysis can run per user at a time.

Use Redis distributed locking.

Requirements:

* Acquire a lock before creating an Inngest job.
* Lock key format should be predictable and namespaced.
* Lock TTL should automatically expire after 5 minutes.
* If another request arrives while a lock exists:

  * Return the existing Job ID if available.
  * Otherwise return an appropriate "Analysis already in progress" response.

When the job completes:

* Remove the lock.
* Store the finished analysis in Redis.
* Store the finished analysis in PostgreSQL.

Locks must also be cleaned up automatically if jobs fail or time out.

---

# Objective 4 — Cache First Strategy

Refactor the analysis workflow to follow this order:

1. Check rate limit.
2. Check whether an analysis is already running.
3. Check Redis cache.
4. Check PostgreSQL.
5. Only if no valid data exists:

   * Create lock.
   * Trigger Inngest.
   * Generate AI analysis.
   * Save to PostgreSQL.
   * Save to Redis.
   * Remove lock.

The goal is to avoid unnecessary Spotify requests and AI calls.

---

# Objective 5 — Resilience

Every Redis operation must:

* Handle connection failures.
* Handle timeouts.
* Retry when appropriate.
* Fail gracefully.

The application should continue functioning even if Redis becomes temporarily unavailable.

---

# Objective 6 — Monitoring

Add structured logging for:

* Cache hits
* Cache misses
* Cache writes
* Rate limit violations
* Lock acquisition
* Lock release
* Duplicate analysis attempts
* Analysis duration
* Spotify fetch duration
* OpenRouter response duration
* Database query duration

Logs should be readable and production-friendly.

---

# Objective 7 — Configuration

Add all required environment variables.

Examples:

* UPSTASH_REDIS_REST_URL
* UPSTASH_REDIS_REST_TOKEN
* RATE_LIMIT_ANALYSIS
* RATE_LIMIT_COMPATIBILITY
* RATE_LIMIT_PLAYLIST

Provide sensible defaults where appropriate.

---

# Objective 8 — Code Quality

Maintain:

* Type safety
* Modular architecture
* Reusable helper functions
* Clean separation of concerns
* Proper error handling
* Comprehensive comments where necessary

Avoid duplicated code.

---

# Deliverables

Generate:

* Complete Redis integration
* Cache service
* Rate limiter service
* Distributed lock service
* Updated API routes
* Updated analysis workflow
* Environment variables
* Folder structure changes
* Example configuration
* Migration guide (if needed)
* Summary of all modified files

The final implementation should be production-ready, scalable, cost-efficient, fault-tolerant, and fully compatible with deployment on Vercel, Supabase, and Inngest.
