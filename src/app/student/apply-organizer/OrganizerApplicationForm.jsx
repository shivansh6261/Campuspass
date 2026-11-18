
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrganizerApplicationForm() {
  const [clubs, setClubs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [clubId, setClubId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [clubsResponse, requestsResponse] =
        await Promise.all([
          fetch("/api/clubs", { cache: "no-store" }),
          fetch("/api/organizer-requests", {
            cache: "no-store",
          }),
        ]);

      if (!clubsResponse.ok || !requestsResponse.ok) {
        throw new Error("Unable to load application data.");
      }

      const clubsData = await clubsResponse.json();
      const requestsData = await requestsResponse.json();

      setClubs(clubsData.clubs || []);
      setRequests(requestsData.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/organizer-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            clubId,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Application failed.");
        return;
      }

      setMessage("Application submitted successfully!");
      setClubId("");
      setReason("");

      await loadData();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">

        <Link
          href="/student"
          className="text-sm text-cyan-400"
        >
          ← Student Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Become a Club Organizer
        </h1>

        <p className="mt-3 text-slate-400">
          Apply to organize events for an approved college club.
          An administrator will review your application.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#111B30] p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Select Club
            </label>

            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-[#080D1D] p-3 text-white"
            >
              <option value="">Choose a club</option>

              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Why should you be an organizer?
            </label>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={20}
              maxLength={500}
              rows={5}
              required
              placeholder="Describe your club membership and responsibilities..."
              className="w-full rounded-xl border border-white/10 bg-[#080D1D] p-3 text-white"
            />
          </div>

          {message && (
            <p className="text-sm text-emerald-400">
              {message}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loading || clubs.length === 0}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>

        <section className="mt-10">
          <h2 className="text-xl font-bold">
            My Applications
          </h2>

          {requests.length === 0 ? (
            <p className="mt-4 text-slate-400">
              No applications yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#111B30] p-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {request.club.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {new Date(
                        request.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={
                      request.status === "APPROVED"
                        ? "text-sm font-semibold text-emerald-400"
                        : request.status === "REJECTED"
                        ? "text-sm font-semibold text-red-400"
                        : "text-sm font-semibold text-amber-400"
                    }
                  >
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
