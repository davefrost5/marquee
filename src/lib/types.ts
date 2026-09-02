export type TemplateId = "editorial" | "poster" | "magazine";

export type SectionId = "hero" | "music" | "shows" | "book" | "media";

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  accentFont: string;
}

export interface TenantPublicData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string | null;
  bookingEmail: string;
  template: TemplateId;
  theme: TenantTheme;
  logoUrl: string | null;
  heroImageUrl: string | null;
  mascotUrl: string | null;
  spotifyArtistId: string | null;
  sectionOrder: SectionId[];
  shows: Array<{ id: string; date: string; time: string; venue: string }>;
  availableDates: string[];
  mediaItems: Array<{
    id: string;
    type: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    sortOrder: number;
  }>;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  tenantId: string | null;
  tenantSlug: string | null;
}

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  "hero",
  "music",
  "shows",
  "book",
  "media",
];

export const TEMPLATE_OPTIONS = [
  {
    id: "editorial" as const,
    name: "Editorial",
    description: "Dark accents on warm paper — numbered sections, zine energy.",
    preview: "Force Fed–style one-pager",
  },
  {
    id: "poster" as const,
    name: "Tour Poster",
    description: "Bold blocks, high contrast, gig-poster typography.",
    preview: "All-caps headlines, stacked dates",
  },
  {
    id: "magazine" as const,
    name: "Gallery",
    description: "Clean magazine layout with generous whitespace.",
    preview: "Photo-forward, refined grid",
  },
];
