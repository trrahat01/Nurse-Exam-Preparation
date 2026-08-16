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
 * Email verification & password reset now happen via the hosted backend's web
 * pages (backend/api/verify.php and backend/api/password-reset.php), not through
 * in-app secret confirmations. These helpers remain for the in-app screen, but
 * no longer touch any external auth service.
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

export async function completePasswordReset(_params: RecoveryParams, _newPassword: string): Promise<boolean> {
  return false; // password reset now uses the backend web form
}

export async function completeEmailVerification(_params: RecoveryParams): Promise<boolean> {
  return false; // email verification now uses the backend web page
}