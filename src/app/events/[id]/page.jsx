
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

async function EventDetails({ params }) {
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      club: {
        isActive: true,
      },
    },
    include: {
      club: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← All Events
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#111B30]">
          <div className="h-64 bg-gradient-to-br from-violet-700 to-cyan-700 md:h-96">
            {event.bannerUrl && (
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="p-6 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
              {event.club.name}
            </p>

            <h1 className="mt-3 text-3xl font-bold md:text-5xl">
              {event.title}
            </h1>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#080D1D] p-5">
                <p className="text-sm text-slate-400">
                  Event Starts
                </p>
                <p className="mt-2 font-semibold">
                  {formatDate(event.startAt)}
                </p>
              </div>

              <div className="rounded-xl bg-[#080D1D] p-5">
                <p className="text-sm text-slate-400">
                  Event Ends
                </p>
                <p className="mt-2 font-semibold">
                  {formatDate(event.endAt)}
                </p>
              </div>

              <div className="rounded-xl bg-[#080D1D] p-5">
                <p className="text-sm text-slate-400">
                  Venue
                </p>
                <p className="mt-2 font-semibold">
                  {event.venue}
                </p>
              </div>

              <div className="rounded-xl bg-[#080D1D] p-5">
                <p className="text-sm text-slate-400">
                  Ticket Price
                </p>
                <p className="mt-2 font-semibold text-cyan-400">
                  {event.isPaid
                    ? `₹${(event.pricePaise / 100).toFixed(2)}`
                    : "FREE"}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">
                About This Event
              </h2>

              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-300">
                {event.description}
              </p>
            </div>

            <div className="mt-10 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <p className="font-semibold">
                Registration Information
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Registration deadline:{" "}
                {formatDate(event.registrationDeadline)}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Total capacity: {event.capacity} seats
              </p>

              <p className="mt-4 text-sm text-amber-300">
                Online registration and ticket booking
                are coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EventPage({ params }) {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading event details...
          </div>
        }
      >
        <EventDetails params={params} />
      </Suspense>
    </>
  );
}
