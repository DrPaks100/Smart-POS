import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeId } from '@/types'

const THEME_VARS: Record<
  ThemeId,
  {
    scheme: 'light' | 'dark'
    bg: string
    surface: string
    ink: string
    muted: string
    border: string
    blend: string
    blendSoft: string
    shadow: string
    shadowLg: string
    ambientBefore: string
    ambientAfter: string
  }
> = {
  brand: {
    scheme: 'light',
    bg: '#f7f8fc',
    surface: '#ffffff',
    ink: '#0f172a',
    muted: '#64748b',
    border: '#e8eaf0',
    blend: 'linear-gradient(135deg, #84cc16 0%, #0d9488 35%, #2563eb 70%, #7c3aed 100%)',
    blendSoft:
      'linear-gradient(135deg, rgba(132,204,22,0.14) 0%, rgba(13,148,136,0.1) 35%, rgba(37,99,235,0.12) 70%, rgba(124,58,237,0.1) 100%)',
    shadow: '0 4px 24px rgba(37, 99, 235, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
    shadowLg: '0 12px 40px rgba(37, 99, 235, 0.12), 0 4px 16px rgba(124, 58, 237, 0.08)',
    ambientBefore:
      'radial-gradient(circle, rgba(132,204,22,0.5) 0%, rgba(13,148,136,0.35) 40%, rgba(37,99,235,0.25) 70%, transparent 100%)',
    ambientAfter:
      'radial-gradient(circle, rgba(124,58,237,0.45) 0%, rgba(37,99,235,0.35) 45%, rgba(13,148,136,0.2) 75%, transparent 100%)',
  },
  dark: {
    scheme: 'dark',
    bg: '#0b1220',
    surface: '#121a2b',
    ink: '#e8eefc',
    muted: '#94a3b8',
    border: '#243044',
    blend: 'linear-gradient(135deg, #a3e635 0%, #14b8a6 35%, #3b82f6 70%, #a78bfa 100%)',
    blendSoft:
      'linear-gradient(135deg, rgba(163,230,53,0.16) 0%, rgba(20,184,166,0.12) 35%, rgba(59,130,246,0.14) 70%, rgba(167,139,250,0.12) 100%)',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25)',
    shadowLg: '0 16px 48px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(59, 130, 246, 0.15)',
    ambientBefore:
      'radial-gradient(circle, rgba(163,230,53,0.28) 0%, rgba(20,184,166,0.2) 40%, rgba(59,130,246,0.18) 70%, transparent 100%)',
    ambientAfter:
      'radial-gradient(circle, rgba(167,139,250,0.28) 0%, rgba(59,130,246,0.22) 45%, rgba(20,184,166,0.12) 75%, transparent 100%)',
  },
  ocean: {
    scheme: 'light',
    bg: '#f3fafc',
    surface: '#ffffff',
    ink: '#0c4a6e',
    muted: '#64748b',
    border: '#d7eef5',
    blend: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 40%, #2563eb 75%, #1d4ed8 100%)',
    blendSoft:
      'linear-gradient(135deg, rgba(34,211,238,0.16) 0%, rgba(14,165,233,0.12) 40%, rgba(37,99,235,0.12) 75%, rgba(29,78,216,0.1) 100%)',
    shadow: '0 4px 24px rgba(14, 165, 233, 0.1), 0 1px 3px rgba(12, 74, 110, 0.05)',
    shadowLg: '0 12px 40px rgba(14, 165, 233, 0.16), 0 4px 16px rgba(37, 99, 235, 0.1)',
    ambientBefore:
      'radial-gradient(circle, rgba(34,211,238,0.45) 0%, rgba(14,165,233,0.35) 40%, rgba(37,99,235,0.22) 70%, transparent 100%)',
    ambientAfter:
      'radial-gradient(circle, rgba(29,78,216,0.35) 0%, rgba(37,99,235,0.28) 45%, rgba(14,165,233,0.18) 75%, transparent 100%)',
  },
  sunset: {
    scheme: 'light',
    bg: '#fff8f3',
    surface: '#ffffff',
    ink: '#431407',
    muted: '#9a3412',
    border: '#fde4d4',
    blend: 'linear-gradient(135deg, #fbbf24 0%, #f97316 40%, #ea580c 70%, #c2410c 100%)',
    blendSoft:
      'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(249,115,22,0.12) 40%, rgba(234,88,12,0.12) 70%, rgba(194,65,12,0.1) 100%)',
    shadow: '0 4px 24px rgba(249, 115, 22, 0.1), 0 1px 3px rgba(67, 20, 7, 0.05)',
    shadowLg: '0 12px 40px rgba(249, 115, 22, 0.16), 0 4px 16px rgba(194, 65, 12, 0.1)',
    ambientBefore:
      'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(249,115,22,0.32) 40%, rgba(234,88,12,0.22) 70%, transparent 100%)',
    ambientAfter:
      'radial-gradient(circle, rgba(194,65,12,0.35) 0%, rgba(234,88,12,0.28) 45%, rgba(251,191,36,0.18) 75%, transparent 100%)',
  },
}

export function applyTheme(themeId: ThemeId) {
  const theme = THEME_VARS[themeId] ?? THEME_VARS.brand
  const root = document.documentElement
  root.dataset.theme = themeId
  root.style.colorScheme = theme.scheme
  root.style.setProperty('--bb-bg', theme.bg)
  root.style.setProperty('--bb-surface', theme.surface)
  root.style.setProperty('--bb-ink', theme.ink)
  root.style.setProperty('--bb-muted', theme.muted)
  root.style.setProperty('--bb-border', theme.border)
  root.style.setProperty('--bb-blend', theme.blend)
  root.style.setProperty('--bb-blend-soft', theme.blendSoft)
  root.style.setProperty('--bb-shadow', theme.shadow)
  root.style.setProperty('--bb-shadow-lg', theme.shadowLg)
  root.style.setProperty('--bb-ambient-before', theme.ambientBefore)
  root.style.setProperty('--bb-ambient-after', theme.ambientAfter)
}

interface ThemeState {
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: 'brand',
      setTheme: (themeId) => {
        applyTheme(themeId)
        set({ themeId })
      },
    }),
    {
      name: 'bb-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.themeId) applyTheme(state.themeId)
      },
    },
  ),
)

export const THEME_OPTIONS: { id: ThemeId; label: string; hint: string }[] = [
  { id: 'brand', label: 'Brand', hint: 'Green → teal → blue → violet' },
  { id: 'dark', label: 'Dark', hint: 'Night floor mode' },
  { id: 'ocean', label: 'Ocean', hint: 'Cool blue shop light' },
  { id: 'sunset', label: 'Sunset', hint: 'Warm amber till glow' },
]
