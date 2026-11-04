import React, { useState } from 'react';
import { db, useQuery } from './db.js';
import { LIGHTS, TOOLS, ALLOWED_EXAMPLES } from './content.js';
import { Seg, Helpful, Icon } from './ui.jsx';

function Item({ title, children, kind, id }) {
  const [o, setO] = useState(false);
  return (
    <div className="lcard">
      <button className="lhead" onClick={() => setO(!o)} aria-expanded={o}><span>{title}</span><Icon n="chev" /></button>
      {o && <div className="lbody">{children}<Helpful kind={kind} id={id} /></div>}
    </div>
  );
}

function Mine() {
  const fbs = useQuery(() => db.settings.where('key').startsWith('fb:').toArray(), [], []);
  const allowed = useQuery(() => db.allowed.toArray(), [], []);
  const [txt, setTxt] = useState('');
  const [warn, setWarn] = useState(false);
  const answers = useQuery(() => db.answers.toArray(), [], []);
  const good = fbs.filter((f) => f.value === 'helped');
  const title = (k) => { const [, kind, id] = k.split(':'); return ((kind === 'light' ? LIGHTS : TOOLS).find((x) => x.id === id) || {}).title || id; };
  const best = ['fills', 'myself'].flatMap((q) => (answers.find((a) => a.qid === q) || {}).value || []).filter((v) => v !== 'Not sure');
  const add = async (v) => {
    const t = v.trim(); if (!t) return;
    if (/self.?harm|hurt myself|starv|purge|not eat|להרעיב|לפגוע בעצמי/i.test(t)) { setWarn(true); return; }
    setWarn(false);
    if (!allowed.some((a) => a.text === t)) await db.allowed.add({ created: Date.now(), text: t });
    setTxt('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card"><h3>Things that helped me</h3>{good.length ? <div className="wrapchips">{good.map((f) => <span className="tag" key={f.key}>{title(f.key)}</span>)}</div> : <p className="small">Tap “This helped” on a card and it lands here.</p>}</div>
      <div className="card">
        <h3>Things I'm not judging myself for</h3>
        <p className="small">In hard times, some things are just ok. Add yours.</p>
        <div className="wrapchips">
          {allowed.map((a) => <button key={a.id} className="tag sel" onClick={() => db.allowed.delete(a.id)} aria-label={`Remove ${a.text}`}>{a.text} ×</button>)}
          {ALLOWED_EXAMPLES.filter((e) => !allowed.some((a) => a.text === e)).map((e) => <button key={e} className="tag" onClick={() => add(e)}>+ {e}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Add your own" dir="auto" aria-label="Add your own" style={{ flex: 1, minWidth: 0, height: 48, borderRadius: 24, border: 0, padding: '0 16px', fontSize: 16, background: '#fff' }} />
          <button className="iconbtn" onClick={() => add(txt)} aria-label="Add"><Icon n="plus" size={20} /></button>
        </div>
        {warn && <p className="small">That one is something to talk about with a person, not to put on this list. The Support page in More has people to call.</p>}
      </div>
      <div className="card">
        <h3>Me at my best</h3>
        {best.length ? <div className="wrapchips">{best.map((b) => <span className="tag" key={b}>{b}</span>)}</div> : <p className="small">Answer the tiny questions on Today and the things that fill you up collect here.</p>}
      </div>
    </div>
  );
}

export default function Library() {
  const [seg, setSeg] = useState('lights');
  return (
    <div className="screen">
      <h1>Library</h1>
      <Seg value={seg} onChange={setSeg} items={[['lights', 'Little lights'], ['tools', 'Try this'], ['mine', 'Mine']]} />
      {seg === 'lights' && LIGHTS.map((l) => (
        <Item key={l.id} title={l.title} kind="light" id={l.id}>
          <p><b>What research found.</b> {l.finding}</p><p><b>For you.</b> {l.forYou}</p><p><b>Try it.</b> {l.tryIt}</p><p className="small">{l.caveat}</p>
        </Item>
      ))}
      {seg === 'tools' && TOOLS.map((t) => (
        <Item key={t.id} title={t.title} kind="tool" id={t.id}>
          <p><b>Why.</b> {t.why}</p>
          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>{t.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          <p className="small">For example: {t.example}</p>
        </Item>
      ))}
      {seg === 'mine' && <Mine />}
      <div style={{ height: 8 }} />
    </div>
  );
}
