# Troubleshooting Static Card Input

If the card input box appears but you cannot type in it, follow these steps:

## 1. Check Browser Console
Open your browser's Developer Tools (F12 or Right Click -> Inspect -> Console).
Look for these logs:

- ✅ **Good:** "Stripe Key present: pk_test_..."
- ✅ **Good:** "CardElement is ready"
- ❌ **Bad:** "Stripe Publishable Key is missing..."
- ❌ **Bad:** "Network Error" (Stripe script failed to load)

## 2. Verify Environment Variables
The application needs to be restarted after adding `.env.local`.

Run this in your terminal to restart:
```bash
# In open-nurse-employer directory
# Press Ctrl+C to stop
npm run dev
```

## 3. Check for Ad Blockers
Disable any ad blockers (uBlock Origin, AdBlock Plus) for `localhost`. They sometimes block Stripe's iframe/script.

## 4. Check Network Tab
In Developer Tools -> Network tab:
- Filter for "stripe"
- You should see requests to `js.stripe.com` and `m.stripe.com`
- If they are red (failed), your network or ad blocker is blocking Stripe.

## 5. Verify API Key
Ensure your `.env.local` file has the correct key format:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
It **must** start with `pk_test_` (or `pk_live_` for production).
It **must not** contain quotes or spaces at the end.

## 6. Test with a Simple Link
If it still fails, try opening this URL in your browser to verify you can reach Stripe:
https://js.stripe.com/v3/

If this doesn't load, you have a network issue.

## 7. Try Incognito/Private Window
Extensions often interfere with payment fields. Try opening the billing page in an Incognito window.
