# Family Workout App — Setup Guide

Follow these steps in order. Each should take about 2 minutes.

---

## Step 1: Create a Supabase account

1. Go to **https://supabase.com** and click **Start your project**
2. Sign up with GitHub or email (free, no credit card)
3. Click **New project**
4. Fill in:
   - **Name:** `family-workouts` (or anything)
   - **Database password:** make something up and save it somewhere
   - **Region:** pick the one closest to you (US East or US West)
5. Click **Create new project** — takes ~1 minute to spin up

---

## Step 2: Set up the database

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase_schema.sql` from this folder
4. Copy all the contents and paste them into the SQL editor
5. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
6. You should see "Success. No rows returned"

---

## Step 3: Get your API keys

1. In Supabase, click **Settings** (gear icon) in the left sidebar
2. Click **API**
3. Copy these two values — you'll need them in the next step:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (long string starting with `eyJ...`)

---

## Step 4: Create a GitHub repository

1. Go to **https://github.com** and sign in (create account if needed)
2. Click the **+** icon → **New repository**
3. Name it something like `family-workouts`
4. Set to **Public** (required for free GitHub Pages)
5. Click **Create repository**
6. Note your repo name — you'll use it in the next step

---

## Step 5: Update the app with your repo name

1. Open `vite.config.js` in this folder
2. Replace `YOUR_REPO_NAME` with your actual GitHub repo name
   - Example: if your repo is `github.com/michael/family-workouts`, put `family-workouts`
3. Save the file

---

## Step 6: Add secrets to GitHub

1. In your GitHub repo, click **Settings** tab
2. In the left sidebar, click **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these two:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 3 |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 3 |

---

## Step 7: Push code to GitHub

Open Terminal (Mac) or Command Prompt (Windows), navigate to this folder, and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name.

---

## Step 8: Enable GitHub Pages

1. In your GitHub repo, click **Settings**
2. Click **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions**
4. Click **Save**

---

## Step 9: Wait for deployment

1. Click the **Actions** tab in your GitHub repo
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait ~2 minutes for it to finish (green checkmark = done)

---

## Step 10: Share the link!

Your app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

Share this link with family members. When they visit, they just pick a nickname and they're in — no login needed.

---

## Troubleshooting

**App shows blank/error screen:**
- Check that GitHub Secrets are set correctly (Step 6)
- Check the Actions tab for error messages

**"Missing Supabase environment variables" error:**
- Your Supabase URL or key wasn't passed in correctly — re-check Step 6

**Family member can't see workouts:**
- Make sure they're using the same URL
- Workouts are shared across everyone using the app

---

## How to use the app

- **Feed tab:** See all family workouts, react with 🔥💪👏❤️😮, leave comments
- **Log tab:** Record a workout — choose from templates or build your own from 100+ exercises
- **Mine tab:** See your own workout history, redo a previous workout, delete workouts
- **Copy workout:** On anyone's workout in the feed, tap "Copy workout" to load it into your log
