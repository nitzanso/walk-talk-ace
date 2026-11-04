import React, { useState } from 'react';
import { db, exportAll, wipeAll, useSetting } from './db.js';
import { reportText } from './report.js';
import { Seg } from './ui.jsx';

export default function More({ open }) {
  const [tone, setTone] = useSetting('tone', 'direct');
  const [lang, setLang] = useSetting('lang', 'he-IL');
  const [url, setUrl] = useSetting('reflectUrl', '');
  const [draft, setDraft] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const [rep, setRep] = useState('');

  const download = async () => {
    const blob = new Blob([JSON.stringify(await exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-pack.json'; a.click();
  };
  const copyReport = async () => {
    const t = reportText();
    try { await navigator.clipboard.writeText(t); setMsg('Copied.'); } catch { setRep(t); }
  };
  return (
    <div className="screen">
      <h1>More</h1>
      <div className="card">
        <h3>How I talk to you</h3>
        <Seg value={tone} onChange={setTone} items={[['direct', 'Plain'], ['warm', 'Warm']]} />
      </div>
      <div className="card">
        <h3>Language for talking</h3>
        <Seg value={lang} onChange={setLang} items={[['he-IL', 'עברית'], ['en-US', 'English']]} />
      </div>
      <button className="btn soft" onClick={() => open('support')}>Support: people to call</button>
      <div className="card">
        <h3>My pack</h3>
        <p className="small">Everything stays on this phone. Download a copy any time.</p>
        <button className="btn soft" onClick={download}>Download my pack</button>
        {!confirm ? <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm(true)}>Delete everything…</button> : (
          <div className="fb"><button onClick={() => setConfirm(false)}>Keep it</button><button className="on" onClick={async () => { await wipeAll(); location.reload(); }}>Yes, delete</button></div>
        )}
      </div>
      <div className="card">
        <h3>Reflection connection</h3>
        <p className="small">Empty means reflections show a clearly marked sample. Paste the address of the secure step once it exists.</p>
        <input value={draft ?? url} onChange={(e) => setDraft(e.target.value)} onBlur={() => draft !== null && setUrl(draft.trim())} placeholder="https://…" aria-label="Reflection connection address" style={{ height: 48, borderRadius: 24, border: 0, padding: '0 16px', fontSize: 16, background: '#fff' }} />
      </div>
      <div className="card">
        <h3>Phone test results</h3>
        <p className="small">From the Talk screen. Copy and paste to Claude.</p>
        <button className="btn soft" onClick={copyReport}>Copy test results</button>
        {msg && <p className="small">{msg}</p>}
        {rep && <div className="mono">{rep}</div>}
      </div>
      <p className="small center">Walk Talk Ace · early test version. Not therapy, not a crisis service.</p>
      <div style={{ height: 8 }} />
    </div>
  );
}
