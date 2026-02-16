import { MOCK_USER } from '@/lib/mock-data';

/**
 * Check if the current user is an admin.
 * In production this would read from an auth context;
 * for now we derive it from the mock user.
 */
export function useIsAdmin(): boolean {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9e12a5bc-bcf8-4863-ba85-1864bc6b6f1f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permissions.ts:useIsAdmin',message:'useIsAdmin called',data:{isAdmin:MOCK_USER.isAdmin},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return MOCK_USER.isAdmin;
}
