
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    },
    {
      title: "Organizers",
      value: totalOrganizers,
    },
    {
      title: "Active Clubs",
      value: totalClubs,
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
    },
  ];

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Welcome, {admin.name}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-white/10 bg-[#111B30] p-6"
            >
              <p className="text-sm text-slate-400">
                {stat.title}
              </p>

              <h2 className="mt-3 text-3xl font-bold text-violet-400">
                {stat.value}
              </h2>
            </div>
          ))}

        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <h3 className="text-lg font-semibold">
              Organizer Requests
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Approve or reject club organizers.
            </p>
          </div>

          <Link
            href="/admin/club-management"
            className="rounded-2xl border border-violet-500/20 bg-[#111B30] p-6 transition hover:border-violet-400"
          >
            <h3 className="text-lg font-semibold">
              Club & Organizer Management
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add clubs and approve organizer applications.
            </p>
          </Link>

          <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <h3 className="text-lg font-semibold">
              Manage Users
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              View students and organizers.
            </p>
          </div>

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
