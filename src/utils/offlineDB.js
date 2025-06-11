// // src/utils/offlineDB.js
// import { openDB }   from 'idb'
// import localforage  from 'localforage'
// import { supabase } from './supabaseClient'

// const DB_NAME    = 'banking'
// const DB_VERSION = 2

// async function getDB() {
//   return openDB(DB_NAME, DB_VERSION, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains('cards')) {
//         db.createObjectStore('cards', { keyPath: 'id' })
//       }
//       if (!db.objectStoreNames.contains('transactions')) {
//         db.createObjectStore('transactions', { keyPath: 'id' })
//       }
//       if (!db.objectStoreNames.contains('profile')) {
//         db.createObjectStore('profile', { keyPath: 'id' })
//       }
//     }
//   })
// }

// // ─── Profile CRUD ───────────────────────────────────────────────

// export async function getProfile() {
//   const db = await getDB()
//   return db.get('profile', 'me') || null
// }

// export async function updateLocalProfile(profile) {
//   const db = await getDB()
//   // always store with id='me'
//   await db.put('profile', { id: 'me', ...profile })
// }

// // ─── Offline Queue (localforage) ───────────────────────────────

// const PROFILE_QUEUE_KEY = 'profileUpdates'

// export async function getQueuedProfileUpdates() {
//   return (await localforage.getItem(PROFILE_QUEUE_KEY)) || []
// }

// export async function queueProfileUpdate(profile) {
//   const queue = await getQueuedProfileUpdates()
//   // overwrite any existing queued update
//   const filtered = queue.filter(q => q.id !== profile.id)
//   filtered.push({ ...profile, id: profile.id || 'me' })
//   await localforage.setItem(PROFILE_QUEUE_KEY, filtered)
// }

// export async function removeQueuedProfileUpdates() {
//   await localforage.removeItem(PROFILE_QUEUE_KEY)
// }

// // ─── Sync helpers ──────────────────────────────────────────────

// export async function syncPendingProfileUpdates() {
//   const queued = await getQueuedProfileUpdates()
//   if (!queued.length) return

//   for (const p of queued) {
//     // 1) upsert name into your `profiles` table
//     const { error: profilesErr } = await supabase
//       .from('profiles')
//       .upsert({ id: p.id, name: p.name })
//     if (profilesErr) {
//       console.error('Failed to sync profile.name', profilesErr)
//       continue
//     }

//     // 2) update auth credentials
//     const { error: authErr } = await supabase.auth.updateUser({
//       email:    p.email,
//       password: p.password || undefined
//     })
//     if (authErr) {
//       console.error('Failed to sync auth credentials', authErr)
//       continue
//     }

//     // 3) clear queue on success
//     await removeQueuedProfileUpdates()
//   }
// }

// // ─── Transaction sync (unchanged) ──────────────────────────────

// export async function getQueuedTransactions() {
//   return (await localforage.getItem('txQueue')) || []
// }

// export async function queueTransaction(tx) {
//   const q = await getQueuedTransactions()
//   await localforage.setItem('txQueue', [...q, tx])
// }

// export async function removeQueuedTransaction(id) {
//   const q = (await getQueuedTransactions()).filter(t => t.id !== id)
//   await localforage.setItem('txQueue', q)
// }

// export async function syncPendingTransactions() {
//   const queue = await getQueuedTransactions()
//   if (!queue.length) return

//   const db = await getDB()
//   for (const tx of queue) {
//     const { error: txErr } = await supabase
//       .from('transactions')
//       .insert([{ ...tx, status: 'complete' }])
//     if (txErr) {
//       console.error('sync tx failed', txErr)
//       continue
//     }

//     // bump balances, write to IDB, remove from queue...
//     const card = await db.get('cards', tx.card_id)
//     if (card) {
//       card.balance = parseFloat(card.balance) + tx.amount
//       await db.put('cards', card)
//       await supabase
//         .from('cards')
//         .update({ balance: card.balance })
//         .eq('id', card.id)
//     }

//     await db.put('transactions', { ...tx, status: 'complete' })
//     await removeQueuedTransaction(tx.id)
//   }
// }

// // ─── “master” sync that runs both queues ───────────────────────

// export async function syncAllOfflineActions() {
//   await syncPendingTransactions()
//   await syncPendingProfileUpdates()
// }

// // ─── IndexedDB “cache” for cards & txs ─────────────────────────

// export async function getAllCards() {
//   const db = await getDB()
//   return db.getAll('cards')
// }
// export async function saveCards(cards) {
//   const db = await getDB()
//   const tx = db.transaction('cards', 'readwrite')
//   cards.forEach(c => tx.store.put(c))
//   await tx.done
// }

// export async function getAllTransactions() {
//   const db = await getDB()
//   return db.getAll('transactions')
// }
// export async function saveTransactions(txs) {
//   const db = await getDB()
//   const tx = db.transaction('transactions', 'readwrite')
//   txs.forEach(t => tx.store.put(t))
//   await tx.done
// }

