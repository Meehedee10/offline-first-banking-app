// // src/components/SendMoney.js
// import React, { useState, useEffect } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { v4 as uuidv4 }                 from 'uuid'
// import { useAuth }                      from '../hooks/useAuth'
// import { supabase }                     from '../utils/supabaseClient'
// import {
//   queueTransaction,
//   addTransaction,
//   getAllCards,
// } from '../utils/offlineDB'

// export default function SendMoney() {
//   const { user }           = useAuth()
//   const [search]           = useSearchParams()
//   const nav                = useNavigate()
//   const cardId             = search.get('cardId')
//   const [card, setCard]    = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [form, setForm]    = useState({
//     accountName: '',
//     description: '',
//     reference: '',
//     amount: 0,
//   })

//   // 1) load the card (online or offline)
//   useEffect(() => {
//     if (!cardId) return
//     const loadOffline = async () => {
//       const cards = await getAllCards()
//       const match = cards.find(c => c.id === cardId)
//       if (match) setCard(match)
//     }
//     if (!navigator.onLine) {
//       loadOffline()
//       return
//     }
//     // online: fetch from Supabase
//     supabase
//       .from('cards')
//       .select('id, card_number, expiry, cvv, balance')
//       .eq('id', cardId)
//       .single()
//       .then(({ data, error }) => {
//         if (error) console.error('Error loading card:', error)
//         else setCard(data)
//       })
//   }, [cardId])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!card) return

//     const offline = !navigator.onLine
//     setLoading(true)

//     const amt = -Math.abs(form.amount)
//     const now = new Date().toISOString()
//     const txCommon = {
//       user_id:     user.id,
//       card_id:     card.id,
//       merchant:    form.accountName,
//       amount:      amt,
//       date:        now,
//       status:      offline ? 'pending' : 'complete',
//       description: form.description,
//       reference:   form.reference,
//     }

//     if (offline) {
//       const offlineTx = { id: uuidv4(), ...txCommon }
//       await queueTransaction(offlineTx)
//       await addTransaction(offlineTx)
//       alert('Offline: transaction queued and will sync when back online.')
//       setLoading(false)
//       return nav('/cards/send/confirmation')
//     }

//     // online: insert into Supabase
//     const { data: inserted, error: txError } = await supabase
//       .from('transactions')
//       .insert([txCommon])
//       .select()

//     if (txError) {
//       alert('Failed to send: ' + txError.message)
//       setLoading(false)
//       return
//     }

//     const newTx = inserted[0]
//     await addTransaction(newTx)

//     // update card balance
//     const newBalance = parseFloat(card.balance) + amt
//     const { error: cardError } = await supabase
//       .from('cards')
//       .update({ balance: newBalance })
//       .eq('id', card.id)
//     if (cardError) console.error('Failed to update balance:', cardError)

//     setLoading(false)
//     nav('/cards/send/confirmation')
//   }

