
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const initialForm = {
  title: "",
  description: "",
  venue: "",
  bannerUrl: "",
  clubId: "",
  startAt: "",
  endAt: "",
  registrationDeadline: "",
  capacity: "100",
  isPaid: false,
  price: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#080D1D] px-4 py-3 text-white outline-none focus:border-violet-500";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-300";

export default function NewEventForm({ clubs }) {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const pricePaise = form.isPaid
        ? Math.round(Number(form.price) * 100)
        : 0;

      const payload = {
        title: form.title,
        description: form.description,
        venue: form.venue,
        bannerUrl: form.bannerUrl,
        clubId: form.clubId,

        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),

        registrationDeadline: new Date(
          form.registrationDeadline
        ).toISOString(),

        capacity: Number(form.capacity),

        isPaid: form.isPaid,
        pricePaise,
      };

      const response = await fetch(
        "/api/organizer/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create event."
        );
      }

      router.push("/organizer/events");
      router.refresh();

    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D1D] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">

        <Link
          href="/organizer"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Organizer Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Create New Event
        </h1>

        <p className="mt-2 text-slate-400">
          Create an event draft for your approved club.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-[#111B30] p-6"
        >
          <div>
            <label className={labelClass}>
              Select Club
            </label>

            <select
              className={inputClass}
              value={form.clubId}
              onChange={(e) =>
                update("clubId", e.target.value)
              }
              required
            >
              <option value="">Choose your club</option>

              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Event Title
            </label>

            <input
              className={inputClass}
              value={form.title}
              onChange={(e) =>
                update("title", e.target.value)
              }
              placeholder="e.g. CodeSprint 2026"
              minLength={5}
              maxLength={120}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Event Description
            </label>

            <textarea
              className={inputClass}
              value={form.description}
              onChange={(e) =>
                update("description", e.target.value)
              }
              placeholder="Describe the event, activities, rules and eligibility..."
              rows={6}
              minLength={30}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Banner Image URL
            </label>

            <input
              className={inputClass}
              type="url"
              value={form.bannerUrl}
              onChange={(e) =>
                update("bannerUrl", e.target.value)
              }
              placeholder="https://example.com/banner.jpg"
            />

            <p className="mt-2 text-xs text-slate-500">
              Optional for now. Direct image upload will
              be added later.
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Venue
            </label>

            <input
              className={inputClass}
              value={form.venue}
              onChange={(e) =>
                update("venue", e.target.value)
              }
              placeholder="e.g. Main Auditorium, SGSITS"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Start Date & Time
              </label>

              <input
                type="datetime-local"
                className={inputClass}
                value={form.startAt}
                onChange={(e) =>
                  update("startAt", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                End Date & Time
              </label>

              <input
                type="datetime-local"
                className={inputClass}
                value={form.endAt}
                onChange={(e) =>
                  update("endAt", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Registration Deadline
            </label>

            <input
              type="datetime-local"
              className={inputClass}
              value={form.registrationDeadline}
              onChange={(e) =>
                update(
                  "registrationDeadline",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Total Seat Capacity
            </label>

            <input
              type="number"
              min="1"
              max="100000"
              className={inputClass}
              value={form.capacity}
              onChange={(e) =>
                update("capacity", e.target.value)
              }
              required
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-[#080D1D] p-5">
            <h2 className="font-semibold">
              Ticket Type
            </h2>

            <div className="mt-4 flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!form.isPaid}
                  onChange={() =>
                    update("isPaid", false)
                  }
                />
                Free Event
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.isPaid}
                  onChange={() =>
                    update("isPaid", true)
                  }
                />
                Paid Event
              </label>
            </div>

            {form.isPaid && (
              <div className="mt-5">
                <label className={labelClass}>
                  Ticket Price (₹)
                </label>

                <input
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) =>
                    update("price", e.target.value)
                  }
                  placeholder="e.g. 199"
                  required
                />
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || clubs.length === 0}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-semibold transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Creating Event..."
              : "Save Event as Draft"}
          </button>
        </form>
      </div>
    </main>
  );
}
