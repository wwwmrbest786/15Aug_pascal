# Deployment Guide for Pascal Betting App

## Prerequisites

1. **Supabase Project**: You need a Supabase project with the database schema set up
2. **Netlify Account**: For hosting the frontend

## Environment Variables Required

You'll need to set these environment variables in Windsurf/Netlify:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vfhmodzedgeqoujujbby.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaG1vZHplZGdlcW91anVqYmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3MjYsImV4cCI6MjA3MDc4MTcyNn0.XeDEb1mQHeKfrzLfhEat0TDkIRIXs7ifma9XJKOQDIo
NEXT_PUBLIC_SITE_URL=https://pascal-wagering-app.windsurf.build
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=https://pascal-wagering-app.windsurf.build/auth/callback
```

## Deployment Steps

### 1. Set up Supabase Database

Run the SQL scripts in the `scripts/` folder in your Supabase SQL editor:

1. `01-create-tables.sql` - Creates all necessary tables and RLS policies
2. `02-seed-data.sql` - (Optional) Adds sample data for testing

### 2. Configure Supabase Auth

In your Supabase dashboard (https://vfhmodzedgeqoujujbby.supabase.co):

1. Go to Authentication → Settings → URL Configuration
2. Set **Site URL**: `https://pascal-wagering-app.windsurf.build`
3. Add **Redirect URLs**:
   - `https://pascal-wagering-app.windsurf.build/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
4. Save the configuration

### 3. Deploy to Netlify

#### Option A: Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
4. Add the environment variables in Netlify dashboard under Site settings → Environment variables

#### Option B: Manual Deploy

1. Build the project locally:
   ```bash
   npm run build
   ```
2. Drag and drop the `out` folder to Netlify

### 4. Test the Deployment

1. Visit your deployed app
2. Try signing up for a new account
3. Create a group and test the basic functionality

## Troubleshooting

### Common Issues:

1. **Auth not working**: Check that redirect URLs are correctly set in Supabase
2. **Database errors**: Ensure RLS policies are properly set up
3. **Build failures**: Check that all environment variables are set

### Local Development:

Create a `.env.local` file with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then run:
```bash
npm run dev
```

## Next Steps After Deployment

1. Test all functionality in production
2. Set up monitoring and error tracking
3. Configure proper domain name
4. Set up email templates in Supabase for auth flows