// export async function addTransaction(txObj) {
//   const db = await getDB()
//   await db.put('transactions', txObj)
// }

//offlineDB.js
import { openDB } from 'idb'
import localforage from 'localforage'
import { supabase } from './supabaseClient'

// one IndexedDB database with three object stores
const DB_NAME = 'banking'
const DB_VERSION = 2

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('cards'))
        db.createObjectStore('cards', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('transactions'))
        db.createObjectStore('transactions', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('profile'))
        db.createObjectStore('profile', { keyPath: 'id' })
    },
  })
}

// ─── CARDS ─────────────────────────────────────────────────────
export async function getAllCards() {
  const db = await getDB()
  return (await db.getAll('cards')) || []
}
export async function saveCards(cards) {
  const db = await getDB()
  const tx = db.transaction('cards', 'readwrite')
  cards.forEach(c => tx.store.put(c))
  await tx.done
}

// ─── TRANSACTIONS ──────────────────────────────────────────────
const TX_QUEUE_KEY = 'txQueue'

export async function getQueuedTransactions() {
  return (await localforage.getItem(TX_QUEUE_KEY)) || []
}
export async function queueTransaction(tx) {
  const q = await getQueuedTransactions()
  await localforage.setItem(TX_QUEUE_KEY, [...q, tx])
}
export async function removeQueuedTransaction(localId) {
  const q = (await getQueuedTransactions()).filter(t => t.id !== localId)
  await localforage.setItem(TX_QUEUE_KEY, q)
}

export async function getAllTransactions() {
  const db = await getDB()
  return (await db.getAll('transactions')) || []
}
export async function saveTransactions(txs) {
  const db = await getDB()
  const tx = db.transaction('transactions', 'readwrite')
  txs.forEach(t => tx.store.put(t))
  await tx.done
}
export async function addTransaction(txObj) {
  const db = await getDB()
  await db.put('transactions', txObj)
}

export async function syncPendingTransactions() {
  const queue = await getQueuedTransactions()
  if (!queue.length) return

  for (const tx of queue) {
    const { error: txErr } = await supabase
      .from('transactions')
      .insert([{ ...tx, status: 'complete' }])
    if (txErr) {
      console.error('sync tx failed', txErr)
      continue
    }
    // update card balance locally & remotely
    const db = await getDB()
    const card = await db.get('cards', tx.card_id)
    if (card) {
      card.balance = parseFloat(card.balance) + tx.amount
      await db.put('cards', card)
      const { error: cardErr } = await supabase
        .from('cards')
        .update({ balance: card.balance })
        .eq('id', card.id)
      if (cardErr) console.error('Failed to sync card balance', cardErr)
    }
    // write the completed tx locally
    await db.put('transactions', { ...tx, status: 'complete' })
    // remove from the queue
    await removeQueuedTransaction(tx.id)
  }
}

// ─── PROFILE ────────────────────────────────────────────────────
const PROFILE_QUEUE = 'profileQueue'

export async function getProfile() {
  const db = await getDB()
  return db.get('profile', 'me')
}

export async function updateLocalProfile(profile) {
  const db = await getDB()
  await db.put('profile', { id: 'me', ...profile })
}

export async function getQueuedProfileUpdates() {
  return (await localforage.getItem(PROFILE_QUEUE)) || []
}
export async function queueProfileUpdate(profile) {
  const q = await getQueuedProfileUpdates()
  await localforage.setItem(PROFILE_QUEUE, [...q, profile])
}
export async function removeQueuedProfileUpdate(id) {
  const q = (await getQueuedProfileUpdates()).filter(p => p.id !== id)
  await localforage.setItem(PROFILE_QUEUE, q)
}
export async function clearProfileQueue() {
  await localforage.removeItem(PROFILE_QUEUE)
}

export async function syncPendingProfileUpdates(userId) {
  const queue = await getQueuedProfileUpdates()
  if (!queue.length) return

  for (const p of queue) {
    // upsert into your "profiles" table
    const { error: upErr } = await supabase
      .from('profiles')
      .upsert({ id: userId, name: p.name })
    if (upErr) {
      console.error('Failed profile upsert', upErr)
      continue
    }
    // update Auth email/password
    const { error: authErr } = await supabase.auth.updateUser({
      email:    p.email,
      password: p.password || undefined,
    })
    if (authErr) {
      console.error('Failed auth update', authErr)
      continue
    }
    // remove this item from the queue
    await removeQueuedProfileUpdate(p.id)
  }
}

// ─── SYNC ALL ───────────────────────────────────────────────────
export async function syncAllOfflineActions(userId) {
  // run both in parallel
  await Promise.all([
    syncPendingTransactions(),
    syncPendingProfileUpdates(userId),
  ])
}
