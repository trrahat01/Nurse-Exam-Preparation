import { Client, Account, Databases, ID, Query, Permission, Role } from 'appwrite';
import Constants from 'expo-constants';

// Read config from env (.env) first, then app.json -> extra.
const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as Record<string, string>;

const endpoint =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || extra.appwriteEndpoint || 'https://tor.cloud.appwrite.io/v1';
const projectId =
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || extra.appwriteProjectId || '6a7f8d46003d6384946a';

// ⚠️ The "API key" you received is a SERVER key — it must NOT go in this client.
// The app only needs the endpoint + project id. The server key is used only by
// the data-import script (scripts/import-appwrite.js) which you keep private.

// Database / collection IDs come from the Appwrite console (you create them).
// Put real IDs in .env / app.json extra; these are just defaults.
const databaseId =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || extra.appwriteDatabaseId || '';

export const APPWRITE_DATABASE_ID = databaseId;

export const APPWRITE_COLLECTIONS = {
  questions: process.env.EXPO_PUBLIC_APPWRITE_COLL_QUESTIONS || extra.appwriteCollQuestions || 'questions',
  categories: process.env.EXPO_PUBLIC_APPWRITE_COLL_CATEGORIES || extra.appwriteCollCategories || 'categories',
  bookmarks: process.env.EXPO_PUBLIC_APPWRITE_COLL_BOOKMARKS || extra.appwriteCollBookmarks || 'bookmarks',
  results: process.env.EXPO_PUBLIC_APPWRITE_COLL_RESULTS || extra.appwriteCollResults || 'mock_results',
  exposures: process.env.EXPO_PUBLIC_APPWRITE_COLL_EXPOSURES || extra.appwriteCollExposures || 'question_exposures',
  profiles: process.env.EXPO_PUBLIC_APPWRITE_COLL_PROFILES || extra.appwriteCollProfiles || 'profiles',
};

const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export { ID, Query, Permission, Role };
export { client as appwriteClient };

/** Appwrite redirect URLs for email verification / password reset (GitHub Pages). */
export function getRedirectBase(): string {
  return extra.appwriteRedirectBase || 'https://trrahat01.github.io/nurse-prep-pages';
}

export function isAppwriteConfigured(): boolean {
  return !!projectId && !!endpoint && !!databaseId;
}

/** Persist the session token so login stays permanent across app restarts. */
export function saveSessionToken(token: string) {
  // AsyncStorage is used by the auth store; we reuse it here to avoid a second import cycle.
  return import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) =>
    AsyncStorage.setItem('appwrite_session', token)
  );
}

export async function getStoredSessionToken(): Promise<string | null> {
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  return AsyncStorage.getItem('appwrite_session');
}

export async function clearStoredSessionToken(): Promise<void> {
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  await AsyncStorage.removeItem('appwrite_session');
}
