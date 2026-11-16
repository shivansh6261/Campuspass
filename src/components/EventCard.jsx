
import Link from "next/link";
import Image from "next/image";

export default function EventCard({ event }) {
  const categoryIcons = {
    Hackathon: "💻",
    Workshop: "🧠",
    Cultural: "🎭",
    Sports: "🏆",
    Technical: "⚡",
  };

  const icon = categoryIcons[event.category] || "🎉";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111B30] transition-all duration-300 hover:-translate-y-2 hover:border-violet-400/50 hover:shadow-[0_15px_45px_rgba(139,92,246,0.18)]">

      {/* EVENT POSTER */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-cyan-700">

        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl">
            {icon}
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D1D]/70 via-transparent to-transparent" />

        {/* Category Badge */}
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#080D1D]/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {event.category}
        </span>

        {/* Free / Paid Badge */}
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md ${
            Number(event.price) === 0
              ? "bg-emerald-500/90 text-white"
              : "bg-amber-400/95 text-slate-950"
          }`}
        >
          {Number(event.price) === 0
            ? "FREE"
            : "PAID EVENT"}
        </span>
      </div>

      {/* EVENT DETAILS */}
      <div className="space-y-4 p-6">

        {/* Club Name */}
        <p className="text-sm font-semibold tracking-wide text-cyan-400">
          {event.club}
        </p>

        {/* Event Title */}
        <h3 className="min-h-14 text-xl font-bold leading-snug text-white transition group-hover:text-violet-300">
          {event.title}
        </h3>

        {/* Date */}
        <div className="flex items-start gap-3 text-sm text-slate-300">
          <span className="text-lg">📅</span>
          <span>
            {event.date} • {event.time}
          </span>
        </div>

        {/* Venue */}
        <div className="flex items-start gap-3 text-sm text-slate-300">
          <span className="text-lg">📍</span>
          <span>{event.venue}</span>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5">

          {/* Price */}
          <div>
            <p className="text-xs text-slate-400">
              Entry Fee
            </p>

            <p className="mt-1 text-xl font-extrabold text-cyan-400">
              {Number(event.price) === 0
                ? "Free"
                : `₹${event.price}`}
            </p>
          </div>

          {/* View Event Button */}
          <Link
            href={`/events/${event.id}`}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40"
          >
            View Event ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
