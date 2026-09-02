"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [error, setError] = useState("");
  const [magicUrl, setMagicUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    setLoading(true);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "magic", magicToken: token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) router.push(data.tenantSlug ? "/admin" : "/onboarding");
        else setError(data.error ?? "Magic link failed");
      })
      .finally(() => setLoading(false));
  }, [searchParams, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMagicUrl("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: mode === "password" ? password : undefined, mode }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Sign in failed");
      return;
    }
    if (data.magicUrl) {
      setMagicUrl(data.magicUrl);
      return;
    }
    router.push(data.tenantSlug ? "/admin" : "/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[var(--marquee-surface)] p-8">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Marquee
        </Link>
        <h1 className="mt-6 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">Manage your band site and booking inbox.</p>

        <div className="mt-6 flex gap-2 rounded-full bg-zinc-900 p-1 text-sm">
          <button type="button" onClick={() => setMode("password")} className={`flex-1 rounded-full py-2 ${mode === "password" ? "bg-zinc-700" : ""}`}>
            Password
          </button>
          <button type="button" onClick={() => setMode("magic")} className={`flex-1 rounded-full py-2 ${mode === "magic" ? "bg-zinc-700" : ""}`}>
            Magic link
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500" />
          {mode === "password" && (
            <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500" />
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {magicUrl && (
            <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-sm">
              <p className="text-emerald-300">Magic link ready (dev mode):</p>
              <a href={magicUrl} className="mt-2 block break-all underline">{magicUrl}</a>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[var(--marquee-accent)] py-3 font-medium text-white disabled:opacity-50">
            {loading ? "Working…" : mode === "magic" ? "Send magic link" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          New band? <Link href="/onboarding" className="text-white underline">Start onboarding</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
