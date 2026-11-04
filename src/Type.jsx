import React, { useState } from 'react';
import { db } from './db.js';
import { Icon } from './ui.jsx';
import { useI18n } from './i18n.jsx';

export default function Type({ onDone, onReflect, onCrisis }) {
  const { t, C } = useI18n();
  const [txt, setTxt] = useState('');
  const go = async () => {
    await db.entries.add({ created: Date.now(), kind: 'type', text: txt.trim() });
    if (C.CRISIS_RE.test(txt)) onCrisis(); else onReflect(txt.trim());
  };
  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">{t('Write it')}</span><h1>{t("What's on your mind?")}</h1></div>
        <button className="iconbtn" onClick={onDone} aria-label={t('Close')}><Icon n="close" size={20} /></button>
      </div>
      <p className="small">{t('Messy is fine. Nobody grades this.')}</p>
      <textarea value={txt} onChange={(e) => setTxt(e.target.value)} dir="auto" aria-label={t('Your words')} placeholder={t('Start anywhere…')} style={{ minHeight: 220, flex: 1 }} />
      <button className="btn" disabled={!txt.trim()} onClick={go}>{t('Get my reflection')}</button>
    </div>
  );
}
