'use server';

/**
 * Geriye dönük uyumluluk (backward compatibility) için alias modülü.
 * Asıl mantık @/app/actions/accountSync ve @/app/actions/syncAccounts altında bulunmaktadır.
 *
 * @deprecated @/app/actions/accountSync veya @/app/actions/syncAccounts kullanın.
 * @module app/actions/stockCheck
 */

export {
  syncAccount as checkSingleAccount,
  syncAllAccounts as checkAllAccounts,
  syncMatchHistory,
  type CheckResult,
} from './accountSync';
