# Phase 2 Setup – Database & Auth

Phase 2 is built. Follow these steps to get it working.

---

## Step 1: Install the new dependency

In Terminal:

```bash
cd /Users/rameezsheraz/upwork-auto-apply-saas
npm install
```

---

## Step 2: Run the database migration in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. In the left sidebar, click **SQL Editor**
4. Click **New query**
5. Copy the contents of `supabase/migrations/20240224000001_initial_schema.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd+Enter)
8. You should see "Success. No rows returned"

---

## Step 3: Enable Email Auth (if not already)

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Under **Email Auth**, you can turn off "Confirm email" for faster testing – otherwise users must confirm their email before logging in

---

## Step 4: Add the auth callback URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - (When you deploy, add your production URL too, e.g. `https://yoursite.com/auth/callback`)
3. Click **Save**

---

## Step 5: Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## What you can do now

1. **Sign up** – Create an account at /signup
2. **Log in** – Use your email and password at /login
3. **Dashboard** – Go to /dashboard (requires login)
4. **Generate proposals** – Paste a job description, add your skills, pick a category (QA, BA, PO, PM, Dev, DevOps), and click Generate
5. **Copy** – Use "Copy All" to copy the full proposal to your clipboard
6. **Usage** – Free users get 3 proposals per month (shown after each generation)

---

## Troubleshooting

### "Failed to check usage" or database errors
- Make sure you ran the SQL migration (Step 2)
- Check that your Supabase URL and anon key in `.env.local` are correct

### "Invalid API key" from OpenAI
- Check your `OPENAI_API_KEY` in `.env.local`
- Make sure you have credits in your OpenAI account

### Email confirmation required
- If signup says "Check your email" but you can't log in, Supabase may require email confirmation
- Go to Supabase → Authentication → Providers → Email → turn off "Confirm email" for testing
- Or check your email (and spam folder) for the confirmation link
