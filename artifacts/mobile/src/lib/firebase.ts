import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { FIREBASE_CONFIG } from './config';

/** True once the project's Firebase config is present in config.ts. */
export const firebaseConfigured = !!FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith('YOUR_');

/** True when running inside Expo Go (Firebase JS Auth isn't fully supported there). */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let app: any = null;
let auth: any = null;

// In Expo Go we skip Firebase Auth so the app runs in guest mode without the
// native assertion crash. In native (APK/AAB) builds Firebase Auth is enabled.
if (firebaseConfigured && !isExpoGo) {
  app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  try {
    // getAuth() uses in-memory persistence — simplest stable option without
    // native @react-native-firebase/auth. Persistent sessions come from
    // AsyncStorage in the auth store layer.
    auth = getAuth(app);
  } catch (e) {
    auth = null;
  }
}

export { app, auth };