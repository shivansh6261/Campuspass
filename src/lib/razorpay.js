
import Razorpay from "razorpay";

let instance;

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay API credentials are missing.");
  }

  if (!instance) {
    instance = new Razorpay({ key_id, key_secret });
  }

  return instance;
}
