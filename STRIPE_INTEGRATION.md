# Stripe Payment Integration - Complete Guide

## Overview
This application uses **Stripe** for all payment processing with three payment methods:
- ✅ **Credit Card** payments (Save for future use)
- ✅ **Stripe Online Payment** (Immediate one-time payments)
- ✅ **Bank Transfer** (ACH) payments

## Payment Methods Explained

### 1. Credit Card (Save Payment Method)
- **Purpose**: Save card details for recurring payments
- **Use Case**: Subscription billing, automatic renewals
- **Process**: Uses Stripe Setup Intent to securely save card
- **Storage**: Card token stored, no actual card details on your server

### 2. Stripe Online Payment
- **Purpose**: Immediate one-time payments
- **Use Case**: Pay now for subscription, top-ups, one-time charges
- **Process**: Uses Stripe Payment Intent for instant payment
- **Storage**: No payment method saved, payment processed immediately

### 3. Bank Transfer
- **Purpose**: ACH bank account payments
- **Use Case**: Direct debit, bank transfers
- **Process**: Collect bank details via Stripe
- **Storage**: Bank account token stored securely

## Setup Instructions

### Backend Setup (Laravel API)

#### 1. Install Stripe PHP SDK
```bash
cd c:\xampp\htdocs\open-nurses-api
composer require stripe/stripe-php
```

#### 2. Configure Environment Variables
Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

#### 3. Run Database Migration
```bash
php artisan migrate
```

This creates the `payments` table for tracking online payments.

### Frontend Setup (Next.js)

#### 1. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 2. Restart Development Server
```bash
npm run dev
```

## API Endpoints

### Payment Methods

#### Get All Payment Methods
```
GET /api/employer/payment-methods
```

#### Create Setup Intent (for saving cards)
```
POST /api/employer/payment-methods/setup-intent
```

#### Add Payment Method
```
POST /api/employer/payment-methods
Body: {
  "stripe_payment_method_id": "pm_xxxxx",
  "is_default": true
}
```

### Online Payments

#### Create Payment Intent
```
POST /api/employer/payments/intent
Body: {
  "amount": 200.00,
  "currency": "gbp",
  "description": "Subscription payment",
  "payment_method_id": 123 (optional - use saved method)
}
```

#### Get Payment Status
```
GET /api/employer/payments/{id}/status
```

#### Get All Payments
```
GET /api/employer/payments
```

## Testing

### Test Cards

| Purpose | Card Number | CVC | Date |
|---------|-------------|-----|------|
| Success | 4242 4242 4242 4242 | Any 3 digits | Any future |
| Decline | 4000 0000 0000 0002 | Any 3 digits | Any future |
| 3D Secure | 4000 0025 0000 3155 | Any 3 digits | Any future |

### Test Bank Accounts
- **Routing Number**: `110000000`
- **Account Number**: `000123456789`

## Frontend Components

### 1. StripeCardForm
**Location**: `components/billing/StripeCardForm.tsx`
- Saves payment methods for future use
- Uses Stripe CardElement
- Handles Setup Intent confirmation

### 2. StripeOnlinePayment
**Location**: `components/billing/StripeOnlinePayment.tsx`
- Processes immediate payments
- Uses Stripe CardElement
- Handles Payment Intent confirmation
- Shows payment amount prominently

### 3. Billing Page
**Location**: `app/billing/page.tsx`
- Displays all three payment options
- Manages payment method list
- Handles payment processing
- Shows billing history

## Backend Services

### StripeService
**Location**: `app/Services/StripeService.php`

**Methods**:
- `createCustomer()` - Create Stripe customer
- `createSetupIntent()` - For saving payment methods
- `createPaymentIntent()` - For immediate payments
- `retrievePaymentIntent()` - Get payment status
- `confirmPaymentIntent()` - Confirm payment
- `attachPaymentMethod()` - Attach saved method
- `detachPaymentMethod()` - Remove payment method

### PaymentController
**Location**: `app/Http/Controllers/Api/Employer/PaymentController.php`

Handles:
- Creating payment intents
- Processing payments
- Retrieving payment status
- Payment history

### PaymentMethodController
**Location**: `app/Http/Controllers/Api/Employer/PaymentMethodController.php`

Handles:
- Saving payment methods
- Listing payment methods
- Setting default methods
- Deleting methods

## Database Schema

### payments Table
```sql
- id
- employer_id
- stripe_payment_intent_id
- amount
- currency
- status (pending, processing, succeeded, failed, canceled)
- description
- metadata (JSON)
- created_at
- updated_at
```

### payment_methods Table
```sql
- id
- employer_id
- stripe_customer_id
- stripe_payment_method_id
- type (card, bank_account)
- card_brand
- card_last_four
- card_exp_month
- card_exp_year
- is_default
- is_active
- created_at
- updated_at
- deleted_at
```

## User Flow

### Saving a Payment Method
1. User clicks "Add Payment Method"
2. Selects "Credit Card"
3. Form expands with Stripe Elements
4. Backend creates Setup Intent
5. User enters card details
6. Stripe validates and tokenizes card
7. Payment method saved to database
8. Can be set as default

### Making an Online Payment
1. User clicks "Add Payment Method"
2. Selects "Stripe Online Payment"
3. Form expands showing payment amount
4. Backend creates Payment Intent
5. User enters card details
6. Stripe processes payment immediately
7. Payment recorded in database
8. User receives confirmation

### Using Saved Payment Method
1. User can select saved method for payments
2. Payment Intent created with saved method ID
3. Payment processed without re-entering card
4. 3D Secure handled automatically if required

## Security Features

- **PCI Compliance**: Card details never touch your server
- **Tokenization**: All sensitive data tokenized by Stripe
- **3D Secure**: Automatic SCA compliance
- **Encryption**: All data encrypted in transit and at rest
- **Setup Intents**: Secure method for saving cards
- **Payment Intents**: Secure method for processing payments

## Troubleshooting

### "Failed to initialize payment"
- Check Stripe API keys in `.env`
- Verify backend is running
- Check browser console for errors

### "Payment failed"
- Use test cards from Stripe documentation
- Check Stripe Dashboard for error details
- Verify amount is above minimum (£0.50)

### "Card declined"
- Use successful test card: `4242 4242 4242 4242`
- Check card expiry is in future
- Verify CVC is provided

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Enable Stripe webhooks
- [ ] Set up payment failure notifications
- [ ] Configure email receipts
- [ ] Test 3D Secure flow
- [ ] Set up monitoring and alerts
- [ ] Review Stripe Dashboard regularly
- [ ] Enable fraud detection
- [ ] Set up refund policies
- [ ] Configure dispute handling

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Setup Intents Guide](https://stripe.com/docs/payments/setup-intents)
- [Testing Guide](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/)

---

**Note**: PayPal has been completely replaced with Stripe. All payment processing now uses Stripe's secure infrastructure.
