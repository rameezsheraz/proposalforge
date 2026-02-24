# ProposalForge.io – Upwork Proposal Optimizer for Tech Freelancers

Stop losing jobs to generic proposals. Win more QA, BA, PO, PM, Dev & DevOps gigs with AI-optimized Upwork proposals.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **AI:** OpenAI API
- **Payments:** Stripe (Phase 3)
- **Hosting:** Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

- **Supabase:** Create a project at [supabase.com](https://supabase.com) and add URL + anon key
- **OpenAI:** Get API key from [platform.openai.com](https://platform.openai.com)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/
│   ├── page.tsx          # Landing page
│   ├── layout.tsx
│   ├── (auth)/           # Login, signup (Phase 2)
│   ├── dashboard/        # Main tool (Phase 2)
│   └── api/              # API routes (Phase 2)
├── components/
├── lib/
│   └── supabase.ts
└── supabase/
    └── migrations/      # DB schema (Phase 2)
```

## MVP Roadmap

- [x] Project setup
- [x] Auth (Supabase)
- [x] Database schema
- [x] Proposal generation (OpenAI)
- [x] Usage limits (3 free/month)
- [x] Proposal history
- [x] Saved profile (skills + portfolio)
- [x] Stripe integration (Pro $12/mo, Premium $29/mo)
