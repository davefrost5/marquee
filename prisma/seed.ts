import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

const FORCE_FED_SHOWS = [
  { date: "2026-05-22", time: "5:00 PM", venue: "The Columns, Avon" },
  { date: "2026-06-02", time: "7", venue: "Private Party" },
  { date: "2026-06-06", time: "8:30", venue: "Private Party" },
  { date: "2026-06-07", time: "2-5", venue: "D'Arcy's Tavern - Bradley Beach" },
  { date: "2026-06-12", time: "3-6", venue: "Acoustic-ish Pig and Parrot Brielle" },
  { date: "2026-06-13", time: "9:30", venue: "Reef and Barrel" },
  { date: "2026-06-14", time: "3", venue: "Joe's Surf Shack" },
  { date: "2026-06-18", time: "9/10-?", venue: "Spring Lake Tap House" },
  { date: "2026-06-19", time: "7", venue: "Private Party" },
  { date: "2026-06-20", time: "7", venue: "Private Party" },
  { date: "2026-06-28", time: "5", venue: "The Columns" },
  { date: "2026-07-02", time: "7", venue: "Private Party" },
  { date: "2026-07-03", time: "12-4", venue: "Martells Tiki" },
  { date: "2026-07-03", time: "6", venue: "Private Party" },
  { date: "2026-07-04", time: "7", venue: "Private Party" },
  { date: "2026-07-10", time: "5", venue: "The Columns" },
  { date: "2026-07-11", time: "8", venue: "Private Party" },
  { date: "2026-07-17", time: "3-6", venue: "Acoustic-ish Pig and Parrot" },
  { date: "2026-07-17", time: "7", venue: "Private Party" },
  { date: "2026-07-17", time: "1-5", venue: "Martells Tiki Bar" },
  { date: "2026-07-23", time: "4/5", venue: "Acoustic-ish La Dolce Vita, Belmar" },
  { date: "2026-07-25", time: "7", venue: "Private Party" },
  { date: "2026-07-26", time: "5", venue: "The Columns" },
  { date: "2026-07-30", time: "4/5", venue: "Acoustic-ish La Dolce Vita, Belmar" },
  { date: "2026-08-01", time: "7", venue: "Private Party" },
  { date: "2026-08-02", time: "5-8", venue: "Acoustic-ish Kelly's Tavern" },
  { date: "2026-08-07", time: "7", venue: "Private Party" },
  { date: "2026-08-08", time: "7", venue: "Private Party" },
  { date: "2026-08-09", time: "2", venue: "B2B Bistro Bayville" },
  { date: "2026-08-14", time: "3-6", venue: "Pig and Parrot" },
  { date: "2026-08-14", time: "9", venue: "Low Dive" },
  { date: "2026-08-15", time: "TBD", venue: "The Columns" },
  { date: "2026-08-21", time: "7", venue: "Acoustic-ish Deal Lake Bar & Co" },
];

async function ensureTenantMembership(userId: string, tenantId: string) {
  await prisma.tenantMember.upsert({
    where: { userId_tenantId: { userId, tenantId } },
    create: { userId, tenantId, role: "admin" },
    update: {},
  });
}

