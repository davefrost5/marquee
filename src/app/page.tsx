import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Marquee
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/b/force-fed" className="opacity-70 hover:opacity-100">
            Demo site
          </Link>
          <Link href="/login" className="opacity-70 hover:opacity-100">
            Sign in
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full bg-[var(--marquee-accent)] px-4 py-2 font-medium text-white hover:brightness-110"
          >
            Start free
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:px-10 md:pt-24">
        <div className="animate-fade-up max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-zinc-400">For working bands</p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Your band site. Booking inbox. One login.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Marquee gives every band a polished public website with shows, Spotify, media, and booking — plus an admin portal to run it all without touching code.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/onboarding"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
            >
              Create your band site
            </Link>
            <Link
              href="/b/force-fed"
              className="rounded-full border border-zinc-700 px-6 py-3 text-sm hover:border-zinc-500"
            >
              See Force Fed live
            </Link>
          </div>
        </div>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Onboarding wizard",
              body: "Pick colors, upload your logo, connect Spotify, choose a template — live preview included.",
            },
            {
              title: "Public band site",
              body: "Music embed, gig list, photo grid, and booking calendar driven by your CMS data.",
            },
            {
              title: "Admin portal",
              body: "Edit shows, manage availability, review booking requests, and tweak your look anytime.",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-zinc-800 bg-[var(--marquee-surface)] p-6"
            >
              <h2 className="text-lg font-medium">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{card.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-24 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8 md:p-12">
          <h2 className="text-2xl font-semibold">Try the seeded demo</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Force Fed (tenant #1) ships with real gigs, gallery media, and Spotify. Admin credentials are
            configured privately via environment variables.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/b/force-fed" className="underline underline-offset-4">
              Public site →
            </Link>
            <Link href="/b/neon-harbor" className="underline underline-offset-4">
              Neon Harbor (poster template) →
            </Link>
            <Link href="/admin" className="underline underline-offset-4">
              Admin portal →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
