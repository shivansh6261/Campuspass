
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminClubPanel() {
  const [clubs, setClubs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [processingId, setProcessingId] = useState(null);
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
        throw new Error("Unable to load admin data.");
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

  async function createClub(event) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create club.");
        return;
      }

      setName("");
      setDescription("");
      setMessage("Club created successfully.");

      await loadData();
    } catch {
      setError("Unable to create club.");
    } finally {
      setCreating(false);
    }
  }

  async function reviewRequest(id, action) {
    let reviewNote = "";

    if (action === "REJECT") {
      const input = window.prompt(
        "Enter rejection reason (minimum 10 characters):"
      );

      if (input === null) return;

      reviewNote = input.trim();

      if (reviewNote.length < 10) {
        setError("Rejection reason must be at least 10 characters.");
        return;
      }
    }

    setProcessingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/organizer-requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            action,
            reviewNote,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to review request.");
        return;
      }

      setMessage(data.message);
      await loadData();
    } catch {
      setError("Unable to process application.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/admin"
          className="text-sm text-cyan-400"
        >
          ← Admin Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Club & Organizer Management
        </h1>

        <p className="mt-2 text-slate-400">
          Manage approved college clubs and organizer applications.
        </p>

        {message && (
          <p className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <h2 className="text-xl font-bold">
              Add Approved Club
            </h2>

            <form
              onSubmit={createClub}
              className="mt-6 space-y-4"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Club name"
                minLength={3}
                maxLength={80}
                required
                className="w-full rounded-xl border border-white/10 bg-[#080D1D] p-3 text-white"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Club description"
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-white/10 bg-[#080D1D] p-3 text-white"
              />

              <button
                disabled={creating}
                className="rounded-xl bg-violet-600 px-6 py-3 font-semibold disabled:opacity-50"
              >
                {creating ? "Creating..." : "Add Club"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
            <h2 className="text-xl font-bold">
              Active Clubs ({clubs.length})
            </h2>

            <div className="mt-6 space-y-3">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <h3 className="font-semibold">
                    {club.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {club.description || "No description"}
                  </p>
                </div>
              ))}

              {!loading && clubs.length === 0 && (
                <p className="text-slate-400">
                  No clubs created yet.
                </p>
              )}
            </div>
          </section>

        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Pending Organizer Requests ({requests.length})
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-white/10 bg-[#111B30] p-6"
              >
                <h3 className="text-lg font-bold">
                  {request.student.name}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {request.student.email}
                </p>

                <p className="mt-3 text-sm">
                  <span className="text-slate-400">
                    Enrollment:
                  </span>{" "}
                  {request.student.enrollment}
                </p>

                <p className="mt-1 text-sm">
                  <span className="text-slate-400">
                    Club:
                  </span>{" "}
                  {request.club.name}
                </p>

                <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
                  {request.reason || "No reason provided"}
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    disabled={processingId !== null}
                    onClick={() =>
                      reviewRequest(request.id, "APPROVE")
                    }
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-semibold disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    disabled={processingId !== null}
                    onClick={() =>
                      reviewRequest(request.id, "REJECT")
                    }
                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {!loading && requests.length === 0 && (
              <p className="text-slate-400">
                No pending organizer applications.
              </p>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
