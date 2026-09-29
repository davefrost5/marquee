import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

function magicLinkRequestsAllowed() {
  if (process.env.ALLOW_DEV_MAGIC_LINK === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, mode, magicToken } = body as {
    email?: string;
    password?: string;
    mode?: "password" | "magic";
    magicToken?: string;
  };

  if (mode === "magic" && magicToken) {
    const link = await prisma.magicLink.findUnique({
      where: { token: magicToken },
      include: {
        user: {
          include: {
            tenants: { include: { tenant: true }, take: 1 },
          },
        },
      },
    });

    if (!link || link.usedAt || link.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired magic link" }, { status: 401 });
    }

    await prisma.magicLink.update({
      where: { id: link.id },
      data: { usedAt: new Date() },
    });

    const membership = link.user.tenants[0];
    const token = await createSessionToken({
      id: link.user.id,
      email: link.user.email,
      name: link.user.name,
      tenantId: membership?.tenantId ?? null,
      tenantSlug: membership?.tenant.slug ?? null,
    });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, tenantSlug: membership?.tenant.slug ?? null });
  }

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (mode === "magic") {
    if (!magicLinkRequestsAllowed()) {
      return NextResponse.json(
        {
          error:
            "Magic link sign-in is disabled in production. Use password sign-in or set ALLOW_DEV_MAGIC_LINK=true only in non-production environments.",
        },
        { status: 403 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email. Create an account via onboarding or use password sign-in." },
        { status: 404 },
      );
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await prisma.magicLink.create({
      data: { token, userId: user.id, expiresAt },
    });

    const origin = new URL(request.url).origin;
    const magicUrl = `${origin}/login?token=${token}`;

    return NextResponse.json({
      ok: true,
      message: "Magic link created",
      magicUrl,
      devNote: "Development only: magic link is returned in the response. It is never returned when NODE_ENV=production unless ALLOW_DEV_MAGIC_LINK=true.",
    });
  }

  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      tenants: { include: { tenant: true }, take: 1 },
    },
  });

  if (!user?.password || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const membership = user.tenants[0];
  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    tenantId: membership?.tenantId ?? null,
    tenantSlug: membership?.tenant.slug ?? null,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, tenantSlug: membership?.tenant.slug ?? null });
}
