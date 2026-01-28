# Payment Flow Verification Guide

## Complete Payment Flow Overview

### Flow 1: Add to Cart → Checkout → Payment
1. **Product Page** → User clicks "Add to Cart"
   - Item saved to localStorage
   - Cart count updated in navbar
   
2. **Cart Page** → User reviews items
   - Shows all cart items with quantities
   - Total calculation
   - "Proceed to Checkout" button

3. **Checkout Page** → User fills shipping address
   - Form validation
   - Order summary
   - "Proceed to Payment" button

4. **Payment** → Razorpay checkout opens
   - Order created on server
   - Payment modal opens
   - User completes payment

5. **Payment Success** → Order created in database
   - Cart cleared
   - Redirect to success page
   - Order ID displayed

### Flow 2: Buy Now → Checkout → Payment
1. **Product Page** → User clicks "Buy Now"
   - Redirects to checkout with product details
   - No cart involvement

2. **Checkout Page** → Same as Flow 1, step 3

3. **Payment** → Same as Flow 1, step 4

4. **Payment Success** → Same as Flow 1, step 5

## Payment Flow Steps

### Step 1: Order Creation (`/api/razorpay/create-order`)
- ✅ Validates amount and items
- ✅ Converts amount to paise
- ✅ Creates Razorpay order
- ✅ Returns order ID and key
- ❌ Does NOT create database order yet

### Step 2: Payment Processing (Razorpay Checkout)
- ✅ Opens Razorpay modal
- ✅ User selects payment method
- ✅ User completes payment
- ✅ Razorpay returns payment details

### Step 3: Payment Verification (`/api/razorpay/verify-payment`)
- ✅ Verifies payment signature (MANDATORY)
- ✅ Verifies payment status (captured/authorized)
- ✅ Creates order in database
- ✅ Prevents duplicate orders
- ✅ Returns order ID

### Step 4: Success Handling
- ✅ Cart cleared from localStorage
- ✅ Cart count updated
- ✅ Redirect to success page
- ✅ Order details displayed

## Error Handling

### Order Creation Errors
- Invalid amount → Error message shown
- Missing items → Error message shown
- Razorpay API error → Detailed error message
- Network error → Retry option

### Payment Errors
- Payment failed → Redirect to failure page
- Payment cancelled → User can retry
- Verification failed → Error message, no order created

### Verification Errors
- Invalid signature → Payment rejected
- Payment not captured → Error message
- Network error → Error message

## Testing Checklist

### ✅ Test Mode
- [ ] Test with Razorpay test keys
- [ ] Test successful payment
- [ ] Test failed payment
- [ ] Test payment cancellation
- [ ] Test invalid amount
- [ ] Test empty cart

### ✅ Live Mode
- [ ] Verify live keys configured
- [ ] Test with real payment (small amount)
- [ ] Verify order creation
- [ ] Verify cart clearing
- [ ] Verify order details page

### ✅ Edge Cases
- [ ] Multiple rapid clicks on payment button
- [ ] Network interruption during payment
- [ ] Browser back button during payment
- [ ] Payment timeout
- [ ] Duplicate payment attempts
- [ ] Empty shipping address
- [ ] Invalid email/phone format

## Common Issues & Solutions

### Issue: "Razorpay authentication failed"
**Solution:**
- Check `.env` file has correct keys
- Verify keys match test/live mode
- Restart server after changing `.env`
- Check for extra spaces in `.env` values

### Issue: "Payment verification failed"
**Solution:**
- Check webhook secret (if using webhooks)
- Verify signature verification logic
- Check payment status in Razorpay dashboard

### Issue: "Cart not clearing after payment"
**Solution:**
- Check localStorage is accessible
- Verify cartUpdated event is dispatched
- Check browser console for errors

### Issue: "Order not created in database"
**Solution:**
- Check payment verification succeeded
- Verify database connection
- Check server logs for errors
- Verify order data structure

## Monitoring

### Logs to Check
- `[Razorpay]` - Payment operations
- `[API]` - API endpoint calls
- `[Payment]` - Client-side payment flow
- `[Webhook]` - Webhook events (if configured)

### Razorpay Dashboard
- Check Orders section for created orders
- Check Payments section for payment status
- Check Webhooks section for webhook deliveries
- Check Logs for API errors

## Security Checklist

- ✅ Signature verification implemented
- ✅ Payment status verification
- ✅ Server-side order creation
- ✅ No sensitive data in client
- ✅ HTTPS in production
- ✅ Webhook signature verification
- ✅ Duplicate order prevention

## Performance

- ✅ Razorpay script preloaded
- ✅ Order creation cached
- ✅ Timeout handling
- ✅ Error retry logic
- ✅ Optimized API calls
