
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    phone: "",
    year: "",
  });

  // Load student profile
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();

        if (cancelled) return;

        setStudent(data.student);

        setForm({
          phone: data.student.phone || "",
          year: data.student.year || "",
        });

      } catch (err) {
        console.error("Profile load failed:", err);

        if (!cancelled) {
          setError("Unable to load your profile.");
        }

      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // Save profile
  async function handleSave(e) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          phone: form.phone,
          year: form.year,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to update profile."
        );
        return;
      }

      // Update displayed student data
      setStudent((previous) => ({
        ...previous,
        ...data.student,
      }));

      setSuccess("Profile updated successfully!");
      setEditing(false);

      router.refresh();

    } catch (err) {
      console.error("Profile save failed:", err);

      setError(
        "Something went wrong. Please try again."
      );

    } finally {
      setSaving(false);
    }
  }

  // Cancel changes
  function handleCancel() {
    setForm({
      phone: student.phone || "",
      year: student.year || "",
    });

    setEditing(false);
    setError("");
  }

  // Reusable display field
  function ProfileField({ label, value }) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="break-words text-sm font-semibold text-white">
          {value || "Not available"}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-[#080D1D] text-white">
          <p className="animate-pulse text-slate-400">
            Loading your profile...
          </p>
        </main>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080D1D] px-5 text-white">
          <p className="text-red-300">
            {error || "Please log in to view your profile."}
          </p>

          <Link
            href="/login"
            className="rounded-xl bg-violet-600 px-5 py-3"
          >
            Go to Login
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-[#080D1D] px-5 py-12 text-white">

        {/* Background effects */}
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl">

          {/* Back link */}
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-slate-400 transition hover:text-cyan-400"
          >
            ← Back to CampusPass
          </Link>

          {/* Profile Header */}
          <div className="mb-8 rounded-3xl border border-white/10 bg-[#111B30]/90 p-6 sm:p-8">

            <div className="flex flex-wrap items-center gap-5">

              {/* Avatar */}
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-3xl font-bold shadow-lg shadow-violet-600/20">
                {student.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">

                <h1 className="text-2xl font-extrabold sm:text-3xl">
                  {student.name}
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  {student.email}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                    Student
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      student.verificationStatus === "APPROVED"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : student.verificationStatus === "REJECTED"
                          ? "border-red-500/30 bg-red-500/10 text-red-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {student.verificationStatus === "APPROVED"
                      ? "College Approved"
                      : student.verificationStatus === "REJECTED"
                        ? "Verification Rejected"
                        : "Verification Pending"}
                  </span>

                </div>

              </div>

            </div>
          </div>

          {/* Student Details */}
          <div className="rounded-3xl border border-white/10 bg-[#111B30]/90 p-6 sm:p-8">

            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold">
                  Student Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your CampusPass profile.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500"
                >
                  Edit Profile
                </button>
              )}

            </div>

            {/* Read-only details */}
            <div className="grid gap-4 sm:grid-cols-2">

              <ProfileField
                label="Full Name"
                value={student.name}
              />

              <ProfileField
                label="Email Address"
                value={student.email}
              />

              <ProfileField
                label="Enrollment Number"
                value={student.enrollment}
              />

              <ProfileField
                label="Department"
                value={student.department}
              />

            </div>

            {/* Editable details */}
            <div className="mt-6 border-t border-white/10 pt-6">

              <h3 className="mb-5 text-lg font-semibold">
                Academic & Contact Details
              </h3>

              {editing ? (

                <form
                  onSubmit={handleSave}
                  className="space-y-5"
                >

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm text-slate-300"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-violet-400 sm:max-w-md"
                    />
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label
                      htmlFor="year"
                      className="mb-2 block text-sm text-slate-300"
                    >
                      Academic Year
                    </label>

                    <select
                      id="year"
                      name="year"
                      required
                      value={form.year}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-[#111B30] px-4 py-3 outline-none transition focus:border-violet-400 sm:max-w-md"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Other">Other</option>
                    </select>

                    <p className="mt-2 text-xs text-slate-400">
                      Update this when you advance to the
                      next academic year.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <p role="alert" className="text-sm text-red-300">
                      {error}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3">

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              ) : (

                <div className="grid gap-4 sm:grid-cols-2">

                  <ProfileField
                    label="Phone Number"
                    value={student.phone}
                  />

                  <ProfileField
                    label="Academic Year"
                    value={student.year}
                  />

                </div>

              )}

              {/* Success */}
              {success && (
                <div
                  role="status"
                  className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
                >
                  {success}
                </div>
              )}

            </div>
          </div>

          {/* Verification Information */}
          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

            <h3 className="font-semibold text-cyan-300">
              Account Verification
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Email verification:{" "}
              {student.emailVerifiedAt
                ? "Verified"
                : "Pending"}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              College verification:{" "}
              {student.verificationStatus === "APPROVED"
                ? "Approved"
                : student.verificationStatus === "REJECTED"
                  ? "Rejected"
                  : "Pending"}
            </p>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Updating your academic year does not
              automatically verify your college enrollment
              or grant access to restricted events.
            </p>

          </div>

        </div>
      </main>
    </>
  );
}
