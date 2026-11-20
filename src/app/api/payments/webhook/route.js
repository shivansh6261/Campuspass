
import { NextResponse } from "next/server";
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { getRazorpay } from "@/lib/razorpay";
import { finalizePaidBooking } from "@/lib/paid-bookings";

export async function POST(request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("Razorpay webhook secret missing.");

    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 500 }
    );
  }

  // Use raw body. Do not JSON.parse before verifying.
  const rawBody = await request.text();
  const signature = request.headers.get(
    "x-razorpay-signature"
  );

  const expected = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (
    !signature ||
    !/^[a-fA-F0-9]{64}$/.test(signature) ||
    !timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    )
  ) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  try {
    const payload = JSON.parse(rawBody);

    if (payload.event !== "payment.captured") {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const paymentId =
      payload.payload?.payment?.entity?.id;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID." },
        { status: 400 }
      );
    }

    // Fetch the current payment state from Razorpay.
    const payment =
      await getRazorpay().payments.fetch(paymentId);

    const result = await finalizePaidBooking(payment);

    if (result.status === "REFUND_REQUIRED") {
      console.error(
        "Paid booking requires refund reconciliation:",
        payment.order_id
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Payment webhook processing failed:", error);

    // Razorpay can retry failed webhook deliveries.
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
