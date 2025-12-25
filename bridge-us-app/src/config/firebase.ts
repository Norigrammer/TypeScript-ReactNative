import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

const extra = (Constants?.expoConfig?.extra as any) || {};
const extraFirebase = extra.firebase || {};

const apiKey = (process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string) || extraFirebase.apiKey;
const authDomain = (process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string) || extraFirebase.authDomain;
const projectId = (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string) || extraFirebase.projectId;
const storageBucket = (process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string) || extraFirebase.storageBucket;
const messagingSenderId = (process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string) || extraFirebase.messagingSenderId;
const appId = (process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string) || extraFirebase.appId;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Guard against missing config to avoid cryptic runtime errors
const missing = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error('[Firebase Config] Missing keys:', missing.join(', '));
  throw new Error('Firebase config is incomplete. Please set EXPO_PUBLIC_* env or app.json extra.firebase');
}

// Initialize once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Auth（標準のgetAuthを使用。必要に応じて後で永続化に対応）
const auth = getAuth(app);

// Firestore
const db = getFirestore(app);

export { app, auth, db };
