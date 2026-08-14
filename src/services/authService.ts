import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { STORE_ID } from '@/constants'
import type { UserProfile, UserRole } from '@/types'

function bootstrapProfile(user: User, role: UserRole = 'admin'): UserProfile {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName:
      user.displayName || user.email?.split('@')[0] || 'Best Brightness Admin',
    role,
    isActive: true,
    storeId: STORE_ID,
  }
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const profile = await ensureUserProfile(credential.user)
  if (!profile.isActive) {
    await signOut(auth)
    const err = new Error('This account has been deactivated. Ask an administrator.')
    ;(err as Error & { code?: string }).code = 'auth/user-disabled'
    throw err
  }
  void touchLastLogin(credential.user.uid)
  return credential.user
}

export async function registerWithEmail(input: {
  email: string
  password: string
  displayName: string
  role?: UserRole
}) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.password,
  )
  await updateProfile(credential.user, { displayName: input.displayName })

  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    email: input.email,
    displayName: input.displayName,
    role: input.role ?? 'cashier',
    isActive: true,
    storeId: STORE_ID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return credential.user
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function logout() {
  await signOut(auth)
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  try {
    const existing = await fetchUserProfile(user.uid)
    if (existing) return existing

    const profile = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Team member',
      role: 'admin' as UserRole,
      isActive: true,
      storeId: STORE_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', user.uid), profile)
    return {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      role: profile.role,
      isActive: profile.isActive,
      storeId: profile.storeId,
    }
  } catch (err) {
    console.warn(
      '[auth] Firestore profile unavailable — using local bootstrap profile.',
      err,
    )
    return bootstrapProfile(user, 'admin')
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    phone: data.phone,
    isActive: data.isActive ?? true,
    storeId: data.storeId ?? STORE_ID,
  }
}

export async function updateUserProfileFields(
  uid: string,
  input: { displayName?: string; phone?: string },
): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (input.displayName !== undefined) {
    payload.displayName = input.displayName.trim()
    if (auth.currentUser?.uid === uid) {
      await updateProfile(auth.currentUser, { displayName: input.displayName.trim() })
    }
  }
  if (input.phone !== undefined) {
    payload.phone = input.phone.trim() || null
  }
  await setDoc(doc(db, 'users', uid), payload, { merge: true })
}

async function touchLastLogin(uid: string) {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge: true },
    )
  } catch {
    /* ignore until Firestore rules allow writes */
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
