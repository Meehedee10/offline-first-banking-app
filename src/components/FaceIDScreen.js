// src/components/FaceIDScreen.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FaceIDScreen() {
  const nav = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => nav('/home'), 2000);
    return () => clearTimeout(id);
  }, [nav]);

  return (
    <div style={{
      background: '#0E0B1D',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <div />  
      <img src="/face-id.png" alt="Face-ID" style={{ width: '80%' }} />
      <div style={{ textAlign: 'center', color: '#FFF' }}>
        <h2>Enabling Face-ID</h2>
        <p style={{ opacity: 0.6 }}>please wait…</p>
      </div>
      <button style={{
        background: '#004EFF',
        color: '#FFF',
        padding: '12px 24px',
        border: 'none',
        borderRadius: 24,
        fontSize: 16,
        width: '100%'
      }}>
        Loading…
      </button>
    </div>
  );
}
