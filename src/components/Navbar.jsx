
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D1D]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-xl font-bold text-white shadow-lg shadow-violet-500/20">
            C
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-white">
            Campus
            <span className="text-violet-400">
              Pass.
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <Link
            href="/#events"
            className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            Explore Events
          </Link>

          <Link
            href="/#about"
            className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
          >
            About
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:scale-105 hover:shadow-violet-500/40"
          >
            Student Login ↗
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="rounded-lg border border-white/20 p-2 text-white md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0D1428] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-5">

            <Link
              href="/#events"
              onClick={() => setMenuOpen(false)}
              className="text-slate-300 hover:text-cyan-400"
            >
              Explore Events
            </Link>

            <Link
              href="/#about"
              onClick={() => setMenuOpen(false)}
              className="text-slate-300 hover:text-cyan-400"
            >
              About
            </Link>

            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold text-white"
            >
              Student Login
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}
