
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

import PublishEventButton from "./PublishEventButton";

// Format dates in Indian Standard Time
function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// Protected organizer events content
async function OrganizerEventsContent() {
  const { memberships } = await requireOrganizer();

  // Clubs the organizer is authorized to manage
  const clubIds = memberships.map(
    (membership) => membership.clubId
  );

  // Fetch events from Neon PostgreSQL
  const events = await prisma.event.findMany({
    where: {
      clubId: {
        in: clubIds,
      },
    },
    include: {
      club: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Back Navigation */}
        <Link
          href="/organizer"
          className="text-sm text-cyan-400 transition hover:text-cyan-300"
        >
          ← Organizer Dashboard
        </Link>

        {/* Page Header */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">
              Manage Events
            </h1>

            <p className="mt-2 text-slate-400">
              Create, manage, and publish events for your
              authorized clubs.
            </p>
          </div>

          <Link
            href="/organizer/events/new"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-90"
          >
            + Create Event
          </Link>
        </div>

        {/* Event Statistics */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <p className="text-sm text-slate-400">
              Total Events
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              {events.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <p className="text-sm text-slate-400">
              Published Events
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-400">
              {
                events.filter(
                  (event) => event.status === "PUBLISHED"
                ).length
              }
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <p className="text-sm text-slate-400">
              Draft Events
            </p>

            <h2 className="mt-2 text-3xl font-bold text-amber-400">
              {
                events.filter(
                  (event) => event.status === "DRAFT"
                ).length
              }
            </h2>
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center">
            <h2 className="text-xl font-semibold">
              No events created yet
            </h2>

            <p className="mt-3 text-slate-400">
              Start by creating your first event.
            </p>

            <Link
              href="/organizer/events/new"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#111B30] transition hover:border-violet-500/40"
              >

                {/* Event Banner */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-cyan-700">
                  {event.bannerUrl && (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  )}

                  {/* Event Status */}
                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
                      event.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : event.status === "DRAFT"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-500/30 text-slate-200"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    {event.club.name}
                  </p>

                  <h2 className="mt-3 text-xl font-bold text-white">
                    {event.title}
                  </h2>

                  <p className="mt-3 line-clamp-2 text-sm text-slate-400">
                    {event.description}
                  </p>

                  <div className="mt-5 space-y-3 text-sm text-slate-300">
                    <p>
                      📅 {formatDate(event.startAt)}
                    </p>

                    <p>
                      📍 {event.venue}
                    </p>

                    <p>
                      🎟️ {event.capacity} total seats
                    </p>
                  </div>

                  {/* Ticket Price */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm text-slate-400">
                      Ticket Price
                    </span>

                    <span className="font-semibold text-cyan-400">
                      {event.isPaid
                        ? `₹${(event.pricePaise / 100).toFixed(2)}`
                        : "FREE"}
                    </span>
                  </div>

                  {/* Publish Draft Event */}
                  {event.status === "DRAFT" && (
                    <PublishEventButton eventId={event.id} />
                  )}

                  {/* View Published Event */}
                  {event.status === "PUBLISHED" && (
                    <Link
                      href={`/events/${event.id}`}
                      className="mt-5 block rounded-xl border border-cyan-500/30 px-5 py-3 text-center font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
                    >
                      View Published Event →
                    </Link>
                  )}

                  {/* Cancelled or Completed Events */}
                  {(event.status === "CANCELLED" ||
                    event.status === "COMPLETED") && (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-slate-400">
                      This event is {event.status.toLowerCase()}.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Page with Suspense for Next.js 16
export default function OrganizerEventsPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading your events...
          </div>
        }
      >
        <OrganizerEventsContent />
      </Suspense>
    </>
  );
}
