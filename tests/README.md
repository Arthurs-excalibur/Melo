# Melo QA Automation Suite

This suite uses Playwright TypeScript with Page Object Model coverage for Melo's core journeys, API contracts, accessibility, responsive behavior, visual regression, Lighthouse, console monitoring, and network failure detection.

## Structure

- `tests/pages`: Page Objects for landing, dashboard, compatibility, settings, and share flows.
- `tests/fixtures`: Auth/session setup, API mocks, console/network monitoring, and reusable test data.
- `tests/e2e`: User journeys for landing, auth, dashboard analysis, compatibility, playlist export, settings, share cards, SEO, security, and responsive behavior.
- `tests/api`: HTTP contract, validation, unauthorized access, latency, and Spotify auth guardrail tests.
- `tests/accessibility`: axe-core checks for key pages and workflows.
- `tests/visual`: Screenshot baselines for high-value UI states.
- `tests/performance`: Lighthouse audits and Web Vital collection.
- `test-results`: JSON, JUnit, traces, screenshots, videos, and Lighthouse output.

## Local Commands

```bash
npm run playwright:install
npm run test:e2e
npm run test:api
npm run test:a11y
npm run test:visual:update
npm run test:visual
npm run test:perf
npm run test:qa
```

`test:qa:all` runs every configured browser and viewport project. It is intentionally broad and can be slow.

## Environment

Default tests avoid real Spotify mutations. Authenticated UI tests mint a NextAuth JWT test cookie and mock browser-side API responses.

Set these when running against live infrastructure:

```bash
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://127.0.0.1:3000
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
DATABASE_URL=...
RUN_LIVE_INTEGRATION=1
RUN_LIGHTHOUSE=1
```

## Maintenance Rules

- Prefer user-visible locators: roles, labels, headings, and button names.
- Keep Page Objects thin. Put workflow actions there, not assertions for unrelated pages.
- Add a mocked UI test plus an API contract test when adding a new feature route.
- Keep live Spotify/Supabase mutation tests opt-in unless they run against seeded disposable resources.
- Update visual baselines only after reviewing diffs in `playwright-report`.
- Treat console warnings, hydration errors, failed requests, and 5xx responses as regressions.

## Current Coverage Map

- Landing: hero, CTA, feature navigation, FAQ, footer links.
- Authentication: OAuth entry, unauthorized dashboard redirect, session persistence, expired-session error.
- Dashboard: analysis request, cached completion, aura reveal, profile, top tracks/artists, charts, galaxy, empty states, retry.
- AI/Inngest: analysis polling contracts and Inngest endpoint reachability.
- Spotify: provider contract, unauthenticated session, playlist scope error UX.
- Compatibility: share link parsing, score, breakdown, errors, loading states.
- Share Cards: public API contract, metadata/not-found behavior.
- Settings: profile, theme controls, sign out, delete data confirmation.
- API: protected endpoints, validation, error response shape, latency budgets.
- Responsive: requested mobile/tablet/desktop projects in `playwright.config.ts`.
- Cross-browser: Chromium, Firefox, WebKit projects.
- Accessibility: axe on landing, dashboard, compatibility.
- Visual Regression: landing, dashboard aura, compatibility, settings, error page.
- Performance: Lighthouse budgets: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 95.