//   if (!card) {
//     return <p style={{ padding: 20, color: '#FFF' }}>Loading card…</p>
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       style={{
//         background: '#0E0B1D',
//         color:      '#FFF',
//         padding:    20,
//         minHeight: '100vh',
//       }}
//     >
//       <button type="button" onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#FFF' }}>
//         ←
//       </button>

//       {/* Card Info */}
//       <div style={{ margin: '16px 0' }}>
//         <label>Account Number</label>
//         <input
//           type="text"
//           value={card.card_number}
//           readOnly
//           style={{ width: '100%', padding: 8, borderRadius: 8, background: '#1A1632', border: 'none', color: '#FFF' }}
//         />
//       </div>
//       <p>Expiry: {card.expiry} CVV: {card.cvv}</p>
//       <p>Balance: ${parseFloat(card.balance).toFixed(2)}</p>

//       {/* Input Fields */}
//       {[
//         ['Account Name', 'accountName'],
//         ['Description',  'description'],
//         ['Reference No', 'reference'],
//       ].map(([label, key]) => (
//         <div key={key} style={{ margin: '16px 0' }}>
//           <label>{label}</label>
//           <input
//             required
//             value={form[key]}
//             onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
//             style={{ width: '100%', padding: 8, borderRadius: 8, background: '#1A1632', border: 'none', color: '#FFF' }}
//           />
//         </div>
//       ))}

//       {/* Amount */}
//       <div style={{ margin: '16px 0', padding: 12, background: '#1A1632', borderRadius: 8 }}>
//         <label>Enter Your Amount</label>
//         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//           <span>AUD {form.amount.toFixed(2)}</span>
//           <button type="button" onClick={() => alert('Currency switch stub')} style={{ color: '#F55', background: 'none', border: 'none' }}>
//             Change Currency?
//           </button>
//         </div>
//         <input
//           type="number"
//           required
//           value={form.amount}
//           onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
//           style={{ width: '100%', padding: 8, marginTop: 8, borderRadius: 8, background: '#0E0B1D', border: '1px solid #333', color: '#FFF' }}
//         />
//       </div>

//       <button type="submit" disabled={form.amount <= 0 || loading} style={{ background: loading ? '#555' : '#004EFF', color: '#FFF', padding: 12, border: 'none', borderRadius: 24, width: '100%' }}>
//         {loading ? 'Sending…' : 'Send Money'}
//       </button>
//     </form>
//   )
// }


// src/components/SendMoney.js
// src/components/SendMoney.js
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 as uuidv4 }                 from 'uuid'
import { useAuth }                      from '../hooks/useAuth'
import { supabase }                     from '../utils/supabaseClient'
import {
  queueTransaction,
  addTransaction,
  getAllCards,
} from '../utils/offlineDB'

export default function SendMoney() {
  const { user }           = useAuth()
  const [search]           = useSearchParams()
  const nav                = useNavigate()
  const cardId             = search.get('cardId')

  // our own sender card
  const [card, setCard]    = useState(null)
  const [loading, setLoading] = useState(false)

  // form now holds both receiver_account and accountName
  const [form, setForm]    = useState({
    receiverAcct:  '',    // ← the 16-digit receiver account #
    accountName:   '',    // ← friendly label for history
    description:   '',
    reference:     '',
    amount:        0,
  })

  // 1) load your card (online/offline)
  useEffect(() => {
    if (!cardId) return
    const loadOffline = async () => {
      const cards = await getAllCards()
      const match = cards.find(c => c.id === cardId)
      if (match) setCard(match)
    }
    if (!navigator.onLine) {
      loadOffline()
      return
    }
    supabase
      .from('cards')
      .select('id, card_number, expiry, cvv, balance')
      .eq('id', cardId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Error loading card:', error)
        else setCard(data)
      })
  }, [cardId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!card) return

    // validate 16-digit receiver
    if (!/^\d{16}$/.test(form.receiverAcct)) {
      return alert('Please enter a 16-digit account number')
    }

    const offline = !navigator.onLine
    setLoading(true)

    const amt = -Math.abs(form.amount)
    const now = new Date().toISOString()

    // <-- merchant is now accountName; receiver_account holds the raw number
    const txCommon = {
      user_id:          user.id,
      card_id:          card.id,
      merchant:         form.accountName,
      receiver_account: form.receiverAcct,
      amount:           amt,
      date:             now,
      status:           offline ? 'pending' : 'complete',
      description:      form.description,
      reference:        form.reference,
    }

    if (offline) {
      // queue + local
      const offlineTx = { id: uuidv4(), ...txCommon }
      await queueTransaction(offlineTx)
      await addTransaction(offlineTx)
      alert('Offline: transaction queued, will sync when back online.')
      setLoading(false)
      return nav('/cards/send/confirmation')
    }

    // online: push to Supabase
    const { data: inserted, error: txError } = await supabase
      .from('transactions')
      .insert([txCommon])
      .select()

    if (txError) {
      alert('Failed to send: ' + txError.message)
      setLoading(false)
      return
    }

    const newTx = inserted[0]
    await addTransaction(newTx)

    // update your card balance
    const newBalance = parseFloat(card.balance) + amt
    const { error: cardError } = await supabase
      .from('cards')
      .update({ balance: newBalance })
      .eq('id', card.id)
    if (cardError) console.error('Failed to update balance:', cardError)

    setLoading(false)
    nav('/cards/send/confirmation')
  }

  if (!card) {
    return <p style={{ padding: 20, color: '#FFF' }}>Loading card…</p>
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#0E0B1D',
        color:      '#FFF',
        padding:    20,
        minHeight: '100vh',
      }}
    >
      <button
        type="button"
        onClick={() => nav(-1)}
        style={{ background: 'none', border: 'none', color: '#FFF' }}
      >
        ←
      </button>

      {/* Sender’s Card */}
      <div style={{ margin: '16px 0' }}>
        <p><strong>Your Account:</strong> {card.card_number}</p>
        <p>Expiry: {card.expiry} CVV: {card.cvv}</p>
        <p>Balance: ${parseFloat(card.balance).toFixed(2)}</p>
      </div>

      {/* Receiver Account Number */}
      <div style={{ margin: '16px 0' }}>
        <label>Receiver Account Number</label>
        <input
          type="text"
          required
          maxLength={16}
          value={form.receiverAcct}
          onChange={e => setForm(f => ({
            ...f,
            receiverAcct: e.target.value.replace(/\D/g, '').slice(0,16)
          }))}
          placeholder="1234123412341234"
          style={{
            width:'100%', padding:8, borderRadius:8,
            background:'#1A1632', border:'none', color:'#FFF'
          }}
        />
      </div>

      {/* Friendly Name */}
      <div style={{ margin: '16px 0' }}>
        <label>Account Name</label>
        <input
          required
          value={form.accountName}
          onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
          style={{
            width:'100%', padding:8, borderRadius:8,
            background:'#1A1632', border:'none', color:'#FFF'
          }}
        />
      </div>

      {/* Description & Reference */}
      {[
        ['Description', 'description'],
        ['Reference No', 'reference']
      ].map(([label, key]) => (
        <div key={key} style={{ margin: '16px 0' }}>
          <label>{label}</label>
          <input
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            style={{
              width:'100%', padding:8, borderRadius:8,
              background:'#1A1632', border:'none', color:'#FFF'
            }}
          />
        </div>
      ))}

      {/* Amount */}
      <div style={{ margin:'16px 0', padding:12, background:'#1A1632', borderRadius:8 }}>
        <label>Enter Your Amount</label>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span>AUD {form.amount.toFixed(2)}</span>
          <button
            type="button"
            onClick={() => alert('Currency switch stub')}
            style={{ color:'#F55', background:'none', border:'none' }}
          >
            Change Currency?
          </button>
        </div>
        <input
          type="number"
          required
          value={form.amount}
          onChange={e => setForm(f => ({
            ...f,
            amount: parseFloat(e.target.value) || 0
          }))}
          style={{
            width:'100%', padding:8, marginTop:8,
            borderRadius:8, background:'#0E0B1D',
            border:'1px solid #333', color:'#FFF'
          }}
        />
      </div>

      <button
        type="submit"
        disabled={form.amount <= 0 || loading}
        style={{
          background: loading ? '#555' : '#004EFF',
          color:      '#FFF',
          padding:    12,
          border:     'none',
          borderRadius:24,
          width:'100%'
        }}
      >
        {loading ? 'Sending…' : 'Send Money'}
      </button>
    </form>
  )
}

