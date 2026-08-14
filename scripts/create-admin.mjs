/**
 * One-time Admin bootstrap for Best Brightness POS.
 * Run: node scripts/create-admin.mjs
 * Do not commit real passwords. Delete or rotate after first login.
 */
import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
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

const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@bestbrightness.co.za',
  password: process.env.ADMIN_PASSWORD || 'BestBright@Admin2026!',
  displayName: process.env.ADMIN_NAME || 'Best Brightness Admin',
}

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

async function upsertAdminProfile(uid, email, displayName) {
  const ref = doc(db, 'users', uid)
  const existing = await getDoc(ref)
  const payload = {
    uid,
    email,
    displayName,
    role: 'admin',
    isActive: true,
    storeId: 'best-brightness-main',
    updatedAt: serverTimestamp(),
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
  }
  await setDoc(ref, payload, { merge: true })
}

async function main() {
  console.log('Project:', firebaseConfig.projectId)
  console.log('Creating / updating Admin:', ADMIN.email)

  let user
  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN.email, ADMIN.password)
    user = cred.user
    await updateProfile(user, { displayName: ADMIN.displayName })
    console.log('Auth user created:', user.uid)
  } catch (err) {
    if (err?.code === 'auth/email-already-in-use') {
      console.log('Auth user already exists — signing in to sync profile…')
      const cred = await signInWithEmailAndPassword(auth, ADMIN.email, ADMIN.password)
      user = cred.user
      console.log('Signed in:', user.uid)
    } else if (err?.code === 'auth/operation-not-allowed') {
      console.error('\nEmail/Password sign-in is NOT enabled.')
      console.error(
        'Enable it here: https://console.firebase.google.com/project/best-brightness-pos/authentication/providers',
      )
      process.exit(1)
    } else {
      throw err
    }
  }

  try {
    await upsertAdminProfile(user.uid, ADMIN.email, ADMIN.displayName)
    console.log('Firestore profile written: users/' + user.uid + ' (role: admin)')
  } catch (err) {
    console.error('\nAuth user is ready, but Firestore profile failed.')
    console.error('Create a Firestore database if missing, then re-run this script.')
    console.error('Error:', err?.code || err?.message || err)
    process.exit(1)
  }

  console.log('\n========== ADMIN LOGIN ==========')
  console.log('Email:   ', ADMIN.email)
  console.log('Password:', ADMIN.password)
  console.log('Role:     admin')
  console.log('=================================')
  console.log('Sign in at http://127.0.0.1:5173/login')
  console.log('Change this password after first login.')
}

main().catch((err) => {
  console.error('Failed:', err?.code || err?.message || err)
  process.exit(1)
})
