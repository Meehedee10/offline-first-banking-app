
// // src/components/Settings.js
// import React, { useState, useEffect, useCallback } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { supabase } from '../utils/supabaseClient'
// import {
//   getProfile,
//   updateLocalProfile,
//   syncPendingProfileUpdates
// } from '../utils/offlineDB'

// export default function Settings() {
//   const { user } = useAuth()
//   const nav = useNavigate()

//   const [profile, setProfile] = useState({ name: '', email: user?.email || '' })
//   const [loading, setLoading]   = useState(true)

//   const loadProfile = useCallback(async () => {
//     if (!user) return
//     setLoading(true)

//     if (navigator.onLine) {
//       // 1) push whatever was queued
//       await syncPendingProfileUpdates(user.id)

//       // 2) re-fetch the authoritative name from Supabase
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('name')
//         .eq('id', user.id)
//         .single()

//       if (!error && data?.name) {
//         setProfile({ name: data.name, email: user.email })
//         // keep local IndexedDB in sync
//         await updateLocalProfile({ name: data.name, email: user.email })
//       } else {
//         // fallback: load whatever was local
//         const local = await getProfile()
//         if (local) setProfile({ name: local.name, email: local.email || user.email })
//       }
//     } else {
//       // offline: read from IndexedDB only
//       const local = await getProfile()
//       if (local) {
//         setProfile({ name: local.name, email: local.email || user.email })
//       }
//     }

//     setLoading(false)
//   }, [user])

//   useEffect(() => {
//     loadProfile()
//     window.addEventListener('online', loadProfile)
//     return () => window.removeEventListener('online', loadProfile)
//   }, [loadProfile])

//   if (loading) {
//     return <p style={{ padding:20, color:'#FFF' }}>Loading…</p>
//   }

//   return (
//     <div style={{
//       padding:20,
//       background:'#0E0B1D',
//       color:'#FFF',
//       minHeight:'100vh',
//     }}>
//       <h2>Settings</h2>
//       <p><strong>Name:</strong> {profile.name}</p>
//       <p><strong>Email:</strong> {profile.email}</p>
//       <button
//         onClick={()=>nav('/settings/edit')}
//         style={{
//           background:'#004EFF',
//           color:'#FFF',
//           padding:'12px 0',
//           border:'none',
//           borderRadius:24,
//           width:'100%',
//           marginTop:20
//         }}
//       >
//         Edit Profile & Password
//       </button>
//     </div>
//   )
// }



import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../utils/supabaseClient'
import {
  getProfile,
  updateLocalProfile,
  syncPendingProfileUpdates
} from '../utils/offlineDB'

export default function Settings() {
  const { user, loading: authLoading } = useAuth()
  const nav = useNavigate()

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // 1) Ensure any queued offline profile updates are pushed up
    await syncPendingProfileUpdates(user.id)

    // 2) Force‐refresh the Supabase user object to pick up a newly verified email
    const { data: { user: freshUser } } = await supabase.auth.getUser()

    // 3) If online, fetch the authoritative name from the "profiles" table
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      if (!error && data?.name) {
        // Use the fresh user email and the fetched name
        setProfile({ name: data.name, email: freshUser.email })
        // keep local IndexedDB in sync
        await updateLocalProfile({ name: data.name, email: freshUser.email })
      } else {
        // fallback to whatever was stored locally
        const local = await getProfile()
        if (local) {
          setProfile({
            name: local.name,
            email: local.email || freshUser.email
          })
        } else {
          setProfile({ name: '', email: freshUser.email })
        }
      }
    } else {
      // Offline: read from IndexedDB only, but still use freshUser.email
      const local = await getProfile()
      if (local) {
        setProfile({
          name: local.name,
          email: local.email || freshUser.email
        })
      } else {
        setProfile({ name: '', email: freshUser.email })
      }
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      loadProfile()
      window.addEventListener('online', loadProfile)
    }
    return () => window.removeEventListener('online', loadProfile)
  }, [authLoading, loadProfile])

  if (authLoading || loading) {
    return <p style={{ padding:20, color:'#FFF' }}>Loading…</p>
  }

  return (
    <div style={{
      padding:20,
      background:'#0E0B1D',
      color:'#FFF',
      minHeight:'100vh',
    }}>
      <h2>Settings</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <button
        onClick={() => nav('/settings/edit')}
        style={{
          background:'#004EFF',
          color:'#FFF',
          padding:'12px 0',
          border:'none',
          borderRadius:24,
          width:'100%',
          marginTop:20
        }}
      >
        Edit Profile & Password
      </button>
    </div>
  )
}
