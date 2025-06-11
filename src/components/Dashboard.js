// src/components/Dashboard.js
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { getAllTransactions, saveTransactions } from '../utils/offlineDB'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTxs = useCallback(async () => {
    setLoading(true)

    // 1) load from IndexedDB
    const local = await getAllTransactions()
    const mineLocal = local
      .filter((t) => t.user_id === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4)

    if (!navigator.onLine) {
      setTxs(mineLocal)
      setLoading(false)
      return
    }

    // 2) if online, fetch from Supabase
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(4)

    if (error) {
      console.error('Dashboard fetch error', error)
      setTxs(mineLocal)
    } else {
      // merge & cache
      await saveTransactions(data)
      setTxs(data)
    }
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    fetchTxs()
    window.addEventListener('online', fetchTxs)
    return () => window.removeEventListener('online', fetchTxs)
  }, [fetchTxs])

  return (
    <div style={{ padding: 20, color: '#FFF' }}>
      <h1>Welcome back, {user.email}</h1>
      <h2>Recent Transactions</h2>
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
          : <p>No transactions yet.</p>
      }

      <button onClick={() => nav('/transactions')}>
        View All
      </button>
    </div>
  )
}
