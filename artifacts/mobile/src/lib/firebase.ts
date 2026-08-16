import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from './config';

/** True once the project's Firebase config is present in config.ts. */
export const firebaseConfigured = !!FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith('YOUR_');

let app: any = null;
let auth: any = null;

if (firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  try {
    // AsyncStorage-backed session persistence (keeps the user signed in across
    // restarts). Works without native modules (Expo Go compatible).
    const rnPersistence: any = {
      type: 'LOCAL',
      async _isAvailable() { return true; },
      async _set(key: string, value: string) { await AsyncStorage.setItem(key, value); },
      async _get(key: string) { return (await AsyncStorage.getItem(key)) as string | null; },
      async _remove(key: string) { await AsyncStorage.removeItem(key); },
    };
    auth = initializeAuth(app, { persistence: rnPersistence });
  } catch {
    auth = getAuth(app);
  }
}

export { app, auth };