
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    enrollment: "",
    phone: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-300";

  function handleChange(e) {
  const { name, value } = e.target;

  setForm((previous) => ({
    ...previous,
    [name]: value,
  }));

  setError("");
}

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!/^[0-9]{10}$/.test(form.phone)) {
        setError("Enter a valid 10-digit phone number.");
        return;
      }

      if (!form.enrollment.trim()) {
        setError("Enrollment number is required.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (form.password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }
    }

    // Backend authentication will be added later.
    setError(
      "Form validated. Authentication backend is not connected yet."
    );
  }

  return (
   <> <Navbar />
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D1D] px-5 py-12 text-white">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />

      <div className="relative w-full max-w-lg">

        {/* Back Link */}
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
        >
          ← Back to CampusPass
        </Link>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-[#111B30]/90 p-6 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-9">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-bold shadow-lg shadow-violet-500/20">
              C
            </div>

            <h1 className="text-3xl font-extrabold">
              {mode === "login"
                ? "Welcome Back!"
                : "Join CampusPass"}
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              {mode === "login"
                ? "Sign in to explore your campus experiences."
                : "Create your student account to register for college events."}
            </p>
          </div>

          {/* Login / Register Tabs */}
          <div className="mt-8 grid grid-cols-2 rounded-xl bg-[#080D1D] p-1">

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-lg py-3 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`rounded-lg py-3 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >

            {/* Registration Fields */}
            {mode === "register" && (
              <>
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* College Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                College Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your college email"
                className={inputClass}
              />
            </div>

            {mode === "register" && (
              <>
                {/* Enrollment Number */}
                <div>
                  <label htmlFor="enrollment" className={labelClass}>
                    Enrollment Number *
                  </label>
                  <input
                    id="enrollment"
                    name="enrollment"
                    type="text"
                    required
                    value={form.enrollment}
                    onChange={handleChange}
                    placeholder="Enter enrollment number"
                    className={inputClass}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={inputClass}
                  />
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className={labelClass}>
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={form.department}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className="bg-[#111B30]">
                      Select Department
                    </option>
                    {[
                      "Computer Science",
                      "Information Technology",
                      "Electronics",
                      "Electrical",
                      "Mechanical",
                      "Civil",
                      "Industrial & Production",
                      "Other",
                    ].map((dept) => (
                      <option
                        key={dept}
                        value={dept}
                        className="bg-[#111B30]"
                      >
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label htmlFor="year" className={labelClass}>
                    Academic Year *
                  </label>
                  <select
                    id="year"
                    name="year"
                    required
                    value={form.year}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className="bg-[#111B30]">
                      Select Year
                    </option>
                    {["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"].map(
                      (year) => (
                        <option
                          key={year}
                          value={year}
                          className="bg-[#111B30]"
                        >
                          {year}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password *
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={mode === "register" ? 8 : undefined}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={`${inputClass} pr-16`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-cyan-400"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {mode === "register" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={labelClass}
                >
                  Confirm Password *
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={inputClass}
                />
              </div>
            )}

            {/* Error / Information */}
            {error && (
              <div
                role="status"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
            >
              {mode === "login"
                ? "Sign In →"
                : "Create Account →"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-7 text-center text-xs leading-relaxed text-slate-500">
            Exclusive to SGSITS students.
            <br />
            Secure verification will be enabled
            when authentication is connected.
          </p>
        </div>
      </div>
    </main>
    </>
  );
}
