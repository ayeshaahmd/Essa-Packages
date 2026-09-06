# Essa Packages — Supabase admin setup

The website uses Supabase for team sign-in, quote records, and private artwork storage. Netlify serves the site and runs the protected quote API.

## 1. Prepare Supabase

1. Create a dedicated Supabase project for Essa Packages.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it once.
3. Open **Authentication → Users** and create the admin team member with an email and strong password.
4. Approve that user as an administrator by running this in the SQL Editor, using their real email:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'admin@yourdomain.com';
```

The schema keeps quote records behind row-level security and creates a private, 4 MB artwork bucket.

## 2. Configure Netlify

1. Push this folder to your Git repository and import it into Netlify.
2. Netlify reads `netlify.toml`: the build command is `npm run build` and the publish folder is `dist`.
3. In **Project configuration → Environment variables**, add the values listed in `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
4. Trigger a fresh deployment after saving the variables.

The secret key is server-only. Never expose it with a `VITE_` prefix or commit the real value. Existing projects can use the documented `VITE_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` fallbacks.

## 3. Open the workspace

Visit `https://your-domain/#admin` and sign in with the approved Supabase user. Unapproved Supabase accounts cannot load or change quote records.

## Optional WhatsApp notifications

Create and approve a WhatsApp Business template named by `META_WHATSAPP_TEMPLATE_NAME`. Its body must contain four variables in this order:

1. Quote ID
2. Customer name
3. Packaging type
4. Quantity

Then add the Meta settings from `.env.example` to Netlify. Quote requests still save correctly when WhatsApp is not configured; the dashboard simply records the notification as pending.

## Daily use

- Customers send requests through the website quote form.
- Approved team members sign in at `/#admin` to search, filter, review, and update leads.
- Team notes can be saved against each request for production follow-up.
- Artwork stays private and is downloaded through the authenticated server function.
- The export button downloads the current quote data as CSV.
