import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, getSetting } from './db.js';
import { SAMPLE_REFLECTION } from './content.js';
import { Icon } from './ui.jsx';

export default function Reflection({ text, onClose }) {
  const [state, setState] = useState('loading'); // loading | sample | real | error
  const [r, setR] = useState(null);
  const [fb, setFb] = useState(null);
  const [rid, setRid] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const url = (await getSetting('reflectUrl', '')) || '/api/reflect';
      const tone = await getSetting('tone', 'direct');
      let result = null; let kind = 'sample';
      if (url) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, tone }) });
          if (!res.ok) throw new Error('bad response');
          const j = await res.json(); if (j.crisis) { onClose(); window.dispatchEvent(new Event('crisis')); return; } result = j.reflection; kind = 'real';
        } catch { kind = 'error'; }
      }
      if (!alive) return;
      setR(result || SAMPLE_REFLECTION);
      setState(kind);
      const id = await db.reflections.add({ created: Date.now(), text, reflection: result || SAMPLE_REFLECTION, sample: kind !== 'real' });
      setRid(id);
    })();
    return () => { alive = false; };
  }, [text]);

  const rate = (v) => { setFb(v); if (rid) db.reflections.update(rid, { feedback: v }); };

  if (state === 'loading') {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <motion.div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--lav)' }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.4, repeat: Infinity }} />
        <p className="small">Listening to what you said…</p>
      </div>
    );
  }
  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">After your walk</span><h1>What I heard</h1></div>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><Icon n="close" size={20} /></button>
      </div>
      {state !== 'real' && (
        <div className="card" style={{ background: '#FFF3CF' }}>
          <p><b style={{ fontWeight: 500 }}>This is a sample.</b> {state === 'error' ? "The connection didn't answer, so this shows the shape only." : 'Real reflections switch on when the secure connection to Claude is set up (More, then Reflection connection).'} It is not about what you said.</p>
        </div>
      )}
      <div className="card"><h3 style={{ color: '#1F6B67' }}>A read of your process</h3><p>{r.process}</p><p className="small">Tell me if this isn't right.</p></div>
      <div className="card">
        <h3 style={{ color: '#1F6B67' }}>Feelings, in your words</h3>
        <div className="wrapchips">{r.feelings.map((f) => <span key={f.name} className="tag">{f.name}: “{f.quote}”</span>)}</div>
      </div>
      <div className="card"><h3 style={{ color: '#1F6B67' }}>New since last time</h3><p>{r.newThing}</p></div>
      {r.wording && (
        <div className="card" style={{ border: '2px solid var(--sun)' }}>
          <h3 style={{ color: '#1F6B67' }}>Your wording</h3>
          <p className="small">Saying it this way is fine. If you want another way to say it, here is one.</p>
          <p style={{ color: 'var(--muted)', textDecoration: 'line-through' }}>“{r.wording.before}”</p>
          <p style={{ fontWeight: 500 }}>→ “{r.wording.after}”</p>
        </div>
      )}
      <div className="card" style={{ background: '#E3ECEA' }}><h3>If you feel like it</h3><p>{r.invitation}</p></div>
      <div className="card">
        <p className="small">Did this feel true?</p>
        <div className="pills">
          {[['true', 'True'], ['notquite', 'Not quite'], ['missed', 'Missed it']].map(([k, l]) => <button key={k} className={'pill' + (fb === k ? ' on' : '')} onClick={() => rate(k)}>{l}</button>)}
        </div>
      </div>
      <button className="btn" onClick={onClose}>Done</button>
    </div>
  );
}
