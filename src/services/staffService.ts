import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { STORE_ID } from '@/constants'
import { auth, db, secondaryAuth } from '@/firebase/config'
import type { UserProfile, UserRole } from '@/types'

function mapUser(snap: QueryDocumentSnapshot<DocumentData>): UserProfile {
  const data = snap.data()
  return {
    uid: snap.id,
    email: String(data.email ?? ''),
    displayName: String(data.displayName ?? ''),
    role: (data.role as UserRole) ?? 'cashier',
    phone: data.phone ? String(data.phone) : undefined,
    isActive: data.isActive !== false,
    storeId: String(data.storeId ?? STORE_ID),
    createdAt: data.createdAt?.toDate?.() ?? undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    lastLoginAt: data.lastLoginAt?.toDate?.() ?? undefined,
  }
}

export async function listStaff(storeId = STORE_ID): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), where('storeId', '==', storeId))
    const snap = await getDocs(q)
    return snap.docs
      .map(mapUser)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }))
  } catch {
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs
      .map(mapUser)
      .filter((u) => u.storeId === storeId)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }))
  }
}

export async function registerStaff(input: {
  displayName: string
  email: string
  password: string
  role: Extract<UserRole, 'manager' | 'cashier'>
  phone?: string
  storeId?: string
}): Promise<string> {
  const email = input.email.trim().toLowerCase()
  const displayName = input.displayName.trim()
  if (!displayName) throw new Error('Enter a full name.')
  if (!email) throw new Error('Enter an email.')
  if (input.password.length < 6) throw new Error('Password must be at least 6 characters.')

  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    input.password,
  )
  const uid = credential.user.uid

  try {
    await updateProfile(credential.user, { displayName })
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      displayName,
      role: input.role,
      phone: input.phone?.trim() || null,
      isActive: true,
      storeId: input.storeId ?? STORE_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid ?? null,
    })
  } catch (err) {
    try {
      await credential.user.delete()
    } catch {
      /* orphan auth user may remain if delete fails */
    }
    throw err
  } finally {
    await signOut(secondaryAuth)
  }

  return uid
}

export async function updateStaff(
  uid: string,
  input: {
    displayName?: string
    phone?: string
    role?: Extract<UserRole, 'manager' | 'cashier'>
    isActive?: boolean
  },
): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (input.displayName !== undefined) payload.displayName = input.displayName.trim()
  if (input.phone !== undefined) payload.phone = input.phone.trim() || null
  if (input.role !== undefined) payload.role = input.role
  if (input.isActive !== undefined) payload.isActive = input.isActive
  await updateDoc(doc(db, 'users', uid), payload)
}

export async function sendStaffPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim())
}
