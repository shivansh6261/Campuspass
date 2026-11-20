
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_RETRIES = 5;

export async function finalizePaidBooking(payment) {
  if (
    payment?.status !== "captured" ||
    !payment?.order_id ||
    !payment?.id
  ) {
    throw new Error("Payment is not captured.");
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const order = await tx.paymentOrder.findUnique({
            where: {
              razorpayOrderId: payment.order_id,
            },
            include: {
              event: {
                include: {
                  club: {
                    select: { isActive: true },
                  },
                },
              },
            },
          });

          if (!order) {
            throw new Error("Payment order not found.");
          }

          // Validate gateway amount and currency.
          if (
            Number(payment.amount) !== order.amountPaise ||
            payment.currency !== order.currency
          ) {
            throw new Error(
              "Payment amount or currency mismatch."
            );
          }

          // Idempotent: don't issue another registration.
          if (order.status === "PAID") {
            if (
              order.razorpayPaymentId !== payment.id
            ) {
              return {
                status: "REFUND_REQUIRED",
                registrationId: null,
              };
            }

            return {
              status: "PAID",
              registrationId: order.registrationId,
            };
          }

          if (
            order.status === "REFUND_REQUIRED" ||
            order.status === "REFUNDED"
          ) {
            return {
              status: order.status,
              registrationId: null,
            };
          }

          const now = new Date();
          const event = order.event;

          const student = await tx.student.findUnique({
            where: { id: order.studentId },
            select: { accountStatus: true },
          });

          const existingRegistration =
            await tx.registration.findUnique({
              where: {
                studentId_eventId: {
                  studentId: order.studentId,
                  eventId: order.eventId,
                },
              },
              select: { id: true },
            });

          // Count confirmed seats.
          const registeredCount =
            await tx.registration.count({
              where: { eventId: order.eventId },
            });

          // Other students' active seat holds.
          // Holds belonging to this student will be
          // released after their payment is confirmed.
          const otherHolds =
            await tx.paymentOrder.count({
              where: {
                eventId: order.eventId,
                studentId: {
                  not: order.studentId,
                },
                status: {
                  in: ["RESERVED", "ORDER_CREATED"],
                },
                expiresAt: {
                  gt: now,
                },
              },
            });

          const canConfirm =
            event.status === "PUBLISHED" &&
            event.club.isActive &&
            event.isPaid &&
            student?.accountStatus === "ACTIVE" &&
            now < event.startAt &&
            !existingRegistration &&
            registeredCount + otherHolds < event.capacity;

          if (!canConfirm) {
            // Money was captured but a ticket cannot
            // be safely issued. Flag for refund.
            await tx.paymentOrder.update({
              where: { id: order.id },
              data: {
                status: "REFUND_REQUIRED",
                razorpayPaymentId: payment.id,
              },
            });

            return {
              status: "REFUND_REQUIRED",
              registrationId: null,
            };
          }

          // Create the confirmed registration.
          const registration =
            await tx.registration.create({
              data: {
                studentId: order.studentId,
                eventId: order.eventId,
              },
            });

          await tx.paymentOrder.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              razorpayPaymentId: payment.id,
              registrationId: registration.id,
            },
          });

          // Release this student's other pending holds.
          await tx.paymentOrder.updateMany({
            where: {
              studentId: order.studentId,
              eventId: order.eventId,
              id: { not: order.id },
              status: {
                in: ["RESERVED", "ORDER_CREATED"],
              },
            },
            data: { status: "EXPIRED" },
          });

          return {
            status: "PAID",
            registrationId: registration.id,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        }
      );
    } catch (error) {
      // Retry concurrent transaction conflicts.
      if (
        (error.code === "P2034" ||
          error.code === "P2002") &&
        attempt < MAX_RETRIES - 1
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Payment confirmation retry limit reached.");
}
