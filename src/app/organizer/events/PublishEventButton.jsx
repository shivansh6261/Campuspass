
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishEventButton({ eventId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function publishEvent() {
    if (!window.confirm("Publish this event for students?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/organizer/events/${eventId}/publish`,
        {
          method: "PATCH",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to publish event."
        );
      }

      router.refresh();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={publishEvent}
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Event"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
