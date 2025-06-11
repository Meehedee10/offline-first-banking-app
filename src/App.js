// src/App.js
// src/App.js
import React, { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Router from './AppRouter'
import NavBar  from './components/NavBar'
import { syncAllOfflineActions } from './utils/offlineDB'
import { useAuth } from './hooks/useAuth'





export default function App() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const hideNav = ['/', '/login', '/signup', '/faceid']

  // tick to force children to re-render when we sync
  const [tick, setTick] = useState(0)
  const onSync = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
  async function handleOnline() {
    if (navigator.onLine && user) {
      await syncAllOfflineActions(user.id)
      onSync()
    }
  }
  window.addEventListener('online', handleOnline)
  handleOnline()
  return () => window.removeEventListener('online', handleOnline)
}, [user, onSync])


  return (
    <div style={{ paddingBottom:'60px', minHeight:'100vh', background:'#0E0B1D' }}>
      <div style={{
        background: navigator.onLine ? '#0F0' : '#F55',
        color:'#FFF', textAlign:'center', padding:'4px 0', fontSize:12
      }}>
        {navigator.onLine ? 'You are Online!' : 'You are Offline!'}
      </div>

      {/* Pass tick so Router remounts its routes after a sync */}
      <Router key={tick} />

      {!hideNav.includes(pathname) && <NavBar />}
    </div>
  )
}
