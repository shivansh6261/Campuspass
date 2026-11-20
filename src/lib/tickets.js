
import { createHmac, timingSafeEqual } from "node:crypto";

const TICKET_VERSION = "CP1";

function getSigningSecret() {
  const secret = process.env.TICKET_SIGNING_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "TICKET_SIGNING_SECRET is missing or too short."
    );
  }

  return secret;
}

// Generate cryptographically signed ticket
export function createTicket(registrationId) {
  if (
    typeof registrationId !== "string" ||
    !/^[a-zA-Z0-9_-]{10,80}$/.test(registrationId)
  ) {
    throw new Error("Invalid registration ID.");
  }

  const payload = `${TICKET_VERSION}.${registrationId}`;

  const signature = createHmac(
    "sha256",
    getSigningSecret()
  )
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

// Verify QR ticket authenticity
export function verifyTicket(ticket) {
  if (
    typeof ticket !== "string" ||
    ticket.length > 256
  ) {
    return null;
  }

  const parts = ticket.trim().split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [version, registrationId, signature] = parts;

  if (
    version !== TICKET_VERSION ||
    !/^[a-zA-Z0-9_-]{10,80}$/.test(registrationId) ||
    !/^[a-zA-Z0-9_-]{43}$/.test(signature)
  ) {
    return null;
  }

  const payload = `${version}.${registrationId}`;

  const expectedSignature = createHmac(
    "sha256",
    getSigningSecret()
  )
    .update(payload)
    .digest("base64url");

  const received = Buffer.from(signature, "base64url");
  const expected = Buffer.from(
    expectedSignature,
    "base64url"
  );

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  return registrationId;
}
