"use client";

import { useMemo, useState } from "react";
import type { TenantPublicData } from "@/lib/types";

function BookForm({ tenant }: { tenant: TenantPublicData }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", eventType: "", location: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const monthDays = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 60 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;
    setStatus("submitting");
    const res = await fetch(`/api/b/${tenant.slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, requestedDate: selectedDate }),
    });
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid grid-cols-4 gap-2">
        {monthDays.map((date) => {
          const available = tenant.availableDates.includes(date);
          const selected = selectedDate === date;
          return (
            <button
              key={date}
              type="button"
              disabled={!available}
              onClick={() => available && setSelectedDate(date)}
              className="border-2 px-2 py-3 text-xs font-bold uppercase disabled:opacity-20"
              style={{
                borderColor: tenant.theme.primaryColor,
                background: selected ? tenant.theme.primaryColor : "transparent",
                color: selected ? tenant.theme.backgroundColor : tenant.theme.textColor,
              }}
            >
              {new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </button>
          );
        })}
      </div>
      <form onSubmit={submit} className="space-y-3 border-4 p-6" style={{ borderColor: tenant.theme.secondaryColor }}>
        {["name", "email", "location"].map((field) => (
          <input
            key={field}
            required={field !== "location"}
            type={field === "email" ? "email" : "text"}
            placeholder={field}
            value={form[field as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full border-b-2 bg-transparent py-2 uppercase outline-none"
            style={{ borderColor: tenant.theme.primaryColor }}
          />
        ))}
        <select
          required
          value={form.eventType}
          onChange={(e) => setForm({ ...form, eventType: e.target.value })}
          className="w-full border-b-2 bg-transparent py-2 uppercase"
          style={{ borderColor: tenant.theme.primaryColor }}
        >
          <option value="">Event type</option>
          <option>Concert</option>
          <option>Private</option>
          <option>Festival</option>
        </select>
        <button
          type="submit"
          className="w-full py-4 text-sm font-black uppercase tracking-[0.3em]"
          style={{ background: tenant.theme.primaryColor, color: tenant.theme.backgroundColor }}
        >
          {status === "success" ? "Sent!" : "Book the band"}
        </button>
      </form>
    </div>
  );
}

export function PosterTemplate({ tenant }: { tenant: TenantPublicData }) {
  const { theme } = tenant;

  return (
    <div className="min-h-screen" style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont }}>
      <header className="relative overflow-hidden px-6 py-20 md:px-12 md:py-28">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `repeating-linear-gradient(-12deg, ${theme.primaryColor}, ${theme.primaryColor} 12px, transparent 12px, transparent 24px)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-sm font-black uppercase tracking-[0.5em]" style={{ color: theme.secondaryColor }}>
            On tour
          </p>
          <h1
            className="mt-4 text-[clamp(3rem,12vw,9rem)] font-black uppercase leading-[0.85]"
            style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}
          >
            {tenant.name}
          </h1>
          <p className="mt-6 max-w-xl text-xl font-bold uppercase tracking-wide">{tenant.tagline}</p>
          {tenant.location && <p className="mt-2 opacity-70">{tenant.location}</p>}
        </div>
      </header>

      {tenant.sectionOrder.includes("music") && tenant.spotifyArtistId && (
        <section id="music" className="scroll-mt-16 border-y-4 px-6 py-12 md:px-12" style={{ borderColor: theme.primaryColor }}>
          <h2 className="mb-6 text-4xl font-black uppercase" style={{ fontFamily: theme.headingFont }}>Music</h2>
          <iframe
            src={`https://open.spotify.com/embed/artist/${tenant.spotifyArtistId}?utm_source=generator&theme=0`}
            width="100%"
            height="280"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-4 border-white/10"
            title="Spotify"
          />
        </section>
      )}

      {tenant.sectionOrder.includes("shows") && (
        <section id="shows" className="scroll-mt-16 px-6 py-12 md:px-12">
          <h2 className="mb-8 text-5xl font-black uppercase" style={{ fontFamily: theme.headingFont, color: theme.secondaryColor }}>
            Dates
          </h2>
          <div className="space-y-0">
            {tenant.shows.map((show) => (
              <div
                key={show.id}
                className="grid grid-cols-[1fr_auto] gap-4 border-t-4 py-5 md:grid-cols-[12rem_1fr_auto]"
                style={{ borderColor: theme.primaryColor }}
              >
                <span className="text-2xl font-black" style={{ color: theme.primaryColor }}>
                  {new Date(show.date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <span className="text-xl font-bold uppercase">{show.venue}</span>
                <span className="opacity-70">{show.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {tenant.sectionOrder.includes("media") && (
        <section id="media" className="scroll-mt-16 px-6 py-12 md:px-12">
          <h2 className="mb-6 text-4xl font-black uppercase" style={{ fontFamily: theme.headingFont }}>Media</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {tenant.mediaItems.map((item) =>
              item.type === "video" ? (
                <video key={item.id} controls preload="none" poster={item.thumbnailUrl ?? undefined} className="aspect-square w-full object-cover" src={item.url} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id} src={item.url} alt={item.caption ?? ""} loading="lazy" className="aspect-square w-full object-cover" />
              ),
            )}
          </div>
        </section>
      )}

      {tenant.sectionOrder.includes("book") && (
        <section id="book" className="scroll-mt-16 border-t-4 px-6 py-12 md:px-12" style={{ borderColor: theme.secondaryColor }}>
          <h2 className="mb-8 text-4xl font-black uppercase" style={{ fontFamily: theme.headingFont }}>Book</h2>
          <BookForm tenant={tenant} />
        </section>
      )}

      <footer className="px-6 py-10 md:px-12" style={{ background: theme.secondaryColor, color: theme.backgroundColor }}>
        <p className="text-2xl font-black uppercase">{tenant.name}</p>
        <a href={`mailto:${tenant.bookingEmail}`} className="mt-2 inline-block underline">
          {tenant.bookingEmail}
        </a>
      </footer>
    </div>
  );
}
