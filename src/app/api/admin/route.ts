import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseSectionOrder } from "@/lib/tenant";

async function getAdminTenant(sessionUserId: string) {
  const membership = await prisma.tenantMember.findFirst({
    where: { userId: sessionUserId },
    include: {
      tenant: {
        include: {
          shows: { orderBy: [{ date: "asc" }, { time: "asc" }] },
          availableDates: { orderBy: { date: "asc" } },
          bookingRequests: { orderBy: { createdAt: "desc" } },
          mediaItems: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  return membership?.tenant ?? null;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant(session.id);
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 404 });

  return NextResponse.json({
    tenant: {
      ...tenant,
      sectionOrder: parseSectionOrder(tenant.sectionOrder),
    },
    user: { email: session.email, name: session.name },
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { section, data } = body as { section: string; data: Record<string, unknown> };

  if (section === "site") {
    const updated = await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        name: data.name as string | undefined,
        tagline: data.tagline as string | undefined,
        location: data.location as string | undefined,
        bookingEmail: data.bookingEmail as string | undefined,
        template: data.template as string | undefined,
        primaryColor: data.primaryColor as string | undefined,
        secondaryColor: data.secondaryColor as string | undefined,
        backgroundColor: data.backgroundColor as string | undefined,
        textColor: data.textColor as string | undefined,
        headingFont: data.headingFont as string | undefined,
        bodyFont: data.bodyFont as string | undefined,
        accentFont: data.accentFont as string | undefined,
        spotifyArtistId: data.spotifyArtistId as string | undefined,
        sectionOrder: data.sectionOrder
          ? JSON.stringify(data.sectionOrder)
          : undefined,
        logoUrl: data.logoUrl as string | undefined,
        heroImageUrl: data.heroImageUrl as string | undefined,
        mascotUrl: data.mascotUrl as string | undefined,
      },
    });
    return NextResponse.json({ ok: true, tenant: updated });
  }

  if (section === "shows") {
    if (data.action === "add") {
      const show = await prisma.show.create({
        data: {
          tenantId: session.tenantId,
          date: String(data.date),
          time: String(data.time),
          venue: String(data.venue),
        },
      });
      return NextResponse.json({ ok: true, show });
    }
    if (data.action === "delete") {
      await prisma.show.delete({ where: { id: String(data.id) } });
      return NextResponse.json({ ok: true });
    }
  }

  if (section === "availability") {
    if (data.action === "add") {
      try {
        const item = await prisma.availableDate.create({
          data: { tenantId: session.tenantId, date: String(data.date) },
        });
        return NextResponse.json({ ok: true, item });
      } catch {
        return NextResponse.json({ error: "Date already exists" }, { status: 409 });
      }
    }
    if (data.action === "delete") {
      await prisma.availableDate.delete({ where: { id: String(data.id) } });
      return NextResponse.json({ ok: true });
    }
  }

  if (section === "bookings") {
    await prisma.bookingRequest.update({
      where: { id: String(data.id) },
      data: { status: String(data.status) },
    });
    return NextResponse.json({ ok: true });
  }

  if (section === "media") {
    if (data.action === "add") {
      const item = await prisma.mediaItem.create({
        data: {
          tenantId: session.tenantId,
          type: String(data.type),
          url: String(data.url),
          thumbnailUrl: data.thumbnailUrl ? String(data.thumbnailUrl) : null,
          caption: data.caption ? String(data.caption) : null,
          sortOrder: Number(data.sortOrder ?? 0),
        },
      });
      return NextResponse.json({ ok: true, item });
    }
    if (data.action === "delete") {
      await prisma.mediaItem.delete({ where: { id: String(data.id) } });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Unknown section" }, { status: 400 });
}
