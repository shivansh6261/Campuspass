
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { requireStudent } from "@/lib/authorization";

async function StudentContent() {
  const student = await requireStudent();


  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold">
          Welcome, {student.name}!
        </h1>

        <p className="mt-2 text-slate-400">
          Your CampusPass Student Dashboard
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">

          <Link
            href="/#events"
            className="rounded-2xl border border-violet-500/20 bg-[#111B30] p-6 transition hover:border-violet-400"
          >
            <h2 className="text-xl font-semibold">
              Explore Events
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Discover upcoming college events.
            </p>
          </Link>


          <Link
            href="/student/bookings"
            className="group rounded-2xl border border-cyan-500/20 bg-[#111B30] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:bg-[#17233D]"
          >
            <div className="mb-4 text-3xl">
              🎟️
            </div>

            <h2 className="text-xl font-semibold">
              My Bookings
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              View your registered events, booking details,
              and upcoming campus activities.
            </p>

            <p className="mt-5 font-semibold text-cyan-400 transition group-hover:translate-x-1">
              View My Bookings →
            </p>
          </Link>


          <Link
            href="/student/apply-organizer"
            className="rounded-2xl border border-violet-500/20 bg-[#111B30] p-6 transition hover:border-violet-400"
          >
            <h2 className="text-xl font-semibold">
              Become an Organizer
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Apply to manage events for your college club.
            </p>
          </Link>

        </div>

      </div>
    </main>
  );
}

export default function StudentPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Loading student dashboard...
          </div>
        }
      >
        <StudentContent />
      </Suspense>
    </>
  );
}
