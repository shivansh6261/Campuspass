
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterButton({
  eventId,
  canRegister,
  disabledReason,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] =
    useState(false);

  async function handleRegistration() {
    if (loading || !canRegister) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(eventId)}/register`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        if (
          response.status === 409 &&
          data.error?.includes("already registered")
        ) {
          setAlreadyRegistered(true);
        }

        throw new Error(
          data.error || "Registration failed."
        );
      }

      router.push("/student/bookings");
      router.refresh();
    } catch (error) {
      setError(
        error.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {canRegister && !alreadyRegistered ? (
        <button
          type="button"
          onClick={handleRegistration}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Confirming Registration..."
            : "Register for Free"}
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-slate-400"
        >
          {alreadyRegistered
            ? "Already Registered"
            : disabledReason || "Registration Unavailable"}
        </button>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {alreadyRegistered && (
        <Link
          href="/student/bookings"
          className="block text-center text-sm font-semibold text-cyan-400 hover:text-cyan-300"
        >
          View My Bookings →
        </Link>
      )}

      <p className="text-center text-xs text-slate-500">
        Registration is confirmed only after the server
        successfully reserves your seat.
      </p>
    </div>
  );
}
