"use client";

import { useMemo, useState } from "react";
import type { TenantPublicData } from "@/lib/types";

function BookBlock({ tenant }: { tenant: TenantPublicData }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", eventType: "", location: "", message: "" });
  const [done, setDone] = useState(false);
  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 45 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;
    const res = await fetch(`/api/b/${tenant.slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, requestedDate: selectedDate }),
    });
    if (res.ok) setDone(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="flex flex-wrap gap-2">
        {days.map((date) => {
          const ok = tenant.availableDates.includes(date);
          const on = selectedDate === date;
          return (
            <button
              key={date}
              type="button"
              disabled={!ok}
              onClick={() => ok && setSelectedDate(date)}
              className="rounded-full px-3 py-1.5 text-sm disabled:opacity-25"
              style={{
                background: on ? tenant.theme.primaryColor : `${tenant.theme.secondaryColor}15`,
                color: on ? "#fff" : tenant.theme.textColor,
              }}
            >
              {new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </button>
          );
        })}
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        {done ? (
          <p style={{ color: tenant.theme.primaryColor }}>Thanks — we&apos;ll reply within 48 hours.</p>
        ) : (
          <>
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-b py-2 outline-none" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border-b py-2 outline-none" />
            <select required value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="w-full border-b py-2">
              <option value="">Event type</option>
              <option>Concert</option>
              <option>Private Event</option>
              <option>Festival</option>
            </select>
            <input required placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border-b py-2 outline-none" />
            <button type="submit" className="rounded-full px-6 py-3 text-sm text-white" style={{ background: tenant.theme.primaryColor }}>
              Request date
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export function MagazineTemplate({ tenant }: { tenant: TenantPublicData }) {
  const { theme } = tenant;

  return (
    <div className="min-h-screen bg-white" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <header className="mx-auto max-w-6xl px-6 pb-16 pt-24 md:px-10">
        <p className="text-xs uppercase tracking-[0.35em] opacity-50" style={{ fontFamily: theme.accentFont }}>
          {tenant.location}
        </p>
        <h1
          className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl"
          style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}
        >
          {tenant.name}
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed opacity-80">{tenant.tagline}</p>
        <div className="mt-8 flex gap-4 text-sm">
          <a href="#music" className="underline underline-offset-4">Music</a>
          <a href="#shows" className="underline underline-offset-4">Shows</a>
          <a href="#book" className="underline underline-offset-4">Book</a>
          <a href="#media" className="underline underline-offset-4">Gallery</a>
        </div>
      </header>

      {tenant.heroImageUrl && (
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tenant.heroImageUrl} alt="" className="aspect-[21/9] w-full rounded-2xl object-cover" />
        </div>
      )}

      {tenant.sectionOrder.includes("music") && tenant.spotifyArtistId && (
        <section id="music" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:px-10">
          <h2 className="mb-8 text-sm uppercase tracking-[0.3em] opacity-50">Now playing</h2>
          <iframe
            src={`https://open.spotify.com/embed/artist/${tenant.spotifyArtistId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="max-w-xl rounded-xl"
            title="Spotify"
          />
        </section>
      )}

      {tenant.sectionOrder.includes("shows") && (
        <section id="shows" className="scroll-mt-20 bg-neutral-50 py-20">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <h2 className="mb-10 text-3xl" style={{ fontFamily: theme.headingFont }}>Upcoming shows</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {tenant.shows.map((show) => (
                <article key={show.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-widest opacity-50">{show.time}</p>
                  <h3 className="mt-2 text-2xl" style={{ fontFamily: theme.headingFont }}>{show.venue}</h3>
                  <p className="mt-2 opacity-70">
                    {new Date(show.date + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {tenant.sectionOrder.includes("media") && (
        <section id="media" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:px-10">
          <h2 className="mb-10 text-3xl" style={{ fontFamily: theme.headingFont }}>Gallery</h2>
          <div className="columns-2 gap-4 md:columns-3">
            {tenant.mediaItems.map((item) =>
              item.type === "video" ? (
                <video key={item.id} controls preload="none" poster={item.thumbnailUrl ?? undefined} className="mb-4 w-full rounded-lg" src={item.url} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id} src={item.url} alt={item.caption ?? ""} loading="lazy" className="mb-4 w-full rounded-lg" />
              ),
            )}
          </div>
        </section>
      )}

      {tenant.sectionOrder.includes("book") && (
        <section id="book" className="scroll-mt-20 border-t py-20">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <h2 className="mb-4 text-3xl" style={{ fontFamily: theme.headingFont }}>Book {tenant.name}</h2>
            <p className="mb-10 max-w-xl opacity-70">Pick an open date and tell us about your event.</p>
            <BookBlock tenant={tenant} />
          </div>
        </section>
      )}

      <footer className="border-t py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 md:flex-row md:justify-between md:px-10">
          <span>{tenant.name}</span>
          <a href={`mailto:${tenant.bookingEmail}`} style={{ color: theme.primaryColor }}>{tenant.bookingEmail}</a>
        </div>
      </footer>
    </div>
  );
}
