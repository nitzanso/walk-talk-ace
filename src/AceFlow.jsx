import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from './db.js';
import { useI18n } from './i18n.jsx';
import { AceCard, Sun } from './Blob.jsx';
import { Icon } from './ui.jsx';
import { useSetting } from './db.js';
import { micPermission, startDictation, dictationSupported } from './speech.js';

export default function AceFlow({ first, onClose, onTalk }) {
  const { t, C } = useI18n();
  const { ACE_EXAMPLES, SMALL_ACE_EXAMPLES } = C;
  const [kind, setKind] = useState('big');
  const [sel, setSel] = useState(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(null);
  const ex = kind === 'big' ? ACE_EXAMPLES : SMALL_ACE_EXAMPLES;
  const can = !!sel || !!text.trim();
  const [lang] = useSetting('lang', 'he-IL');
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState('');
  const dict = React.useRef(null);
  const base = React.useRef('');
  const toggleMic = async () => {
    if (listening) { dict.current && dict.current.stop(); setListening(false); return; }
    setErr('');
    if (!dictationSupported()) { setErr(t('Speaking is not available in this browser. Typing works.')); return; }
    const p = await micPermission();
    if (!p.ok) { setErr(t(p.message)); return; }
    base.current = text ? text.trim() + ' ' : '';
    dict.current = startDictation({ lang, onText: (t) => setText(base.current + t), onError: (e) => { setErr(t(e.message)); if (e.fatal) setListening(false); } });
    setListening(true);
  };
  React.useEffect(() => () => { try { dict.current && dict.current.stop(); } catch {} }, []);

  const save = async () => {
    try { dict.current && dict.current.stop(); } catch {}
    const t = text.trim() || sel;
    await db.aces.add({ created: Date.now(), kind, category: sel, text: t });
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    setSaved(t);
  };

  if (saved) {
    return (
      <div className="screen" style={{ alignItems: 'center' }}>
        <div className="grow" />
        <div className="flipwrap">
          <motion.div className="flipinner" initial={{ rotateY: 180, y: 30, scale: 0.9 }} animate={{ rotateY: 0, y: 0, scale: 1 }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}>
            <div className="flipface"><AceCard text={saved} small={kind === 'small'} size="lg" /></div>
            <div className="flipface b"><AceCard back /></div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="center" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2>{first ? t("That's your first ace.") : t('Added to your aces.')}</h2>
          <p style={{ color: 'var(--muted)' }}>{first ? t("You've done hard things before.") : t('Proof, in your own words.')}</p>
        </motion.div>
        <div className="grow" />
        <button className="btn" onClick={onClose}>{t('Continue')}</button>
      </div>
    );
  }

  return (
    <div className="screen">
      {!first && (
        <div className="top"><span className="eyebrow">{t('Add an ace')}</span><button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button></div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity }}><Sun size={text || sel ? 64 : 110} face /></motion.div>
      </div>
      {first || kind === 'big' ? (
        <div className="center" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="eyebrow">{first ? t('Your first ace') : t('A big ace')}</span>
          <h1 style={{ fontSize: 24 }}>{t('Tell me about a time in your life when you got through something difficult.')}</h1>
          <p style={{ color: 'var(--muted)' }}>{t("Briefly is fine. Say it out loud or type it. It can also be something else you're proud of. You don't have to pick anything.")}</p>
        </div>
      ) : (
        <div className="center" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="eyebrow">{t('A small ace')}</span>
          <h1 style={{ fontSize: 25 }}>{t('What did you do that counts?')}</h1>
          <p style={{ color: 'var(--muted)' }}>{t('Small things count. Say it, type it, or tap an idea.')}</p>
        </div>
      )}
      {!first && (
        <div className="pills" role="group" aria-label={t('Kind of ace')}>
          <button className={'pill' + (kind === 'big' ? ' on' : '')} onClick={() => { setKind('big'); setSel(null); }}>{t('Big ace')}</button>
          <button className={'pill' + (kind === 'small' ? ' on' : '')} onClick={() => { setKind('small'); setSel(null); }}>{t('Small ace')}</button>
        </div>
      )}
      <button className={'btn' + (listening ? '' : ' soft')} onClick={toggleMic} aria-pressed={listening}><Icon n="mic" size={22} color={listening ? '#fff' : '#25264A'} />{listening ? t('Listening… tap to stop') : t('Say it out loud')}</button>
      {err && <div className="card" style={{ background: '#FFF3CF' }} role="alert"><p>{err}</p></div>}
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Or type it here. A sentence is enough.')} aria-label={t('Your ace in your own words')} dir="auto" style={{ minHeight: 120 }} />
      <p className="small">{t('Need ideas? Tap one and then change it.')}</p>
      <div className="wrapchips">
        {ex.map((x) => <button key={x} className={'tag' + (sel === x ? ' sel' : '')} onClick={() => { setSel(sel === x ? null : x); if (!text) setText(sel === x ? '' : x); }} aria-pressed={sel === x}>{x}</button>)}
      </div>
      <div className="grow" />
      <div className="sticky">
      <button className="btn" onClick={save} disabled={!can}>{can ? t('Save my ace') : t('Say it or type it first')}</button>
      {first ? <button className="link" onClick={onClose}>{t('Skip for now')}</button> : null}
      </div>
    </div>
  );
}
