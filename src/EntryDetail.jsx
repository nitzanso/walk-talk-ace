import React, { useState } from 'react';
import { db, useQuery } from './db.js';
import { Icon, Seg, Helpful } from './ui.jsx';
import { useI18n } from './i18n.jsx';
import ReflectionView from './ReflectionView.jsx';

export default function EntryDetail({ id, onClose, open }) {
  const { t, he, lang } = useI18n();
  const e = useQuery(() => db.entries.get(id), [id], null);
  const themes = useQuery(() => db.insights.where('kind').equals('theme').toArray(), [], []);
  const [tab, setTab] = useState('words');
  const [sure, setSure] = useState(false);
  const erase = async () => { const txt = (await db.entries.get(id) || {}).text; await db.entries.delete(id); if (txt) { const rs = await db.reflections.toArray(); await Promise.all(rs.filter((x) => x.text === txt).map((x) => db.reflections.delete(x.id))); } onClose(); };
  if (!e) return <div className="screen" />;
  const r = e.reflection;
  const mine = themes.filter((th) => (e.themes || []).includes(th.slug));
  const date = new Date(e.created).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + new Date(e.created).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">{date}</span><h1 style={{ fontSize: 24 }}>{(he && e.titleHe) || e.title || t('Walk and talk')}</h1></div>
        <button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button>
      </div>
      <Seg value={tab} onChange={setTab} items={[['words', t('What you said')], ['refl', t('Reflection')], ['themes', t('Themes')], ['next', t('Try next')]]} />
      {tab === 'words' && <p dir="auto" style={{ whiteSpace: 'pre-wrap' }}>{e.text || t('No text was saved for this one.')}</p>}
      {tab === 'refl' && (r ? <ReflectionView r={r} /> : <p className="lead">{t('No reflection for this one yet.')}</p>)}
      {tab === 'themes' && (mine.length ? mine.map((th) => (
        <div className="card" key={th.id}>
          <h3>{he && th.he ? th.he : th.en}</h3>
          {e.themeQuotes && e.themeQuotes[th.slug] && <p className="small" dir="auto" style={{ fontStyle: 'italic' }}>“{e.themeQuotes[th.slug]}”</p>}
        </div>
      )) : <div className="card"><p>{t('No themes marked here.')}</p></div>)}
      {tab === 'next' && (e.tryNext ? (
        <div className="card">
          <h3>{e.tryNext.title}</h3>
          <p>{e.tryNext.why}</p>
          <p className="small">{t('For example:')} {e.tryNext.example}</p>
          <Helpful kind="entry" id={String(e.id)} />
        </div>
      ) : <div className="card"><p>{t('Nothing to try for this one. Sometimes saying it is the whole job.')}</p></div>)}
      {!sure ? <button className="link" onClick={() => setSure(true)}>{t('Delete this recording')}</button> : (
        <div className="card"><p>{t('Delete this recording and its reflection? This cannot be undone.')}</p>
          <div className="fb"><button onClick={() => setSure(false)}>{t('Keep it')}</button><button className="on" onClick={erase}>{t('Delete')}</button></div></div>)}
      <div style={{ height: 8 }} />
    </div>
  );
}
