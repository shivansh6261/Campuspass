
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

async function AdminContent() {
  const admin = await requireAdmin();

  const [
    totalStudents,
    totalOrganizers,
    totalClubs,
    pendingRequests,
  ] = await Promise.all([
    prisma.student.count({
      where: { role: "STUDENT" },
    }),

    prisma.student.count({
      where: { role: "ORGANIZER" },
    }),

    prisma.club.count({
      where: { isActive: true },
    }),

    prisma.organizerRequest.count({
      where: { status: "PENDING" },
    }),
  ]);

  const stats = [
    {
      title: "Students",
      value: totalStudents,
      icon: "🎓",
      color: "text-violet-400",
    },
    {
      title: "Organizers",
      value: totalOrganizers,
      icon: "👥",
      color: "text-cyan-400",
    },
    {
      title: "Active Clubs",
      value: totalClubs,
      icon: "🏛️",
      color: "text-emerald-400",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: "📩",
      color: "text-amber-400",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            CampusPass Administration
          </p>

          <h1 className="text-3xl font-extrabold md:text-5xl">
            Admin{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>

          <p className="mt-4 text-slate-400">
            Welcome, {admin.name}. Manage your campus
            event platform from one place.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-white/10 bg-[#111B30] p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  {stat.title}
                </p>

                <span className="text-2xl">
                  {stat.icon}
                </span>
              </div>

              <h2
                className={`mt-4 text-4xl font-bold ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* MANAGEMENT SECTION */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold">
            Administration Tools
          </h2>

          <p className="mt-2 text-slate-400">
            Manage clubs, organizer applications,
            and platform users.
          </p>

          <div className="mt-7 grid gap-6 md:grid-cols-2">

            {/* SINGLE COMBINED MANAGEMENT CARD */}
            <Link
              href="/admin/club-management"
              className="group flex flex-col rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#171C3C] to-[#111B30] p-8 transition duration-300 hover:-translate-y-1 hover:border-violet-400/60 hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-3xl">
                  🏛️
                </div>

                {pendingRequests > 0 && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                    {pendingRequests} Pending
                  </span>
                )}
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Club & Organizer Management
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Create and manage college clubs, review
                organizer applications, and approve or
                reject student requests.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                  Club Management
                </span>

                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                  Organizer Requests
                </span>

                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                  Approvals
                </span>
              </div>

              <div className="mt-8 flex items-center gap-2 font-semibold text-violet-400 transition group-hover:gap-4">
                Open Management
                <span>→</span>
              </div>
            </Link>

            {/* FUTURE USER MANAGEMENT */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-[#111B30] p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-3xl">
                👥
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                User Management
              </h3>

              <p className="mt-3 flex-1 leading-7 text-slate-400">
                View registered students, organizers,
                and manage platform accounts.
              </p>

              <div className="mt-8">
                <span className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-400">
                  Coming Soon
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* BACK TO HOME */}
        <div className="mt-12">
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

export default function AdminPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading admin dashboard...
          </div>
        }
      >
        <AdminContent />
      </Suspense>
    </>
  );
}
