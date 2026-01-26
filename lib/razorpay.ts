import Razorpay from "razorpay";

// Lazy initialization function to validate and create Razorpay instance
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const missing = [];
    if (!keyId) missing.push("RAZORPAY_KEY_ID");
    if (!keySecret) missing.push("RAZORPAY_KEY_SECRET");
    throw new Error(
      `Razorpay credentials are missing: ${missing.join(", ")}. Please add them to your .env file.`
    );
  }

  if (keySecret.trim() === "") {
    throw new Error(
      "RAZORPAY_KEY_SECRET is empty. Please add your Razorpay secret key to the .env file. You can find it in your Razorpay Dashboard > Settings > API Keys."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Export a getter function instead of direct instance
export function getRazorpay() {
  return getRazorpayInstance();
}

export interface CreateOrderParams {
  amount: number; // Amount in paise (smallest currency unit)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  try {
    const razorpay = getRazorpayInstance();
    
    const options = {
      amount: params.amount, // amount in paise
      currency: params.currency || "INR",
      receipt: params.receipt || `receipt_${Date.now()}`,
      notes: params.notes || {},
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    
    // Provide more specific error messages
    if (error.statusCode === 401) {
      throw new Error(
        "Razorpay authentication failed. Please check that your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file are correct and match your Razorpay account. Make sure the secret key is not empty."
      );
    }
    
    if (error.error?.description) {
      throw new Error(`Razorpay error: ${error.error.description}`);
    }
    
    throw new Error(error.message || "Failed to create Razorpay order");
  }
}

export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    const razorpay = getRazorpayInstance();
    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET!;

    if (!secret || secret.trim() === "") {
      return { isValid: false, error: "Razorpay secret key is not configured" };
    }

    // Create the signature
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // Verify the signature
    if (generatedSignature !== razorpaySignature) {
      return { isValid: false, error: "Invalid payment signature" };
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.status === "captured" || payment.status === "authorized") {
      return { isValid: true, payment };
    }

    return { isValid: false, error: "Payment not captured" };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return { isValid: false, error: error.message || "Payment verification failed" };
  }
}
