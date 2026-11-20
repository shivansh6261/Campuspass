
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import RegisterButton from "./RegisterButton";
import PaidBookingButton from "./PaidBookingButton";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

async function EventDetailsContent({ params }) {
  // Required for request-time database access with
  // Next.js cacheComponents / Partial Prerendering.
  await connection();

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      club: {
        select: {
          name: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const bookedSeats = event._count.registrations;
  const availableSeats = Math.max(
    0,
    event.capacity - bookedSeats
  );

  const now = new Date();

  const isPublished = event.status === "PUBLISHED";
  const hasStarted = now >= event.startAt;
  const deadlinePassed =
    now >= event.registrationDeadline;

  const canRegister =
    isPublished &&
    event.club.isActive &&
    !event.isPaid &&
    !hasStarted &&
    !deadlinePassed &&
    availableSeats > 0;

  let disabledReason = "Registration Unavailable";

  if (!isPublished || !event.club.isActive) {
    disabledReason = "Registration Unavailable";
  } else if (hasStarted || deadlinePassed) {
    disabledReason = "Registration Closed";
  } else if (availableSeats === 0) {
    disabledReason = "Event Fully Booked";
  } else if (event.isPaid) {
    disabledReason = "Paid Registration Coming Soon";
  }

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/#events"
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          ← Explore Events
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#111B30]">

          {/* Event Banner */}
          <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-800 via-indigo-900 to-cyan-900 md:h-96">
            {event.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="text-7xl">🎉</div>
                <p className="mt-4 text-lg font-semibold text-white/80">
                  CampusPass Event
                </p>
              </div>
            )}
          </div>

          <div className="p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-3">

              {/* Event Information */}
              <div className="lg:col-span-2">
                <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300">
                  🏛️ {event.club.name}
                </span>

                <h1 className="mt-6 text-3xl font-extrabold md:text-5xl">
                  {event.title}
                </h1>

                <p className="mt-5 text-slate-400">
                  Organized by{" "}
                  <span className="font-semibold text-cyan-400">
                    {event.club.name}
                  </span>
                </p>

                <div className="mt-10">
                  <h2 className="text-2xl font-bold">
                    About This Event
                  </h2>

                  <p className="mt-5 whitespace-pre-line leading-8 text-slate-300">
                    {event.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="mt-10 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#080D1D] p-5">
                    <p className="text-sm text-slate-400">
                      📅 Starts
                    </p>

                    <p className="mt-3 font-semibold">
                      {formatDate(event.startAt)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#080D1D] p-5">
                    <p className="text-sm text-slate-400">
                      🕒 Ends
                    </p>

                    <p className="mt-3 font-semibold">
                      {formatDate(event.endAt)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#080D1D] p-5">
                    <p className="text-sm text-slate-400">
                      📍 Venue
                    </p>

                    <p className="mt-3 font-semibold">
                      {event.venue}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#080D1D] p-5">
                    <p className="text-sm text-slate-400">
                      ⏳ Registration Deadline
                    </p>

                    <p className="mt-3 font-semibold">
                      {formatDate(event.registrationDeadline)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Panel */}
              <aside>
                <div className="rounded-2xl border border-violet-500/20 bg-[#080D1D] p-6">
                  <p className="text-sm font-medium text-slate-400">
                    Registration Fee
                  </p>

                  <h2 className="mt-2 text-4xl font-extrabold text-emerald-400">
                    {event.isPaid
                      ? `₹${(event.pricePaise / 100).toFixed(2)}`
                      : "FREE"}
                  </h2>

                  <div className="my-7 border-t border-white/10" />

                  <div className="space-y-5">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">
                        Total Seats
                      </span>

                      <span className="font-semibold">
                        {event.capacity}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">
                        Registered
                      </span>

                      <span className="font-semibold">
                        {bookedSeats}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">
                        Available
                      </span>

                      <span className="font-bold text-emerald-400">
                        {availableSeats}
                      </span>
                    </div>
                  </div>

                  {/* Seat Availability Bar */}
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                      style={{
                        width: `${event.capacity > 0
                          ? Math.min(
                            100,
                            (bookedSeats / event.capacity) * 100
                          )
                          : 0
                          }%`,
                      }}
                    />
                  </div>

                  <div className="mt-8">
                    {event.isPaid ? (
                      <PaidBookingButton
                        eventId={event.id}
                        eventTitle={event.title}
                      />
                    ) : (
                      <RegisterButton
                        eventId={event.id}
                        canRegister={canRegister}
                      />
                    )}
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EventDetailsPage({ params }) {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] px-5 py-16 text-center text-slate-400">
            Loading event details...
          </div>
        }
      >
        <EventDetailsContent params={params} />
      </Suspense>
    </>
  );
}
