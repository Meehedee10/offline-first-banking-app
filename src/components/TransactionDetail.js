// src/components/TransactionDetail.js
import React, { useEffect, useState } from 'react';
import { getAllTransactions } from '../utils/offlineDB';
import { useParams, useNavigate } from 'react-router-dom';

export default function TransactionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [tx, setTx] = useState(null);

  useEffect(() => {
    async function load() {
      const all = await getAllTransactions();
      const found = all.find(t=>String(t.id)===id);
      setTx(found);
    }
    load();
  }, [id]);

  if (!tx) return null;
  return (
    <div style={{ padding:20, background:'#0E0B1D', color:'#FFF', minHeight:'100vh' }}>
      <button onClick={()=>nav(-1)} style={{ background:'none', border:'none', color:'#FFF', fontSize:20 }}>←</button>
      <h3>{tx.merchant||'Transfer'}</h3>
      <p>Amount: <strong style={{ color:tx.amount>0?'#0F0':'#F55' }}>
          {tx.amount>0?'+':'-'}${Math.abs(tx.amount).toFixed(2)}
        </strong>
      </p>
      <p>Date: {new Date(tx.date).toLocaleString()}</p>
      {tx.status==='pending' && <p style={{ color:'#F55' }}>This transaction is still pending.</p>}
    </div>
  );
}
