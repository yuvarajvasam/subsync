-- Lumen Sub Sync Database Schema
-- This file contains the complete database schema for the subscription management platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'terminated', 'pending');
CREATE TYPE billing_status AS ENUM ('paid', 'pending', 'failed', 'refunded');
CREATE TYPE plan_type AS ENUM ('monthly', 'yearly');
CREATE TYPE technology_type AS ENUM ('fibernet', 'copper');
CREATE TYPE discount_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE recommendation_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE recommendation_category AS ENUM ('usage', 'cost', 'performance', 'technology');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Plans table
CREATE TABLE public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    type plan_type NOT NULL,
    technology technology_type NOT NULL,
    data_quota TEXT NOT NULL, -- e.g., "500GB", "Unlimited"
    speed TEXT NOT NULL, -- e.g., "Up to 500 Mbps"
    features JSONB DEFAULT '[]'::jsonb,
    auto_renewal BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    status subscription_status DEFAULT 'pending' NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    usage_gb INTEGER DEFAULT 0,
    auto_renewal BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, plan_id, status) -- Prevent duplicate active subscriptions
);

-- Billing records table
CREATE TABLE public.billing_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    billing_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status billing_status DEFAULT 'pending' NOT NULL,
    invoice_id TEXT UNIQUE NOT NULL,
    payment_method TEXT,
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discounts table
CREATE TABLE public.discounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    description TEXT,
    conditions TEXT,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    status discount_status DEFAULT 'active' NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    applicable_plans UUID[] DEFAULT '{}', -- Array of plan IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Discount usage tracking
CREATE TABLE public.discount_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discount_id UUID REFERENCES public.discounts(id) NOT NULL,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) NOT NULL,
    amount_saved DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discount_id, user_id, subscription_id)
);

-- Recommendations table
CREATE TABLE public.recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    current_plan TEXT,
    savings TEXT,
    priority recommendation_priority DEFAULT 'medium' NOT NULL,
    category recommendation_category NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, success, error
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Usage tracking table
CREATE TABLE public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID REFERENCES public.subscriptions(id) NOT NULL,
    date DATE NOT NULL,
    usage_gb INTEGER DEFAULT 0,
    peak_usage_gb INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscription_id, date)
);

-- Analytics views for admin dashboard
CREATE VIEW public.subscription_analytics AS
SELECT 
    DATE_TRUNC('month', s.created_at) as month,
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN s.status = 'terminated' THEN 1 END) as terminated_subscriptions,
    SUM(s.price) as total_revenue,
    AVG(s.price) as average_price
FROM public.subscriptions s
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY month DESC;

CREATE VIEW public.user_analytics AS
SELECT 
    DATE_TRUNC('month', u.created_at) as month,
    COUNT(*) as new_users,
    COUNT(CASE WHEN u.last_login > NOW() - INTERVAL '30 days' THEN 1 END) as active_users
FROM public.users u
GROUP BY DATE_TRUNC('month', u.created_at)
ORDER BY month DESC;

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_billing_records_user_id ON public.billing_records(user_id);
CREATE INDEX idx_billing_records_status ON public.billing_records(status);
CREATE INDEX idx_discounts_code ON public.discounts(code);
CREATE INDEX idx_discounts_status ON public.discounts(status);
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_usage_tracking_subscription_id ON public.usage_tracking(subscription_id);
CREATE INDEX idx_usage_tracking_date ON public.usage_tracking(date);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can view their own billing records
CREATE POLICY "Users can view own billing" ON public.billing_records
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all billing records
CREATE POLICY "Admins can view all billing" ON public.billing_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Everyone can view active discounts
CREATE POLICY "Everyone can view active discounts" ON public.discounts
    FOR SELECT USING (status = 'active');

-- Admins can manage all discounts
CREATE POLICY "Admins can manage discounts" ON public.discounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations" ON public.recommendations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own recommendations (mark as read)
CREATE POLICY "Users can update own recommendations" ON public.recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own usage tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE id = subscription_id AND user_id = auth.uid()
        )
    );

-- Admins can view all usage tracking
CREATE POLICY "Admins can view all usage" ON public.usage_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Plans are publicly readable
CREATE POLICY "Plans are publicly readable" ON public.plans
    FOR SELECT USING (true);

-- Admins can manage plans
CREATE POLICY "Admins can manage plans" ON public.plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_records_updated_at BEFORE UPDATE ON public.billing_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON public.discounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sample data insertion
INSERT INTO public.plans (name, description, price, type, technology, data_quota, speed, features, is_popular) VALUES
('Fibernet Basic', 'Essential fiber internet for individuals', 29.99, 'monthly', 'fibernet', '100GB', 'Up to 100 Mbps', '["High-speed internet", "24/7 support", "Free installation"]', false),
('Fibernet Premium', 'Advanced fiber internet for families', 49.99, 'monthly', 'fibernet', '500GB', 'Up to 500 Mbps', '["High-speed internet", "Priority support", "Free installation", "Parental controls"]', true),
('Fibernet Enterprise', 'Professional fiber internet for businesses', 99.99, 'monthly', 'fibernet', 'Unlimited', 'Up to 1 Gbps', '["High-speed internet", "Dedicated support", "Free installation", "Business features", "SLA guarantee"]', false),
('Copper Standard', 'Reliable copper internet connection', 19.99, 'monthly', 'copper', '50GB', 'Up to 50 Mbps', '["Reliable internet", "Basic support", "Standard installation"]', false),
('Copper Plus', 'Enhanced copper internet connection', 34.99, 'monthly', 'copper', '150GB', 'Up to 100 Mbps', '["Reliable internet", "Enhanced support", "Standard installation", "Extended coverage"]', false);

INSERT INTO public.discounts (code, percentage, description, conditions, valid_from, valid_until, usage_limit, applicable_plans) VALUES
('WELCOME20', 20.00, 'Welcome discount for new users', 'Valid for first-time subscribers only', '2024-01-01', '2024-12-31', 100, ARRAY[]::uuid[]),
('FIBER15', 15.00, 'Fibernet upgrade promotion', 'Valid for Fibernet plan upgrades', '2024-01-01', '2024-12-31', 50, ARRAY[]::uuid[]),
('SUMMER50', 50.00, 'Summer promotion for annual subscriptions', 'Valid for annual subscriptions only', '2024-06-01', '2024-08-31', 25, ARRAY[]::uuid[]);
