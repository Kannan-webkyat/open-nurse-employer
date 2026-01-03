# Stripe Payment Integration for Employer Billing

## Overview
This document describes the Stripe payment integration for the employer billing and subscription system.

## Features Implemented

### 1. **Subscription API Module** (`lib/api/subscription.js`)
- `getPlans()` - Fetch all available subscription plans
- `getCurrentSubscription()` - Get employer's current subscription
- `upgradeSubscription(data)` - Create or upgrade subscription with payment
- `cancelSubscription(data)` - Cancel active subscription

### 2. **Billing Page** (`app/billing/page.tsx`)
**Key Features:**
- Real-time subscription status display
- Available subscription plans grid
- Stripe payment integration
- Secure card payment processing
- Loading states and error handling
- Toast notifications for user feedback

**Components:**
- `StripeCardForm` - Secure card input using Stripe Elements
- Plan selection and comparison
- Current subscription overview
- Payment modal with plan summary

### 3. **Stripe Integration**
**Packages Installed:**
- `@stripe/stripe-js` - Stripe.js library
- `@stripe/react-stripe-js` - React components for Stripe
- `react-hot-toast` - Toast notifications

**Security:**
- PCI-compliant card input (Stripe Elements)
- No card data stored on frontend
- Payment Method ID sent to backend
- Backend handles Stripe Customer and Subscription creation

## Backend API Endpoints

### Available Routes (from `routes/Employer/employer.php`)

```php
GET  /api/employer/subscriptions/plans
GET  /api/employer/subscriptions/current
POST /api/employer/subscriptions/upgrade
POST /api/employer/subscriptions/cancel
```

### Subscription Controller Methods

1. **getPlans()**
   - Returns all available subscription plans
   - Includes: name, price, type, nurse_slots, features

2. **getCurrentSubscription()**
   - Returns employer's active subscription
   - Includes: plan details, status, period dates, used slots

3. **upgradeSubscription()**
   - Accepts: `plan_id`, `payment_method_id`
   - Creates Stripe Customer (if new)
   - Attaches Payment Method
   - Creates Stripe Subscription
   - Stores subscription in database
   - Returns subscription details

4. **cancelSubscription()**
   - Cancels active subscription
   - Can be immediate or at period end
   - Updates database status

## Payment Flow

### 1. **Frontend Flow:**
```
User selects plan
  ↓
Opens payment modal
  ↓
Enters card details (Stripe Elements)
  ↓
Stripe creates Payment Method
  ↓
Send Payment Method ID to backend
  ↓
Backend processes subscription
  ↓
Success/Error feedback
  ↓
Refresh subscription data
```

### 2. **Backend Flow (SubscriptionController):**
```
Receive payment_method_id + plan_id
  ↓
Get/Create Stripe Customer
  ↓
Attach Payment Method to Customer
  ↓
Create Stripe Subscription
  ↓
Store subscription in database
  ↓
Return subscription details
```

## Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`.env`)
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Database Schema

### subscription_plans Table
- `id` - Primary key
- `name` - Plan name (Basic, Premium, Enterprise)
- `type` - Billing cycle (1=Monthly, 2=Quarterly, 3=Yearly)
- `price` - Plan price
- `nurse_slots` - Number of nurse slots
- `features` - JSON array of features

### employer_subscriptions Table
- `id` - Primary key
- `employer_id` - Foreign key to employers
- `plan_id` - Foreign key to subscription_plans
- `stripe_subscription_id` - Stripe subscription ID
- `stripe_customer_id` - Stripe customer ID
- `status` - Subscription status
- `current_period_start` - Period start date
- `current_period_end` - Period end date
- `cancel_at_period_end` - Boolean flag

### payment_methods Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `stripe_payment_method_id` - Stripe PM ID
- `type` - Payment method type
- `last_four` - Last 4 digits
- `is_default` - Boolean flag

## Stripe Webhooks

### Webhook Handler (`StripeWebhookController`)
**Endpoint:** `POST /api/employer/webhooks/stripe`

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_method.attached`
- `payment_method.detached`

**Purpose:**
- Keep database in sync with Stripe
- Handle subscription lifecycle events
- Process payment confirmations
- Update subscription status

## Testing

### Test Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### Test Flow
1. Navigate to `/billing`
2. View current subscription (if any)
3. Select a plan
4. Enter test card details
5. Submit payment
6. Verify subscription creation
7. Check database for subscription record

## UI/UX Features

### Current Subscription Card
- Plan name and status badge
- Active nurse slots (used/total)
- Billing cycle information
- Visual status indicators

### Plan Selection
- Grid layout for easy comparison
- Price per billing cycle
- Nurse slots included
- "Current Plan" indicator
- Disabled state for active plan

### Payment Modal
- Plan summary with pricing
- Stripe Elements card input
- Cardholder name field
- Loading states during processing
- Error handling with toast notifications
- Cancel option

### Visual Feedback
- Loading spinners
- Success/error toasts
- Disabled states
- Hover effects
- Smooth transitions

## Security Considerations

1. **PCI Compliance**
   - Stripe Elements handles card data
   - No card numbers stored in database
   - Only Payment Method IDs stored

2. **Authentication**
   - All routes protected with `auth:sanctum`
   - Employer middleware verification
   - Token-based authentication

3. **Webhook Security**
   - Signature verification
   - Stripe webhook secret
   - Event validation

4. **Data Protection**
   - Encrypted connections (HTTPS in production)
   - Secure token storage
   - Environment variable protection

## Future Enhancements

1. **Payment History**
   - Invoice list with download
   - Payment receipts
   - Transaction history

2. **Multiple Payment Methods**
   - Add/remove cards
   - Set default payment method
   - Payment method management

3. **Plan Upgrades/Downgrades**
   - Proration handling
   - Immediate vs end-of-period changes
   - Credit/refund management

4. **Usage Tracking**
   - Nurse slot usage analytics
   - Billing alerts
   - Usage-based billing

5. **Subscription Management**
   - Pause subscription
   - Reactivate cancelled subscription
   - Trial periods
   - Promotional codes/coupons

## Troubleshooting

### Common Issues

1. **"Stripe not loaded"**
   - Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
   - Verify Stripe.js script loading

2. **"Payment failed"**
   - Check Stripe dashboard for error details
   - Verify API keys are correct
   - Check webhook configuration

3. **"Subscription not updating"**
   - Verify webhook endpoint is accessible
   - Check webhook secret configuration
   - Review webhook logs in Stripe dashboard

4. **"Card declined"**
   - Use valid test cards in test mode
   - Check card details entered correctly
   - Verify sufficient funds (in production)

## Support

For issues or questions:
1. Check Stripe documentation: https://stripe.com/docs
2. Review Laravel Cashier docs (if using)
3. Check application logs
4. Review Stripe dashboard for payment details
