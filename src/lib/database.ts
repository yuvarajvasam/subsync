import { supabaseClient } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type Views = Database['public']['Views']

export class DatabaseService {
  // Plans
  static async getPlans(): Promise<Tables['plans']['Row'][]> {
    const { data, error } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('status', 'active')
      .order('price', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getPlanById(id: string) {
    const { data, error } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createPlan(plan: Tables['plans']['Insert']) {
    const { data, error } = await supabaseClient
      .from('plans')
      .insert(plan)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePlan(id: string, updates: Tables['plans']['Update']) {
    const { data, error } = await supabaseClient
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deletePlan(id: string) {
    const { error } = await supabaseClient
      .from('plans')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Subscriptions
  static async getUserSubscriptions(userId: string): Promise<any[]> {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        plans (
          name,
          technology,
          data_quota,
          speed
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getAllSubscriptions() {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        users (
          email,
          full_name
        ),
        plans (
          name,
          technology,
          data_quota,
          speed
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async createSubscription(subscription: Tables['subscriptions']['Insert']) {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateSubscription(id: string, updates: Tables['subscriptions']['Update']) {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async cancelSubscription(id: string) {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .update({ status: 'terminated' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Billing Records
  static async getUserBillingHistory(userId: string): Promise<any[]> {
    const { data, error } = await supabaseClient
      .from('billing_records')
      .select(`
        *,
        subscriptions (
          plans (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('billing_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createBillingRecord(billing: Tables['billing_records']['Insert']) {
    const { data, error } = await supabaseClient
      .from('billing_records')
      .insert(billing)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateBillingStatus(id: string, status: Tables['billing_records']['Update']['status']) {
    const { data, error } = await supabaseClient
      .from('billing_records')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Discounts
  static async getActiveDiscounts() {
    const { data, error } = await supabaseClient
      .from('discounts')
      .select('*')
      .eq('status', 'active')
      .gte('valid_until', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async getAllDiscounts() {
    const { data, error } = await supabaseClient
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async createDiscount(discount: Tables['discounts']['Insert']) {
    const { data, error } = await supabaseClient
      .from('discounts')
      .insert(discount)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateDiscount(id: string, updates: Tables['discounts']['Update']) {
    const { data, error } = await supabaseClient
      .from('discounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteDiscount(id: string) {
    const { error } = await supabaseClient
      .from('discounts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async validateDiscountCode(code: string) {
    const { data, error } = await supabaseClient
      .from('discounts')
      .select('*')
      .eq('code', code)
      .eq('status', 'active')
      .gte('valid_until', new Date().toISOString().split('T')[0])
      .single()

    if (error) return null
    return data
  }

  // Recommendations
  static async getUserRecommendations(userId: string): Promise<Tables['recommendations']['Row'][]> {
    const { data, error } = await supabaseClient
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createRecommendation(recommendation: Tables['recommendations']['Insert']) {
    const { data, error } = await supabaseClient
      .from('recommendations')
      .insert(recommendation)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async markRecommendationAsRead(id: string) {
    const { data, error } = await supabaseClient
      .from('recommendations')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Notifications
  static async getUserNotifications(userId: string) {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async createNotification(notification: Tables['notifications']['Insert']) {
    const { data, error } = await supabaseClient
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async markNotificationAsRead(id: string) {
    const { data, error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Analytics
  static async getSubscriptionAnalytics() {
    const { data, error } = await supabaseClient
      .from('subscription_analytics')
      .select('*')
      .order('month', { ascending: false })
      .limit(12)

    if (error) throw error
    return data
  }

  static async getUserAnalytics() {
    const { data, error } = await supabaseClient
      .from('user_analytics')
      .select('*')
      .order('month', { ascending: false })
      .limit(12)

    if (error) throw error
    return data
  }

  // Users
  static async getAllUsers() {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async getUserById(id: string) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async updateUserRole(id: string, role: 'user' | 'admin') {
    const { data, error } = await supabaseClient
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Usage Tracking
  static async getUserUsage(userId: string) {
    const { data, error } = await supabaseClient
      .from('usage_tracking')
      .select(`
        *,
        subscriptions (
          plans (
            name
          )
        )
      `)
      .eq('subscriptions.user_id', userId)
      .order('date', { ascending: false })
      .limit(30)

    if (error) throw error
    return data
  }

  static async updateUsage(subscriptionId: string, date: string, usageGb: number) {
    const { data, error } = await supabaseClient
      .from('usage_tracking')
      .upsert({
        subscription_id: subscriptionId,
        date,
        usage_gb: usageGb,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
