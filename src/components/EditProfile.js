

// src/components/EditProfile.js
// import React, { useEffect, useState } from 'react'
// import { useNavigate }               from 'react-router-dom'
// import { useAuth }                   from '../hooks/useAuth'
// import {
//   getProfile,
//   updateLocalProfile,
//   queueProfileUpdate
// } from '../utils/offlineDB'
// import { supabase }                  from '../utils/supabaseClient'

// export default function EditProfile() {
//   const { user } = useAuth()
//   const [profile, setProfile] = useState({
//     name:     '',
//     email:    '',
//     password: ''
//   })
//   const [loading, setLoading] = useState(true)
//   const nav = useNavigate()

//   useEffect(() => {
//     getProfile().then(p => {
//       if (p) {
//         // load from IDB if we have a “me” record
//         setProfile(p)
//       } else {
//         // otherwise seed the email from Auth
//         setProfile({ name: '', email: user.email, password: '' })
//       }
//       setLoading(false)
//     })
//   }, [user])

//   const handleSubmit = async e => {
//     e.preventDefault()

//     // 1) always write to IndexedDB immediately
//     updateLocalProfile({ ...profile, id: user.id })

//     if (navigator.onLine) {
//       // 2A) upsert into your profiles table
//       const { error: upErr } = await supabase
//         .from('profiles')
//         .upsert({ id: user.id, name: profile.name })
//       if (upErr) {
//         return alert('Could not update name: ' + upErr.message)
//       }

//       // 2B) update Auth email/password
//       const { error: authErr } = await supabase.auth.updateUser({
//         email:    profile.email,
//         password: profile.password || undefined,
//       })
//       if (authErr) {
//         return alert('Could not update credentials: ' + authErr.message)
//       }


//       alert('Profile saved.')
//     } else {
//       // 3) offline → queue it
//       await queueProfileUpdate({ ...profile, id: user.id })
//       alert('Offline: profile changes will sync when back online.')
//     }

//     nav(-1)
//   }

//   if (loading) return <p style={{ color:'#FFF', padding:20 }}>Loading…</p>

//   return (
//     <form
//       onSubmit={handleSubmit}
//       style={{
//         padding:20,
//         background:'#0E0B1D',
//         color:'#FFF',
//         minHeight:'100vh',
//         display:'flex',
//         flexDirection:'column',
//         gap:16
//       }}
//     >
//       <button
//         type="button"
//         onClick={() => nav(-1)}
//         style={{
//           background:'none',
//           border:'none',
//           color:'#FFF',
//           fontSize:20,
//           textAlign:'left'
//         }}
//       >
//         ← Back
//       </button>

//       <h2>Edit Profile</h2>

//       <label>Name</label>
//       <input
//         required
//         value={profile.name}
//         onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
//         style={{
//           padding:8,
//           borderRadius:4,
//           border:'1px solid #333',
//           background:'#1A1632',
//           color:'#FFF'
//         }}
//       />

//       <label>Email</label>
//       <input
//         type="email"
//         required
//         value={profile.email}
//         onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
//         style={{
//           padding:8,
//           borderRadius:4,
//           border:'1px solid #333',
//           background:'#1A1632',
//           color:'#FFF'
//         }}
//       />

//       <label>New Password (leave blank to keep current)</label>
//       <input
//         type="password"
//         value={profile.password}
//         onChange={e => setProfile(p => ({ ...p, password: e.target.value }))}
//         placeholder="••••••••"
//         style={{
//           padding:8,
//           borderRadius:4,
//           border:'1px solid #333',
//           background:'#1A1632',
//           color:'#FFF'
//         }}
//       />

//       <button
//         type="submit"
//         style={{
//           background:'#004EFF',
//           color:'#FFF',
//           padding:'12px 0',
//           border:'none',
//           borderRadius:24,
//           width:'100%'
//         }}
//       >
//         Save Changes
//       </button>
//     </form>
//   )
// }


import React, { useEffect, useState } from 'react'
import { useNavigate }               from 'react-router-dom'
import { useAuth }                   from '../hooks/useAuth'
import {
  getProfile,
  updateLocalProfile,
  queueProfileUpdate
} from '../utils/offlineDB'
import { supabase }                  from '../utils/supabaseClient'

export default function EditProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    name:     '',
    email:    '',
    password: ''
  })
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    getProfile().then(p => {
      if (p) {
        // load from IDB if we have a “me” record
        setProfile(p)
      } else {
        // otherwise seed the email from Auth
        setProfile({ name: '', email: user.email, password: '' })
      }
      setLoading(false)
    })
  }, [user])

  const handleSubmit = async e => {
    e.preventDefault()

    // 1) write to local IndexedDB immediately
    updateLocalProfile({ ...profile, id: user.id })

    if (navigator.onLine) {
      // 2A) upsert into the "profiles" table (stores display name)
      const { error: upErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name: profile.name })
      if (upErr) {
        return alert('Could not update name: ' + upErr.message)
      }

      // 2B) ask Supabase Auth to change email/password
      // Supabase will send a verification link to `profile.email`
      const { error: authErr } = await supabase.auth.updateUser({
        email:    profile.email,
        password: profile.password || undefined,
      })
      if (authErr) {
        return alert('Could not update credentials: ' + authErr.message)
      }

      alert(
        'Profile saved. A verification email has been sent to ' +
        profile.email +
        '. Please click that link to finalize the change.'
      )
    } else {
      // 3) offline → queue it for later sync
      await queueProfileUpdate({ ...profile, id: user.id })
      alert('Offline: profile changes will sync when back online.')
    }

    nav(-1)
  }

  if (loading) return <p style={{ color:'#FFF', padding:20 }}>Loading…</p>

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding:20,
        background:'#0E0B1D',
        color:'#FFF',
        minHeight:'100vh',
        display:'flex',
        flexDirection:'column',
        gap:16
      }}
    >
      <button
        type="button"
        onClick={() => nav(-1)}
        style={{
          background:'none',
          border:'none',
          color:'#FFF',
          fontSize:20,
          textAlign:'left'
        }}
      >
        ← Back
      </button>

      <h2>Edit Profile</h2>

      <label>Name</label>
      <input
        required
        value={profile.name}
        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
        style={{
          padding:8,
          borderRadius:4,
          border:'1px solid #333',
          background:'#1A1632',
          color:'#FFF'
        }}
      />

      <label>Email</label>
      <input
        type="email"
        required
        value={profile.email}
        onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
        style={{
          padding:8,
          borderRadius:4,
          border:'1px solid #333',
          background:'#1A1632',
          color:'#FFF'
        }}
      />

      <label>New Password (leave blank to keep current)</label>
      <input
        type="password"
        value={profile.password}
        onChange={e => setProfile(p => ({ ...p, password: e.target.value }))}
        placeholder="••••••••"
        style={{
          padding:8,
          borderRadius:4,
          border:'1px solid #333',
          background:'#1A1632',
          color:'#FFF'
        }}
      />

      <button
        type="submit"
        style={{
          background:'#004EFF',
          color:'#FFF',
          padding:'12px 0',
          border:'none',
          borderRadius:24,
          width:'100%'
        }}
      >
        Save Changes
      </button>
    </form>
  )
}



