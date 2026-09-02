import { prisma } from "./db";
import type { SectionId, TenantPublicData, TemplateId } from "./types";
import { DEFAULT_SECTION_ORDER } from "./types";

export function parseSectionOrder(raw: string): SectionId[] {
  try {
    const parsed = JSON.parse(raw) as SectionId[];
    return parsed.length > 0 ? parsed : DEFAULT_SECTION_ORDER;
  } catch {
    return DEFAULT_SECTION_ORDER;
  }
}

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
    include: {
      shows: { orderBy: [{ date: "asc" }, { time: "asc" }] },
      availableDates: { orderBy: { date: "asc" } },
      mediaItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export function toPublicTenant(tenant: NonNullable<Awaited<ReturnType<typeof getTenantBySlug>>>): TenantPublicData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    tagline: tenant.tagline,
    location: tenant.location,
    bookingEmail: tenant.bookingEmail,
    template: tenant.template as TemplateId,
    theme: {
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      backgroundColor: tenant.backgroundColor,
      textColor: tenant.textColor,
      headingFont: tenant.headingFont,
      bodyFont: tenant.bodyFont,
      accentFont: tenant.accentFont,
    },
    logoUrl: tenant.logoUrl,
    heroImageUrl: tenant.heroImageUrl,
    mascotUrl: tenant.mascotUrl,
    spotifyArtistId: tenant.spotifyArtistId,
    sectionOrder: parseSectionOrder(tenant.sectionOrder),
    shows: tenant.shows.filter((s) => s.date >= today),
    availableDates: tenant.availableDates.map((d) => d.date),
    mediaItems: tenant.mediaItems,
  };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function isSlugAvailable(slug: string, excludeTenantId?: string): Promise<boolean> {
  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (!existing) return true;
  return excludeTenantId ? existing.id === excludeTenantId : false;
}
