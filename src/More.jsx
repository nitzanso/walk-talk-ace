import React, { useState } from 'react';
import { buildMemory } from './memory.js';
import { exportAll, wipeAll, importPack, useSetting } from './db.js';
import { reportText } from './report.js';
import { Seg, Icon } from './ui.jsx';
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
  const [useMem, setUseMem] = useSetting('useMemory', true);
  const [memTxt, setMemTxt] = useState(null);

  const download = async () => {
    const blob = new Blob([JSON.stringify(await exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-pack.json'; a.click();
  };
  const copyReport = async () => {
    const r = reportText();
    try { await navigator.clipboard.writeText(r); setMsg(t('Copied.')); } catch { setRep(r); }
  };
  const inputStyle = { height: 44, borderRadius: 22, border: 0, padding: '0 16px', fontSize: 16, background: '#fff', width: '100%' };
  return (
    <div className="screen plain">
      <h1>{t('More')}</h1>

      <section className="grp">
        <label className="fld"><span className="small">{t('My name')}</span>
          <input value={nameDraft ?? name} dir="auto" onChange={(e) => setNameDraft(e.target.value)} onBlur={() => nameDraft !== null && setName(nameDraft.trim())} placeholder={t('What should I call you?')} style={inputStyle} /></label>
        <div className="fld"><span className="small">{t('Language')}</span><Seg value={lang} onChange={setLang} items={[['he-IL', 'עברית'], ['en-US', 'English']]} /></div>
        <div className="fld"><span className="small">{t('How I talk to you')}</span><Seg value={tone} onChange={setTone} items={[['direct', t('Plain')], ['warm', t('Warm')]]} /></div>
      </section>

      <section className="grp">
        <button className="lrow" onClick={() => open('support')}><span>{t('Support: people to call')}</span><Icon n="chev" size={18} /></button>
        <button className="lrow" onClick={() => open('library')}><span>{t('Library: ideas and tools')}</span><Icon n="chev" size={18} /></button>
      </section>

      <section className="grp">
        <div className="fld"><span className="small">{t('Let reflections use my earlier recordings, so they can speak about how I am changing')}</span><Seg value={useMem === false ? 'off' : 'on'} onChange={(v) => setUseMem(v === 'on')} items={[['on', t('On')], ['off', t('Off')]]} /></div>
        <button className="link" style={{ alignSelf: 'flex-start' }} onClick={async () => setMemTxt(memTxt === null ? ((await buildMemory()) || t('Nothing yet.')) : null)}>{memTxt === null ? t('See exactly what is sent') : t('Hide')}</button>
        {memTxt !== null && <p className="small" dir="auto" style={{ whiteSpace: 'pre-wrap' }}>{memTxt}</p>}
        <span className="small">{t('Only a short summary is sent, only when you ask for a reflection, and never saved by the service.')}</span>
      </section>

      <section className="grp">
        <span className="small">{t('Everything stays on this phone. Download a copy any time.')}</span>
        <button className="lrow" onClick={download}><span>{t('Download my pack')}</span><Icon n="chev" size={18} /></button>
        <label className="lrow" style={{ cursor: 'pointer' }}><span>{t('Import a pack')}</span><Icon n="chev" size={18} /><input type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { const r = await importPack(JSON.parse(await f.text())); setImp(r.skipped ? t('This pack is already here.') : t('Added {n} items to your profile.', { n: r.added })); } catch { setImp(t('That file could not be read.')); } e.target.value = ''; }} /></label>
        {imp && <p className="small">{imp}</p>}
        {!confirm ? <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm(true)}>{t('Delete everything…')}</button> : (
          <div className="fb"><button onClick={() => setConfirm(false)}>{t('Keep it')}</button><button className="on" onClick={async () => { await wipeAll(); location.reload(); }}>{t('Yes, delete')}</button></div>
        )}
      </section>

      <details className="adv">
        <summary className="small">{t('Advanced')}</summary>
        <div className="fld"><span className="small">{t('Reflection connection')}</span>
          <input dir="ltr" value={draft ?? url} onChange={(e) => setDraft(e.target.value)} onBlur={() => draft !== null && setUrl(draft.trim())} placeholder="https://…" style={inputStyle} /></div>
        <button className="lrow" onClick={copyReport}><span>{t('Copy test results')}</span></button>
        {msg && <p className="small">{msg}</p>}
        {rep && <div className="mono" dir="ltr">{rep}</div>}
        <p className="small">{t('Version')}: {typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev'}</p>
      </details>
      <p className="small center">{t('Walk Talk Ace · early test version. Not therapy, not a crisis service.')}</p>
    </div>
  );
}
