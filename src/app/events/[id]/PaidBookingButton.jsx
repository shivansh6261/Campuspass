
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.getElementById(
      "razorpay-checkout-script"
    );

    if (existing) {
      existing.addEventListener(
        "load",
        () => resolve(true),
        { once: true }
      );
      existing.addEventListener(
        "error",
        () => resolve(false),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");

    script.id = "razorpay-checkout-script";
    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export default function PaidBookingButton({
  eventId,
  eventTitle = "CampusPass Event",
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  function showMessage(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  async function handlePayment() {
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay Checkout."
        );
      }

      // 1. Reserve seat and create Razorpay order.
      const orderResponse = await fetch(
        "/api/payments/create-order",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eventId }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            "Unable to create payment order."
        );
      }

      const expiresAt = new Date(
        orderData.expiresAt
      ).getTime();

      if (Date.now() >= expiresAt) {
        throw new Error(
          "Seat reservation expired. Please retry."
        );
      }

      // 2. Open Razorpay Checkout.
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CampusPass",
        description: eventTitle,
        order_id: orderData.orderId,

        theme: {
          color: "#7C3AED",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            showMessage(
              "Payment window closed. Your seat hold will expire automatically if no payment is captured.",
              "info"
            );
          },
        },

        handler: async (response) => {
          showMessage(
            "Payment received. Verifying your booking...",
            "info"
          );

          try {
            // 3. Verify payment on our backend.
            const verifyResponse = await fetch(
              "/api/payments/verify",
              {
                method: "POST",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const result = await verifyResponse.json();

            if (!verifyResponse.ok) {
              showMessage(
                result.error ||
                  "Payment verification pending. Check My Bookings.",
                "error"
              );
              return;
            }

            showMessage(
              "Payment verified! Opening your QR ticket...",
              "success"
            );

            router.push(
              `/student/bookings/${result.registrationId}/ticket`
            );

            router.refresh();
          } catch (error) {
            showMessage(
              "Payment status could not be confirmed. Check My Bookings shortly. Do not pay again until you verify the status.",
              "error"
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        showMessage(
          response.error?.description ||
            "Payment failed. Please retry.",
          "error"
        );

        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      showMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : "💳 Book Ticket & Pay"}
      </button>

      {message && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm ${
            messageType === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : messageType === "info"
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        Secure checkout powered by Razorpay.
        Your QR ticket is issued after payment confirmation.
      </p>
    </div>
  );
}
