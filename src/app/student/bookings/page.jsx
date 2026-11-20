
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireStudent } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function MyBookingsContent() {
  const student = await requireStudent();

  const registrations = await prisma.registration.findMany({
    where: {
      studentId: student.id,
    },
    include: {
      event: {
        include: {
          club: {
            select: {
              name: true,
            },
          },
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
          href="/student"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Student Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            CampusPass Student Portal
          </p>

          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">
            My{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Bookings
            </span>
          </h1>

          <p className="mt-4 text-slate-400">
            Your confirmed event registrations.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#111B30] p-6">
          <p className="text-sm text-slate-400">
            Total Registrations
          </p>

          <h2 className="mt-3 text-4xl font-bold text-violet-400">
            {registrations.length}
          </h2>
        </div>

        {registrations.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#111B30] p-12 text-center">
            <div className="text-5xl">🎟️</div>

            <h2 className="mt-5 text-2xl font-bold">
              No Bookings Yet
            </h2>

            <p className="mt-3 text-slate-400">
              You haven't registered for any events yet.
            </p>

            <Link
              href="/#events"
              className="mt-7 inline-flex rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
            >
              Explore Events →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {registrations.map((registration) => {
              const event = registration.event;

              return (
                <div
                  key={registration.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#111B30] p-6 transition hover:border-violet-400/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                      {event.club.name}
                    </span>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                      Registered
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-bold">
                    {event.title}
                  </h2>

                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    <p>
                      📅 {formatDate(event.startAt)}
                    </p>

                    <p>
                      📍 {event.venue}
                    </p>

                    <p>
                      🎟️ Booking ID: {registration.id}
                    </p>

                    <p className="text-slate-400">
                      Registered on{" "}
                      {formatDate(registration.createdAt)}
                    </p>
                  </div>

                  {event.status === "CANCELLED" && (
                    <p className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                      This event has been cancelled.
                    </p>
                  )}


                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={`/student/bookings/${registration.id}/ticket`}
                      className="inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      🎟️ View QR Ticket
                    </Link>

                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
                    >
                      View Event →
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function MyBookingsPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading your bookings...
          </div>
        }
      >
        <MyBookingsContent />
      </Suspense>
    </>
  );
}
