import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { db } from './db.js';
import { Icon } from './ui.jsx';
import { useI18n } from './i18n.jsx';
import * as C from './content.js';
import { S, FEAR_QS, GOOD_QS } from './weekly.js';

const DAY = 86400e3;
const thisWeekOk = (v) => v == null || v >= 0.7;
const SCORE = { good: 2, soso: 1, hard: 0 };
const dkey = (ms) => new Date(ms).toDateString();


let _L = 'en';
const T = (k) => S[k][_L];
function Chip({ label, on, onClick }) { return <button className={'pill' + (on ? ' on' : '')} onClick={onClick} style={{ height: 'auto', minHeight: 44, padding: '10px 16px', whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.25, flex: '0 1 auto' }}>{label}</button>; }
function Head({ eyebrow, title, intro, onClose }) {
  return (
    <>
      <div className="top"><span className="eyebrow">{eyebrow}</span><button className="iconbtn" onClick={onClose} aria-label="close"><Icon n="close" size={20} /></button></div>
      <h1 dir="auto">{title}</h1>{intro && <p className="lead" dir="auto">{intro}</p>}
    </>
  );
}
function Foot({ onNext, nextLabel, onSkip, disabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <button className="btn" onClick={onNext} disabled={disabled}>{nextLabel || T('go')}</button>
      {onSkip && <button className="link center" onClick={onSkip}>{T('skip')}</button>}
    </div>
  );
}
function Page({ k, children }) { return <motion.div key={k} className="screen" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>; }

