/**
 * Seeds public portfolio demo accounts (manager + cashier).
 * Run: node scripts/seed-demo-staff.mjs
 */
import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  getAuth,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  const raw = readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    env[trimmed.slice(0, i)] = trimmed.slice(i + 1)
  }
  return env
}

const env = loadEnv()

const STAFF = [
  {
    email: 'manager@bestbrightness.co.za',
    password: 'DemoTill@2026',
    displayName: 'Sipho Manager',
    role: 'manager',
  },
  {
    email: 'cashier@bestbrightness.co.za',
    password: 'DemoTill@2026',
    displayName: 'Lerato Cashier',
    role: 'cashier',
  },
]

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function upsertProfile(uid, account) {
  const ref = doc(db, 'users', uid)
  const existing = await getDoc(ref)
  await setDoc(
    ref,
    {
      uid,
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      isActive: true,
      storeId: 'best-brightness-main',
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  )
}

async function seedOne(account) {
  let uid
  try {
    const cred = await createUserWithEmailAndPassword(auth, account.email, account.password)
    uid = cred.user.uid
    await updateProfile(cred.user, { displayName: account.displayName })
    console.log('Created', account.role, uid)
  } catch (err) {
    if (err?.code !== 'auth/email-already-in-use') throw err
    const cred = await signInWithEmailAndPassword(auth, account.email, account.password)
    uid = cred.user.uid
    console.log('Exists', account.role, uid)
  }
  await upsertProfile(uid, account)
  await signOut(auth)
}

async function main() {
  console.log('Seeding demo staff for', firebaseConfig.projectId)
  for (const account of STAFF) {
    await seedOne(account)
  }
  console.log('\nDemo logins ready:')
  for (const account of STAFF) {
    console.log(`${account.role}: ${account.email} / ${account.password}`)
  }
}

main().catch((err) => {
  console.error('Failed:', err?.code || err?.message || err)
  process.exit(1)
})
