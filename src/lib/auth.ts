import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin'
  full_name?: string
}

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
    return data
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      role: profile.role,
      full_name: profile.full_name,
    }
  }

  // Get current session
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser()
        callback(authUser)
      } else {
        callback(null)
      }
    })
  }

  // Update user profile
  static async updateProfile(updates: {
    full_name?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Check if user is admin
  static async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.role === 'admin'
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  }
}