// The weekly check-in: see the week, re-check what you named, look at a direction, look at one fear with a few guided questions.
// Everything here is rule-based and authored. Nothing is sent anywhere. Every step can be skipped.
export default function Weekly({ onClose }) {
  const { he } = useI18n();
  const L = he ? 'he' : 'en';
  _L = L;
  const tx = (k) => S[k][L];
  const [d, setD] = useState(null);
  const [step, setStep] = useState('intro');
  const [vals, setVals] = useState({});
  const [area, setArea] = useState(null);
  const [sign, setSign] = useState('');
  const [rate, setRate] = useState(null);
  const [helped, setHelped] = useState('');
  const [keepGoal, setKeepGoal] = useState(null);
  const [fear, setFear] = useState(null);
  const [deeper, setDeeper] = useState(false);
  const [qi, setQi] = useState(0);
  const [cur, setCur] = useState(['', '', '']);
  const [answers, setAnswers] = useState([]);
  const [pocketed, setPocketed] = useState({});
  const savedRef = useRef(false);
  const saveRef = useRef(null);
  useEffect(() => { if (step === 'see' && saveRef.current) saveRef.current(); }, [step]);

  useEffect(() => { (async () => {
    const now = Date.now();
    const checks = await db.checks.toArray();
    const ents = await db.entries.toArray();
    const sets = await db.settings.toArray();
    const refl = await db.reflections.toArray();
    const win = (i) => [now - (i + 1) * 7 * DAY, now - i * 7 * DAY];
    const weeks = [5, 4, 3, 2, 1, 0].map((i) => { const [a, b] = win(i); const cs = checks.filter((c) => c.created >= a && c.created < b && c.mood in SCORE); return cs.length ? cs.reduce((s, c) => s + SCORE[c.mood], 0) / cs.length : null; });
    const [a0] = win(0);
    const recs = ents.filter((e) => e.created >= a0).length;
    const days = new Set([...ents.filter((e) => e.created >= a0).map((e) => dkey(e.created)), ...checks.filter((c) => c.created >= a0).map((c) => dkey(c.created)), ...sets.filter((s) => s.key.startsWith('notice:') && s.value && s.value.at >= a0).map((s) => dkey(s.value.at))]).size;
    const all = [...ents.filter((e) => e.reflection).map((e) => ({ created: e.created, r: e.reflection })), ...refl.filter((x) => x.reflection && !x.sample).map((x) => ({ created: x.created, r: x.reflection }))];
    const cnt = {};
    all.filter((x) => x.created > now - 21 * DAY).forEach((x) => (x.r.feelings || []).forEach((f) => { if (!f.pleasant && f.name) cnt[f.name] = (cnt[f.name] || 0) + 1; }));
    const prev = sets.filter((s) => s.key.startsWith('week:')).map((s) => s.value).filter(Boolean).sort((a, b) => b.at - a.at);
    const last = prev[0] || null;
    const lastVals = {}; (last && last.feel || []).forEach((f) => { lastVals[f.name] = f.n; });
    const names = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
    (last && last.feel || []).forEach((f) => { if (!names.includes(f.name) && names.length < 3) names.push(f.name); });
    const goalRow = sets.find((s) => s.key === 'weekly:goal');
    const lastWeek = weeks[4], thisWeek = weeks[5];
    const myWords = [];
    const first = Math.min(now, ...ents.map((e) => e.created), ...checks.map((c) => c.created));
    const openNow = sets.some((x) => x.key === 'lookback:open' && x.value);
    const calm = thisWeekOk(weeks[5]);
    const unlocked = calm && (openNow || now - first > 21 * DAY);
    const pastGood = prev.flatMap((r) => (r.answers || []).filter((a) => a.kind === 'good' && a.a)).slice(0, 3);
    setD({ unlocked, pastGood, weeks, recs, days, names, lastVals, last, goal: goalRow ? goalRow.value : null, thisWeek, lastWeek, hasHistory: prev.length > 0, history: prev, myWords });
    const v = {}; names.forEach((n) => { v[n] = lastVals[n] != null ? lastVals[n] : 5; }); setVals(v);
  })(); }, []);

  if (!d) return <div className="screen" />;
  const goalSet = !!d.goal;
  const list = step === 'good' ? GOOD_QS : (deeper && fear && FEAR_QS[fear] ? FEAR_QS[fear] : null);
  const q = list ? list[qi] : null;
  const areaName = (id) => { const a = S.areas.find((x) => x.id === id); return a ? a[L] : ''; };

  const submitText = (txt) => { if (C.CRISIS_RE.test(txt)) { onClose(); window.dispatchEvent(new Event('crisis')); return true; } return false; };
  const afterFear = () => setStep(d.unlocked ? 'goodgate' : 'see');
  const nextStepAfterIntro = () => setStep('still');

  const finishQ = () => {
    const txt = q.many ? cur.filter(Boolean).join(' · ') : cur[0];
    if (txt && submitText(txt)) return;
    if (txt) setAnswers((a) => [...a, { q: q.q[L], a: txt, keep: !!q.keep, kind: step === 'good' ? 'good' : 'fear' }]);
    setCur(['', '', '']);
    if (qi + 1 >= list.length) { if (step === 'good') setStep('see'); else afterFear(); } else setQi(qi + 1);
  };

  const save = async () => {
    if (savedRef.current) return; savedRef.current = true;
    const rec = { at: Date.now(), feel: Object.entries(vals).map(([name, n]) => ({ name, n })), goal: goalSet && !keepGoal ? null : (area ? { area, sign } : d.goal), rate, helped, fear, answers };
    await db.settings.put({ key: 'week:' + Date.now(), value: rec });
    const g = area ? { area, sign, set: Date.now() } : d.goal;
    if (g) await db.settings.put({ key: 'weekly:goal', value: g });
  };
  saveRef.current = save;

  const trendBars = () => {
    const w = d.weeks; const max = 2; const has = w.some((x) => x != null);
    if (!has) return <p className="small">{tx('noData')}</p>;
    return (
      <svg viewBox="0 0 300 110" style={{ width: '100%' }} role="img" aria-label={tx('trend')}>
        {w.map((v, i) => { const x = 14 + i * 47; const h = v == null ? 0 : 8 + (v / max) * 70; return (
          <g key={i}>
            <rect x={x} y={90 - h} width="30" height={v == null ? 2 : h} rx="8" fill={i === 5 ? '#E08A3C' : '#CFE3EE'} opacity={v == null ? 0.4 : 1} />
            <text x={x + 15} y="106" fontSize="10" textAnchor="middle" fill="#6E665C">{i === 5 ? (he ? 'השבוע' : 'now') : `-${5 - i}`}</text>
          </g>); })}
      </svg>
    );
  };

  if (step === 'intro') return (
    <Page k={step + qi}>
      <Head onClose={onClose} eyebrow={tx('title')} title={tx('week')} intro={tx('weekIntro')} />
      <div className="card" style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
        <div className="center"><b style={{ fontSize: 34 }}>{d.recs}</b><div className="small">{tx('recs')}</div></div>
        <div className="center"><b style={{ fontSize: 34 }}>{d.days}</b><div className="small">{tx('days')}</div></div>
      </div>
      <div className="card"><span className="small">{tx('trend')}</span>{trendBars()}<span className="small">{tx('trendNote')}</span></div>
      <Foot onNext={nextStepAfterIntro} />
    </Page>
  );

  if (step === 'still') return (
    <Page k={step + qi}>
      <Head onClose={onClose} eyebrow={tx('title')} title={tx('stillTitle')} intro={d.names.length ? tx('stillIntro') : tx('stillNone')} />
      {d.names.map((n) => (
        <div className="card" key={n} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <b dir="auto">{n}</b>
          <input type="range" style={{ accentColor: '#E08A3C' }} min="0" max="10" value={vals[n] != null ? vals[n] : 5} onChange={(e) => setVals({ ...vals, [n]: Number(e.target.value) })} aria-label={n} />
          <div className="small" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{tx('gone')}</span><b>{vals[n] != null ? vals[n] : 5}/10</b><span>{tx('strong')}</span></div>
          {d.lastVals[n] != null && <span className="small">{tx('lastTime')}: {d.lastVals[n]}/10</span>}
        </div>
      ))}
      <Foot onNext={() => setStep('goal')} onSkip={() => { setVals({}); setStep('goal'); }} />
    </Page>
  );

  if (step === 'goal') {
    if (goalSet && keepGoal === null) return (
      <Page k={step + qi}>
        <Head onClose={onClose} eyebrow={tx('title')} title={tx('howWent')} intro={`${tx('goalBack')}: ${areaName(d.goal.area)}${d.goal.sign ? ' · ' + d.goal.sign : ''}`} />
        <div className="pills" style={{ flexWrap: 'wrap', gap: 8 }}>{S.rate.map((r) => <Chip key={r.id} label={r[L]} on={rate === r.id} onClick={() => setRate(r.id)} />)}</div>
        <div className="fld"><span className="small">{tx('helpedQ')}</span><textarea dir="auto" rows={2} value={helped} onChange={(e) => setHelped(e.target.value)} placeholder={tx('typeHere')} /></div>
        <p className="lead">{tx('keepQ')}</p>
        <div className="pills"><Chip label={tx('keep')} onClick={() => { if (!submitText(helped)) setKeepGoal(true); setStep('fear'); }} /><Chip label={tx('change')} onClick={() => { if (!submitText(helped)) { setKeepGoal(false); setArea(null); } }} /></div>
        <button className="link center" onClick={() => setStep('fear')}>{tx('skip')}</button>
      </Page>
    );
    return (
      <Page k={step + qi}>
        <Head onClose={onClose} eyebrow={tx('title')} title={tx('goalTitle')} intro={tx('goalIntro')} />
        <div className="pills" style={{ flexWrap: 'wrap', gap: 8 }}>{S.areas.map((a) => <Chip key={a.id} label={a[L]} on={area === a.id} onClick={() => setArea(a.id)} />)}</div>
        {area && (
          <>
            <p className="lead">{tx('signQ')}</p>
            <p className="small" dir="auto">{tx('signEx')}</p>
            <div className="pills" style={{ flexWrap: 'wrap', gap: 8 }}>{S.signSignals.map((s) => <Chip key={s.en} label={s[L]} on={sign === s[L]} onClick={() => setSign(s[L])} />)}</div>
            <textarea dir="auto" rows={2} value={sign} onChange={(e) => setSign(e.target.value)} placeholder={tx('typeHere')} />
          </>
        )}
        <Foot onNext={() => { if (sign && submitText(sign)) return; setStep('fear'); }} disabled={!area} onSkip={() => { setArea(null); setStep('fear'); }} />
      </Page>
    );
  }

  if (step === 'fear' && !deeper) return (
    <Page k={step + qi}>
      <Head onClose={onClose} eyebrow={tx('title')} title={tx('fearTitle')} intro={tx('fearIntro')} />
      <div className="pills" style={{ flexWrap: 'wrap', gap: 8 }}>{S.fears.map((f) => <Chip key={f.id} label={f[L]} on={fear === f.id} onClick={() => setFear(f.id)} />)}</div>
      {fear && fear !== 'none' && (
        <>
          <p className="lead" dir="auto">{tx('gate')}</p>
          <div className="pills"><Chip label={tx('yesDeeper')} onClick={() => { setDeeper(true); setQi(0); }} /><Chip label={tx('later')} onClick={afterFear} /></div>
        </>
      )}
      <Foot onNext={afterFear} nextLabel={tx('go')} onSkip={null} disabled={!fear || (fear !== 'none' && fear != null && false)} />
    </Page>
  );

  if (step === 'goodgate') return (
    <Page k="goodgate">
      <Head onClose={onClose} eyebrow={tx('title')} title={tx('lookTitle')} intro={tx('lookGate')} />
      <p className="lead" dir="auto">{tx('lookGate2')}</p>
      <div className="pills"><Chip label={tx('yesDeeper')} onClick={() => { setQi(0); setCur(['', '', '']); setStep('good'); }} /><Chip label={tx('later')} onClick={() => setStep('see')} /></div>
    </Page>
  );

  if (((step === 'fear' && deeper) || step === 'good') && q) return (
    <Page k={step + qi}>
      <div className="top"><span className="eyebrow">{step === 'good' ? tx('lookTitle') : S.fears.find((f) => f.id === fear)[L]} · {qi + 1}/{list.length}</span><button className="iconbtn" onClick={onClose} aria-label="close"><Icon n="close" size={20} /></button></div>
      <h2 dir="auto" style={{ fontWeight: 400 }}>{q.q[L]}</h2>
      {q.chips && <div className="pills" style={{ flexWrap: 'wrap', gap: 8 }}>{q.chips.map((c) => <Chip key={c.en} label={c[L]} onClick={() => { const i = q.many ? Math.max(0, cur.findIndex((x) => !x)) : 0; const n = [...cur]; n[i] = c[L]; setCur(n); }} />)}</div>}
      {(q.many ? [0, 1, 2] : [0]).map((i) => <input key={i} dir="auto" value={cur[i]} onChange={(e) => { const n = [...cur]; n[i] = e.target.value; setCur(n); }} placeholder={tx('typeHere')} style={{ padding: 12, borderRadius: 12, border: '1px solid #D8CDB6', fontSize: 16 }} />)}
      <Foot onNext={finishQ} nextLabel={tx('next')} onSkip={() => { setCur(['', '', '']); if (qi + 1 >= list.length) { if (step === 'good') setStep('see'); else afterFear(); } else setQi(qi + 1); }} />
    </Page>
  );

  // closing: what I see, from your own numbers and words
  const lines = [];
  if (d.thisWeek != null && d.lastWeek != null) lines.push(d.thisWeek - d.lastWeek > 0.25 ? tx('lighter') : d.thisWeek - d.lastWeek < -0.25 ? tx('heavier') : tx('sameDays')); else lines.push(tx('none'));
  Object.entries(vals).forEach(([n, v]) => { const p = d.lastVals[n]; if (p != null && v !== p) lines.push(`${n}: ${p} → ${v} ${v < p ? tx('feelDown') : tx('feelUp')}.`); });
  const goalNow = area ? areaName(area) : d.goal ? areaName(d.goal.area) : null;
  if (goalNow) lines.push(`${tx('goalBack').replace(/:?$/, '')} ${goalNow}.`);
  const keeps = answers.filter((a) => a.keep && a.a);
  return (
    <Page k={step + qi}>
      <Head onClose={onClose} eyebrow={tx('title')} title={tx('seeTitle')} />
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{lines.map((l, i) => <p key={i} dir="auto" style={{ margin: 0 }}>{l}</p>)}</div>
      {d.pastGood.length > 0 && <div className="card"><span className="small">{tx('earlier')}</span>{d.pastGood.map((a, i) => <p key={i} dir="auto" style={{ margin: '6px 0 0' }}>{a.a}</p>)}</div>}
      {answers.length > 0 && <div className="card"><span className="small">{tx('youWrote')}</span>{answers.map((a, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <span className="small" dir="auto">{a.q}</span><b dir="auto" style={{ fontWeight: 500 }}>{a.a}</b>
          {a.keep && <button className="link" style={{ alignSelf: 'flex-start' }} disabled={pocketed[i]} onClick={async () => { await db.aces.add({ created: Date.now(), kind: 'small', category: 'week', text: a.a }); setPocketed({ ...pocketed, [i]: true }); }}>{pocketed[i] ? tx('saved') : tx('save')}</button>}
        </div>))}</div>}
      <Foot onNext={onClose} nextLabel={tx('done')} />
    </Page>
  );
}
