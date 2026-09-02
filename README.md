# Marquee

Multi-tenant SaaS for bands: a public website (music, shows, booking, media) plus an admin portal to manage everything. Built as a greenfield product inspired by the [Force Fed](https://force-fed-band.vercel.app) prototype.

> **Reference note:** The private `davefrost5/force-fed-band` repo was not accessible from this environment. Force Fed tenant #1 was rebuilt from the live public site (copy, layout, Spotify artist ID, gig list via public API, and downloadable media assets). No production secrets were imported.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **SQLite** via Prisma 7 + better-sqlite3 adapter
- **Auth:** email/password + magic-link (dev: link shown in UI; production would email it)
- **Uploads:** local `public/uploads/` (stub for future Vercel Blob)

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123)

## Demo tenants

After `npm run db:seed`, demo admin credentials are printed in the terminal only (not stored in the repo). Set optional env vars below to use fixed local passwords.

| Band | Public site |
|------|-------------|
| **Force Fed** (editorial template) | [/b/force-fed](http://127.0.0.1:43123/b/force-fed) |
| **Neon Harbor** (poster template) | [/b/neon-harbor](http://127.0.0.1:43123/b/neon-harbor) |

## Onboarding a new band

1. Go to [/onboarding](http://127.0.0.1:43123/onboarding)
2. Create account (email + password)
3. Set band name, slug, tagline, booking email
4. Pick brand colors (live preview)
5. Optional Spotify artist ID, logo, hero image
6. Choose template: **Editorial**, **Tour Poster**, or **Gallery**
7. Publish — you'll land on your public site at `/b/your-slug`

Then manage shows, availability, bookings, and media at [/admin](http://127.0.0.1:43123/admin).

## Admin features (generalized from Force Fed)

- **Shows** — add/remove upcoming gigs (`date`, `time`, `venue`)
- **Availability** — dates open for booking requests
- **Booking inbox** — review requests, set status (pending / confirmed / declined)
- **Site** — name, tagline, colors, template, Spotify artist ID
- **Media** — upload images to the public gallery

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path, default `file:./dev.db` |
| `AUTH_SECRET` | JWT session signing secret |
| `FORCE_FED_ADMIN_EMAIL` | Force Fed seed admin email (optional) |
| `FORCE_FED_ADMIN_PASSWORD` | Force Fed seed admin password (optional; random if omitted) |
| `NEON_HARBOR_ADMIN_EMAIL` | Neon Harbor seed admin email (optional) |
| `NEON_HARBOR_ADMIN_PASSWORD` | Neon Harbor seed admin password (optional; random if omitted) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **43123** |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:seed` | Reset seed data (Force Fed + Neon Harbor) |
| `npm run db:reset` | Drop DB, migrate, seed |

## Project structure

```
src/app/b/[slug]     Public band sites (multi-tenant)
src/app/admin        Band admin portal
src/app/onboarding   New band wizard
src/components/templates   Editorial, Poster, Gallery layouts
prisma/              Schema + seed
public/seeds/force-fed     Ported public assets
```

## Production notes

- Swap SQLite for Postgres and update the Prisma driver adapter
- Move uploads to Vercel Blob or S3
- Send magic links via Resend/SendGrid
- Add subdomain routing (`{slug}.marquee.app`) via middleware
