import { create } from 'zustand'
import type { User } from 'firebase/auth'
import type { UserProfile } from '@/types'
import {
  ensureUserProfile,
  loginWithEmail,
  logout as firebaseLogout,
  resetPassword,
  subscribeToAuth,
} from '@/services/authService'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  error: string | null
  init: () => () => void
  login: (email: string, password: string) => Promise<void>
  sendReset: (email: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  error: null,

  init: () => {
    const unsub = subscribeToAuth(async (user) => {
      if (!user) {
        set({ user: null, profile: null, initialized: true, loading: false })
        return
      }
      const profile = await ensureUserProfile(user)
      if (!profile.isActive) {
        await firebaseLogout()
        set({
          user: null,
          profile: null,
          initialized: true,
          loading: false,
          error: 'auth/user-disabled',
        })
        return
      }
      set({ user, profile, initialized: true, loading: false })
    })
    return unsub
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await loginWithEmail(email, password)
      const profile = await ensureUserProfile(user)
      set({ user, profile, loading: false })
    } catch (err) {
      const code = (err as { code?: string }).code ?? 'unknown'
      set({ loading: false, error: code })
      throw err
    }
  },

  sendReset: async (email) => {
    set({ loading: true, error: null })
    try {
      await resetPassword(email)
      set({ loading: false })
    } catch (err) {
      const code = (err as { code?: string }).code ?? 'unknown'
      set({ loading: false, error: code })
      throw err
    }
  },

  logout: async () => {
    await firebaseLogout()
    set({ user: null, profile: null })
  },

  clearError: () => set({ error: null }),
}))
