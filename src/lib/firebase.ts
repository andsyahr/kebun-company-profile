import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore/lite';
import { getAuth, type Auth } from 'firebase/auth';

// Config web Firebase memang publik by design — keamanan di Firestore rules + Auth.
const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | undefined;

function getApp(): FirebaseApp | undefined {
  if (!firebaseReady) return undefined;
  app ??= getApps()[0] ?? initializeApp(config);
  return app;
}

export function getDb(): Firestore | undefined {
  const a = getApp();
  return a ? getFirestore(a) : undefined;
}

/** Hanya panggil di client (halaman admin). */
export function getFirebaseAuth(): Auth | undefined {
  const a = getApp();
  return a ? getAuth(a) : undefined;
}
