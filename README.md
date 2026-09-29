# Marquee

Multi-tenant SaaS for bands: a public website (music, shows, booking, media) plus an admin portal to manage everything. Built as a greenfield product inspired by the [Force Fed](https://force-fed-band.vercel.app) prototype.

> **Reference note:** The private `davefrost5/force-fed-band` repo was not accessible from this environment. Force Fed tenant #1 was rebuilt from the live public site (copy, layout, Spotify artist ID, gig list via public API, and downloadable media assets). No production secrets were imported.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **PostgreSQL** via Prisma 7 + `@prisma/adapter-pg` (Neon on Vercel)
- **Auth:** email/password; magic-link in local dev only (disabled in production)
- **Uploads:** Vercel Blob in production (`BLOB_READ_WRITE_TOKEN`); local `public/uploads/` in dev

## Quick start

Use a local Postgres instance or a [Neon](https://neon.tech) dev branch for `DATABASE_URL`.

```bash
npm install
cp .env.example .env
# Edit DATABASE_URL, AUTH_SECRET, and seed passwords in .env

npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123)

### Local Postgres (Docker)

```bash
docker run --name marquee-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=marquee -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marquee"
```

## Demo tenants

| Band | Public site | Admin login |
|------|-------------|-------------|
| **Force Fed** (editorial template) | [/b/force-fed](http://127.0.0.1:43123/b/force-fed) | `FORCE_FED_ADMIN_EMAIL` / `FORCE_FED_ADMIN_PASSWORD` from `.env` |
| **Neon Harbor** (poster template) | [/b/neon-harbor](http://127.0.0.1:43123/b/neon-harbor) | `hello@neonharbor.band` / `NEON_HARBOR_DEMO_PASSWORD` from `.env` |

Seed is **idempotent**: re-running `npm run db:seed` ensures users and memberships exist but does **not** overwrite existing tenant content or user passwords.

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
| `DATABASE_URL` | PostgreSQL connection string (Neon on Vercel) |
| `AUTH_SECRET` | JWT session signing secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for admin uploads (optional locally) |
| `FORCE_FED_ADMIN_EMAIL` | Force Fed seed admin email |
| `FORCE_FED_ADMIN_PASSWORD` | Force Fed seed admin password (required for seed) |
| `NEON_HARBOR_DEMO_PASSWORD` | Neon Harbor demo password (optional; random on first seed if unset) |
| `ALLOW_DEV_MAGIC_LINK` | Set to `true` to expose magic links in API responses outside production (dev only) |

Static seed assets live under `public/seeds/` and are served by Next.js; they are not uploaded to Blob.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **43123** |
| `npm run build` | `prisma generate`, `prisma migrate deploy`, then `next build` |
| `npm run db:seed` | Idempotent seed for Force Fed + Neon Harbor (manual; not part of build) |
| `npm run db:migrate` | `prisma migrate dev` (local schema changes) |
| `npm run db:reset` | Drop DB, migrate, seed |

## Deploying on Vercel

1. Connect the repo and add Neon Postgres (Vercel sets `DATABASE_URL` and related Postgres vars).
2. Set `AUTH_SECRET`, `FORCE_FED_ADMIN_*`, `NEON_HARBOR_DEMO_PASSWORD`, and `BLOB_READ_WRITE_TOKEN` in the Vercel project.
3. Deploy — the build runs migrations automatically.
4. **Once after first deploy** (or any fresh database), run the seed from your machine or Vercel CLI:

   ```bash
   npm run db:seed
   ```

   Use env vars from the Vercel project (`vercel env pull` + run locally, or a one-off command with the same env).

**Magic link auth:** disabled in production (`NODE_ENV=production`). Use password sign-in on Vercel. Magic links are only issued in non-production when the account already exists (no auto-registration).

## Project structure

```
src/app/b/[slug]     Public band sites (multi-tenant)
src/app/admin        Band admin portal
src/app/onboarding   New band wizard
src/components/templates   Editorial, Poster, Gallery layouts
prisma/              Schema + migrations + seed
public/seeds/force-fed     Ported public assets
```
