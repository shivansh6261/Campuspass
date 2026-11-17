
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();

  // Login / Registration mode
  const [mode, setMode] = useState("login");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
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

  // Tailwind styles
  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-300";

  // Update form values
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // Switch between Login and Register
  function switchMode(newMode) {
    if (loading) return;

    setMode(newMode);
    setError("");
    setSuccess("");
    setShowPassword(false);

    // Clear passwords when changing modes
    setForm((previous) => ({
      ...previous,
      password: "",
      confirmPassword: "",
    }));
  }

  // Handle Login and Registration
  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    // ==================================
    // STEP 1: STUDENT LOGIN
    // ==================================
    if (mode === "login") {
      setLoading(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            password: form.password,
          }),
        });

        const data = await response.json();

        // Handle login errors
        if (!response.ok) {
          setError(
            data.message ||
              "Invalid email or password."
          );
          return;
        }

        // Login successful
        setSuccess("Login successful! Redirecting...");

        // Clear password fields
        setForm((previous) => ({
          ...previous,
          password: "",
          confirmPassword: "",
        }));

        // Redirect after login
        router.replace("/");
        router.refresh();

      } catch (err) {
        console.error("Login request failed:", err);

        setError(
          "Unable to connect to the server. Please try again."
        );

      } finally {
        setLoading(false);
      }

      return;
    }

    // ==================================
    // STEP 2: STUDENT REGISTRATION
    // ==================================

    // Validate full name
    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    // Validate email
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Validate enrollment
    if (!form.enrollment.trim()) {
      setError("Enrollment number is required.");
      return;
    }

    // Validate phone
    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    // Validate department
    if (!form.department) {
      setError("Please select your department.");
      return;
    }

    // Validate academic year
    if (!form.year) {
      setError("Please select your academic year.");
      return;
    }

    // Validate password length
    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    // Validate matching passwords
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ==================================
    // STEP 3: SEND REGISTRATION REQUEST
    // ==================================
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          enrollment: form.enrollment.trim(),
          phone: form.phone,
          department: form.department,
          year: form.year,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json();

      // Handle registration errors
      if (!response.ok) {
        setError(
          data.message ||
            "Registration failed. Please try again."
        );
        return;
      }

      // Registration successful
      setSuccess(
        data.message ||
          "Registration received successfully!"
      );

      // Clear password fields
      setForm((previous) => ({
        ...previous,
        password: "",
        confirmPassword: "",
      }));

    } catch (err) {
      console.error("Registration request failed:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

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

          {/* Authentication Card */}
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
                disabled={loading}
                onClick={() => switchMode("login")}
                className={`rounded-lg py-3 text-sm font-semibold transition disabled:opacity-50 ${
                  mode === "login"
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode("register")}
                className={`rounded-lg py-3 text-sm font-semibold transition disabled:opacity-50 ${
                  mode === "register"
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </button>

            </div>

            {/* Authentication Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              {/* Full Name */}
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="name"
                    className={labelClass}
                  >
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
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className={labelClass}
                >
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={inputClass}
                />
              </div>

              {/* Registration Fields */}
              {mode === "register" && (
                <>

                  {/* Enrollment Number */}
                  <div>
                    <label
                      htmlFor="enrollment"
                      className={labelClass}
                    >
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
                    <label
                      htmlFor="phone"
                      className={labelClass}
                    >
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
                    <label
                      htmlFor="department"
                      className={labelClass}
                    >
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
                      <option
                        value=""
                        className="bg-[#111B30]"
                      >
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
                    <label
                      htmlFor="year"
                      className={labelClass}
                    >
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
                      <option
                        value=""
                        className="bg-[#111B30]"
                      >
                        Select Year
                      </option>

                      {[
                        "1st Year",
                        "2nd Year",
                        "3rd Year",
                        "4th Year",
                        "Other",
                      ].map((year) => (
                        <option
                          key={year}
                          value={year}
                          className="bg-[#111B30]"
                        >
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                </>
              )}

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className={labelClass}
                >
                  Password *
                </label>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={
                      mode === "register" ? 8 : undefined
                    }
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
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
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

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
                >
                  <p className="font-semibold">
                    {mode === "login"
                      ? "Login Successful!"
                      : "Registration Received!"}
                  </p>

                  <p className="mt-2">
                    {success}
                  </p>

                  {mode === "register" && (
                    <>
                      <p className="mt-2 text-xs text-emerald-200/70">
                        Your email and college enrollment
                        are not verified yet. Verification
                        is required before accessing
                        student-only features.
                      </p>

                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="mt-4 rounded-lg border border-emerald-400/30 px-4 py-2 text-sm font-semibold hover:bg-emerald-500/10"
                      >
                        Go to Login →
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  (mode === "register" && Boolean(success))
                }
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? mode === "login"
                    ? "Signing In..."
                    : "Creating Account..."
                  : mode === "login"
                    ? "Sign In →"
                    : success
                      ? "Registration Received ✓"
                      : "Create Account →"}
              </button>

            </form>

            {/* Footer */}
            <p className="mt-7 text-center text-xs leading-relaxed text-slate-500">
              Exclusive to SGSITS students.
              <br />
              Email and college verification
              are required before account approval.
            </p>

          </div>
        </div>
      </main>
    </>
  );
}
