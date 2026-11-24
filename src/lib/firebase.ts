import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

export const TPS3R_DATABASE_ID =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || 'database-tps3r';

export const TPS3R_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'tps3r-sigap-586c4';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sigap-586c4',
  storageBucket: TPS3R_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function createFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

function createIsolatedFirestore(firebaseApp: FirebaseApp): Firestore {
  if (typeof window === 'undefined') {
    return getFirestore(firebaseApp, TPS3R_DATABASE_ID);
  }

  try {
    return initializeFirestore(
      firebaseApp,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      TPS3R_DATABASE_ID
    );
  } catch {
    // Fallback aman saat Next.js Hot Module Reload (Firestore sudah diinisialisasi)
    return getFirestore(firebaseApp, TPS3R_DATABASE_ID);
  }
}

export const app: FirebaseApp = createFirebaseApp();
export const db: Firestore = createIsolatedFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app, `gs://${TPS3R_STORAGE_BUCKET}`);

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getClientAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = import('firebase/analytics')
      .then(async ({ isSupported, getAnalytics }) => {
        const supported = await isSupported();
        return supported ? getAnalytics(app) : null;
      })
      .catch(() => null);
  }

  return analyticsPromise;
}
