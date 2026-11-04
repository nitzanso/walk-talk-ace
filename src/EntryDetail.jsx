import React, { useState } from 'react';
import { db, useQuery } from './db.js';
import { Icon, Seg, Helpful } from './ui.jsx';
import { useI18n } from './i18n.jsx';

export default function EntryDetail({ id, onClose, open }) {
  const { t, he, lang } = useI18n();
  const e = useQuery(() => db.entries.get(id), [id], null);
  const themes = useQuery(() => db.insights.where('kind').equals('theme').toArray(), [], []);
  const [tab, setTab] = useState('words');
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
      {tab === 'words' && <div className="card"><p dir="auto" style={{ whiteSpace: 'pre-wrap' }}>{e.text || t('No text was saved for this one.')}</p></div>}
      {tab === 'refl' && (r ? (
        <>
          <div className="card"><h3 style={{ color: '#1F6B67' }}>{t('A read of your process')}</h3><p>{r.process}</p></div>
          <div className="card"><h3 style={{ color: '#1F6B67' }}>{t('Feelings, in your words')}</h3><div className="wrapchips">{r.feelings.map((f) => <span key={f.name} className="tag">{f.name}: “{f.quote}”</span>)}</div></div>
          <div className="card"><h3 style={{ color: '#1F6B67' }}>{t('New since last time')}</h3><p>{r.newThing}</p></div>
          <p className="small">{t('This is my read, written from your words. Tell me if it is wrong.')}</p>
        </>
      ) : <div className="card"><p>{t('No reflection for this one yet.')}</p></div>)}
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
      <div style={{ height: 8 }} />
    </div>
  );
}
