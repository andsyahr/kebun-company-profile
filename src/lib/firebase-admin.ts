import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Server-only: service account JSON di env FIREBASE_SERVICE_ACCOUNT (jangan PUBLIC_)
let app: App | undefined;

export function getAdminApp(): App | undefined {
  const existing = getApps()[0];
  if (existing) return existing;
  const json = import.meta.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) return undefined;
  app = initializeApp({ credential: cert(JSON.parse(json)) });
  return app;
}

export function getAdminAuth(): Auth | undefined {
  const a = getAdminApp();
  return a ? getAuth(a) : undefined;
}

export function getAdminDb(): Firestore | undefined {
  const a = getAdminApp();
  return a ? getFirestore(a) : undefined;
}
