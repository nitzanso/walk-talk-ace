import React from 'react';
import { motion } from 'motion/react';
import Blob, { Landscape, Sun } from './Blob.jsx';
import { db, useQuery, useSetting, setSetting } from './db.js';
import { MESSAGES, LIGHTS, QUESTIONS } from './content.js';
import { Helpful, Icon } from './ui.jsx';

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function QuestionCard({ q, onDone }) {
  const [sel, setSel] = React.useState([]);
  const toggle = (o) => setSel(q.multi ? (sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o]) : [o]);
  const save = async (val) => { await db.answers.put({ qid: q.id, value: val, at: Date.now() }); onDone && onDone(); };
  return (
    <div className="card">
      <span className="eyebrow">A tiny question</span>
      <h3>{q.text}</h3>
      <div className="wrapchips">
        {q.options.map((o) => <button key={o} className={'tag' + (sel.includes(o) ? ' sel' : '')} onClick={() => toggle(o)} aria-pressed={sel.includes(o)} style={{ minHeight: 44 }}>{o}</button>)}
      </div>
      <div className="fb">
        <button onClick={() => save(['Not sure'])}>Not sure</button>
        <button className="on" disabled={!sel.length} onClick={() => save(sel)} style={{ opacity: sel.length ? 1 : 0.45 }}>Save</button>
      </div>
    </div>
  );
}

export default function Today({ open }) {
  const [tone] = useSetting('tone', 'direct');
  const [skipQ, , qReady] = useSetting('skipQ', {});
  const [since] = useSetting('onboardedAt', Date.now());
  const checks = useQuery(() => db.checks.orderBy('created').reverse().limit(30).toArray(), []);
  const aceCount = useQuery(() => db.aces.count(), [], 0);
  const answers = useQuery(() => db.answers.toArray(), []);
  const fbs = useQuery(() => db.settings.where('key').startsWith('fb:').toArray(), []);
  const total = useQuery(async () => (await db.aces.count()) + (await db.checks.count()) + (await db.entries.count()) + (await db.toolbox.count()), [], 0);

  const today = checks.find((c) => c.created >= startOfDay());
  const mood = today ? today.mood : 'calm';
  const pick = async (m) => { await db.checks.add({ created: Date.now(), mood: m }); if (navigator.vibrate) navigator.vibrate(15); };

  const noLight = new Set(fbs.filter((f) => f.value === 'no' && f.key.startsWith('fb:light:')).map((f) => f.key.slice(9)));
  const pool = LIGHTS.filter((l) => !noLight.has(l.id));
  const day = Math.floor(Date.now() / 86400000);
  const light = pool.length ? pool[day % pool.length] : null;
  const [lightOpen, setLightOpen] = React.useState(false);

  const answered = new Set(answers.map((a) => a.qid));
  const daysIn = (Date.now() - since) / 86400000;
  const q = daysIn >= 1 && qReady && !today?.skipQ
    ? QUESTIONS.find((x) => x.id !== 'dealing' && !answered.has(x.id) && !(skipQ && skipQ[x.id] && Date.now() - skipQ[x.id] < 7 * 86400000))
    : null;
  const qToday = q && answered.size >= 0;

  const hour = new Date().getHours();
  const hi = hour < 12 ? 'Good morning' : hour < 18 ? 'Hello' : 'Good evening';

  const options = [
    ['talk', 'mic', 'Talk', 'Say it out loud, walking or not'],
    ['type', 'pen', 'Type', 'Write a few lines'],
    ['lights', 'sun', 'A little light', 'A short, researched idea'],
    ['breathe', 'wind', 'Breathe', 'About 90 seconds'],
  ];

  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span><h1>{hi}</h1></div>
        <button className="acepill" onClick={() => open('aces')} aria-label={`Your aces, ${aceCount}`}><Sun size={26} color="#25264A" />{aceCount}</button>
      </div>

      <Landscape mood={mood} />

      {!today ? (
        <div className="card">
          <h3>How is today?</h3>
          <div className="moods">
            {[['good', 'Good'], ['soso', 'So-so'], ['hard', 'Hard']].map(([m, l]) => (
              <motion.button key={m} className="mood" whileTap={{ scale: 0.95 }} onClick={() => pick(m)}><Blob mood={m} size={52} />{l}</motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card"><p>{MESSAGES[tone][today.mood]}</p></div>
      )}

      <div>
        <h2 style={{ marginBottom: 10 }}>What would help right now?</h2>
        <div className="chips">
          {options.map(([id, ic, name, sub], i) => (
            <motion.button key={id} className="chip" whileTap={{ scale: 0.98 }} onClick={() => open(id === 'lights' ? 'library' : id)} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', background: i === 0 ? 'var(--butter)' : 'var(--card)', minHeight: 64 }}>
              <Icon n={ic} />
              <span style={{ flex: 1 }}>{name}<br /><span className="small" style={{ fontWeight: 400 }}>{sub}</span></span>
              {i === 0 && <span className="tag" style={{ background: '#fff' }}>Try this one</span>}
            </motion.button>
          ))}
        </div>
      </div>

      {light && (
        <div className="lcard">
          <button className="lhead" onClick={() => setLightOpen(!lightOpen)} aria-expanded={lightOpen}>
            <span><span className="eyebrow" style={{ display: 'block' }}>Little light for today</span>{light.title}</span>
            <Icon n="chev" />
          </button>
          {lightOpen && (
            <div className="lbody">
              <p><b>What research found.</b> {light.finding}</p>
              <p><b>For you.</b> {light.forYou}</p>
              <p><b>Try it.</b> {light.tryIt}</p>
              <p className="small">{light.caveat}</p>
              <Helpful kind="light" id={light.id} />
            </div>
          )}
        </div>
      )}

      {qToday && <QuestionCard q={q} />}
      {q && <button className="link" onClick={() => setSetting('skipQ', { ...(skipQ || {}), [q.id]: Date.now() })}>Ask me this another day</button>}

      <p className="small center">You've shown up {total} {total === 1 ? 'time' : 'times'}. It never resets.</p>
      <div style={{ height: 8 }} />
    </div>
  );
}
