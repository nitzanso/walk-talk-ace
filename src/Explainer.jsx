import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { db } from './db.js';
import { Icon } from './ui.jsx';
import { useI18n } from './i18n.jsx';
import { EXPLAINERS } from './explainers.js';

const INK = '#25264A', SKIN = '#F2C9A5', BLUE = '#7FA6D6', RED = '#E58C7B', YEL = '#F2B24A', GRN = '#8CC7A1';

function Person({ x = 150, y = 120, s = 1, bob = true, children }) {
  return (
    <motion.g transform={`translate(${x} ${y}) scale(${s})`} animate={bob ? { y: [0, -4, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity }}>
      <rect x="-16" y="14" width="32" height="44" rx="14" fill={BLUE} />
      <circle cx="0" cy="0" r="20" fill={SKIN} />
      <circle cx="-7" cy="-2" r="2" fill={INK} /><circle cx="7" cy="-2" r="2" fill={INK} />
      <path d="M-6 8q6 5 12 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      {children}
    </motion.g>
  );
}

function Art({ name, t }) {
  const box = { width: '100%', maxHeight: 300 };
  if (name === 'walk') return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><path d="M10 190h280" stroke={INK} strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
      <Person x={150} y={110} />
      <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}><circle cx="200" cy="50" r="14" fill="#DDD7F3" stroke={INK} strokeOpacity=".35" strokeWidth="1.5" /><text x="200" y="55" fontSize="14" textAnchor="middle" fill={INK}>?</text></motion.g></svg>
  );
  if (name === 'spin') return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><Person x={150} y={120} bob={false} />
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '150px 110px' }}>
        {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; return <g key={i}><circle cx={150 + Math.cos(a) * 85} cy={110 + Math.sin(a) * 70} r={13 + (i % 3) * 3} fill="#DDD7F3" stroke={INK} strokeOpacity=".35" strokeWidth="1.5" /></g>; })}
      </motion.g></svg>
  );
  if (name === 'alarm') return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><ellipse cx="150" cy="105" rx="105" ry="75" fill="#F6D9D2" stroke={INK} strokeWidth="3" />
      <motion.circle cx="115" cy="120" r="22" fill={RED} animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ transformOrigin: '115px 120px' }} />
      <circle cx="195" cy="80" r="16" fill={BLUE} opacity=".55" />
      <text x="115" y="165" fontSize="13" textAnchor="middle" fill={INK}>{t('alarm')}</text><text x="195" y="115" fontSize="13" textAnchor="middle" fill={INK}>{t('thinking')}</text></svg>
  );
  if (name === 'zoom') return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><rect x="10" y="10" width="280" height="200" rx="18" fill="none" stroke={INK} strokeOpacity=".2" strokeWidth="3" strokeDasharray="6 8" />
      <motion.g initial={{ scale: 1.7 }} animate={{ scale: 0.8 }} transition={{ duration: 3, ease: 'easeInOut' }} style={{ transformOrigin: '150px 110px' }}>
        <Person x={150} y={105} bob={false} />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '150px 100px' }}>
          {[0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2; return <circle key={i} cx={150 + Math.cos(a) * 62} cy={100 + Math.sin(a) * 50} r="10" fill="#DDD7F3" stroke={INK} strokeOpacity=".35" strokeWidth="1.5" />; })}
        </motion.g></motion.g>
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}><path d="M255 30c-14-12-28-12-42 0 14 12 28 12 42 0z" fill="#DDD7F3" stroke={INK} strokeOpacity=".35" strokeWidth="1.5" stroke={INK} strokeWidth="2" /><circle cx="234" cy="30" r="5" fill={INK} /></motion.g></svg>
  );
  if (name === 'label') return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><Person x={95} y={125} bob={false} />
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} style={{ transformOrigin: '190px 70px' }}><rect x="140" y="40" width="130" height="46" rx="23" fill="#DDD7F3" stroke={INK} strokeOpacity=".35" strokeWidth="1.5" /><text x="205" y="69" fontSize="16" textAnchor="middle" fill={INK}>{t('anxious')}</text></motion.g>
      <motion.circle cx="230" cy="160" r="22" fill={RED} initial={{ opacity: 1 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.5, duration: 3 }} /><text x="230" y="199" fontSize="12" textAnchor="middle" fill={INK}>{t('alarm')}</text></svg>
  );
  if (name === 'breath') return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><motion.circle cx="150" cy="110" fill={GRN} animate={{ r: [40, 78, 40] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 1] }} />
      <text x="150" y="116" fontSize="16" textAnchor="middle" fill={INK}>{t('out slowly')}</text></svg>
  );
  if (name === 'wave') return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><path d="M20 180H280" stroke={INK} strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
      <motion.path d="M20 180C70 170 95 30 150 30S230 170 280 180" fill="none" stroke={YEL} strokeWidth="6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 6, ease: 'easeInOut' }} />
      <text x="150" y="20" fontSize="13" textAnchor="middle" fill={INK}>{t('the urge')}</text></svg>
  );
  return (
    <svg viewBox="0 0 300 220" style={box} role="img" aria-label=""><motion.circle cx="150" cy="105" r="42" fill={YEL} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: '150px 105px' }} /></svg>
  );
}

