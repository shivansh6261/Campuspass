
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const quickActions = [
  {
    title: "Manage Events",
    description:
      "View your events, publish drafts, and manage event details.",
    icon: "📋",
    href: "/organizer/events",
    action: "Manage Events",
    accent: "violet",
    iconBg: "bg-violet-500/15",
    border: "hover:border-violet-400/50",
    linkColor: "text-violet-400",
  },
  {
    title: "Create Event",
    description:
      "Create a new college event with dates, venue, capacity and ticket pricing.",
    icon: "📅",
    href: "/organizer/events/new",
    action: "Create Event",
    accent: "cyan",
    iconBg: "bg-cyan-500/15",
    border: "hover:border-cyan-400/50",
    linkColor: "text-cyan-400",
  },
  {
    title: "Registrations",
    description:
      "Access the registration management area for your club events.",
    icon: "🎟️",
    href: "/organizer/registrations",
    action: "View Registrations",
    accent: "emerald",
    iconBg: "bg-emerald-500/15",
    border: "hover:border-emerald-400/50",
    linkColor: "text-emerald-400",
  },
  {
    title: "QR Verification",
    description:
      "Open the ticket verification area for event check-in.",
    icon: "📱",
    href: "/organizer/verify-qr",
    action: "Open Verification",
    accent: "pink",
    iconBg: "bg-pink-500/15",
    border: "hover:border-pink-400/50",
    linkColor: "text-pink-400",
  },
];

function StatCard({ label, value, color, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6 transition hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>

      <h2 className={`mt-4 text-4xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}

function ActionCard({ item }) {
  return (
    <Link
      href={item.href}
      className={`group flex flex-col rounded-2xl border border-white/10 bg-[#111B30] p-7 transition duration-300 hover:-translate-y-1 hover:bg-[#17233D] hover:shadow-xl hover:shadow-black/20 ${item.border}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${item.iconBg}`}
      >
        {item.icon}
      </div>

      <h3 className="mt-6 text-xl font-bold text-white">
        {item.title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">
        {item.description}
      </p>

      <div
        className={`mt-7 flex items-center gap-2 font-semibold transition-all group-hover:gap-4 ${item.linkColor}`}
      >
        {item.action}
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
}

async function OrganizerDashboardContent() {
  // Only authorized organizers can access this page.
  const { memberships } = await requireOrganizer();

  // Get unique club IDs for this organizer.
  const clubIds = [
    ...new Set(
      memberships.map((membership) => membership.clubId)
    ),
  ];

  // Fetch real club information and event statistics.
  const [
    clubs,
    totalEvents,
    publishedEvents,
    draftEvents,
  ] = await Promise.all([
    prisma.club.findMany({
      where: {
        id: {
          in: clubIds,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.event.count({
      where: {
        clubId: {
          in: clubIds,
        },
      },
    }),

    prisma.event.count({
      where: {
        clubId: {
          in: clubIds,
        },
        status: "PUBLISHED",
      },
    }),

    prisma.event.count({
      where: {
        clubId: {
          in: clubIds,
        },
        status: "DRAFT",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        {/* DASHBOARD HEADER */}
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            CampusPass • Organizer Portal
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Organizer{" "}
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Manage your college clubs, organize events,
            monitor registrations, and prepare for event
            check-in.
          </p>
        </header>

        {/* AUTHORIZED CLUBS */}
        <section className="mb-10 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-[#171B39] to-[#101B30] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
                Your Authorized Clubs
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                {clubs.length === 1
                  ? clubs[0].name
                  : clubs.length > 1
                    ? `${clubs.length} Clubs`
                    : "No Clubs Assigned"}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                You can manage events for the clubs
                assigned to your organizer account.
              </p>
            </div>

            <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300">
              {clubs.length} Authorized{" "}
              {clubs.length === 1 ? "Club" : "Clubs"}
            </span>
          </div>

          {/* Show every club name */}
          {clubs.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-lg">
                    🏛️
                  </span>

                  <div>
                    <p className="font-semibold text-white">
                      {club.name}
                    </p>

                    <p
                      className={`text-xs ${
                        club.isActive
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {club.isActive
                        ? "Active Club"
                        : "Inactive Club"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EVENT STATISTICS */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Event Overview
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Live event statistics across your authorized clubs.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Events"
              value={totalEvents}
              color="text-white"
              icon="📅"
            />

            <StatCard
              label="Published Events"
              value={publishedEvents}
              color="text-emerald-400"
              icon="✅"
            />

            <StatCard
              label="Draft Events"
              value={draftEvents}
              color="text-amber-400"
              icon="📝"
            />

            <StatCard
              label="My Clubs"
              value={clubs.length}
              color="text-cyan-400"
              icon="🏛️"
            />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-14">
          <div className="mb-7">
            <h2 className="text-2xl font-bold">
              Quick Actions
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Access your organizer tools in one place.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {quickActions.map((item) => (
              <ActionCard
                key={item.href}
                item={item}
              />
            ))}
          </div>
        </section>

        {/* ORGANIZER INFORMATION */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-[#111B30] p-6 md:p-8">
          <h2 className="text-xl font-bold">
            Organizer Information
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">
                Account Role
              </p>

              <p className="mt-2 font-semibold text-violet-300">
                Authorized Organizer
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Club Memberships
              </p>

              <p className="mt-2 font-semibold">
                {clubs.length}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">
                Assigned Clubs
              </p>

              <p className="mt-2 font-semibold text-white">
                {clubs.length > 0
                  ? clubs.map((club) => club.name).join(", ")
                  : "No clubs assigned"}
              </p>
            </div>
          </div>
        </section>

        {/* HOME NAVIGATION */}
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-cyan-400"
          >
            ← Back to CampusPass Homepage
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function OrganizerDashboardPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] px-5 py-12 text-slate-400">
            Loading organizer dashboard...
          </div>
        }
      >
        <OrganizerDashboardContent />
      </Suspense>
    </>
  );
}
