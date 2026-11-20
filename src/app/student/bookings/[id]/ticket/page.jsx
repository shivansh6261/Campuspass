
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import Navbar from "@/components/Navbar";
import { requireStudent } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { createTicket } from "@/lib/tickets";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

async function TicketContent({ params }) {
  const student = await requireStudent();
  const { id } = await params;

  // Students can access only their own tickets.
  const registration = await prisma.registration.findFirst({
    where: {
      id,
      studentId: student.id,
    },
    include: {
      event: {
        include: {
          club: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!registration) {
    notFound();
  }

  const event = registration.event;
  const checkedIn = Boolean(registration.checkedInAt);

  const ticketAvailable =
    event.status === "PUBLISHED" &&
    !checkedIn &&
    new Date() < event.endAt;

  let qrImage = null;

  if (ticketAvailable) {
    const signedTicket = createTicket(registration.id);

    qrImage = await QRCode.toDataURL(signedTicket, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#080D1D",
        light: "#FFFFFF",
      },
    });
  }

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <Link
          href="/student/bookings"
          className="text-sm font-medium text-cyan-400"
        >
          ← My Bookings
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-violet-500/20 bg-[#111B30]">
          <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-7 py-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-100">
              CampusPass
            </p>

            <h1 className="mt-3 text-2xl font-extrabold">
              Event Ticket
            </h1>

            <p className="mt-2 text-sm text-violet-100">
              {event.club.name}
            </p>
          </div>

          <div className="p-7">
            <h2 className="text-center text-2xl font-bold">
              {event.title}
            </h2>

            <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#080D1D] p-5">
              <div>
                <p className="text-xs text-slate-400">
                  Attendee
                </p>
                <p className="mt-1 font-semibold">
                  {student.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Date & Time
                </p>
                <p className="mt-1 font-semibold">
                  {formatDate(event.startAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Venue
                </p>
                <p className="mt-1 font-semibold">
                  {event.venue}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Booking ID
                </p>
                <p className="mt-1 break-all font-mono text-sm">
                  {registration.id}
                </p>
              </div>
            </div>

            {checkedIn ? (
              <div className="mt-7 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <p className="text-xl font-bold text-emerald-400">
                  ✓ Checked In
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  {formatDate(registration.checkedInAt)}
                </p>
              </div>
            ) : ticketAvailable ? (
              <div className="mt-8 text-center">
                <div className="mx-auto inline-block rounded-2xl bg-white p-4">
                  <img
                    src={qrImage}
                    alt={`QR ticket for ${event.title}`}
                    width={320}
                    height={320}
                    className="h-auto w-full max-w-72"
                  />
                </div>

                <p className="mt-5 font-semibold text-emerald-400">
                  ✓ Registration Confirmed
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Show this QR code to the organizer
                  at the event entrance.
                </p>
              </div>
            ) : (
              <div className="mt-7 rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-center text-sm text-amber-300">
                This event is cancelled, completed,
                or its ticket validity has expired.
              </div>
            )}

            <div className="mt-8 border-t border-dashed border-white/20 pt-6 text-center text-xs text-slate-500">
              One booking • One attendee • One check-in
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TicketPage({ params }) {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080D1D] p-10 text-slate-400">
            Generating your ticket...
          </div>
        }
      >
        <TicketContent params={params} />
      </Suspense>
    </>
  );
}
