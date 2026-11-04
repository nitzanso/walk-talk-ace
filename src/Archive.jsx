import React, { useState } from 'react';
import Blob, { AceCard } from './Blob.jsx';
import { db, useQuery } from './db.js';
import { QUESTIONS, LIGHTS, TOOLS } from './content.js';
import { Seg, Icon } from './ui.jsx';

const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const when = (t) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' · ' + new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
const MOODN = { good: 'Good', soso: 'So-so', hard: 'Hard' };

function Timeline() {
  const data = useQuery(async () => {
    const [c, e, r, a] = await Promise.all([db.checks.toArray(), db.entries.toArray(), db.reflections.toArray(), db.aces.toArray()]);
    return [
      ...c.map((x) => ({ t: x.created, k: 'check', title: `Today felt ${MOODN[x.mood] || x.mood}`, mood: x.mood })),
      ...e.map((x) => ({ t: x.created, k: 'entry', title: x.kind === 'breathe' ? 'Breathing, 90 seconds' : x.kind === 'talk' ? `Walk and talk${x.seconds ? ', ' + Math.round(x.seconds / 60 * 10) / 10 + ' min' : ''}` : x.kind === 'type' ? 'Wrote something' : 'Entry', sub: x.text })),
      ...r.map((x) => ({ t: x.created, k: 'refl', title: x.sample ? 'Reflection (sample)' : 'Reflection', sub: x.reflection && x.reflection.process, fb: x.feedback })),
      ...a.map((x) => ({ t: x.created, k: 'ace', title: `${x.kind === 'small' ? 'Small' : 'Big'} ace`, sub: x.text })),
    ].sort((p, q) => q.t - p.t);
  }, [], []);
  if (!data.length) return <div className="card"><p>Nothing here yet. Everything you do shows up here, newest first.</p></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((x, i) => (
        <div key={i} className="tl-item">
          {x.mood ? <Blob mood={x.mood} size={40} /> : <Icon n={x.k === 'ace' ? 'sun' : x.k === 'refl' ? 'book' : 'path'} />}
          <div style={{ minWidth: 0 }}>
            <div className="small">{when(x.t)}</div>
            <div style={{ fontWeight: 500 }}>{x.title}</div>
            {x.sub && <div className="small" dir="auto" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{x.sub}</div>}
            {x.fb && <div className="small">You said: {x.fb === 'true' ? 'true' : x.fb === 'notquite' ? 'not quite' : 'missed it'}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Patterns() {
  const checks = useQuery(() => db.checks.toArray(), [], []);
  const all = useQuery(async () => [...(await db.checks.toArray()), ...(await db.entries.toArray()), ...(await db.aces.toArray()), ...(await db.reflections.toArray())].map((x) => x.created), [], []);
  const fbs = useQuery(() => db.settings.where('key').startsWith('fb:').toArray(), [], []);
  const days = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const byDay = {}; checks.forEach((c) => { byDay[dayKey(c.created)] = c.mood; });
  const showed = new Set(all.map(dayKey));
  const tally = { good: 0, soso: 0, hard: 0 }; checks.forEach((c) => { if (tally[c.mood] !== undefined) tally[c.mood]++; });
  const name = (k) => { const [, kind, id] = k.split(':'); const src = kind === 'light' ? LIGHTS : TOOLS; const f = src.find((x) => x.id === id); return f ? f.title : id; };
  const helped = fbs.filter((f) => f.value === 'helped'); const no = fbs.filter((f) => f.value === 'no');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card">
        <h3>Last 14 days</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
          {days.map((d) => { const m = byDay[dayKey(d)]; return (
            <div className="day" key={d.toISOString()}>{m ? <Blob mood={m} size={34} /> : <div className="ring" style={{ borderStyle: showed.has(dayKey(d)) ? 'solid' : 'dashed', background: showed.has(dayKey(d)) ? '#fff' : 'transparent' }} />}{d.getDate()}</div>
          ); })}
        </div>
        <p className="small">A blank day isn't a failure. A faint ring means you did something but didn't check in.</p>
      </div>
      <div className="card">
        <h3>How days have felt</h3>
        <p>{checks.length ? `Good ${tally.good} · So-so ${tally.soso} · Hard ${tally.hard}` : 'Check in a few days and a pattern starts to show.'}</p>
        <p className="small">Days you showed up: {showed.size}. Never a streak, nothing resets.</p>
      </div>
      <div className="card">
        <h3>What helped</h3>
        {helped.length ? <div className="wrapchips">{helped.map((f) => <span key={f.key} className="tag">{name(f.key)}</span>)}</div> : <p className="small">Tap “This helped” on a card and it collects here.</p>}
        {no.length > 0 && <><h3 style={{ marginTop: 6 }}>Not for you</h3><div className="wrapchips">{no.map((f) => <span key={f.key} className="tag" style={{ background: '#EEE' }}>{name(f.key)}</span>)}</div><p className="small">I'll show these less.</p></>}
      </div>
    </div>
  );
}

export function Aces({ open }) {
  const aces = useQuery(() => db.aces.orderBy('created').reverse().toArray(), [], []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button className="btn soft" onClick={() => open('ace')}><Icon n="plus" size={20} /> Add an ace</button>
      {aces.length === 0 ? <div className="card"><p>Your aces are proof of hard things you've handled. Add one any time.</p></div> : (
        <div className="acegrid">{aces.map((a) => <div key={a.id}><AceCard text={a.text} small={a.kind === 'small'} /></div>)}</div>
      )}
    </div>
  );
}

function About({ open }) {
  const answers = useQuery(() => db.answers.toArray(), [], []);
  const label = (id) => id === 'dealing' ? 'What you are dealing with' : id === 'goal' ? 'What you want from this' : (QUESTIONS.find((q) => q.id === id) || {}).text || id;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ background: '#E3ECEA' }}>
        <h3>What I'm learning about you</h3>
        <p className="small">Only what you told me. You can remove any of it.</p>
      </div>
      {answers.length === 0 && <div className="card"><p>Nothing yet. A tiny question shows up on Today now and then.</p></div>}
      {answers.map((a) => (
        <div className="card" key={a.qid}>
          <span className="eyebrow">{label(a.qid)}</span>
          <div className="wrapchips">{(a.value || []).map((v) => <span className="tag" key={v}>{v}</span>)}</div>
          {a.text && <p dir="auto">{a.text}</p>}
          <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => db.answers.delete(a.qid)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export default function Archive({ open }) {
  const [seg, setSeg] = useState('time');
  return (
    <div className="screen">
      <h1>Your archive</h1>
      <Seg value={seg} onChange={setSeg} items={[['time', 'Timeline'], ['pat', 'Patterns'], ['aces', 'Aces'], ['me', 'About me']]} />
      {seg === 'time' && <Timeline />}
      {seg === 'pat' && <Patterns />}
      {seg === 'aces' && <Aces open={open} />}
      {seg === 'me' && <About open={open} />}
      <div style={{ height: 8 }} />
    </div>
  );
}
