// src/hooks/useOfflineSync.js
import { useEffect } from 'react'
import { syncPendingTransactions } from '../utils/offlineDB'

/**
 * Runs syncPendingTransactions() whenever we come back online,
 * and (optionally) runs it immediately if we start online.
 */
export default function useOfflineSync(onSync) {
  useEffect(() => {
    async function _runSync() {
      if (!navigator.onLine) return
      await syncPendingTransactions()
      // then re-fetch your live data
      onSync?.()
    }

    // 1) if we’re already online at mount
    _runSync()
    // 2) also whenever we go from offline → online
    window.addEventListener('online', _runSync)
    return () => window.removeEventListener('online', _runSync)
  }, [onSync])
}
