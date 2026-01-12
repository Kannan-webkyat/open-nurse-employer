# Quick Setup Guide - Stripe Payment Integration

## ⚠️ IMPORTANT: You need to configure Stripe API keys to fix the errors

### Step 1: Get Your Stripe API Keys

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create a free Stripe account (or login if you have one)
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### Step 2: Configure Backend (.env)

Open: `c:\xampp\htdocs\open-nurses-api\.env`

Add these lines (replace with your actual keys):
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Step 3: Configure Frontend (.env.local)

Create/Edit: `c:\xampp\htdocs\open-nurse-employer\.env.local`

Add these lines (replace with your actual keys):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Restart Servers

After adding the keys, restart both servers:

**Backend:**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd c:\xampp\htdocs\open-nurses-api
php artisan serve
```

**Frontend:**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd c:\xampp\htdocs\open-nurse-employer
npm run dev
```

### Step 5: Run Migration (if not done)

```bash
cd c:\xampp\htdocs\open-nurses-api
php artisan migrate
```

## Testing

Once configured, test with these test cards:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |

- **CVC**: Any 3 digits
- **Expiry**: Any future date

## Troubleshooting

### Error: "Please call Stripe() with your publishable key"
- Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Restart the Next.js dev server (`npm run dev`)

### Error: 500 Internal Server Error
- Make sure `STRIPE_SECRET_KEY` is set in backend `.env`
- Check Laravel logs: `storage/logs/laravel.log`
- Make sure the migration has been run

### Error: "Stripe customer not found"
- This is normal for first-time use
- The system will create a customer automatically

## Quick Test Checklist

- [ ] Stripe account created
- [ ] API keys copied
- [ ] Backend `.env` updated with `STRIPE_SECRET_KEY`
- [ ] Frontend `.env.local` created with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Both servers restarted
- [ ] Migration run (`php artisan migrate`)
- [ ] Can open billing page without errors
- [ ] Can click "Add Payment Method"
- [ ] Can see payment form load

## Need Help?

If you're still getting errors:
1. Check browser console (F12) for frontend errors
2. Check Laravel logs: `c:\xampp\htdocs\open-nurses-api\storage\logs\laravel.log`
3. Make sure both servers are running
4. Clear browser cache and reload

---

**Note**: These are TEST keys. Never use live keys in development!
