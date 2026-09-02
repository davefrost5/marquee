import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    return NextResponse.json({ error: "Band not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, email, eventType, location, message, requestedDate } = body;

  if (!name || !email || !eventType || !location || !requestedDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.create({
    data: {
      tenantId: tenant.id,
      name,
      email,
      eventType,
      location,
      message: message ?? null,
      requestedDate,
    },
  });

  return NextResponse.json({ ok: true, id: booking.id });
}
