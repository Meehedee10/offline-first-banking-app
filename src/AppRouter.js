// // src/AppRouter.js
// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';

// import SplashScreen   from './components/SplashScreen';
// import FaceIDScreen   from './components/FaceIDScreen';
// import Dashboard      from './components/Dashboard';
// import Cards          from './components/Cards';
// import SendMoney      from './components/SendMoney';
// import Confirmation   from './components/Confirmation';
// import TransactionHistory  from './components/TransactionHistory';
// import TransactionDetail   from './components/TransactionDetail';
// import Statistics     from './components/Statistics';
// import Settings       from './components/Settings';
// import EditProfile    from './components/EditProfile';

// export default function AppRouter() {
//   return (
//     <Routes>
//       <Route path="/"                         element={<SplashScreen />} />
//       <Route path="/faceid"                   element={<FaceIDScreen />} />
//       <Route path="/home"                     element={<Dashboard />} />
//       <Route path="/cards"                    element={<Cards />} />
//       <Route path="/cards/send"               element={<SendMoney />} />
//       <Route path="/cards/send/confirmation"  element={<Confirmation />} />
//       <Route path="/transactions"             element={<TransactionHistory />} />
//       <Route path="/transactions/:id"         element={<TransactionDetail />} />
//       <Route path="/stats"                    element={<Statistics />} />
//       <Route path="/settings"                 element={<Settings />} />
//       <Route path="/settings/edit"            element={<EditProfile />} />
//       <Route path="*"                         element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }
// src/AppRouter.js
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }                from './hooks/useAuth'

import Signup             from './components/Signup'
import Login              from './components/Login'
import FaceIDScreen       from './components/FaceIDScreen'
import Dashboard          from './components/Dashboard'
import Cards              from './components/Cards'
import SendMoney          from './components/SendMoney'
import Confirmation       from './components/Confirmation'
import TransactionHistory from './components/TransactionHistory'
import TransactionDetail  from './components/TransactionDetail'
import Statistics         from './components/Statistics'
import Settings           from './components/Settings'
import EditProfile        from './components/EditProfile'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p style={{ color: '#FFF', padding: 20 }}>Loading…</p>
  return user ? children : <Navigate to="/login" replace />
}

export default function AppRouter({ card, txs }) {
  return (
    <Routes>
      {/* cold start → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* public */}
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/faceid"
        element={
          <RequireAuth>
            <FaceIDScreen />
          </RequireAuth>
        }
      />

      {/* private */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            {/* Dashboard now gets up-to-date card + txs props */}
            <Dashboard card={card} txs={txs} />
          </RequireAuth>
        }
      />
      <Route
        path="/cards"
        element={
          <RequireAuth>
            <Cards />
          </RequireAuth>
        }
      />
      <Route
        path="/cards/send"
        element={
          <RequireAuth>
            <SendMoney />
          </RequireAuth>
        }
      />
      <Route
        path="/cards/send/confirmation"
        element={
          <RequireAuth>
            <Confirmation />
          </RequireAuth>
        }
      />
      <Route
        path="/transactions"
        element={
          <RequireAuth>
            {/* History gets the same txs array */}
            <TransactionHistory txs={txs} />
          </RequireAuth>
        }
      />
      <Route
        path="/transactions/:id"
        element={
          <RequireAuth>
            <TransactionDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/stats"
        element={
          <RequireAuth>
            <Statistics />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />
      <Route
        path="/settings/edit"
        element={
          <RequireAuth>
            <EditProfile />
          </RequireAuth>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
