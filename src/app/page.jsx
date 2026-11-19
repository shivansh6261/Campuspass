
import Navbar from "@/components/Navbar";
import LiveEvents from "@/components/LiveEvents";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080D1D] text-white">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden px-5 py-24 md:py-36">

          {/* Background glowing circles */}
          <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-violet-600/30 blur-[110px]" />

          <div className="pointer-events-none absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-[110px]" />

          <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,#172554_0%,#080D1D_65%)]" />

          <div className="mx-auto max-w-6xl text-center">

            {/* College Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-2 text-sm font-medium tracking-wider text-violet-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              SGSITS INDORE
            </div>

            {/* Main Heading */}
            <h1 className="mx-auto max-w-5xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
              Your Campus.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Your Experience.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Discover exciting college events, connect with
              amazing clubs, and create unforgettable memories.
              All your campus experiences in one place.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#events"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-600/25 transition duration-300 hover:-translate-y-1 hover:shadow-violet-500/50"
              >
                Explore Events ↗
              </a>

              <a
                href="#about"
                className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur transition hover:border-cyan-400/50 hover:bg-white/10"
              >
                How It Works
              </a>
            </div>

            {/* Feature Highlights */}
            <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Discover Events",
                },
                {
                  number: "02",
                  title: "Register Easily",
                },
                {
                  number: "03",
                  title: "Get Digital Pass",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/10"
                >
                  <h3 className="text-3xl font-bold text-cyan-400">
                    {item.number}
                  </h3>

                  <p className="mt-2 font-medium text-slate-200">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* EVENTS SECTION - DATABASE POWERED */}
        <section
          id="events"
          className="relative scroll-mt-24 bg-[#0D1428] px-5 py-20"
        >
          <div className="mx-auto max-w-6xl">

            <div className="mb-12">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Explore What's Happening
              </p>

              <h2 className="text-4xl font-bold md:text-5xl">
                Upcoming{" "}
                <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  Events
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-slate-400">
                From coding competitions to cultural festivals,
                discover what's happening across SGSITS clubs.
              </p>
            </div>

            {/* Fetch published events from Neon PostgreSQL */}
            <Suspense
              fallback={
                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#111B30]"
                    >
                      <div className="h-48 bg-white/10" />

                      <div className="space-y-4 p-6">
                        <div className="h-4 w-24 rounded bg-white/10" />
                        <div className="h-7 w-3/4 rounded bg-white/10" />
                        <div className="h-4 w-full rounded bg-white/10" />
                        <div className="h-4 w-1/2 rounded bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <LiveEvents />
            </Suspense>

          </div>
        </section>

        {/* ABOUT SECTION */}
        <section
          id="about"
          className="scroll-mt-24 px-5 py-24"
        >
          <div className="mx-auto max-w-4xl text-center">

            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">
              One Campus. Endless Possibilities.
            </p>

            <h2 className="text-3xl font-bold md:text-5xl">
              Everything You Need.
              <br />

              <span className="text-violet-400">
                One Platform.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-slate-400">
              CampusPass brings college clubs, organizers,
              and students together. Explore events,
              register for activities, and access your
              digital passes with ease.
            </p>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-500">
        © 2026 CampusPass • SGSITS Indore
      </footer>
    </div>
  );
}
