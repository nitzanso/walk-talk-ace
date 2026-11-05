import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, getSetting } from './db.js';
import { Icon } from './ui.jsx';
import { buildMemory } from './memory.js';
import ReflectionView from './ReflectionView.jsx';
import { useI18n } from './i18n.jsx';

export default function Reflection({ text, onClose }) {
  const { t, C, lang } = useI18n();
  const [state, setState] = useState('loading'); // loading | sample | real | error
  const [r, setR] = useState(null);
  const [fb, setFb] = useState(null);
  const [rid, setRid] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const url = (await getSetting('reflectUrl', '')) || '/api/reflect';
      const tone = await getSetting('tone', 'direct');
      const memory = await buildMemory();
      let result = null; let kind = 'sample';
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, tone, lang, memory }) });
        if (!res.ok) throw new Error('bad response');
        const j = await res.json();
        if (j.crisis) { onClose(); window.dispatchEvent(new Event('crisis')); return; }
        result = j.reflection; kind = 'real';
      } catch { kind = 'error'; }
      if (!alive) return;
      const show = result || C.SAMPLE_REFLECTION;
      setR(show); setState(kind);
      const id = await db.reflections.add({ created: Date.now(), text, reflection: show, sample: kind !== 'real' });
      setRid(id);
    })();
    return () => { alive = false; };
  }, [text]);

  const rate = (v) => { setFb(v); if (rid) db.reflections.update(rid, { feedback: v }); };

  if (state === 'loading') {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <motion.div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--lav)' }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.4, repeat: Infinity }} />
        <p className="small">{t('Listening to what you said…')}</p>
      </div>
    );
  }
  return (
    <div className="screen plain">
      <div className="top">
        <div><span className="eyebrow">{t('After your walk')}</span><h1>{t('What I heard')}</h1></div>
        <button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button>
      </div>
      {state !== 'real' && <p className="small">{t('This is a sample.')} {state === 'error' ? t("The connection didn't answer, so this shows the shape only.") : ''} {t('It is not about what you said.')}</p>}
      <ReflectionView r={r} allowPocket={state === 'real'} />
      <div className="fld">
        <span className="small">{t('Did this feel true?')}</span>
        <div className="pills">
          {[['true', t('True')], ['notquite', t('Not quite')], ['missed', t('Missed it')]].map(([k, l]) => <button key={k} className={'pill' + (fb === k ? ' on' : '')} onClick={() => rate(k)}>{l}</button>)}
        </div>
      </div>
      <button className="btn" onClick={onClose}>{t('Done')}</button>
    </div>
  );
}
