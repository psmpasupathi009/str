# Razorpay Payment Gateway - Optimized Implementation

## Overview
This implementation follows Razorpay's official best practices and Indian compliance requirements (RBI regulations, OPGSP guidelines).

## Features

### ✅ Security & Compliance
- **Signature Verification** (MANDATORY) - Prevents data tampering
- **Status Verification** - Ensures payment is captured/authorized before providing services
- **HTTPS Only** - All API calls use secure connections
- **PCI DSS Compliant** - No card data stored on our servers

### ✅ Best Practices Implemented
- **Orders API Integration** - Prevents duplicate payments
- **Server-side Order Creation** - Secure order generation
- **Webhook Support** - Handles server-to-server callbacks
- **Idempotency** - Prevents duplicate order creation
- **Error Handling** - Comprehensive error messages and retry logic

### ✅ Real-time Features
- **Live Payment Status** - Real-time verification
- **Instant Feedback** - User-friendly loading states
- **Automatic Retries** - Network error handling
- **Timeout Protection** - Prevents hanging requests

## Payment Flow

```
1. User clicks "Pay Now"
   ↓
2. Client → Server: Create Razorpay Order
   ↓
3. Server → Razorpay: Create Order API
   ↓
4. Server → Client: Return Order ID + Key
   ↓
5. Client: Open Razorpay Checkout Modal
   ↓
6. User completes payment
   ↓
7. Razorpay → Client: Payment callback
   ↓
8. Client → Server: Verify Payment
   ↓
9. Server → Razorpay: Verify Signature + Status
   ↓
10. Server: Create Order in Database
   ↓
11. Server → Client: Success response
   ↓
12. Client: Redirect to success page
```

## Environment Variables

Add these to your `.env` file:

```env
# Razorpay API Keys (Required)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here

# Webhook Secret (Optional - for webhook verification)
# Get this from Razorpay Dashboard > Settings > Webhooks
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Setup Instructions

### 1. Get Razorpay Keys
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings > API Keys**
3. Generate or copy your **Key ID** and **Key Secret**
4. For production, use **Live Mode** keys (starts with `rzp_live_`)
5. For development, use **Test Mode** keys (starts with `rzp_test_`)

### 2. Configure Webhooks (Recommended)
1. Go to **Settings > Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Enable events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Copy the **Webhook Secret** to `.env` file

### 3. Test Mode vs Live Mode

**Test Mode:**
- Key ID starts with `rzp_test_`
- Use for development and testing
- No real money transactions
- Test cards available in Razorpay docs

**Live Mode:**
- Key ID starts with `rzp_live_`
- Use for production
- Real money transactions
- Requires KYC verification

## API Endpoints

### 1. Create Order
```
POST /api/razorpay/create-order
Body: {
  amount: number,
  items: Array,
  customerName?: string,
  customerEmail?: string,
  customerPhone?: string,
  userId?: string,
  shippingAddress?: object
}
```

### 2. Verify Payment
```
POST /api/razorpay/verify-payment
Body: {
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  orderData: object
}
```

### 3. Webhook (Server-to-Server)
```
POST /api/razorpay/webhook
Headers: {
  x-razorpay-signature: string,
  x-razorpay-event-id: string
}
```

## Indian Compliance Requirements

### RBI Regulations
- ✅ Payment Aggregator License (Razorpay handles this)
- ✅ Secure payment processing
- ✅ Transaction monitoring
- ✅ Customer data protection

### OPGSP Guidelines
- ✅ PCI DSS compliance
- ✅ Multi-factor authentication
- ✅ Fraud detection
- ✅ Dispute resolution

### KYC Requirements
- Customer information collection
- Address verification
- Phone/Email verification

## Error Handling

The implementation handles:
- ✅ Network timeouts
- ✅ Authentication failures
- ✅ Invalid signatures
- ✅ Duplicate payments
- ✅ Payment failures
- ✅ Order creation errors

## Testing

### Test Cards (Test Mode Only)
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **3D Secure**: `4012 0010 3714 1112`

### Test UPI IDs
- `success@razorpay`
- `failure@razorpay`

## Monitoring

Check logs for:
- `[Razorpay]` - Payment operations
- `[API]` - API endpoint calls
- `[Webhook]` - Webhook events

## Support

For issues:
1. Check Razorpay Dashboard for transaction status
2. Review server logs for error details
3. Verify `.env` file configuration
4. Contact Razorpay Support: support@razorpay.com

## Security Notes

⚠️ **IMPORTANT:**
- Never expose `RAZORPAY_KEY_SECRET` in client-side code
- Always verify payment signatures server-side
- Use HTTPS in production
- Keep webhook secret secure
- Monitor for suspicious transactions
