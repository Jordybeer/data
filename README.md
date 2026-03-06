# Psychonaut DB

Personal psychoactive substances database with notes and harm reduction resources.

## Features

- 🔍 Browse and search 100+ substances
- 📝 Add personal notes (admin only)
- 🔐 GitHub OAuth authentication
- 💾 Persistent storage via JSON files
- 🎨 Dark theme with Tailwind CSS

## Tech Stack

- **Next.js 14** (App Router)
- **NextAuth** (GitHub OAuth)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Psychonaut DB (or your choice)
   - **Homepage URL**: `http://localhost:3000` (development) or your production URL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
GITHUB_ID=your_github_client_id_here
GITHUB_SECRET=your_github_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here
```

To generate `NEXTAUTH_SECRET`, run:

```bash
openssl rand -base64 32
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Vercel)

1. Push this branch to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard:
   - `GITHUB_ID`
   - `GITHUB_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
4. Update GitHub OAuth App callback URL to match production URL

## Admin Access

Only the email `contact@jordy.beer` can edit notes. To change this, edit:

```typescript
// src/data/drugs.ts
export const ADMIN_EMAIL = 'your-email@example.com';

// src/app/api/notes/route.ts
const ADMIN_EMAIL = 'your-email@example.com';
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth config
│   │   └── notes/route.ts                # Notes CRUD API
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Main page
│   └── globals.css                    # Global styles
├── components/
│   ├── AuthSection.tsx                # Login/logout UI
│   ├── CategoryList.tsx               # Category filter
│   ├── DisclaimerSection.tsx          # Harm reduction links
│   ├── DrugDetails.tsx                # Modal with notes editor
│   ├── DrugItem.tsx                   # Drug card
│   ├── SearchBar.tsx                  # Search input
│   └── SessionProvider.tsx            # NextAuth provider wrapper
└── data/
    └── drugs.ts                       # Substance data & config

public/
└── notes.json                         # Persistent notes storage
```

## License

Private project for personal use.
