
import { NextResponse } from "next/server";
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import { finalizePaidBooking } from "@/lib/paid-bookings";

function fail(error, status) {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}

function validSignature(orderId, paymentId, signature) {
  if (
    typeof signature !== "string" ||
    !/^[a-fA-F0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    process.env.RAZORPAY_KEY_SECRET
  )
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

export async function POST(request) {
  try {
    const origin = request.headers.get("origin");

    if (
      origin &&
      origin !== new URL(request.url).origin
    ) {
      return fail("Invalid request origin.", 403);
    }

    const student = await getCurrentStudent();

    if (!student?.id) {
      return fail("Please log in.", 401);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body.", 400);
    }

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = body || {};

    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      orderId.length > 100 ||
      paymentId.length > 100 ||
      !validSignature(orderId, paymentId, signature)
    ) {
      return fail("Invalid payment signature.", 400);
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId: orderId },
      select: {
        studentId: true,
      },
    });

    if (!order || order.studentId !== student.id) {
      return fail("Payment order not found.", 404);
    }

    const payment =
      await getRazorpay().payments.fetch(paymentId);

    if (
      payment.order_id !== orderId ||
      payment.status !== "captured"
    ) {
      return fail(
        "Payment is not captured yet. Please wait for confirmation.",
        409
      );
    }

    const result = await finalizePaidBooking(payment);

    if (result.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          error:
            "Payment captured, but the ticket could not be issued. Please contact support for refund assistance.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful. Ticket confirmed!",
      registrationId: result.registrationId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return fail(
      "Payment confirmation is pending. Check My Bookings shortly.",
      500
    );
  }
}
