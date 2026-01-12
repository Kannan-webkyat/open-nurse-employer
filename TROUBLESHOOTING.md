# Troubleshooting Guide - Payment Methods Not Loading

## Issue: Payment methods showing "Loading payment form..." forever

### Quick Fixes:

### 1. Check Stripe Configuration

**Frontend (.env.local):**
```bash
# File: c:\xampp\htdocs\open-nurse-employer\.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env):**
```bash
# File: c:\xampp\htdocs\open-nurses-api\.env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 2. Restart Servers

After adding keys, **MUST RESTART**:

```bash
# Terminal 1 - Backend
Ctrl+C
php artisan serve

# Terminal 2 - Frontend  
Ctrl+C
npm run dev
```

### 3. Check Browser Console

Press `F12` → Console tab

**If you see**: "Please call Stripe() with your publishable key"
- ✅ Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
- ✅ Restart frontend server

**If you see**: WebSocket errors
- ⚠️ These are normal - they're from Laravel Reverb (chat feature)
- ⚠️ They don't affect payments - you can ignore them

### 4. Check Network Tab

Press `F12` → Network tab → Click "Add Payment Method"

**Look for**:
- `/api/employer/payment-methods/setup-intent` - Should return 200
- If 500 error: Check backend `.env` has `STRIPE_SECRET_KEY`
- If 401 error: You're not logged in
- If 404 error: Route not found - check routes file

### 5. Check Backend Logs

```bash
# View Laravel logs
notepad c:\xampp\htdocs\open-nurses-api\storage\logs\laravel.log
```

Look for errors related to Stripe or payment methods.

### 6. Run Migration

If you see "Table 'payments' doesn't exist":

```bash
cd c:\xampp\htdocs\open-nurses-api
php artisan migrate
```

### 7. Clear Browser Cache

Sometimes old JavaScript is cached:
- Press `Ctrl+Shift+R` to hard refresh
- Or `Ctrl+Shift+Delete` → Clear cache

## Common Error Messages:

### "Stripe is not configured"
**Fix**: Add Stripe keys to `.env.local` and restart

### "Failed to load payment methods"
**Fix**: Check backend is running on port 8000

### "Setup intent creation error"
**Fix**: Check `STRIPE_SECRET_KEY` in backend `.env`

### "Payment method already attached"
**Fix**: This is handled automatically - just try again

## Still Not Working?

### Check These:

1. ✅ Backend running: `http://localhost:8000`
2. ✅ Frontend running: `http://localhost:3000`
3. ✅ Logged in as employer
4. ✅ Both `.env` files have Stripe keys
5. ✅ Both servers restarted after adding keys
6. ✅ Migration run successfully

### Get Help:

1. Check browser console (F12)
2. Check Laravel logs
3. Check Network tab for API errors
4. Try with test card: `4242 4242 4242 4242`

## Test Checklist:

- [ ] Can see billing page
- [ ] No yellow warning banner (Stripe configured)
- [ ] Can click "Add Payment Method"
- [ ] Modal opens
- [ ] Can click "Credit Card"
- [ ] Form loads (not stuck on "Loading...")
- [ ] Can enter card details
- [ ] Can submit successfully

---

**Note**: WebSocket errors in console are normal and don't affect payments!
