# psychonaut-db

Next.js 16 (App Router) · TypeScript · Tailwind CSS v3 · Supabase · Framer Motion · Serwist PWA · nodemailer magic-link auth

## Stack conventions
- Components: `src/components/` — React functional, typed props
- Pages/routes: `src/app/` — server components by default, `'use client'` only when needed
- DB access: `src/lib/` — always use server-side Supabase client with service role in API routes; anon key in client components
- Styles: Tailwind utility classes; global CSS in `src/styles/`
- Animations: Framer Motion only — no raw CSS transitions on interactive elements
- Auth: magic-link via nodemailer + `AUTH_SECRET` signed session cookie; protected routes via `src/middleware.ts`

## Critical rules
- NEVER commit `.env*` or secrets
- NEVER use `any` — always type properly
- NEVER modify `package-lock.json` manually
- Server components do NOT import client hooks
- All Supabase queries go through `src/lib/` helpers, not inline
- Diffs only — no explanations unless fix is ambiguous
