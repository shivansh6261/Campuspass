
import { Suspense } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { requireOrganizer } from "@/lib/authorization";
import QRScanner from "./QRScanner";

async function VerifyQRContent() {
  await requireOrganizer();

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/organizer"
          className="text-sm text-cyan-400"
        >
          ← Organizer Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            CampusPass Event Entry
          </p>

          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">
            QR Ticket Verification
          </h1>

          <p className="mt-4 mb-10 text-slate-400">
            Securely verify registered students and
            mark their attendance at your club events.
          </p>
        </div>

        <QRScanner />
      </div>
    </main>
  );
}

export default function VerifyQRPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading QR verification...
          </div>
        }
      >
        <VerifyQRContent />
      </Suspense>
    </>
  );
}
