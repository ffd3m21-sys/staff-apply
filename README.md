# Setup (no credit card needed)

## 1. Database: Supabase (free)
1. Go to supabase.com, sign up (GitHub or email), click "New project", pick any name + password, wait ~2 min.
2. Left menu -> SQL Editor -> New query -> paste everything from `supabase.sql` -> Run.
3. Project Settings -> API: copy "Project URL" (SUPABASE_URL) and the `service_role` secret key (SUPABASE_SERVICE_ROLE_KEY). Never share this key.
4. Your applications will appear in: Table Editor -> applications.

## 2. Discord app
1. discord.com/developers/applications -> New Application.
2. OAuth2 -> copy Client ID and Client Secret.
3. OAuth2 -> Redirects -> add: https://YOUR-SITE.vercel.app/api/auth/callback (and http://localhost:3000/api/auth/callback for testing).
4. (Optional, to show role NAMES) Bot tab -> Reset Token -> copy it, then invite the bot to your server (OAuth2 -> URL Generator -> scope "bot" -> no permissions needed).
5. Server ID: Discord Settings -> Advanced -> Developer Mode ON, right click your server -> Copy Server ID.

## 3. Deploy on Vercel (free Hobby plan)
1. Upload this folder to a GitHub repo.
2. vercel.com -> Add New Project -> import the repo.
3. Settings -> Environment Variables: add every name from `.env.example` with your values.
4. Deploy. Put the final address in SITE_URL, then Redeploy.
