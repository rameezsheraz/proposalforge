# ProposalForge.io – Step-by-Step Setup Guide

This guide assumes you're not a developer. Follow each step in order.

## Quick Checklist

- [ ] Step 0: Node.js installed
- [ ] Step 1: `npm install` done
- [ ] Step 2: Supabase project created, keys copied
- [ ] Step 3: OpenAI account + API key created
- [ ] Step 4: `.env.local` file created and filled
- [ ] Step 5: `npm run dev` runs, page loads at http://localhost:3000

---

## Step 0: Check You Have the Right Tools

### Do you have Node.js installed? (Must be 18.17 or newer)

1. Open **Terminal** (on Mac: press `Cmd + Space`, type "Terminal", press Enter)
2. Type this and press Enter:
   ```
   node --version
   ```
3. **Check your version:**
   - `v20.x.x` or `v22.x.x` → you're good
   - `v18.17.x` or higher → you're good
   - `v16.x.x` or lower → **you must upgrade** (see below)
   - "command not found" → install Node.js (see below)

### How to install or upgrade Node.js (Mac)

**Option A – Direct download (easiest):**
1. Go to https://nodejs.org
2. Download the **LTS** version (green button) – this will be v20 or v22
3. Run the installer
4. **Close and reopen Terminal** (important!)
5. Run `node --version` again – you should see v20 or v22

**Option B – Using nvm (if you use it):**
```bash
nvm install 20
nvm use 20
```

---

## Step 1: Install Project Dependencies

1. Open Terminal
2. Go to your project folder:
   ```
   cd /Users/rameezsheraz/upwork-auto-apply-saas
   ```
3. Install all required packages:
   ```
   npm install
   ```
4. Wait 1–2 minutes. When it finishes, you should see something like "added X packages"

---

## Step 2: Create Your Supabase Account & Project

Supabase gives you a database and user login for free.

### 2.1 Sign up

1. Go to https://supabase.com
2. Click **Start your project**
3. Sign up with GitHub or email

### 2.2 Create a new project

1. Click **New Project**
2. Fill in:
   - **Name:** `proposal-forge` (or any name)
   - **Database Password:** Create a strong password and **save it somewhere safe**
   - **Region:** Pick the one closest to you
3. Click **Create new project**
4. Wait 1–2 minutes for the project to be ready

### 2.3 Get your API keys

1. In the left sidebar, click **Project Settings** (gear icon at bottom)
2. Click **API** in the menu
3. You'll see:
   - **Project URL** – copy this
   - **anon public** key – click "Reveal" and copy it

Keep these handy for Step 4.

---

## Step 3: Create Your OpenAI Account & API Key

OpenAI powers the AI that writes your proposals.

### 3.1 Sign up

1. Go to https://platform.openai.com
2. Sign up or log in

### 3.2 Add payment method (required)

OpenAI needs a payment method, but usage is cheap (a few cents per proposal).

1. Click your profile (top right) → **Billing**
2. Add a payment method
3. Set a **usage limit** (e.g. $10/month) so you don't overspend

### 3.3 Create an API key

1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Name it something like `proposal-forge`
4. Click **Create**
5. **Copy the key immediately** – you won't see it again
6. Save it somewhere safe

---

## Step 4: Create Your `.env.local` File

This file stores your secret keys. It is **not** uploaded to GitHub.

### 4.1 Create the file

1. Open your project in Cursor (or any editor)
2. In the project root, find `.env.example`
3. **Copy** `.env.example` and paste it in the same folder
4. **Rename** the copy to `.env.local`

Or in Terminal:

```
cd /Users/rameezsheraz/upwork-auto-apply-saas
cp .env.example .env.local
```

### 4.2 Fill in your keys

1. Open `.env.local` in your editor
2. Replace the placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=paste_your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_supabase_anon_key_here
OPENAI_API_KEY=paste_your_openai_api_key_here
```

3. **No spaces** around the `=` sign
4. **No quotes** around the values
5. Save the file

---

## Step 5: Run the App

1. In Terminal, make sure you're in the project folder:
   ```
   cd /Users/rameezsheraz/upwork-auto-apply-saas
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. You should see: `Ready on http://localhost:3000`
4. Open your browser and go to: http://localhost:3000
5. You should see the ProposalForge.io landing page

To stop the server: press `Ctrl + C` in Terminal.

---

## Troubleshooting

### "Cannot GET /" when opening the app
**Cause:** Your Node.js version is too old. Next.js 14 needs Node.js 18.17 or newer.

**Fix:**
1. Run `node --version` in Terminal
2. If you see `v16.x.x` or lower, upgrade Node.js:
   - Go to https://nodejs.org and download the **LTS** version
   - Install it, then **close and reopen Terminal**
3. Run `npm run dev` again

### "Cannot find module" or "Module not found"
- Run `npm install` again in the project folder

### "Invalid API key" or Supabase errors
- Check `.env.local` – no typos, no extra spaces
- Make sure you copied the full key
- Restart the dev server (`Ctrl + C`, then `npm run dev` again)

### Port 3000 already in use
- Another app might be using it. Try:
  ```
  npm run dev -- -p 3001
  ```
  Then open http://localhost:3001

### Blank page or errors in browser
- Open Developer Tools (F12 or right-click → Inspect)
- Check the **Console** tab for red error messages
- Share the error text if you need help

---

## What's Next?

Once you see the landing page at http://localhost:3000, you're ready for **Phase 2** (see PHASE2_SETUP.md) and **Phase 3** (see PHASE3_SETUP.md).

Phase 2 adds: Auth, database, proposal generation.
Phase 3 adds: Proposal history, saved profile, Stripe payments.
