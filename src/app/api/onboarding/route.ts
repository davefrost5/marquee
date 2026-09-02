import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionToken, getSession, setSessionCookie } from "@/lib/auth";
import { isSlugAvailable, slugify } from "@/lib/tenant";
import { saveUpload } from "@/lib/uploads";

export async function POST(request: Request) {
  const session = await getSession();
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const step = String(form.get("step") ?? "");
    const payloadRaw = form.get("payload");
    const payload = payloadRaw ? JSON.parse(String(payloadRaw)) : {};

    if (step === "create-account") {
      const email = String(form.get("email") ?? "").toLowerCase().trim();
      const password = String(form.get("password") ?? "");
      if (!email || password.length < 8) {
        return NextResponse.json({ error: "Valid email and password (8+ chars) required" }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Account already exists — sign in instead" }, { status: 409 });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hash, name: payload.bandName ?? null },
      });
      const token = await createSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: null,
        tenantSlug: null,
      });
      await setSessionCookie(token);
      return NextResponse.json({ ok: true, userId: user.id });
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (step === "finalize") {
      const slug = slugify(String(payload.slug ?? payload.bandName ?? ""));
      if (!slug || !(await isSlugAvailable(slug))) {
        return NextResponse.json({ error: "Slug unavailable" }, { status: 400 });
      }

      let logoUrl: string | null = null;
      let heroImageUrl: string | null = null;
      const logoFile = form.get("logo");
      const heroFile = form.get("heroImage");
      const tenantId = `pending-${session.id}`;

      if (logoFile instanceof File && logoFile.size > 0) {
        logoUrl = await saveUpload(logoFile, tenantId, "logo");
      }
      if (heroFile instanceof File && heroFile.size > 0) {
        heroImageUrl = await saveUpload(heroFile, tenantId, "hero");
      }

      const tenant = await prisma.tenant.create({
        data: {
          slug,
          name: String(payload.bandName ?? "My Band"),
          tagline: String(payload.tagline ?? ""),
          location: payload.location ? String(payload.location) : null,
          bookingEmail: String(payload.bookingEmail ?? session.email),
          template: String(payload.template ?? "editorial"),
          primaryColor: String(payload.primaryColor ?? "#c8281f"),
          secondaryColor: String(payload.secondaryColor ?? "#0b0b0b"),
          backgroundColor: String(payload.backgroundColor ?? "#f3ece0"),
          textColor: String(payload.textColor ?? "#0b0b0b"),
          headingFont: String(payload.headingFont ?? "Bowlby One"),
          bodyFont: String(payload.bodyFont ?? "DM Sans"),
          accentFont: String(payload.accentFont ?? "DM Mono"),
          logoUrl,
          heroImageUrl,
          spotifyArtistId: payload.spotifyArtistId ? String(payload.spotifyArtistId) : null,
          sectionOrder: JSON.stringify(payload.sectionOrder ?? ["hero", "music", "shows", "book", "media"]),
          onboardingComplete: true,
          members: { create: { userId: session.id, role: "admin" } },
        },
      });

      const token = await createSessionToken({
        ...session,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      });
      await setSessionCookie(token);

      return NextResponse.json({ ok: true, slug: tenant.slug, siteUrl: `/b/${tenant.slug}` });
    }

    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  }

  const body = await request.json();
  const { step, ...payload } = body as { step: string; [key: string]: unknown };

  if (step === "check-slug") {
    const slug = slugify(String(payload.slug ?? ""));
    const available = slug ? await isSlugAvailable(slug) : false;
    return NextResponse.json({ slug, available });
  }

  return NextResponse.json({ error: "Unsupported request" }, { status: 400 });
}
