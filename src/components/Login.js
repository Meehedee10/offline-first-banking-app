// src/components/Login.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMsg(error.message)
    } else {
      nav('/faceid')
    }
  }

  return (
    <div style={{ padding: 20, background: '#0E0B1D', color: '#FFF', minHeight: '100vh' }}>
      <h2>Log In</h2>
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
          Log In
        </button>
      </form>
    </div>
  )
}
