import { getSupabaseClient } from './supabase';

export interface RecoveryParams {
  access_token?: string;
  refresh_token?: string;
  token_hash?: string;
}

/**
 * Parses a Supabase password-recovery deep link.
 * The recovery email link looks like:
 *   nurse-exam-prep://...#access_token=...&type=recovery&refresh_token=... (PKCE)
 * or with an OTP code (?code=...&type=recovery).
 */
export function parseRecoveryParams(rawUrl?: string | null): RecoveryParams | null {
  if (!rawUrl) return null;
  const qIndex = rawUrl.indexOf('?');
  const fIndex = rawUrl.indexOf('#');
  const query = qIndex >= 0 ? rawUrl.slice(qIndex + 1) : '';
  const fragment = fIndex >= 0 ? rawUrl.slice(fIndex + 1) : '';

  const params = new Map<string, string>();
  `${query}${query && fragment ? '&' : ''}${fragment}`
    .split('&')
    .forEach(pair => {
      if (!pair) return;
      const eq = pair.indexOf('=');
      const key = eq >= 0 ? pair.slice(0, eq) : pair;
      const val = eq >= 0 ? pair.slice(eq + 1) : '';
      if (key) params.set(decodeURIComponent(key), decodeURIComponent(val.replace(/\+/g, ' ')));
    });

  if (params.get('type') !== 'recovery') return null;

  return {
    access_token: params.get('access_token') || undefined,
    refresh_token: params.get('refresh_token') || undefined,
    token_hash: params.get('code') || params.get('token_hash') || undefined,
  };
}

/**
 * Completes the recovery session so the user can then set a new password.
 * Returns true when a valid recovery session is established.
 */
export async function applyRecoverySession(params: RecoveryParams): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    if (params.access_token && params.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error) return false;
    } else if (params.token_hash) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: params.token_hash, type: 'recovery' });
      if (error) return false;
    } else {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}