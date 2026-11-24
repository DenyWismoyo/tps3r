import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  applicationDefault,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

export const ADMIN_DATABASE_ID =
  process.env.FIREBASE_DATABASE_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID ||
  'database-tps3r';

export const ADMIN_STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  'tps3r-sigap-586c4';

const ADMIN_APP_NAME = 'tps3r-admin-app';

function resolveAdminCredential() {
  const inlineKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (inlineKey) {
    const parsed = JSON.parse(inlineKey) as ServiceAccount;
    return cert(parsed);
  }

  const filePath = resolve(
    process.cwd(),
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './service-account-tps3r.json'
  );
  if (existsSync(filePath)) {
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as ServiceAccount;
    return cert(parsed);
  }

  return applicationDefault();
}

export function getFirebaseAdminApp(): App {
  const existing = getApps().find((item) => item.name === ADMIN_APP_NAME);
  if (existing) {
    return existing;
  }

  if (getApps().length > 0 && !ADMIN_APP_NAME) {
    return getApp();
  }

  return initializeApp(
    {
      credential: resolveAdminCredential(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sigap-586c4',
      storageBucket: ADMIN_STORAGE_BUCKET,
    },
    ADMIN_APP_NAME
  );
}

export function getAdminDb(): Firestore {
  return getFirestore(getFirebaseAdminApp(), ADMIN_DATABASE_ID);
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getFirebaseAdminApp());
}

export function getAdminBucket() {
  return getAdminStorage().bucket(ADMIN_STORAGE_BUCKET);
}
