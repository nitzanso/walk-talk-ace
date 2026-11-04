import React from 'react';
import { motion } from 'motion/react';

const FILL = { good: '#F4D58D', soso: '#BBD3EE', hard: '#CFC3EC', calm: '#CFE3D6' };
const MOUTH = {
  good: 'M46 74Q60 90 74 74',
  soso: 'M46 78H74',
  hard: 'M46 84Q60 70 74 84',
  calm: 'M48 76Q60 84 72 76',
};

export default function Blob({ mood = 'calm', size = 64, float = false }) {
  const svg = (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <path d="M60 8C88 4 112 26 112 56C112 90 88 112 58 112C26 112 6 88 8 56C10 28 32 12 60 8Z" fill={FILL[mood]} />
      <g className="eyes">
        <circle cx="44" cy="54" r="5" fill="#25264A" />
        <circle cx="76" cy="54" r="5" fill="#25264A" />
      </g>
      <path d={MOUTH[mood]} fill="none" stroke="#25264A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="30" cy="68" r="6" fill="#F1B6B0" opacity="0.7" />
      <circle cx="90" cy="68" r="6" fill="#F1B6B0" opacity="0.7" />
    </svg>
  );
  if (!float) return svg;
  return (
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
      {svg}
    </motion.div>
  );
}

export function Sun({ size = 26, color = '#25264A', face = false }) {
  if (face) {
    return (
      <svg width={size} height={size} viewBox="0 0 140 140" aria-hidden="true">
        <g stroke="#F2B24A" strokeWidth="6" strokeLinecap="round">
          <path d="M70 6v14M70 120v14M6 70h14M120 70h14M25 25l10 10M105 105l10 10M25 115l10-10M105 35l10-10" />
        </g>
        <circle cx="70" cy="70" r="38" fill="#F4D58D" />
        <circle cx="57" cy="66" r="4.5" fill="#25264A" />
        <circle cx="83" cy="66" r="4.5" fill="#25264A" />
        <path d="M58 82Q70 94 82 82" fill="none" stroke="#25264A" strokeWidth="4" strokeLinecap="round" />
        <circle cx="47" cy="78" r="5" fill="#F1B6B0" opacity="0.7" />
        <circle cx="93" cy="78" r="5" fill="#F1B6B0" opacity="0.7" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="13" cy="13" r="5" fill={color} />
      <path d="M13 2v3M13 21v3M2 13h3M21 13h3M5.2 5.2l2.1 2.1M18.7 18.7l2.1 2.1M5.2 20.8l2.1-2.1M18.7 7.3l2.1-2.1" />
    </svg>
  );
}

const SKY = { calm: '#F9D9CE', good: '#FBE3A8', soso: '#CFE0F2', hard: '#D9D0F0' };

export function Landscape({ mood = 'calm' }) {
  return (
    <svg viewBox="0 0 390 190" width="100%" style={{ display: 'block', borderRadius: 26 }} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="390" height="190" fill={SKY[mood]} />
      <motion.circle cx="305" cy="62" r="28" fill="#F2B24A" animate={{ scale: [1, 1.06, 1] }} style={{ transformOrigin: '305px 62px' }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
      <circle cx="305" cy="62" r="40" fill="#F2B24A" opacity="0.18" />
      <motion.g animate={{ x: [0, 14, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="90" cy="48" rx="34" ry="10" fill="#fff" opacity="0.7" />
        <ellipse cx="116" cy="40" rx="22" ry="9" fill="#fff" opacity="0.7" />
      </motion.g>
      <path d="M0 120C60 80 120 96 180 112C240 128 300 90 390 104V190H0Z" fill="#CFC3EC" />
      <path d="M0 140C80 110 150 132 220 138C290 144 340 120 390 128V190H0Z" fill="#BFDDC9" />
      <path d="M0 166C70 150 140 160 210 168C280 176 340 160 390 166V190H0Z" fill="#A9D0B8" />
      <path d="M120 190C150 168 190 164 220 152C250 140 280 140 330 134" fill="none" stroke="#FFF6EC" strokeWidth="14" strokeLinecap="round" />
      <motion.g animate={{ x: [0, 90, 0], y: [0, -26, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
        <g transform="translate(150 140) scale(0.2)">
          <path d="M60 8C88 4 112 26 112 56C112 90 88 112 58 112C26 112 6 88 8 56C10 28 32 12 60 8Z" fill="#F4D58D" />
          <circle cx="44" cy="54" r="6" fill="#25264A" /><circle cx="76" cy="54" r="6" fill="#25264A" />
          <path d="M46 74Q60 90 74 74" fill="none" stroke="#25264A" strokeWidth="6" strokeLinecap="round" />
        </g>
      </motion.g>
      <g fill="#8FBFA0"><path d="M34 150l8-22 8 22z" /><path d="M52 154l7-18 7 18z" /><path d="M340 160l8-20 8 20z" /></g>
    </svg>
  );
}

export function AceCard({ text, small, back, size = 'sm' }) {
  const big = size === 'lg';
  const a = big ? 34 : 22;
  const sun = big ? 20 : 14;
  if (back) {
    return (
      <div className="acecard back" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice">
          <defs><pattern id="bk" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3.5" fill="#F4D58D" /><path d="M10 2v3M10 15v3M2 10h3M15 10h3" stroke="#F2B24A" strokeWidth="1.2" strokeLinecap="round" /></pattern></defs>
          <rect x="6" y="6" width="88" height="128" rx="8" fill="url(#bk)" stroke="#25264A" strokeWidth="1.2" />
        </svg>
      </div>
    );
  }
  return (
    <div className="acecard" style={{ '--t': big ? '16px' : '12.5px' }}>
      <div className="corner tl"><span style={{ fontSize: a }}>A</span><Sun size={sun} /></div>
      <div className="corner br"><span style={{ fontSize: a }}>A</span><Sun size={sun} /></div>
      <div className="mid">
        <Sun size={big ? 96 : 60} face />
        {text ? <p dir="auto">{text}</p> : null}
        {small ? <span className="small" style={{ fontSize: 11 }}>small ace</span> : null}
      </div>
    </div>
  );
}
