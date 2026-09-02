"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DEFAULT_SECTION_ORDER, TEMPLATE_OPTIONS, type SectionId } from "@/lib/types";

type WizardData = {
  email: string;
  password: string;
  bandName: string;
  slug: string;
  tagline: string;
  location: string;
  bookingEmail: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  accentFont: string;
  spotifyArtistId: string;
  template: "editorial" | "poster" | "magazine";
  sectionOrder: SectionId[];
};

const initial: WizardData = {
  email: "",
  password: "",
  bandName: "",
  slug: "",
  tagline: "",
  location: "",
  bookingEmail: "",
  primaryColor: "#c8281f",
  secondaryColor: "#0b0b0b",
  backgroundColor: "#f3ece0",
  textColor: "#0b0b0b",
  headingFont: "Bowlby One",
  bodyFont: "DM Sans",
  accentFont: "DM Mono",
  spotifyArtistId: "",
  template: "editorial",
  sectionOrder: DEFAULT_SECTION_ORDER,
};

function PreviewCard({ data }: { data: WizardData }) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-lg"
      style={{ background: data.backgroundColor, color: data.textColor, fontFamily: data.bodyFont }}
    >
      <div className="border-b px-4 py-3" style={{ borderColor: `${data.secondaryColor}33` }}>
        <p className="text-xs uppercase tracking-widest opacity-60" style={{ fontFamily: data.accentFont }}>
          Live preview
        </p>
      </div>
      <div className="space-y-3 p-6">
        <h3 className="text-2xl uppercase" style={{ fontFamily: data.headingFont, color: data.primaryColor }}>
          {data.bandName || "Your Band"}
        </h3>
        <p>{data.tagline || "Your one-liner goes here"}</p>
        <div className="flex gap-2">
          <span className="rounded-full px-3 py-1 text-xs text-white" style={{ background: data.primaryColor }}>
            Listen
          </span>
          <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: data.secondaryColor }}>
            Book
          </span>
        </div>
        <div className="flex gap-2 pt-2">
          {[data.primaryColor, data.secondaryColor, data.backgroundColor, data.textColor].map((c) => (
            <span key={c} className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initial);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [slugOk, setSlugOk] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data.slug || data.slug.length < 2) {
      setSlugOk(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "check-slug", slug: data.slug }),
      });
      const json = await res.json();
      setSlugOk(json.available);
    }, 300);
    return () => clearTimeout(t);
  }, [data.slug]);

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function createAccount() {
    setLoading(true);
    setError("");
    const form = new FormData();
    form.set("step", "create-account");
    form.set("email", data.email);
    form.set("password", data.password);
    form.set("payload", JSON.stringify({ bandName: data.bandName }));
    const res = await fetch("/api/onboarding", { method: "POST", body: form });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Could not create account");
      return false;
    }
    return true;
  }

  async function finalize() {
    setLoading(true);
    setError("");
    const form = new FormData();
    form.set("step", "finalize");
    form.set("payload", JSON.stringify(data));
    if (logoFile) form.set("logo", logoFile);
    if (heroFile) form.set("heroImage", heroFile);
    const res = await fetch("/api/onboarding", { method: "POST", body: form });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Could not create band site");
      return;
    }
    router.push(json.siteUrl ?? `/b/${json.slug}`);
  }

  async function next() {
    setError("");
    if (step === 0) {
      if (!data.email || data.password.length < 8) {
        setError("Email and password (8+ characters) required");
        return;
      }
      const ok = await createAccount();
      if (!ok) return;
    }
    if (step === 1 && (!data.bandName || !data.slug || slugOk === false)) {
      setError("Band name and available slug required");
      return;
    }
    if (step === 5) {
      await finalize();
      return;
    }
    setStep((s) => s + 1);
  }

  const steps = ["Account", "Band", "Brand", "Media", "Template", "Launch"];

  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Marquee
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Launch your band site</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {steps.map((label, i) => (
            <span
              key={label}
              className={`rounded-full px-3 py-1 text-xs ${i === step ? "bg-white text-black" : i < step ? "bg-zinc-700" : "bg-zinc-900 text-zinc-500"}`}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {step === 0 && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                />
                <input
                  type="password"
                  placeholder="Password (8+ characters)"
                  value={data.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                />
              </>
            )}
            {step === 1 && (
              <>
                <input
                  placeholder="Band name"
                  value={data.bandName}
                  onChange={(e) => {
                    update("bandName", e.target.value);
                    update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                />
                <div>
                  <input
                    placeholder="URL slug"
                    value={data.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    marquee.app/b/{data.slug || "your-band"}{" "}
                    {slugOk === true && <span className="text-emerald-400">Available</span>}
                    {slugOk === false && <span className="text-red-400">Taken</span>}
                  </p>
                </div>
                <input
                  placeholder="One-liner tagline"
                  value={data.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                />
                <input
                  placeholder="Location (e.g. Brooklyn, NY)"
                  value={data.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                />
                <input
                  type="email"
                  placeholder="Booking email"
                  value={data.bookingEmail}
                  onChange={(e) => update("bookingEmail", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                />
              </>
            )}
            {step === 2 && (
              <>
                {(["primaryColor", "secondaryColor", "backgroundColor", "textColor"] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between gap-4 text-sm">
                    <span className="capitalize">{key.replace("Color", " color")}</span>
                    <input type="color" value={data[key]} onChange={(e) => update(key, e.target.value)} />
                  </label>
                ))}
              </>
            )}
            {step === 3 && (
              <>
                <input
                  placeholder="Spotify artist ID or URL"
                  value={data.spotifyArtistId}
                  onChange={(e) => {
                    const v = e.target.value;
                    const match = v.match(/artist\/([a-zA-Z0-9]+)/);
                    update("spotifyArtistId", match ? match[1] : v);
                  }}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                />
                <label className="block text-sm text-zinc-400">
                  Logo
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="mt-1 w-full text-sm" />
                </label>
                <label className="block text-sm text-zinc-400">
                  Hero image
                  <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)} className="mt-1 w-full text-sm" />
                </label>
              </>
            )}
            {step === 4 && (
              <div className="space-y-3">
                {TEMPLATE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => update("template", t.id)}
                    className={`w-full rounded-xl border p-4 text-left ${data.template === t.id ? "border-white bg-zinc-800" : "border-zinc-700"}`}
                  >
                    <p className="font-medium">{t.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">{t.description}</p>
                  </button>
                ))}
              </div>
            )}
            {step === 5 && (
              <div className="rounded-xl border border-zinc-700 p-4 text-sm text-zinc-300">
                <p>Ready to publish <strong>{data.bandName}</strong> at <strong>/b/{data.slug}</strong></p>
                <p className="mt-2 text-zinc-500">You can edit shows, media, and colors anytime from the admin portal.</p>
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3 pt-4">
              {step > 0 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-lg border border-zinc-700 px-4 py-2">
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={next}
                disabled={loading}
                className="rounded-lg bg-[var(--marquee-accent)] px-6 py-2 font-medium text-white disabled:opacity-50"
              >
                {loading ? "Working…" : step === 5 ? "Publish site" : "Continue"}
              </button>
            </div>
          </div>
          <PreviewCard data={data} />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingWizard />
    </Suspense>
  );
}
