import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { db } from './db.js';
import { Icon } from './ui.jsx';

// Patterns in seconds: [in, hold, out, hold]. Not a medical claim: slow breathing with a longer out-breath helps many people feel calmer.
const PATTERNS = {
  steady: { label: 'Steady 4-2-6-2', p: [4, 2, 6, 2] },
  long: { label: 'Longer out-breath 4-3-8-3', p: [4, 3, 8, 3] },
};
const NAMES = ['Breathe in, into your belly', 'Hold gently', 'Out slowly, through your mouth', 'Rest'];
const TOTAL = 90;

export default function Breathe({ onClose }) {
  const [pat, setPat] = useState('steady');
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const t = useRef({});

  useEffect(() => () => clearInterval(t.current.iv), []);

  const start = () => {
    const p = PATTERNS[pat].p;
    let ph = 0; let left = p[0]; let el = 0;
    setPhase(0); setCount(left); setElapsed(0); setDone(false); setRunning(true);
    if (navigator.vibrate) navigator.vibrate(10);
    t.current.iv = setInterval(() => {
      el += 1; left -= 1; setElapsed(el);
      if (el >= TOTAL) { clearInterval(t.current.iv); setRunning(false); setDone(true); db.entries.add({ created: Date.now(), kind: 'breathe' }).catch(() => {}); return; }
      if (left <= 0) { ph = (ph + 1) % 4; left = p[ph]; setPhase(ph); if (navigator.vibrate && (ph === 0 || ph === 2)) navigator.vibrate(8); }
      setCount(left);
    }, 1000);
  };
  const stop = () => { clearInterval(t.current.iv); setRunning(false); setDone(false); setElapsed(0); setPhase(0); };

  // size by phase: expand during in, stay large during hold, shrink during out, stay small during rest
  const p = PATTERNS[pat].p;
  const target = !running ? 1 : phase === 0 ? 1.55 : phase === 1 ? 1.55 : phase === 2 ? 1 : 1;
  const dur = !running ? 0.6 : phase === 0 ? p[0] : phase === 2 ? p[2] : 0.2;

  return (
    <div className="screen">
      <div className="top">
        <h1>Breathe</h1>
        <button className="iconbtn" onClick={() => { stop(); onClose(); }} aria-label="Close"><Icon n="close" size={20} /></button>
      </div>
      <p className="small">One and a half minutes. Put a hand on your belly and let it rise on the way in.</p>
      <div className="grow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, position: 'relative' }}>
        <motion.div style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', background: '#CFE3D6', opacity: 0.5 }} animate={{ scale: target * 1.18 }} transition={{ duration: dur, ease: 'easeInOut' }} />
        <motion.div style={{ width: 170, height: 170, borderRadius: '50%', background: 'var(--lav)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 44 }} animate={{ scale: target }} transition={{ duration: dur, ease: 'easeInOut' }}>
          {running ? count : done ? '✓' : ''}
        </motion.div>
      </div>
      <h2 className="center" aria-live="polite" style={{ minHeight: 30 }}>{running ? NAMES[phase] : done ? 'Well done. That counts.' : 'Ready when you are'}</h2>
      {!running && (
        <div className="pills" role="group" aria-label="Pattern">
          {Object.entries(PATTERNS).map(([k, v]) => <button key={k} className={'pill' + (pat === k ? ' on' : '')} onClick={() => setPat(k)} style={{ fontSize: 13 }}>{v.label}</button>)}
        </div>
      )}
      {running ? <button className="btn alt" onClick={stop}>Stop</button> : <button className="btn" onClick={start}>{done ? 'Again' : 'Start'}</button>}
      <p className="small center">If you feel dizzy, breathe normally. This is not medical advice.</p>
    </div>
  );
}
