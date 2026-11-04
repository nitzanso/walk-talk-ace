import React from 'react';
import { motion } from 'motion/react';
import { useSetting } from './db.js';
import { useI18n } from './i18n.jsx';

export function Overlay({ children }) {
  return (
    <motion.div className="overlay" initial={{ y: '8%', opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }} exit={{ y: '6%', opacity: 0, transition: { duration: 0.18 } }}>
      {children}
    </motion.div>
  );
}

export function Seg({ value, onChange, items }) {
  return (
    <div className="seg" role="tablist">
      {items.map(([id, label]) => (
        <button key={id} role="tab" aria-selected={value === id} className={value === id ? 'on' : ''} onClick={() => onChange(id)}>{label}</button>
      ))}
    </div>
  );
}

// "This helped" / "Not for me": both answers are equal, so the app learns what does and doesn't fit.
export function Helpful({ kind, id }) {
  const { t } = useI18n();
  const [v, set] = useSetting(`fb:${kind}:${id}`, null);
  return (
    <div className="fb">
      <button className={v === 'helped' ? 'on' : ''} aria-pressed={v === 'helped'} onClick={() => set(v === 'helped' ? null : 'helped')}>{t('This helped')}</button>
      <button className={v === 'no' ? 'on' : ''} aria-pressed={v === 'no'} onClick={() => set(v === 'no' ? null : 'no')}>{t('Not for me')}</button>
    </div>
  );
}

export function Icon({ n, size = 26, color = '#25264A' }) {
  const p = { width: size, height: size, viewBox: '0 0 28 28', fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  return (
    <svg {...p}>
      {n === 'mic' && <><rect x="10" y="3" width="8" height="14" rx="4" /><path d="M6 13a8 8 0 0 0 16 0M14 21v4" /></>}
      {n === 'sun' && <><circle cx="14" cy="14" r="5" /><path d="M14 3v3M14 22v3M3 14h3M22 14h3M6.2 6.2l2.1 2.1M19.7 19.7l2.1 2.1M6.2 21.8l2.1-2.1M19.7 8.3l2.1-2.1" /></>}
      {n === 'path' && <path d="M4 22c4-2 4-6 8-7s6-5 12-9M4 22h4M22 6h-4" />}
      {n === 'book' && <path d="M4 5h8a3 3 0 0 1 3 3v15a2 2 0 0 0-2-2H4zM24 5h-8a3 3 0 0 0-3 3v15a2 2 0 0 1 2-2h9z" />}
      {n === 'user' && <><circle cx="14" cy="9" r="4.5" /><path d="M5 24c1-5 4-7 9-7s8 2 9 7" /></>}
      {n === 'pen' && <path d="M5 23l1-6L18 5l5 5L11 22l-6 1zM15 8l5 5" />}
      {n === 'wind' && <path d="M3 10h13a3 3 0 1 0-3-3M3 15h18a3 3 0 1 1-3 3M3 20h9" />}
      {n === 'back' && <path d="M17 5l-9 9 9 9" />}
      {n === 'close' && <path d="M6 6l16 16M22 6L6 22" />}
      {n === 'plus' && <path d="M14 5v18M5 14h18" />}
      {n === 'chev' && <path d="M8 11l6 6 6-6" />}
    </svg>
  );
}
