
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";
import Link from "next/link";

async function OrganizerContent() {
  const { student, memberships } =
    await requireOrganizer();

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold">
          Organizer Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Welcome, {student.name}
        </p>

        <h2 className="mt-10 text-xl font-semibold">
          Your Authorized Clubs
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {memberships.length > 0 ? (
            memberships.map((membership) => (
              <div
                key={membership.id}
                className="rounded-2xl border border-violet-500/20 bg-[#111B30] p-6"
              >
                <h3 className="text-lg font-bold">
                  {membership.club.name}
                </h3>

                <p className="mt-2 text-sm text-emerald-400">
                  Organizer Access Active
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-400">
              No club memberships assigned yet.
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">


          <Link
            href="/organizer/events/new"
            className="rounded-2xl border border-violet-500/20 bg-[#111B30] p-6 transition hover:border-violet-400"
          >
            <h3 className="text-lg font-semibold">
              Create Event
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Create a new event for your approved club.
            </p>
          </Link>
          


          <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <h3 className="text-lg font-semibold">
              Registrations
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              View registered students and tickets.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <h3 className="text-lg font-semibold">
              QR Verification
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Scan and verify entry passes.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function OrganizerPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading organizer dashboard...
          </div>
        }
      >
        <OrganizerContent />
      </Suspense>
    </>
  );
}
