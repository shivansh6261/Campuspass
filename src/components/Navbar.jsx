
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check logged-in user when the route changes
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      setChecking(true);

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          if (!cancelled) {
            setStudent(null);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setStudent(data.student || null);
        }
      } catch (error) {
        console.error("Session check failed:", error);

        if (!cancelled) {
          setStudent(null);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
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
      setMobileMenuOpen(false);

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  // Role-based dashboard configuration
  const dashboardConfig = {
    STUDENT: {
      href: "/student",
      label: "Student Dashboard",
      icon: "🎓",
      className:
        "border-violet-400/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20",
    },

    ORGANIZER: {
      href: "/organizer",
      label: "Organizer Dashboard",
      icon: "📊",
      className:
        "border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
    },

    ADMIN: {
      href: "/admin",
      label: "Admin Dashboard",
      icon: "🛡️",
      className:
        "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    },
  };

  const dashboard = student
    ? dashboardConfig[student.role]
    : null;

  // Navigation links
  function NavigationLinks() {
    return (
      <>
        {/* Home */}
        <Link
          href="/"
          className={`text-sm font-medium transition hover:text-cyan-400 ${
            pathname === "/"
              ? "text-cyan-400"
              : "text-slate-300"
          }`}
        >
          Home
        </Link>

        {/* Events */}
        <Link
          href="/#events"
          className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
        >
          Events
        </Link>

        {/* Loading authentication */}
        {checking ? (
          <div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />
        ) : student ? (
          <>
            {/* Role-based Dashboard */}
            {dashboard && (
              <Link
                href={dashboard.href}
                aria-current={
                  pathname === dashboard.href
                    ? "page"
                    : undefined
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  dashboard.className
                } ${
                  pathname === dashboard.href
                    ? "ring-1 ring-current/30"
                    : ""
                }`}
              >
                <span>{dashboard.icon}</span>
                <span>{dashboard.label}</span>
              </Link>
            )}

            {/* Profile */}
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                {student.name?.charAt(0).toUpperCase() || "U"}
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
          /* Guest login */
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-90"
          >
            Student Login
          </Link>
        )}
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D1D]/95 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-5 py-4">

        <div className="flex items-center justify-between gap-4">

          {/* CampusPass Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white">
              C
            </div>

            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-xl font-extrabold text-transparent">
              CampusPass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden flex-wrap items-center gap-3 lg:flex">
            <NavigationLinks />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="campuspass-mobile-menu"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10 lg:hidden"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            id="campuspass-mobile-menu"
            className="mt-5 flex flex-col items-stretch gap-4 border-t border-white/10 pt-5 lg:hidden"
          >
            <NavigationLinks />
          </div>
        )}

      </nav>
    </header>
  );
}
