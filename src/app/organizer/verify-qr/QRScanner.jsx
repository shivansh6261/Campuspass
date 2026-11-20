
"use client";

import { useEffect, useRef, useState } from "react";

export default function QRScanner() {
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [manualTicket, setManualTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null);
  const [result, setResult] = useState(null);

  async function sendRequest(action, ticket) {
    const response = await fetch(
      "/api/organizer/check-in",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ticket }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Verification failed."
      );
    }

    return data;
  }

  // STEP 1: Read QR and preview student identity
  async function previewTicket(rawTicket) {
    const ticket = rawTicket?.trim();

    if (
      !ticket ||
      busyRef.current ||
      pending
    ) {
      return;
    }

    busyRef.current = true;
    setLoading(true);
    setResult(null);

    try {
      scannerRef.current?.pause(true);
    } catch {
      // Scanner might not be running.
    }

    try {
      const data = await sendRequest(
        "preview",
        ticket
      );

      setPending({
        ticket,
        student: data.student,
        event: data.event,
        registrationId: data.registrationId,
      });

      setManualTicket("");
    } catch (error) {
      setResult({
        success: false,
        message: error.message,
      });
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  // STEP 2: Organizer confirms the ID card matches
  async function confirmCheckIn() {
    if (!pending || busyRef.current) return;

    busyRef.current = true;
    setLoading(true);
    setResult(null);

    try {
      const data = await sendRequest(
        "confirm",
        pending.ticket
      );

      setResult({
        success: true,
        message: data.message,
        student: data.student,
        event: data.event,
      });

      setPending(null);
    } catch (error) {
      setResult({
        success: false,
        message: error.message,
      });

      // Keep the preview visible so organizer can
      // understand what happened and try again.
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  // ID mismatch: never mark attendance
  function rejectIdentity() {
    if (busyRef.current) return;

    setPending(null);

    setResult({
      success: false,
      message:
        "ID card does not match the registered student. Entry not approved. Attendance has not been marked.",
    });
  }

  function scanNextTicket() {
    if (busyRef.current) return;

    setPending(null);
    setResult(null);
    setManualTicket("");

    try {
      scannerRef.current?.resume();
    } catch {
      // Camera might be inactive.
    }
  }

  async function startCamera() {
    if (scannerRef.current || startingCamera) {
      return;
    }

    setStartingCamera(true);
    setResult(null);

    try {
      const { Html5QrcodeScanner } = await import(
        "html5-qrcode"
      );

      const scanner = new Html5QrcodeScanner(
        "campuspass-qr-reader",
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          rememberLastUsedCamera: true,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          previewTicket(decodedText);
        },
        () => {
          // Ignore frames without QR codes.
        }
      );

      setCameraActive(true);
    } catch (error) {
      console.error("Camera error:", error);

      setResult({
        success: false,
        message:
          "Camera could not start. Check permissions or use manual verification.",
      });
    } finally {
      setStartingCamera(false);
    }
  }

  async function stopCamera() {
    const scanner = scannerRef.current;

    scannerRef.current = null;
    setCameraActive(false);

    if (scanner) {
      try {
        await scanner.clear();
      } catch (error) {
        console.error("Camera cleanup error:", error);
      }
    }
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-7">

      {/* QR Camera */}
      <div className="rounded-2xl border border-violet-500/20 bg-[#111B30] p-6">
        <h2 className="text-xl font-bold text-white">
          📷 Scan Student QR
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          Scan the student's QR ticket to view
          their registered identity.
        </p>

        <div
          id="campuspass-qr-reader"
          className="mt-6 overflow-hidden rounded-xl bg-white text-black"
        />

        <div className="mt-5 flex gap-3">
          {!cameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              disabled={startingCamera}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {startingCamera
                ? "Starting..."
                : "Start Camera"}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300"
            >
              Stop Camera
            </button>
          )}
        </div>
      </div>

      {/* Manual QR code input */}
      <div className="rounded-2xl border border-white/10 bg-[#111B30] p-6">
        <h2 className="text-lg font-bold text-white">
          Manual Ticket Verification
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Paste a signed ticket code to preview
          student details.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            previewTicket(manualTicket);
          }}
        >
          <textarea
            rows={3}
            maxLength={256}
            value={manualTicket}
            onChange={(event) =>
              setManualTicket(event.target.value)
            }
            placeholder="CP1.registrationId.signature"
            className="w-full rounded-xl border border-white/10 bg-[#080D1D] p-4 text-sm text-white outline-none focus:border-violet-500"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !!pending ||
              !manualTicket.trim()
            }
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading
              ? "Verifying..."
              : "Preview Student Details"}
          </button>
        </form>
      </div>

      {/* Student identity preview */}
      {pending && (
        <div className="rounded-2xl border border-cyan-500/40 bg-[#111B30] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/20 text-2xl">
              🎓
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Identity Verification Required
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Student Details
              </h2>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-[#080D1D] p-5">
            <div>
              <p className="text-xs text-slate-400">
                Student Full Name
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {pending.student.name}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">
                  Enrollment Number
                </p>
                <p className="mt-1 font-semibold text-cyan-300">
                  {pending.student.enrollment}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Department
                </p>
                <p className="mt-1 font-semibold">
                  {pending.student.department}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Academic Year
                </p>
                <p className="mt-1 font-semibold">
                  {pending.student.year}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Registered Event
                </p>
                <p className="mt-1 font-semibold">
                  {pending.event.title}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-slate-400">
                Organizing Club
              </p>
              <p className="mt-1 font-semibold">
                {pending.event.clubName}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-300">
              ⚠ Check Physical College ID
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Compare the student's face, full name
              and enrollment number with their
              college ID card before approving entry.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={confirmCheckIn}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading
                ? "Confirming..."
                : "✓ ID Matches — Check In"}
            </button>

            <button
              type="button"
              onClick={rejectIdentity}
              disabled={loading}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              ✕ ID Does Not Match
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          role="status"
          className={`rounded-2xl border p-6 ${
            result.success
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              result.success
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {result.success
              ? "✓ Entry Approved"
              : "✕ Entry Not Approved"}
          </h3>

          <p className="mt-3 text-sm text-slate-200">
            {result.message}
          </p>

          {result.success && (
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <p>
                <strong>Student:</strong>{" "}
                {result.student.name}
              </p>
              <p>
                <strong>Enrollment:</strong>{" "}
                {result.student.enrollment}
              </p>
              <p>
                <strong>Event:</strong>{" "}
                {result.event.title}
              </p>
            </div>
          )}

          {!pending && (
            <button
              type="button"
              onClick={scanNextTicket}
              className="mt-6 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Scan Next Student →
            </button>
          )}
        </div>
      )}

      {loading && !pending && (
        <p className="text-center text-sm text-cyan-400">
          Verifying ticket...
        </p>
      )}
    </div>
  );
}
