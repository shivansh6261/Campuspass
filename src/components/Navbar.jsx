
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [student, setStudent] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Check authentication when route changes
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      setChecking(true);

      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          if (!cancelled) setStudent(null);
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setStudent(data.student || null);
        }

      } catch (error) {
        console.error("Session check failed:", error);

        if (!cancelled) setStudent(null);

      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Logout
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setStudent(null);

      router.replace("/");
      router.refresh();

    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");

    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D1D]/95 backdrop-blur-xl">

      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white">
            C
          </div>

          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-xl font-extrabold text-transparent">
            CampusPass
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">

          <Link
            href="/"
            className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            Home
          </Link>

          <Link
            href="/#events"
            className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            Events
          </Link>

          {/* Loading state */}
          {checking ? (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />
          ) : student ? (
            <>
              {/* Profile */}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                  {student.name?.charAt(0).toUpperCase()}
                </span>

                <span>Profile</span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-90"
            >
              Student Login
            </Link>
          )}

        </div>
      </nav>
    </header>
  );
}
