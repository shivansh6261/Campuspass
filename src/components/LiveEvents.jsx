
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function LiveEvents() {
  // Next.js 16: render this component at request time.
  await connection();

  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startAt: {
        gt: now,
      },
      club: {
        isActive: true,
      },
    },
    include: {
      club: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      startAt: "asc",
    },
    take: 30,
  });

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
        <h3 className="text-xl font-semibold text-white">
          No upcoming events yet
        </h3>

        <p className="mt-3 text-slate-400">
          Published events will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111B30] transition duration-300 hover:-translate-y-1 hover:border-violet-500/50"
        >
          {/* Event Banner */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-cyan-700">
            {event.bannerUrl && (
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            )}

            <span className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
              {event.isPaid
                ? `₹${(event.pricePaise / 100).toFixed(2)}`
                : "FREE"}
            </span>
          </div>

          {/* Event Information */}
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              {event.club.name}
            </p>

            <h3 className="mt-3 text-xl font-bold text-white">
              {event.title}
            </h3>

            <p className="mt-3 line-clamp-2 text-sm text-slate-400">
              {event.description}
            </p>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>📅 {formatDate(event.startAt)}</p>

              <p>📍 {event.venue}</p>

              <p>🎟️ {event.capacity} total seats</p>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4 font-semibold text-cyan-400">
              View Event Details →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