// A short explainer. It can be skipped at any time. Voice uses the phone's own voice, so it works offline and costs nothing.
export default function Explainer({ id, onClose, open }) {
  const { t, he, lang } = useI18n();
  const ex = EXPLAINERS.find((x) => x.id === id) || EXPLAINERS[0];
  const L = he ? 'he' : 'en';
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState(true);
  const timer = useRef(null);
  const sc = ex.scenes[i];
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const last = i >= ex.scenes.length - 1;

  const stopAll = () => { clearTimeout(timer.current); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {} };
  useEffect(() => () => stopAll(), []);
  useEffect(() => {
    if (!playing) return undefined;
    const text = sc[L]; let done = false;
    const next = () => { if (done) return; done = true; if (last) { setPlaying(false); db.settings.put({ key: 'seen:explainer:' + ex.id, value: Date.now() }); } else setI((n) => n + 1); };
    const wait = Math.max(5000, text.length * 75);
    if (voice && hasTTS) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.lang = he ? 'he-IL' : 'en-US'; u.rate = 0.92;
        u.onend = () => { timer.current = setTimeout(next, 900); };
        u.onerror = () => { timer.current = setTimeout(next, wait); };
        window.speechSynthesis.speak(u);
        timer.current = setTimeout(next, wait + 6000); // safety if the voice never ends
      } catch { timer.current = setTimeout(next, wait); }
    } else timer.current = setTimeout(next, wait);
    return () => { done = true; stopAll(); };
  }, [playing, i, voice]);

  const go = (n) => { stopAll(); setI(Math.max(0, Math.min(ex.scenes.length - 1, n))); };
  return (
    <div className="screen">
      <div className="top"><div><span className="eyebrow">{t('A short explanation')}</span><h1>{ex[L].title}</h1></div><button className="iconbtn" onClick={() => { stopAll(); onClose(); }} aria-label={t('Close')}><Icon n="close" size={20} /></button></div>
      <div className="card" style={{ padding: 8 }}><motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Art name={sc.art} t={t} /></motion.div></div>
      <p className="lead" dir="auto" style={{ minHeight: 120 }}>{sc[L]}</p>
      <div className="small center">{i + 1} / {ex.scenes.length}</div>
      <div className="pills">
        <button className="pill" onClick={() => go(i - 1)} disabled={i === 0} aria-label={t('Back')}>←</button>
        <button className="pill on" onClick={() => { if (playing) { stopAll(); setPlaying(false); } else setPlaying(true); }}>{playing ? t('Pause') : t('Play')}</button>
        <button className="pill" onClick={() => go(i + 1)} disabled={last} aria-label={t('Next')}>→</button>
      </div>
      {hasTTS && <button className="link center small" onClick={() => { stopAll(); setVoice(!voice); }}>{voice ? t('Turn the voice off') : t('Turn the voice on')}</button>}
      {last && <p className="small" dir="auto">{ex[L].source}</p>}
      {last && open && <button className="btn" onClick={() => open('notice')}>{t('Try it now: notice it')}</button>}
      <button className="link center" onClick={() => { stopAll(); onClose(); }}>{last ? t('Done') : t('Skip this')}</button>
    </div>
  );
}
