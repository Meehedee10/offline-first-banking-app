// src/components/TransactionHistory.js
import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { getAllTransactions, saveTransactions } from '../utils/offlineDB'
import { useAuth } from '../hooks/useAuth'

export default function TransactionHistory() {
  const { user } = useAuth()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)

    // 1) from local DB
    const local = await getAllTransactions()
    const mineLocal = local
      .filter(t => t.user_id === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    setTxs(mineLocal)

    // 2) if online, refresh
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (!error) {
        await saveTransactions(data)
        setTxs(data)
      }
    }

    setLoading(false)
  }, [user.id])

  useEffect(() => {
    fetchAll()
    window.addEventListener('online', fetchAll)
    return () => window.removeEventListener('online', fetchAll)
  }, [fetchAll])

  return (
    <div style={{ padding: 20, color: '#FFF' }}>
      <button onClick={() => window.history.back()}>← Back</button>
      <h1>Transaction History</h1>
      {loading
        ? <p>Loading…</p>
        : txs.length > 0
          ? <ul>
              {txs.map(t => (
                <li key={t.id || t.localId}>
                  {t.merchant} —{' '}
                  <span style={{ color: 'red' }}>
                    ${Math.abs(t.amount).toFixed(2)}
                    {t.status === 'pending' && ' (Pending)'}
                  </span>
                </li>
              ))}
            </ul>
          : <p>No transactions.</p>
      }
    </div>
  )
}
