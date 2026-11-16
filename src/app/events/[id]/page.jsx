
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import { events } from "@/lib/events";

export const instant = false;

export function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }));
}

export default async function EventDetails({ params }) {
  const { id } = await params;

  const event = events.find((item) => item.id === id);

  if (!event) {
    notFound();
  }
 

  const isFree = Number(event.price) === 0;

  const categoryIcons = {
    Hackathon: "💻",
    Workshop: "🧠",
    Cultural: "🎭",
    Sports: "🏆",
  };

  return (
    <div className="min-h-screen bg-[#080D1D] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10">

        {/* Back Button */}
        <Link
          href="/#events"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-400"
        >
          ← Back to All Events
        </Link>

        {/* EVENT POSTER */}
        <div className="relative mt-8 h-64 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-700 via-violet-700 to-cyan-700 md:h-[420px]">

          {event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              {categoryIcons[event.category] || "🎉"}
            </div>
          )}

          {/* Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D1D]/90 via-[#080D1D]/20 to-transparent" />

          {/* Event Category */}
          <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-[#080D1D]/70 px-4 py-2 text-sm font-semibold backdrop-blur-md">
            {event.category}
          </div>

          {/* Event Title on Poster */}
          <div className="absolute bottom-8 left-6 right-6 md:left-10">
            <p className="mb-3 font-semibold text-cyan-300">
              {event.club}
            </p>

            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight drop-shadow-lg md:text-5xl">
              {event.title}
            </h1>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-10 grid gap-8 lg:grid-cols-3">

          {/* LEFT CONTENT */}
          <div className="space-y-8 lg:col-span-2">

            {/* About Event */}
            <section className="rounded-2xl border border-white/10 bg-[#111B30] p-7">
              <h2 className="text-2xl font-bold">
                About This Event
              </h2>

              <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />

              <p className="mt-6 leading-8 text-slate-300">
                {event.description}
              </p>
            </section>

            {/* Event Information */}
            <section className="rounded-2xl border border-white/10 bg-[#111B30] p-7">
              <h2 className="mb-7 text-2xl font-bold">
                Event Information
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">

                <InfoItem
                  icon="📅"
                  label="Event Date"
                  value={event.date}
                />

                <InfoItem
                  icon="🕒"
                  label="Event Time"
                  value={event.time}
                />

                <InfoItem
                  icon="📍"
                  label="Venue"
                  value={event.venue}
                />

                <InfoItem
                  icon="👥"
                  label="Total Capacity"
                  value={`${event.capacity} Students`}
                />

                <InfoItem
                  icon="🏛️"
                  label="Organized By"
                  value={event.club}
                />

                <InfoItem
                  icon="🎯"
                  label="Category"
                  value={event.category}
                />

              </div>
            </section>

            {/* Registration Note */}
            <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-6">
              <h3 className="font-semibold text-cyan-300">
                🎟️ Digital Campus Pass
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                After registration is implemented, verified
                students will be able to book their passes
                and access their event tickets from the
                student dashboard.
              </p>
            </section>
          </div>

          {/* RIGHT BOOKING CARD */}
          <aside>
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#111B30] shadow-xl shadow-violet-950/20">

              {/* Header */}
              <div className="bg-gradient-to-r from-violet-700 to-indigo-700 p-6">
                <p className="text-sm text-violet-100">
                  Event Registration
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Reserve Your Spot
                </h2>
              </div>

              <div className="space-y-6 p-6">

                {/* Price */}
                <div>
                  <p className="text-sm text-slate-400">
                    Entry Fee
                  </p>

                  <p className="mt-2 text-4xl font-extrabold text-cyan-400">
                    {isFree ? "FREE" : `₹${event.price}`}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {isFree
                      ? "No registration fee"
                      : "Per student registration"}
                  </p>
                </div>

                <div className="border-t border-white/10" />

                {/* Booking Details */}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">
                      Event Date
                    </span>
                    <span className="text-right font-medium">
                      {event.date}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">
                      Time
                    </span>
                    <span className="font-medium">
                      {event.time}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">
                      Capacity
                    </span>
                    <span className="font-medium">
                      {event.capacity}
                    </span>
                  </div>
                </div>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="block rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-center font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-1 hover:shadow-violet-500/40"
                >
                  {isFree
                    ? "Login to Register ↗"
                    : "Login to Book Pass ↗"}
                </Link>

                <p className="text-center text-xs leading-5 text-slate-400">
                  Registration opens after student
                  authentication and booking are enabled.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
    <footer className="mt-20 border-t border-white/10 px-5 py-6">
  © 2026 CampusPass • SGSITS Indore
</footer>
    </div>
  );
}

// Reusable Information Component
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-2xl">
        {icon}
      </div>

      <div>
        <p className="text-sm text-slate-400">
          {label}
        </p>

        <p className="mt-1 font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
