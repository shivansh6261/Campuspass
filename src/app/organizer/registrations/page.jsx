
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";

async function RegistrationsContent() {
  await requireOrganizer();

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/organizer"
          className="text-sm text-cyan-400"
        >
          ← Organizer Dashboard
        </Link>

        <h1 className="mt-8 text-3xl font-bold">
          Event Registrations
        </h1>

        <p className="mt-3 text-slate-400">
          Manage student registrations for your club events.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#111B30] p-10 text-center">
          <div className="text-5xl">🎟️</div>

          <h2 className="mt-5 text-xl font-semibold">
            Registration Management
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            The registration management system has not
            been implemented yet. Student registration
            records will appear here once that feature
            is built.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegistrationsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="p-10">Loading...</div>}>
        <RegistrationsContent />
      </Suspense>
    </>
  );
}
