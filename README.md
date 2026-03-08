# Psychonaut DB - Tailwind Edition

A full-stack Next.js application for logging psychoactive substance experiences. Track substances, add personal notes, and access harm reduction resources.

## 🚀 Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth (GitHub OAuth)
- **Storage**: JSON files / Supabase (configurable)
- **Deployment**: Vercel (Free Tier)

---

## ⚙️ Complete Setup Guide

### Step 1: Get Your Free API Keys

#### GitHub OAuth (Authentication)
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **"New OAuth App"** and fill in:
   - Application name: `Psychonaut DB` (or any name)
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Click **"Register application"**
4. Copy these two values:
   - **Client ID** → This is `GITHUB_ID`
   - Generate a **Client Secret** → This is `GITHUB_SECRET`

#### NextAuth Secret
1. Generate a random secret for session encryption:
   ```bash
   openssl rand -base64 32
   ```
2. Copy the output → This is `NEXTAUTH_SECRET`

---

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Import your `data` repository.
4. Vercel will auto-detect it's a Next.js project.
5. **Before clicking Deploy**, expand **"Environment Variables"** and add these 4 variables:

   | Name | Value |
   |------|-------|
   | `GITHUB_ID` | Your GitHub OAuth Client ID |
   | `GITHUB_SECRET` | Your GitHub OAuth Client Secret |
   | `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://data.jordy.beer`) |
   | `NEXTAUTH_SECRET` | Your generated random secret |

6. Click **"Deploy"**.
7. Wait 2-3 minutes for the build to complete.
8. You'll get a URL like `https://data.vercel.app` — **Save this URL!**
9. **Update your GitHub OAuth App**:
   - Go back to [github.com/settings/developers](https://github.com/settings/developers)
   - Edit your OAuth app
   - Update **Homepage URL** and **Authorization callback URL** to use your new Vercel URL
   - Example: `https://data.jordy.beer` and `https://data.jordy.beer/api/auth/callback/github`

---

### Step 3: Start Logging Experiences

1. Open your Vercel deployment URL in a browser.
2. Click **"Sign in with GitHub"** in the top right.
3. Authorize the app.
4. Browse substances by category (Street Drugs, Research Chemicals).
5. Click any substance card to:
   - View dosage info, effects, duration
   - Add personal notes (if admin)
   - Access harm reduction resources

---

## 🛠️ Troubleshooting

### "Sign in" button doesn't work
**Fix**: Your GitHub OAuth callback URL might be wrong.
1. Go to GitHub Developer Settings → Your OAuth App.
2. Make sure the callback URL matches: `https://your-vercel-url.com/api/auth/callback/github`
3. Redeploy on Vercel after updating.

### Environment variable errors
**Fix**: Check your Vercel environment variables.
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**.
2. Make sure all 4 variables (`GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`) are set correctly.
3. Redeploy after any changes.

### Notes not persisting
**Fix**: JSON file storage requires write permissions.
1. If using Vercel, notes save to `public/notes.json` — but Vercel filesystem is read-only in production.
2. **Recommended**: Switch to Supabase for persistent storage (follow Supabase setup from `wildrift-rank-tracker` repo).
3. Alternative: Use localStorage for client-side notes (no backend required).

---

## 🧪 Local Development (Optional)

If you want to run this on your computer instead of Vercel:

```bash
git clone https://github.com/Jordybeer/data.git
cd data
npm install
```

Create a `.env.local` file in the root:
```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
```

Run the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📊 What This Tracks

- ✅ 100+ substances (street drugs, research chemicals)
- ✅ Dosage info, effects, duration
- ✅ Personal notes per substance (admin only)
- ✅ Harm reduction resources
- ✅ Dark theme UI with Tailwind
- ✅ Mobile-first PWA ready

## 🎯 Roadmap

- [ ] Supabase backend for persistent notes
- [ ] Multi-user support (per-user notes)
- [ ] Experience timeline (log dates, dosages, effects)
- [ ] Export data as CSV
- [ ] iOS Shortcuts integration for quick logging
- [ ] AI harm reduction insights

---

## 📝 Admin Access

Only the email `contact@jordy.beer` can edit notes. To change this, edit:

```typescript
// src/data/drugs.ts
export const ADMIN_EMAIL = 'your-email@example.com';

// src/app/api/notes/route.ts
const ADMIN_EMAIL = 'your-email@example.com';
```

---

## 📝 License

MIT - Do whatever you want with this.
