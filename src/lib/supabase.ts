import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'admin'
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'admin'
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin'
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          type: 'monthly' | 'yearly'
          technology: 'fibernet' | 'copper'
          data_quota: string
          speed: string
          features: any
          auto_renewal: boolean
          status: string
          is_popular: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          type: 'monthly' | 'yearly'
          technology: 'fibernet' | 'copper'
          data_quota: string
          speed: string
          features?: any
          auto_renewal?: boolean
          status?: string
          is_popular?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          type?: 'monthly' | 'yearly'
          technology?: 'fibernet' | 'copper'
          data_quota?: string
          speed?: string
          features?: any
          auto_renewal?: boolean
          status?: string
          is_popular?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'paused' | 'terminated' | 'pending'
          start_date: string
          end_date: string
          price: number
          usage_gb: number
          auto_renewal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'paused' | 'terminated' | 'pending'
          start_date: string
          end_date: string
          price: number
          usage_gb?: number
          auto_renewal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'paused' | 'terminated' | 'pending'
          start_date?: string
          end_date?: string
          price?: number
          usage_gb?: number
          auto_renewal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      billing_records: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          amount: number
          billing_date: string
          due_date: string
          status: 'paid' | 'pending' | 'failed' | 'refunded'
          invoice_id: string
          payment_method: string | null
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          amount: number
          billing_date: string
          due_date: string
          status?: 'paid' | 'pending' | 'failed' | 'refunded'
          invoice_id: string
          payment_method?: string | null
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          amount?: number
          billing_date?: string
          due_date?: string
          status?: 'paid' | 'pending' | 'failed' | 'refunded'
          invoice_id?: string
          payment_method?: string | null
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discounts: {
        Row: {
          id: string
          code: string
          percentage: number
          description: string | null
          conditions: string | null
          valid_from: string
          valid_until: string
          status: 'active' | 'inactive' | 'expired'
          usage_limit: number | null
          usage_count: number
          applicable_plans: string[]
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          code: string
          percentage: number
          description?: string | null
          conditions?: string | null
          valid_from: string
          valid_until: string
          status?: 'active' | 'inactive' | 'expired'
          usage_limit?: number | null
          usage_count?: number
          applicable_plans?: string[]
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          code?: string
          percentage?: number
          description?: string | null
          conditions?: string | null
          valid_from?: string
          valid_until?: string
          status?: 'active' | 'inactive' | 'expired'
          usage_limit?: number | null
          usage_count?: number
          applicable_plans?: string[]
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          reason: string
          plan_name: string
          current_plan: string | null
          savings: string | null
          priority: 'high' | 'medium' | 'low'
          category: 'usage' | 'cost' | 'performance' | 'technology'
          is_read: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          reason: string
          plan_name: string
          current_plan?: string | null
          savings?: string | null
          priority?: 'high' | 'medium' | 'low'
          category: 'usage' | 'cost' | 'performance' | 'technology'
          is_read?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          reason?: string
          plan_name?: string
          current_plan?: string | null
          savings?: string | null
          priority?: 'high' | 'medium' | 'low'
          category?: 'usage' | 'cost' | 'performance' | 'technology'
          is_read?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          action_url: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      subscription_analytics: {
        Row: {
          month: string
          total_subscriptions: number
          active_subscriptions: number
          terminated_subscriptions: number
          total_revenue: number
          average_price: number
        }
      }
      user_analytics: {
        Row: {
          month: string
          new_users: number
          active_users: number
        }
      }
    }
  }
}

// Typed Supabase client
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
