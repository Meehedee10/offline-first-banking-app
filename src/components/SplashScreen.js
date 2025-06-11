import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const nav = useNavigate();
  useEffect(() => {
    setTimeout(() => nav('/faceid'), 1500);
  }, [nav]);

  return (
    <div style={{
      background: '#0E0B1D',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <img src="/logo192.png" alt="NetBank" style={{ width: 100, marginBottom: 20 }} />
      <button
        style={{
          background: '#004EFF',
          color: '#FFF',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 24,
          fontSize: 18
        }}
        onClick={() => nav('/faceid')}
      >
        Tap
      </button>
    </div>
  );
}
