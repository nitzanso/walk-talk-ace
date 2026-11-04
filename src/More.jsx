import React, { useState } from 'react';
import { exportAll, wipeAll, importPack, useSetting } from './db.js';
import { reportText } from './report.js';
import { Seg } from './ui.jsx';
import { useI18n } from './i18n.jsx';

export default function More({ open }) {
  const { t } = useI18n();
  const [tone, setTone] = useSetting('tone', 'direct');
  const [name, setName] = useSetting('name', '');
  const [nameDraft, setNameDraft] = useState(null);
  const [lang, setLang] = useSetting('lang', 'he-IL');
  const [url, setUrl] = useSetting('reflectUrl', '');
  const [draft, setDraft] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const [imp, setImp] = useState('');
  const [rep, setRep] = useState('');

  const download = async () => {
    const blob = new Blob([JSON.stringify(await exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-pack.json'; a.click();
  };
  const copyReport = async () => {
    const r = reportText();
    try { await navigator.clipboard.writeText(r); setMsg(t('Copied.')); } catch { setRep(r); }
  };
  return (
    <div className="screen">
      <h1>{t('More')}</h1>
      <p className="small">{t('Version')}: {typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev'}</p>
      <div className="card">
        <h3>{t('My name')}</h3>
        <input value={nameDraft ?? name} dir="auto" onChange={(e) => setNameDraft(e.target.value)} onBlur={() => nameDraft !== null && setName(nameDraft.trim())} placeholder={t('What should I call you?')} aria-label={t('My name')} style={{ height: 48, borderRadius: 24, border: 0, padding: '0 16px', fontSize: 16, background: '#fff' }} />
      </div>
      <div className="card">
        <h3>{t('Language')}</h3>
        <Seg value={lang} onChange={setLang} items={[['he-IL', 'עברית'], ['en-US', 'English']]} />
      </div>
      <div className="card">
        <h3>{t('How I talk to you')}</h3>
        <Seg value={tone} onChange={setTone} items={[['direct', t('Plain')], ['warm', t('Warm')]]} />
      </div>
      <button className="btn soft" onClick={() => open('support')}>{t('Support: people to call')}</button>
      <div className="card">
        <h3>{t('My pack')}</h3>
        <p className="small">{t('Everything stays on this phone. Download a copy any time.')}</p>
        <button className="btn soft" onClick={download}>{t('Download my pack')}</button>
        <label className="btn soft" style={{ cursor: 'pointer' }}>{t('Import a pack')}<input type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { const r = await importPack(JSON.parse(await f.text())); setImp(r.skipped ? t('This pack is already here.') : t('Added {n} items to your profile.', { n: r.added })); } catch { setImp(t('That file could not be read.')); } e.target.value = ''; }} /></label>
        {imp && <p className="small">{imp}</p>}
        {!confirm ? <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm(true)}>{t('Delete everything…')}</button> : (
          <div className="fb"><button onClick={() => setConfirm(false)}>{t('Keep it')}</button><button className="on" onClick={async () => { await wipeAll(); location.reload(); }}>{t('Yes, delete')}</button></div>
        )}
      </div>
      <div className="card">
        <h3>{t('Reflection connection')}</h3>
        <p className="small">{t('Leave empty to use the built-in connection. Only change this if Claude told you to.')}</p>
        <input dir="ltr" value={draft ?? url} onChange={(e) => setDraft(e.target.value)} onBlur={() => draft !== null && setUrl(draft.trim())} placeholder="https://…" aria-label={t('Reflection connection address')} style={{ height: 48, borderRadius: 24, border: 0, padding: '0 16px', fontSize: 16, background: '#fff' }} />
      </div>
      <div className="card">
        <h3>{t('Phone test results')}</h3>
        <p className="small">{t('From the Talk screen. Copy and paste to Claude.')}</p>
        <button className="btn soft" onClick={copyReport}>{t('Copy test results')}</button>
        {msg && <p className="small">{msg}</p>}
        {rep && <div className="mono" dir="ltr">{rep}</div>}
      </div>
      <p className="small center">{t('Walk Talk Ace · early test version. Not therapy, not a crisis service.')}</p>
      <div style={{ height: 8 }} />
    </div>
  );
}
