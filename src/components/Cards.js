import React, { useState, useEffect } from 'react';
import { supabase }             from '../utils/supabaseClient';
import { useAuth }              from '../hooks/useAuth';
import { useNavigate, Link }    from 'react-router-dom';
import { getAllCards, saveCards } from '../utils/offlineDB';

export default function Cards() {
  const { user }      = useAuth();
  const nav           = useNavigate();
  const [cards, setCards]   = useState([]);
  const [loading, setLoading] = useState(true);
  const offline = !navigator.onLine;

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (offline) {
        // offline: load from local cache
        const local = await getAllCards();
        setCards(local);
        setLoading(false);
      } else {
        // online: fetch remote, then cache
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(error);
          setCards([]);
        } else {
          setCards(data);
          await saveCards(data);       // update local cache
        }
        setLoading(false);
      }
    }

    if (user) load();
  }, [user, offline]);

  if (loading) return <p style={{ padding:20, color:'#FFF' }}>Loading…</p>;

  if (cards.length === 0) {
    return (
      <div style={{ padding:20, color:'#FFF' }}>
        <h2>My Cards</h2>
        <p>No cards yet. You can add one on the{' '}
          <Link to="/settings" style={{ color:'#4EA1FF' }}>Settings</Link> page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding:20, color:'#FFF' }}>
      <h2>My Cards {offline && '(Offline)'}</h2>
      {cards.map(card => (
        <div key={card.id} style={{
          background:'#1A1632', borderRadius:12, padding:20, marginBottom:20
        }}>
          <p style={{ fontSize:18, margin:'0 0 4px' }}>{card.card_number}</p>
          <p style={{ margin:'0 0 4px' }}>
            Expiry: {card.expiry} CVV: {card.cvv}
          </p>
          <p style={{ margin:'0 0 12px' }}>
            Balance: ${parseFloat(card.balance || 0).toFixed(2)}
          </p>
          <button
            onClick={() => nav(`/cards/send?cardId=${card.id}`)}
            style={{
              background:'#004EFF', color:'#FFF', padding:'12px 20px',
              border:'none', borderRadius:24, width:'100%'
            }}
          >
            Send
          </button>
        </div>
      ))}
    </div>
  );
}
