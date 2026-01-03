# Subscription Plans API Test

## Test the API endpoint

Open your browser console on the billing page and run:

```javascript
// Test fetching plans
fetch('http://localhost:8000/api/employer/subscriptions/plans', {
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(res => res.json())
.then(data => console.log('Plans:', data))
.catch(err => console.error('Error:', err))
```

## Expected Response

```json
{
  "success": true,
  "message": "Subscription plans retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Basic",
      "stripe_price_id": "price_1ShoLV2ddkOQOBP0hRR9ai2g",
      "amount": 200,
      "price": 200,
      "type": 0,
      "type_name": "Monthly",
      "trial_days": 14,
      "nurse_slots": 20,
      "enabled": 1
    },
    {
      "id": 2,
      "name": "Pro",
      "stripe_price_id": "price_1SiUGn2ddkOQOBP0r7fTBA8g",
      "amount": 2000,
      "price": 2000,
      "type": 1,
      "type_name": "Yearly",
      "trial_days": 14,
      "nurse_slots": 50,
      "enabled": 1
    }
  ]
}
```

## Database Updates Made

1. ✅ Added `nurse_slots` column to `subscription_plans` table
2. ✅ Updated SubscriptionPlan model to include `nurse_slots`
3. ✅ Updated SubscriptionController to return `nurse_slots` and `price` in API response
4. ✅ Set nurse_slots values: Basic=20, Pro=50

## If Plans Still Don't Show

### Check 1: Authentication
Make sure you're logged in. The API requires authentication.

### Check 2: Browser Console
Open browser console (F12) and check for errors when the billing page loads.

### Check 3: Network Tab
Check the Network tab to see if the API request is being made and what the response is.

### Check 4: API URL
Verify `.env.local` has the correct API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Check 5: Restart Dev Server
After adding environment variables, restart the dev server:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Manual Database Check

Run this to verify the data:

```bash
php artisan tinker --execute="echo json_encode(\App\Models\SubscriptionPlan::all()->toArray(), JSON_PRETTY_PRINT);"
```

You should see both plans with `nurse_slots` field.
