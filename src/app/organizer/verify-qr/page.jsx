
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";

async function QRVerificationContent() {
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
          QR Ticket Verification
        </h1>

        <p className="mt-3 text-slate-400">
          Verify student tickets during event check-in.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#111B30] p-10 text-center">
          <div className="text-5xl">📱</div>

          <h2 className="mt-5 text-xl font-semibold">
            QR Verification
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            QR scanning and secure ticket verification
            are not implemented yet. This page will
            eventually support validating tickets and
            recording student check-ins.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function QRVerificationPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="p-10">Loading...</div>}>
        <QRVerificationContent />
      </Suspense>
    </>
  );
}
