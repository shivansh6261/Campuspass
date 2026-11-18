
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function OrganizerEventsContent() {
  const { memberships } = await requireOrganizer();

  const clubIds = memberships.map(
    (membership) => membership.clubId
  );

  const events = await prisma.event.findMany({
    where: {
      clubId: { in: clubIds },
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

        <Link
          href="/organizer"
          className="text-sm text-cyan-400"
        >
          ← Organizer Dashboard
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold">
              Manage Events
            </h1>

            <p className="mt-2 text-slate-400">
              Events belonging to your authorized clubs.
            </p>
          </div>

          <Link
            href="/organizer/events/new"
            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
          >
            + Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/20 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No events created yet
            </h2>

            <p className="mt-2 text-slate-400">
              Create your first event draft.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-white/10 bg-[#111B30] p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">
                    {event.title}
                  </h2>

                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                    {event.status}
                  </span>
                </div>

                <p className="mt-3 text-sm text-violet-400">
                  {event.club.name}
                </p>

                <p className="mt-4 text-sm text-slate-400">
                  {event.venue}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {formatDate(event.startAt)}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm text-slate-300">
                    {event.capacity} seats
                  </span>

                  <span className="font-semibold text-cyan-400">
                    {event.isPaid
                      ? `₹${(event.pricePaise / 100).toFixed(2)}`
                      : "FREE"}
                  </span>
                </div>
              </article>
            ))}

          </div>
        )}
      </div>
    </main>
  );
}

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
