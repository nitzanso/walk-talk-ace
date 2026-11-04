import React, { useState } from 'react';
import { db } from './db.js';
import { CRISIS_RE } from './content.js';
import { Icon } from './ui.jsx';

export default function Type({ onDone, onReflect, onCrisis }) {
  const [t, setT] = useState('');
  const go = async () => {
    await db.entries.add({ created: Date.now(), kind: 'type', text: t.trim() });
    if (CRISIS_RE.test(t)) onCrisis(); else onReflect(t.trim());
  };
  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">Write it</span><h1>What's on your mind?</h1></div>
        <button className="iconbtn" onClick={onDone} aria-label="Close"><Icon n="close" size={20} /></button>
      </div>
      <p className="small">Messy is fine. Nobody grades this.</p>
      <textarea value={t} onChange={(e) => setT(e.target.value)} dir="auto" aria-label="Your words" placeholder="Start anywhere…" style={{ minHeight: 220, flex: 1 }} />
      <button className="btn" disabled={!t.trim()} onClick={go}>Get my reflection</button>
    </div>
  );
}
