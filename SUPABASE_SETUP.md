# Supabase Integration Setup Guide

This guide will help you set up Supabase for the Lumen Sub Sync application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `lumen-sub-sync` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Environment Variables

1. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

This will create:
- All necessary tables (users, plans, subscriptions, billing_records, discounts, etc.)
- Row Level Security (RLS) policies
- Database functions and triggers
- Sample data

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

### Site URL
- Set **Site URL** to: `http://localhost:5173` (for development)
- For production, set it to your domain: `https://yourdomain.com`

### Redirect URLs
Add these redirect URLs:
- `http://localhost:5173/auth/callback`
- `https://yourdomain.com/auth/callback`

### Email Settings (Optional)
- Configure SMTP settings if you want to send emails
- Or use Supabase's built-in email service

## Step 6: Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Create an admin user:
   - Email: `admin@lumen.com`
   - Password: `admin123` (or your preferred password)
   - Confirm password

4. After creating the user, go to **SQL Editor** and run:
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'admin@lumen.com';
   ```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`
3. Click "Get Started" to go to the auth page
4. Try logging in with:
   - **User**: `admin@lumen.com` / `admin123`
   - **Admin**: `admin@lumen.com` / `admin123`

## Step 8: Production Deployment

When deploying to production:

1. Update your Supabase project settings:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: `https://yourdomain.com/auth/callback`

2. Update your environment variables in your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Database Schema Overview

The schema includes the following main tables:

- **users**: User profiles and roles
- **plans**: Available subscription plans
- **subscriptions**: User subscriptions
- **billing_records**: Payment history
- **discounts**: Promotional codes
- **recommendations**: AI-generated recommendations
- **notifications**: User notifications
- **usage_tracking**: Data usage tracking

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Role-based access**: Admins can access all data, users only their own
- **Authentication**: Secure JWT-based authentication
- **Data validation**: Database constraints ensure data integrity

## Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Check that environment variables are set correctly
   - Verify Site URL and Redirect URLs in Supabase settings

2. **Database errors**:
   - Ensure the schema was executed successfully
   - Check that RLS policies are enabled

3. **CORS errors**:
   - Add your domain to the allowed origins in Supabase settings

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review the application logs in your browser's developer console

## Next Steps

After successful setup:

1. Customize the sample data in the database
2. Configure email templates for authentication
3. Set up monitoring and analytics
4. Implement additional features like payment processing
5. Add more sophisticated recommendation algorithms
