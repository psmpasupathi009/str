import Razorpay from "razorpay";
import * as crypto from "crypto";

// Cache Razorpay instance for better performance
let razorpayInstance: Razorpay | null = null;

/**
 * Get Razorpay instance (singleton pattern)
 * Follows Razorpay best practices for initialization
 */
function getRazorpayInstance(): Razorpay {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  // Validate credentials
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file"
    );
  }

  // Validate key format
  if (!keyId.startsWith("rzp_test_") && !keyId.startsWith("rzp_live_")) {
    throw new Error("Invalid RAZORPAY_KEY_ID format. Must start with 'rzp_test_' or 'rzp_live_'");
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
}

/**
 * Detect Razorpay mode (test or live)
 */
export function getRazorpayMode(): "test" | "live" {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  return keyId.startsWith("rzp_test_") ? "test" : "live";
}

export interface CreateOrderParams {
  amount: number; // Amount in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

/**
 * Create Razorpay Order
 * Following Razorpay best practices: Orders API integration prevents duplicate payments
 */
export async function createRazorpayOrder(params: CreateOrderParams) {
  try {
    const razorpay = getRazorpayInstance();
    
    // Validate amount (minimum 1 paise = ₹0.01)
    if (params.amount < 1) {
      throw new Error("Amount must be at least ₹0.01");
    }

    // Maximum amount: ₹9,99,999.99 (99,99,999 paise)
    const MAX_AMOUNT = 99999999;
    if (params.amount > MAX_AMOUNT) {
      throw new Error(`Amount exceeds maximum limit of ₹${(MAX_AMOUNT / 100).toLocaleString('en-IN')}`);
    }

    const order = await razorpay.orders.create({
      amount: params.amount,
      currency: params.currency || "INR",
      receipt: params.receipt || `receipt_${Date.now()}`,
      notes: params.notes || {},
    });

    return order;
  } catch (error: any) {
    // Handle authentication errors
    if (error.statusCode === 401 || error.statusCode === 403) {
      throw new Error(
        "Razorpay authentication failed. Please verify your API keys in .env file match your Razorpay account."
      );
    }

    // Handle Razorpay API errors
    if (error.error?.description) {
      throw new Error(`Razorpay: ${error.error.description}`);
    }

    throw new Error(error.message || "Failed to create Razorpay order");
  }
}

/**
 * Verify Payment Signature
 * MANDATORY: Signature verification prevents data tampering (Razorpay best practice)
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  
  if (!secret) {
    console.error("[Razorpay] Secret key not configured");
    return false;
  }

  // Generate expected signature
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf8"),
      Buffer.from(razorpaySignature, "utf8")
    );
  } catch {
    // Fallback to simple comparison if timingSafeEqual fails
    return generatedSignature === razorpaySignature;
  }
}

/**
 * Verify Payment Status
 * Following Razorpay best practices: Check payment status before providing services
 */
export async function verifyPaymentStatus(
  razorpayPaymentId: string
): Promise<{ isValid: boolean; payment?: any; error?: string }> {
  try {
    const razorpay = getRazorpayInstance();
    
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    // Payment must be captured or authorized
    if (payment.status === "captured" || payment.status === "authorized") {
      return { isValid: true, payment };
    }

    return { 
      isValid: false, 
      error: `Payment status is '${payment.status}'. Payment must be 'captured' or 'authorized'.` 
    };
  } catch (error: any) {
    console.error("[Razorpay] Error fetching payment:", error);
    return { 
      isValid: false, 
      error: error.message || "Failed to verify payment status" 
    };
  }
}

/**
 * Complete Payment Verification
 * Combines signature verification and status check (Razorpay best practice)
 */
export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ isValid: boolean; payment?: any; error?: string }> {
  // Step 1: Verify signature (MANDATORY)
  const signatureValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!signatureValid) {
    return { isValid: false, error: "Invalid payment signature" };
  }

  // Step 2: Verify payment status
  return await verifyPaymentStatus(razorpayPaymentId);
}

/**
 * Get Razorpay instance (for direct API access if needed)
 */
export function getRazorpay() {
  return getRazorpayInstance();
}
