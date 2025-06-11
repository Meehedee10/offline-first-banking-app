//Signup.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

function randomCardNumber() {
  return Array(4)
    .fill(0)
    .map(() => Math.floor(1000 + Math.random() * 9000))
    .join(' ')
}
function randomCVV() {
  return Math.floor(100 + Math.random() * 900).toString()
}

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setErrorMsg(error.message)
      return
    }

    // create default card
    const newCard = {
      user_id: data.user.id,
      card_number: randomCardNumber(),
      expiry: '01/2026',
      cvv: randomCVV(),
      balance: 1000,
    }
    await supabase.from('cards').insert([newCard])

    nav('/faceid')
  }

  return (
    <div style={{ padding: 20, background: '#0E0B1D', color: '#FFF', minHeight: '100vh' }}>
      <h2>Sign Up</h2>
      {errorMsg && <p style={{ color: '#F55' }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 4, border: 'none' }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 4, border: 'none' }}
        />

        <button
          type="submit"
          style={{
            background: '#004EFF',
            color: '#FFF',
            padding: '10px 20px',
            border: 'none',
            borderRadius: 24,
          }}
        >
          Create Account
        </button>
      </form>
    </div>
  )
}
