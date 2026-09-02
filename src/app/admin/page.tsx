"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TEMPLATE_OPTIONS, type SectionId } from "@/lib/types";

type AdminTenant = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string | null;
  bookingEmail: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  accentFont: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  mascotUrl: string | null;
  spotifyArtistId: string | null;
  sectionOrder: SectionId[];
  shows: Array<{ id: string; date: string; time: string; venue: string }>;
  availableDates: Array<{ id: string; date: string }>;
  bookingRequests: Array<{
    id: string;
    name: string;
    email: string;
    eventType: string;
    location: string;
    message: string | null;
    requestedDate: string;
    status: string;
    createdAt: string;
  }>;
  mediaItems: Array<{ id: string; type: string; url: string; thumbnailUrl: string | null; caption: string | null; sortOrder: number }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<AdminTenant | null>(null);
  const [tab, setTab] = useState<"site" | "shows" | "bookings" | "availability" | "media">("site");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newShow, setNewShow] = useState({ date: "", time: "", venue: "" });
  const [newDate, setNewDate] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      router.push("/onboarding");
      return;
    }
    const data = await res.json();
    setTenant(data.tenant);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(section: string, data: Record<string, unknown>) {
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, data }),
    });
    if (res.ok) {
      setMessage("Saved");
      await load();
      setTimeout(() => setMessage(""), 2000);
    }
  }

  async function uploadFile(file: File, kind: string) {
    const form = new FormData();
    form.set("file", file);
    form.set("kind", kind);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    return data.url as string;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading || !tenant) {
    return <div className="flex min-h-screen items-center justify-center">Loading admin…</div>;
  }

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Marquee Admin</p>
            <h1 className="text-xl font-semibold">{tenant.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {message && <span className="text-emerald-400">{message}</span>}
            <Link href={`/b/${tenant.slug}`} target="_blank" className="rounded-full border border-zinc-700 px-3 py-1.5 hover:border-zinc-500">
              View site
            </Link>
            <button type="button" onClick={logout} className="text-zinc-400 hover:text-white">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr] md:px-10">
        <nav className="flex flex-wrap gap-2 md:flex-col">
          {(["site", "shows", "availability", "bookings", "media"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-2 text-left text-sm capitalize ${tab === t ? "bg-zinc-800" : "hover:bg-zinc-900"}`}
            >
              {t}
            </button>
          ))}
        </nav>

        <main className="rounded-2xl border border-zinc-800 bg-[var(--marquee-surface)] p-6">
          {tab === "site" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Site settings</h2>
              {(["name", "tagline", "location", "bookingEmail", "spotifyArtistId"] as const).map((field) => (
                <label key={field} className="block text-sm">
                  <span className="text-zinc-400 capitalize">{field}</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                    value={tenant[field] ?? ""}
                    onChange={(e) => setTenant({ ...tenant, [field]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block text-sm">
                <span className="text-zinc-400">Template</span>
                <select
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  value={tenant.template}
                  onChange={(e) => setTenant({ ...tenant, template: e.target.value })}
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["primaryColor", "secondaryColor", "backgroundColor", "textColor"] as const).map((c) => (
                  <label key={c} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{c}</span>
                    <input type="color" value={tenant[c]} onChange={(e) => setTenant({ ...tenant, [c]: e.target.value })} />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => patch("site", tenant)}
                className="rounded-lg bg-[var(--marquee-accent)] px-4 py-2 text-sm font-medium text-white"
              >
                Save site settings
              </button>
            </div>
          )}

          {tab === "shows" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Upcoming shows</h2>
              <ul className="divide-y divide-zinc-800">
                {tenant.shows.map((show) => (
                  <li key={show.id} className="flex items-center justify-between py-3 text-sm">
                    <span>{show.date} · {show.venue} · {show.time}</span>
                    <button type="button" className="text-red-400" onClick={() => patch("shows", { action: "delete", id: show.id })}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 md:grid-cols-3">
                <input type="date" value={newShow.date} onChange={(e) => setNewShow({ ...newShow, date: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
                <input placeholder="Time" value={newShow.time} onChange={(e) => setNewShow({ ...newShow, time: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
                <input placeholder="Venue" value={newShow.venue} onChange={(e) => setNewShow({ ...newShow, venue: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
              </div>
              <button
                type="button"
                onClick={() => patch("shows", { action: "add", ...newShow })}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm"
              >
                Add gig
              </button>
            </div>
          )}

          {tab === "availability" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Booking availability</h2>
              <ul className="flex flex-wrap gap-2">
                {tenant.availableDates.map((d) => (
                  <span key={d.id} className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-sm">
                    {d.date}
                    <button type="button" className="text-red-400" onClick={() => patch("availability", { action: "delete", id: d.id })}>×</button>
                  </span>
                ))}
              </ul>
              <div className="flex gap-2">
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
                <button type="button" onClick={() => patch("availability", { action: "add", date: newDate })} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm">
                  Add date
                </button>
              </div>
            </div>
          )}

          {tab === "bookings" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Booking inbox</h2>
              {tenant.bookingRequests.length === 0 ? (
                <p className="text-sm text-zinc-500">No requests yet.</p>
              ) : (
                tenant.bookingRequests.map((b) => (
                  <article key={b.id} className="rounded-xl border border-zinc-800 p-4 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{b.name} · {b.requestedDate}</p>
                        <p className="text-zinc-400">{b.email} · {b.eventType} · {b.location}</p>
                        {b.message && <p className="mt-2 text-zinc-300">{b.message}</p>}
                      </div>
                      <select
                        value={b.status}
                        onChange={(e) => patch("bookings", { id: b.id, status: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {tab === "media" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Media</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {tenant.mediaItems.map((m) => (
                  <div key={m.id} className="relative overflow-hidden rounded-lg border border-zinc-800">
                    {m.type === "video" ? (
                      <video src={m.url} className="aspect-square w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="aspect-square w-full object-cover" />
                    )}
                    <button type="button" className="absolute right-1 top-1 rounded bg-black/70 px-2 text-xs text-red-300" onClick={() => patch("media", { action: "delete", id: m.id })}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-block cursor-pointer rounded-lg border border-zinc-600 px-4 py-2 text-sm">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFile(file, "media");
                    await patch("media", { action: "add", type: "image", url, sortOrder: tenant.mediaItems.length });
                  }}
                />
              </label>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
