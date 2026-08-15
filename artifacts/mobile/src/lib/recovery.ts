import { account, isAppwriteConfigured } from './appwrite';

export interface RecoveryParams {
  userId: string;
  secret: string;
  context: 'verify' | 'recovery' | 'unknown';
}

function parseUrl(rawUrl: string | null | undefined): URLSearchParams | null {
  if (!rawUrl) return null;
  const qIndex = rawUrl.indexOf('?');
  const fIndex = rawUrl.indexOf('#');
  let paramsStr = '';
  if (qIndex >= 0) paramsStr = rawUrl.slice(qIndex + 1, fIndex >= 0 ? fIndex : undefined) + '&';
  if (fIndex >= 0) paramsStr += rawUrl.slice(fIndex + 1);
  const params = new Map<string, string>();
  paramsStr.split('&').forEach(pair => {
    if (!pair) return;
    const eq = pair.indexOf('=');
    const key = eq >= 0 ? pair.slice(0, eq) : pair;
    const val = eq >= 0 ? pair.slice(eq + 1) : '';
    if (key) params.set(decodeURIComponent(key), decodeURIComponent(val.replace(/\+/g, ' ')));
  });
  return params as unknown as URLSearchParams;
}

/**
 * Appwrite email links carry `userId` and `secret` in the query string.
 * `context` tells us whether to verify email or reset the password.
 */
export function parseRecoveryParams(rawUrl: string | null | undefined): RecoveryParams | null {
  const params = parseUrl(rawUrl);
  if (!params) return null;
  const userId = params.get('userId');
  const secret = params.get('secret');
  if (!userId || !secret) return null;
  const context = (params.get('context') === 'verify') ? 'verify' : (params.get('context') === 'recovery' ? 'recovery' : 'unknown');
  return { userId, secret, context };
}

export async function completePasswordReset(params: RecoveryParams, newPassword: string): Promise<boolean> {
  if (!isAppwriteConfigured()) return false;
  try {
    await account.updateRecovery(params.userId, params.secret, newPassword);
    return true;
  } catch {
    return false;
  }
}

export async function completeEmailVerification(params: RecoveryParams): Promise<boolean> {
  if (!isAppwriteConfigured()) return false;
  try {
    await account.updateVerification(params.userId, params.secret);
    return true;
  } catch {
    return false;
  }
}
