# Phase 3 Setup – New Features & Stripe

This guide walks you through setting up the new features (Proposal History, Saved Profile, Stripe payments).

---

## Part 1: Database Update (Required)

You need to add the new `profiles` table.

1. Go to **Supabase** → your project → **SQL Editor**
2. Click **New query**
3. Copy everything from `supabase/migrations/20240224000002_profiles.sql`
4. Paste and click **Run**
5. You should see "Success"

---

## Part 2: Install New Dependencies

In Terminal:

```bash
cd /Users/rameezsheraz/upwork-auto-apply-saas
npm install
```

---

## Part 3: What's New (No Extra Setup)

These work right away after Part 1 and 2:

### Proposal History
- On the dashboard, scroll down to see your past proposals
- Click **View** to expand and see the full proposal
- Click **Copy** to copy any past proposal

### Saved Profile
- Click **Settings** in the dashboard header
- Enter your skills and portfolio links
- Click **Save Profile**
- Next time you generate a proposal, these will be pre-filled

---

## Part 4: Stripe Setup (Optional – For Payments)

Stripe lets you charge for Pro ($12/mo) and Premium ($29/mo) plans. Follow these steps carefully.

### Step 4.1: Create a Stripe Account

1. Go to https://dashboard.stripe.com
2. Sign up (free)
3. Complete account setup (you can use test mode first)

### Step 4.2: Get Your API Keys

1. In Stripe Dashboard, click **Developers** (top right)
2. Click **API keys**
3. Copy:
   - **Secret key** (starts with `sk_test_` in test mode)
   - **Publishable key** (starts with `pk_test_`) – not needed for now

### Step 4.3: Create Products & Prices

1. In Stripe Dashboard, go to **Product catalog** → **Products**
2. Click **Add product**

**Product 1 – Pro:**
- Name: `Pro Plan`
- Description: `Unlimited proposals per month`
- Pricing: **Recurring** → **Monthly** → `$12`
- Click **Save product**
- After saving, copy the **Price ID** (starts with `price_`)

**Product 2 – Premium:**
- Click **Add product** again
- Name: `Premium Plan`
- Description: `Unlimited proposals + future premium features`
- Pricing: **Recurring** → **Monthly** → `$29`
- Click **Save product**
- Copy the **Price ID**

### Step 4.4: Add Keys to .env.local

Open `.env.local` and add:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PRO_PRICE_ID=price_xxx_from_pro_product
STRIPE_PREMIUM_PRICE_ID=price_xxx_from_premium_product
```

### Step 4.5: Set Up the Webhook (Important!)

The webhook tells your app when someone subscribes or cancels.

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:**  
   - Local testing: use Stripe CLI (see Step 4.6)  
   - Production: `https://yourdomain.com/api/stripe/webhook`
4. Click **Select events**
5. Choose:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret
   ```

### Step 4.6: Testing Webhooks Locally (Optional)

For local testing, use the Stripe CLI:

1. Install: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. The CLI will show a webhook signing secret – use that in `.env.local` for local testing

### Step 4.7: Add Service Role Key (For Webhook)

The webhook needs to update your database. It uses the Supabase **service role** key.

1. Go to **Supabase** → **Project Settings** → **API**
2. Under **Project API keys**, find **service_role** (not the anon key!)
3. Click **Reveal** and copy it
4. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

⚠️ **Keep this key secret.** Never expose it in frontend code.

---

## Part 5: Restart the App

```bash
npm run dev
```

---

## Summary Checklist

- [ ] Run profiles migration in Supabase
- [ ] Run `npm install`
- [ ] Proposal History and Settings work
- [ ] (Optional) Stripe account created
- [ ] (Optional) Products and prices created in Stripe
- [ ] (Optional) API keys and price IDs in .env.local
- [ ] (Optional) Webhook created, signing secret in .env.local
- [ ] (Optional) SUPABASE_SERVICE_ROLE_KEY in .env.local

---

## Troubleshooting

### "Stripe not configured"
- Add all 4 Stripe variables to `.env.local`
- Restart the dev server

### Webhook not updating subscription
- Check the webhook URL is correct
- For local dev, use Stripe CLI to forward events
- Verify SUPABASE_SERVICE_ROLE_KEY is set

### Upgrade button does nothing
- Open browser Developer Tools (F12) → Console
- Look for errors
- Check that STRIPE_SECRET_KEY and price IDs are correct
