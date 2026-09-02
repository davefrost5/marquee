"use client";

import { useMemo, useState } from "react";
import type { TenantPublicData } from "@/lib/types";

function SectionHead({
  num,
  title,
  sub,
  theme,
}: {
  num: string;
  title: string;
  sub: string;
  theme: TenantPublicData["theme"];
}) {
  return (
    <div
      className="mb-6 flex items-baseline gap-4 border-b-2 pb-2.5"
      style={{ borderColor: theme.secondaryColor }}
    >
      <span
        className="font-display text-4xl leading-none"
        style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}
      >
        {num}
      </span>
      <h2
        className="m-0 font-display text-2xl uppercase tracking-wide md:text-3xl"
        style={{ color: theme.textColor, fontFamily: theme.headingFont }}
      >
        {title}
      </h2>
      <p
        className="ml-auto hidden max-w-[50%] text-right text-xs uppercase tracking-[0.14em] opacity-65 sm:block"
        style={{ fontFamily: theme.accentFont }}
      >
        {sub}
      </p>
    </div>
  );
}

function MusicSection({ tenant }: { tenant: TenantPublicData }) {
  const artistId = tenant.spotifyArtistId;
  if (!artistId) return null;
  const embed = `https://open.spotify.com/embed/artist/${artistId}?utm_source=generator&theme=0`;
  const profile = `https://open.spotify.com/artist/${artistId}`;

  return (
    <section id="music" className="scroll-mt-20 px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHead num="02" title="Music" sub="Listen on Spotify" theme={tenant.theme} />
        <p className="mb-6 max-w-2xl opacity-80">
          Stream {tenant.name} on Spotify — no account required for the player below.
        </p>
        <div className="overflow-hidden rounded border-2" style={{ borderColor: tenant.theme.secondaryColor }}>
          <iframe
            src={embed}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`${tenant.name} on Spotify`}
            className="border-0"
          />
        </div>
        <a
          href={profile}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-sm uppercase tracking-widest underline"
          style={{ fontFamily: tenant.theme.accentFont, color: tenant.theme.primaryColor }}
        >
          Open artist on Spotify
        </a>
      </div>
    </section>
  );
}

