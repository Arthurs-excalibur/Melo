# Moodify Pre-Deployment Checklist

## 🎵 Spotify Integration

### Authentication

* [ ] Login with Spotify works
* [ ] Logout works
* [ ] Session persists after refresh
* [ ] Session expiration handled gracefully
* [ ] User denied permissions flow handled
* [ ] Invalid token handling works

### API Endpoints

* [ ] `/me` works
* [ ] `/me/top/artists` works
* [ ] All Spotify requests handle rate limits
* [ ] All Spotify requests handle API downtime
* [ ] No Spotify credentials exposed in frontend

### User Experience

* [ ] First-time users understand why Spotify login is needed
* [ ] Clear permission explanation
* [ ] Empty state for users with little listening history

---

# 📱 Mobile Responsiveness

Test:

* [ ] iPhone SE (375px)
* [ ] Android (360px)
* [ ] Tablet (768px)
* [ ] Desktop (1440px)

Check:

* [ ] No horizontal scrolling
* [ ] Charts don't overflow
* [ ] Artist cards don't break layout
* [ ] Navigation works with thumb reach
* [ ] Spotify login button visible immediately
* [ ] Text remains readable

---

# ⚡ Performance

### Target

* [ ] Initial page load under 3 seconds on 4G
* [ ] Lighthouse Performance > 90
* [ ] Largest Contentful Paint under 2.5s
* [ ] Cumulative Layout Shift under 0.1

### Assets

* [ ] Images converted to WebP
* [ ] No unused images
* [ ] No giant background videos
* [ ] Fonts optimized
* [ ] Bundle size checked

### JavaScript & Animations

* [ ] Remove unused npm packages
* [ ] Lazy load heavy components
* [ ] Dynamic imports where possible
* [ ] Infinite spinning arc (Archetypes) uses hardware acceleration and doesn't drain mobile battery
* [ ] Parallax and FadeIn animations degrade gracefully on low-end devices

---

# 🧠 Mood Analysis Validation

This is the most important Moodify-specific section.

* [ ] Mood detection works consistently
* [ ] Similar listening history gives similar moods
* [ ] Mood labels make sense
* [ ] Edge cases tested

Examples:

* [ ] New Spotify account
* [ ] No listening history
* [ ] Only one favorite artist
* [ ] Mixed genres
* [ ] Private listening history

Ask:

> "If a user sees this mood result, would they agree with it?"

If not, improve before launch.

---

# 🔒 Security

### Secrets

* [ ] Spotify Client Secret never reaches frontend
* [ ] `.env` not committed
* [ ] Production secrets configured (e.g., `NEXTAUTH_URL`, `NEXTAUTH_SECRET`)
* [ ] `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` safely configured

### Backend

* [ ] API routes protected
* [ ] Input validation exists
* [ ] Rate limiting enabled
* [ ] Error messages don't expose stack traces

### User Data

* [ ] Users only see their own data
* [ ] No token leakage
* [ ] Session handling secure

---

# 🗄 Database

If Moodify stores user data:

* [ ] Migrations tested
* [ ] Indexes added
* [ ] Duplicate records handled
* [ ] Backups configured

---

# ⚙️ Background Processing (Inngest)

Moodify uses Inngest for background tasks (e.g., async history analysis):

* [ ] Inngest functions are deployed and synced to the production Inngest dashboard
* [ ] Retries and failure handlers are configured (especially for Spotify API rate limits)
* [ ] Long-running mood generation jobs send progress updates to the frontend
* [ ] Webhooks/API routes for Inngest are publicly accessible by the Inngest runner

---

# 🎨 Landing Page Audit

### Above the Fold

Within 5 seconds users should know:

* [ ] What Moodify does
* [ ] Why it's useful
* [ ] Why Spotify is required
* [ ] What happens after login

### Messaging

Bad:

> AI-powered emotional intelligence platform

Good:

> Discover your mood through your Spotify listening habits

---

# ♿ Accessibility

* [ ] Contrast passes accessibility checks
* [ ] Buttons have labels
* [ ] Keyboard navigation works
* [ ] Screen reader friendly
* [ ] Images have alt text

---

# 📊 Analytics

Track:

* [ ] Landing page visits
* [ ] Spotify login clicks
* [ ] Successful authentication
* [ ] Mood generation
* [ ] User retention
* [ ] Errors

Important funnel:

Landing Page
→ Spotify Login
→ Authorization
→ Mood Generated

Find where users drop off.

---

# 🚨 Error Monitoring

Before launch install at least one:

* [ ] Sentry
* [ ] Console logging for production errors
* [ ] API error logging

---

# 🌐 SEO

* [ ] Title tag
* [ ] Meta description
* [ ] Open Graph image
* [ ] Favicon
* [ ] Sitemap
* [ ] robots.txt

---

# 🚀 Final Deployment Test

Use a brand new browser profile.

Complete this exact flow:

* [ ] Visit landing page
* [ ] Read product
* [ ] Click Login with Spotify
* [ ] Grant permissions
* [ ] Generate mood
* [ ] Verify the Archetypes spinning arc and images load properly
* [ ] Refresh page
* [ ] Return later
* [ ] Logout

No developer account shortcuts.

Pretend you're a random internet user.

---

# Moodify Launch Score

### Must Pass Before Deploying

* [ ] Mobile responsive
* [ ] Spotify login works
* [ ] No exposed secrets
* [ ] Lighthouse > 90
* [ ] Mood generation accurate
* [ ] Error tracking installed
* [ ] Analytics installed
* [ ] Tested on real phone
* [ ] Tested on slow internet
* [ ] No console errors