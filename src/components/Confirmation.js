// src/components/Confirmation.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const nav = useNavigate();
  return (
    <div style={{
      background:'#0E0B1D', color:'#FFF',
      height:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center'
    }}>
      <div style={{
        width:100, height:100, borderRadius:50,
        background:'#004EFF', display:'flex',
        alignItems:'center', justifyContent:'center',
      }}>
        <span style={{fontSize:48, color:'#FFF'}}>✓</span>
      </div>
      <h2>Money was sent successfully!</h2>
      <button
        onClick={()=>nav('/home')}
        style={{
          marginTop:20,
          background:'#004EFF',color:'#FFF',
          padding:'10px 20px',border:'none',
          borderRadius:24,
        }}
      >Back to Home</button>
    </div>
  );
}
