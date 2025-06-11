// src/components/Statistics.js
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../utils/supabaseClient'

export default function Statistics() {
  const { user } = useAuth()
  const [txs, setTxs] = useState([])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
      if (error) console.error(error)
      else setTxs(data)
    })()
  }, [user])

  const totalSent = txs
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalReceived = txs
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div
      style={{
        padding: 20,
        background: '#0E0B1D',
        color: '#FFF',
        minHeight: '100vh',
      }}
    >
      <h2>Statistics</h2>
      <p>Total Sent: ${Math.abs(totalSent).toFixed(2)}</p>
      <p>Total Received: ${totalReceived.toFixed(2)}</p>
    </div>
  )
}