function ShowsSection({ tenant }: { tenant: TenantPublicData }) {
  return (
    <section id="shows" className="scroll-mt-20 px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHead num="03" title="Shows" sub="Upcoming gigs" theme={tenant.theme} />
        <p className="mb-8 max-w-2xl opacity-80">
          Catch us live — dates and venues below. More shows added as they&apos;re confirmed.
        </p>
        {tenant.shows.length === 0 ? (
          <p className="opacity-60">No upcoming shows posted yet. Check back soon.</p>
        ) : (
          <ul className="divide-y-2" style={{ borderColor: tenant.theme.secondaryColor }}>
            {tenant.shows.map((show) => (
              <li key={show.id} className="flex flex-wrap items-baseline gap-3 py-4">
                <span
                  className="min-w-[7rem] text-sm uppercase tracking-widest"
                  style={{ fontFamily: tenant.theme.accentFont, color: tenant.theme.primaryColor }}
                >
                  {new Date(show.date + "T12:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-medium">{show.venue}</span>
                <span className="opacity-70">{show.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function BookSection({ tenant }: { tenant: TenantPublicData }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    eventType: "",
    location: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const monthDays = useMemo(() => {
    const now = new Date();
    const days: string[] = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) {
      setError("Please select a date from the calendar");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");
    const res = await fetch(`/api/b/${tenant.slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, requestedDate: selectedDate }),
    });
    if (!res.ok) {
      setStatus("error");
      setError("Could not submit booking request");
      return;
    }
    setStatus("success");
    setForm({ name: "", email: "", eventType: "", location: "", message: "" });
    setSelectedDate(null);
  }

  return (
    <section id="book" className="scroll-mt-20 px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHead num="04" title="Book" sub="Calendar · request" theme={tenant.theme} />
        <p className="mb-8 max-w-2xl opacity-80">
          Select an available date and submit your booking request. We&apos;ll get back to you within 48 hours.
        </p>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest opacity-70" style={{ fontFamily: tenant.theme.accentFont }}>
              Available dates
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {monthDays.map((date) => {
                const available = tenant.availableDates.includes(date);
                const selected = selectedDate === date;
                return (
                  <button
                    key={date}
                    type="button"
                    disabled={!available}
                    onClick={() => available && setSelectedDate(date)}
                    className="rounded border px-2 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-30"
                    style={{
                      borderColor: tenant.theme.secondaryColor,
                      backgroundColor: selected ? tenant.theme.primaryColor : "transparent",
                      color: selected ? "#fff" : tenant.theme.textColor,
                      fontFamily: tenant.theme.accentFont,
                    }}
                  >
                    {new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </button>
                );
              })}
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4 rounded border-2 p-6" style={{ borderColor: tenant.theme.secondaryColor }}>
            <h3 className="font-display text-lg uppercase" style={{ fontFamily: tenant.theme.headingFont }}>
              Request Booking
            </h3>
            {error && <p className="text-sm text-red-700">{error}</p>}
            {status === "success" && (
              <p className="text-sm" style={{ color: tenant.theme.primaryColor }}>
                Request sent! We&apos;ll be in touch soon.
              </p>
            )}
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border-b bg-transparent py-2 outline-none"
              style={{ borderColor: tenant.theme.secondaryColor }}
            />
            <input
              required
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border-b bg-transparent py-2 outline-none"
              style={{ borderColor: tenant.theme.secondaryColor }}
            />
            <select
              required
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              className="w-full border-b bg-transparent py-2 outline-none"
              style={{ borderColor: tenant.theme.secondaryColor }}
            >
              <option value="">Event type</option>
              <option>Concert / Show</option>
              <option>Festival</option>
              <option>Private Event</option>
              <option>Corporate Event</option>
              <option>Other</option>
            </select>
            <input
              required
              placeholder="Event location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border-b bg-transparent py-2 outline-none"
              style={{ borderColor: tenant.theme.secondaryColor }}
            />
            <textarea
              placeholder="Additional details"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="min-h-24 w-full border bg-transparent p-2 outline-none"
              style={{ borderColor: tenant.theme.secondaryColor }}
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-full px-5 py-3 text-xs uppercase tracking-widest text-white disabled:opacity-50"
              style={{ backgroundColor: tenant.theme.primaryColor, fontFamily: tenant.theme.accentFont }}
            >
              {status === "submitting" ? "Sending…" : "Submit booking request"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function MediaSection({ tenant }: { tenant: TenantPublicData }) {
  return (
    <section id="media" className="scroll-mt-20 px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHead num="05" title="Photos and videos" sub="Live · studio" theme={tenant.theme} />
        <p className="mb-8 max-w-2xl opacity-80">
          Show and studio shots. Short clips lazy-load when someone presses play.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {tenant.mediaItems.map((item) =>
            item.type === "video" ? (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded border" style={{ borderColor: tenant.theme.secondaryColor }}>
                <video
                  controls
                  preload="none"
                  poster={item.thumbnailUrl ?? undefined}
                  className="h-full w-full object-cover"
                >
                  <source src={item.url} />
                </video>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                src={item.url}
                alt={item.caption ?? tenant.name}
                loading="lazy"
                className="aspect-square w-full rounded border object-cover"
                style={{ borderColor: tenant.theme.secondaryColor }}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function HeroSection({ tenant }: { tenant: TenantPublicData }) {
  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-20 pt-28 md:px-10 md:pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl text-center md:text-left">
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt={tenant.name} className="mb-6 h-16 w-auto md:h-20" />
          ) : (
            <h1
              className="font-display text-5xl uppercase leading-none md:text-7xl"
              style={{ fontFamily: tenant.theme.headingFont, color: tenant.theme.textColor }}
            >
              {tenant.name}
            </h1>
          )}
          <p
            className="mt-4 font-display text-2xl uppercase md:text-3xl"
            style={{ fontFamily: tenant.theme.headingFont, color: tenant.theme.primaryColor }}
          >
            {tenant.tagline}
          </p>
          {tenant.location && <p className="mt-3 opacity-75">{tenant.location}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <a
              href="#music"
              className="rounded-full px-5 py-3 text-xs uppercase tracking-widest text-white"
              style={{ backgroundColor: tenant.theme.primaryColor, fontFamily: tenant.theme.accentFont }}
            >
              Listen ▸
            </a>
            <a
              href="#book"
              className="rounded-full border-2 px-5 py-3 text-xs uppercase tracking-widest"
              style={{ borderColor: tenant.theme.secondaryColor, fontFamily: tenant.theme.accentFont }}
            >
              Book Us
            </a>
          </div>
        </div>
        {tenant.mascotUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tenant.mascotUrl}
            alt={`${tenant.name} mascot`}
            className="w-full max-w-xs drop-shadow-lg md:max-w-sm"
          />
        )}
      </div>
    </section>
  );
}

const sections = {
  hero: HeroSection,
  music: MusicSection,
  shows: ShowsSection,
  book: BookSection,
  media: MediaSection,
};

export function EditorialTemplate({ tenant }: { tenant: TenantPublicData }) {
  const nav = tenant.sectionOrder.filter((s) => s !== "hero");

  return (
    <div style={{ backgroundColor: tenant.theme.backgroundColor, color: tenant.theme.textColor, fontFamily: tenant.theme.bodyFont }}>
      <nav className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: `${tenant.theme.secondaryColor}33`, backgroundColor: `${tenant.theme.backgroundColor}ee` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <a href="#hero" className="text-sm uppercase tracking-widest" style={{ fontFamily: tenant.theme.accentFont }}>
            {tenant.name}
          </a>
          <div className="flex gap-4 text-xs uppercase tracking-widest" style={{ fontFamily: tenant.theme.accentFont }}>
            {nav.map((s) => (
              <a key={s} href={`#${s}`} className="opacity-80 hover:opacity-100">
                {s === "book" ? "Book" : s.charAt(0).toUpperCase() + s.slice(1)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {tenant.sectionOrder.map((id) => {
        const Component = sections[id];
        return Component ? <Component key={id} tenant={tenant} /> : null;
      })}

      <footer className="border-t px-6 py-10 md:px-10" style={{ borderColor: tenant.theme.secondaryColor }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg uppercase" style={{ fontFamily: tenant.theme.headingFont }}>
              {tenant.name}
            </p>
            {tenant.location && <p className="opacity-70">{tenant.location}</p>}
          </div>
          <a href={`mailto:${tenant.bookingEmail}`} className="underline" style={{ color: tenant.theme.primaryColor }}>
            {tenant.bookingEmail}
          </a>
          <p className="text-sm opacity-50">© {new Date().getFullYear()} {tenant.name}</p>
        </div>
      </footer>
    </div>
  );
}
