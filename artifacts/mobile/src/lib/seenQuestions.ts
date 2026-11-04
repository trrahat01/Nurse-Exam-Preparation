import { getSupabaseClient } from './supabase';

/**
 * Record question exposures directly to Supabase server.
 * This is the ONLY way to record exposures.
 * This function is now integrated into the fetch_unseen_questions_distributed RPC.
 * Individual calls are no longer needed as exposures are recorded atomically within the RPC.
 */
export async function recordExposures(ids: string[], examType: string = 'practice'): Promise<void> {
  throw new Error('Individual exposure recording is deprecated. All exposures are now handled atomically by the fetch_unseen_questions_distributed RPC.');
}

/**
 * Clear all seen question history (for reset)
 * Non-destructive warning-only operation to protect existing exposure data.
 */
export async function clearSeenQuestions(): Promise<void> {
  // Destructive history reset functionality removed per requirements to preserve data.
  console.warn('Destructive clearSeenQuestions functionality is disabled in online-only mode. Existing exposure data is protected.');
}
