import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatZar(amount: number): string {
  const value = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `R ${value}`
}

export function authErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again shortly.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'permission-denied':
      return 'Firestore permissions blocked this action. Publish rules, then try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
