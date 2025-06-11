
// // src/index.js

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App'                // ← make sure this is **not** commented!
// import { AuthProvider } from './hooks/useAuth'
// import './index.css'

// const root = ReactDOM.createRoot(document.getElementById('root'))
// root.render(
//   <BrowserRouter>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </BrowserRouter>
// )

// // Register your service worker for background‐sync & offline caching
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then(reg => {
//         console.log('Service worker registered:', reg)
//       })
//       .catch(err => {
//         console.error('Service worker registration failed:', err)
//       })
//   })
// }



// src/index.js

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'                // ← make sure this is **not** commented!
import { AuthProvider } from './hooks/useAuth'
import './index.css'

// Import your CRA‐style registration helper
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)

// Delegate service worker registration to your helper
serviceWorkerRegistration.register()