async function seedForceFed(adminEmail: string, passwordHash: string) {
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: passwordHash,
      name: "Force Fed Admin",
    },
    update: {},
  });

  let forceFed = await prisma.tenant.findUnique({ where: { slug: "force-fed" } });
  if (!forceFed) {
    forceFed = await prisma.tenant.create({
      data: {
        slug: "force-fed",
        name: "Force Fed",
        tagline: "Come and get it!!!",
        location: "Punk rock from Belmar, NJ.",
        bookingEmail: "booking@forcefed.com",
        template: "editorial",
        primaryColor: "#c8281f",
        secondaryColor: "#0b0b0b",
        backgroundColor: "#f3ece0",
        textColor: "#0b0b0b",
        headingFont: "Bowlby One",
        bodyFont: "DM Sans",
        accentFont: "DM Mono",
        logoUrl: "/seeds/force-fed/brand/wordmark.png",
        mascotUrl: "/seeds/force-fed/brand/mascot.png",
        heroImageUrl: "/seeds/force-fed/brand/mascot.png",
        spotifyArtistId: "2oTji86BbU6FC6ZMh",
        sectionOrder: JSON.stringify(["hero", "music", "shows", "book", "media"]),
        onboardingComplete: true,
        shows: { create: FORCE_FED_SHOWS },
        availableDates: {
          create: [{ date: "2026-09-15" }, { date: "2026-09-20" }, { date: "2026-10-04" }],
        },
        mediaItems: {
          create: [
            ...Array.from({ length: 14 }, (_, i) => ({
              type: "image",
              url: `/seeds/force-fed/media/shane-gallery/${String(i + 1).padStart(2, "0")}.jpg`,
              caption: `Force Fed — photo ${i + 1}`,
              sortOrder: i,
            })),
            {
              type: "video",
              url: "/seeds/force-fed/media/clips/forces-6142.mp4",
              thumbnailUrl: "/seeds/force-fed/media/clips/forces-6142.jpg",
              caption: "Live clip",
              sortOrder: 20,
            },
            {
              type: "video",
              url: "/seeds/force-fed/media/clips/forces-6146.mp4",
              thumbnailUrl: "/seeds/force-fed/media/clips/forces-6146.jpg",
              caption: "Studio clip",
              sortOrder: 21,
            },
            {
              type: "video",
              url: "/seeds/force-fed/media/clips/forces-6214.mp4",
              thumbnailUrl: "/seeds/force-fed/media/clips/forces-6214.jpg",
              caption: "Show clip",
              sortOrder: 22,
            },
          ],
        },
      },
    });
    console.log("Created Force Fed tenant with demo shows and media.");
  } else {
    console.log("Force Fed tenant already exists — skipped demo content (preserves edits).");
  }

  await ensureTenantMembership(admin.id, forceFed.id);
  return { admin, forceFed };
}

async function seedNeonHarbor(demoPasswordHash: string) {
  const demoEmail = "hello@neonharbor.band";
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      email: demoEmail,
      password: demoPasswordHash,
      name: "Neon Harbor",
    },
    update: {},
  });

  let neonHarbor = await prisma.tenant.findUnique({ where: { slug: "neon-harbor" } });
  if (!neonHarbor) {
    neonHarbor = await prisma.tenant.create({
      data: {
        slug: "neon-harbor",
        name: "Neon Harbor",
        tagline: "Synth-pop for midnight drives",
        location: "Asbury Park, NJ",
        bookingEmail: "bookings@neonharbor.band",
        template: "poster",
        primaryColor: "#ff006e",
        secondaryColor: "#8338ec",
        backgroundColor: "#0a0a12",
        textColor: "#f8f9fa",
        headingFont: "Anton",
        bodyFont: "Inter",
        accentFont: "Space Mono",
        spotifyArtistId: "4NHQUGzhtTLFYS5hGJFlVs",
        sectionOrder: JSON.stringify(["hero", "music", "shows", "media", "book"]),
        onboardingComplete: true,
        shows: {
          create: [
            { date: "2026-09-12", time: "8:00 PM", venue: "The Saint, Asbury Park" },
            { date: "2026-10-18", time: "9:00 PM", venue: "Berkeley Oceanfront" },
          ],
        },
        availableDates: {
          create: [{ date: "2026-11-01" }, { date: "2026-11-15" }],
        },
        mediaItems: {
          create: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
              caption: "Live at The Saint",
              sortOrder: 0,
            },
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=800&q=80",
              caption: "Studio session",
              sortOrder: 1,
            },
          ],
        },
      },
    });
    console.log("Created Neon Harbor tenant with demo content.");
  } else {
    console.log("Neon Harbor tenant already exists — skipped demo content (preserves edits).");
  }

  await ensureTenantMembership(demoUser.id, neonHarbor.id);
}

async function main() {
  const adminPassword = process.env.FORCE_FED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      "FORCE_FED_ADMIN_PASSWORD must be set (see .env.example) before seeding.",
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const demoPassword = await bcrypt.hash(
    process.env.NEON_HARBOR_DEMO_PASSWORD ?? randomBytes(24).toString("base64url"),
    10,
  );

  const { admin, forceFed } = await seedForceFed(
    process.env.FORCE_FED_ADMIN_EMAIL ?? "admin@forcefed.com",
    passwordHash,
  );
  await seedNeonHarbor(demoPassword);

  console.log("Seed complete. Force Fed slug:", forceFed.slug);
  console.log("Admin user:", admin.email, "(password from FORCE_FED_ADMIN_PASSWORD on first create only)");
  console.log(
    "Demo band user: hello@neonharbor.band",
    process.env.NEON_HARBOR_DEMO_PASSWORD
      ? "(password from NEON_HARBOR_DEMO_PASSWORD on first create only)"
      : "(random password on first create; set NEON_HARBOR_DEMO_PASSWORD to choose one)",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
