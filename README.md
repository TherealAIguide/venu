# Venu — white-label event app platform

`thevenu.app` — root domain is the marketing site; every client lives at `[slug].thevenu.app`
via wildcard DNS. One codebase reskins entirely from a per-client config.

## Repo structure

```
/site      → marketing page, serves thevenu.app          (Vercel project: venu-site,  root dir: site/)
/app       → the platform, serves *.thevenu.app           (Vercel project: venu-app,   root dir: app/)
/shared    → design tokens, shared CSS
```

## /app — the platform (vanilla JS, no framework, on purpose)

- `index.html` — app shell markup (attendee app + moderator queue + big-screen display)
- `styles.css` — all styles (design system: dark theme, Anton display, Inter body, red accent `#E4032E`)
- `clients.js` — `CLIENTS` registry keyed by subdomain + `resolveClient()` hostname switch
- `app.js` — storage adapter, boot/theming, tabs, and all render logic

### Multi-tenancy
`resolveClient()` reads `location.hostname`, takes the first label, and returns that client's
config. Two clients exist: `tomferry` and `harborgala`. Local preview: `?client=harborgala`.
Adding a client = a new entry in `clients.js` — no DNS change, no redeploy target.

### Storage
`store` currently targets the Claude artifact API (demo only) and will be replaced with Firebase
(Storage for image blobs, Firestore for metadata) — method signatures stay identical. See Task 4.

## Status
- [x] Task 1 — wildcard DNS on Vercel (nameservers moved to Vercel; propagating)
- [~] Task 2 — repo structure + split of venu-app-demo.html into the four files above
- [ ] Task 3 — confirm subdomains render as different events from one deployment
- [ ] Task 4 — Firebase storage adapter (slug-scoped keys, real image uploads)
- [ ] Task 5 — moderator passcode gate
- [ ] Task 6 — PWA (per-client manifest, service worker, iOS Add to Home Screen)
- [ ] Task 7 — marketing site at the root
- [~] Task 8 — first pitch client: **Southwest — The Last Chili Cookoff** (`southwestchili`,
      preview `?client=southwestchili`). Adds the `chili` theme, config-driven branded splash,
      a module loader in app.js, and three modules promoted planned→beta:
      `polls` (Chili Vote), `scavenger` (hunt), `venue-map` (map + booth finder).
      Sample data + placeholder branding pending client review.
