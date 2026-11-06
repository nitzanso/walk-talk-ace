import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db } from './db.js';
import { Icon } from './ui.jsx';
import { useI18n } from './i18n.jsx';
import * as C from './content.js';
import { VALUES, SS } from './self.js';

let _L = 'en';
const T = (k) => SS[k][_L];
const vname = (id) => { const v = VALUES.find((x) => x.id === id); return v ? v[_L] : id; };
function Chip({ label, on, onClick, n }) { return <button className={'pill' + (on ? ' on' : '')} onClick={onClick} style={{ height: 'auto', minHeight: 44, padding: '10px 16px', whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.25, flex: '0 1 auto' }}>{n ? n + '. ' : ''}{label}</button>; }
function Head({ eyebrow, title, intro, onClose }) {
  return (<>
    <div className="top"><span className="eyebrow">{eyebrow}</span><button className="iconbtn" onClick={onClose} aria-label="close"><Icon n="close" size={20} /></button></div>
    <h1 dir="auto">{title}</h1>{intro && <p className="lead" dir="auto">{intro}</p>}
  </>);
}
const field = { padding: 12, borderRadius: 12, border: '1px solid #D8CDB6', fontSize: 16, width: '100%', boxSizing: 'border-box' };

// "Who I am": optional and gentle. Values, who I am, who I am becoming, and a look at how true to myself I have been lately.
export default function Self({ onClose }) {
  const { he } = useI18n();
  _L = he ? 'he' : 'en';
  const [prof, setProf] = useState(undefined);
  const [checks, setChecks] = useState([]);
  const [step, setStep] = useState(null);
  const [picked, setPicked] = useState([]);
  const [top, setTop] = useState([]);
  const [me, setMe] = useState(['', '', '']);
  const [bec, setBec] = useState(['', '', '']);
  const [scores, setScores] = useState({});
  const [lines, setLines] = useState({});
  const [stepText, setStepText] = useState('');
  const [stepSaved, setStepSaved] = useState(false);

  useEffect(() => { (async () => {
    const row = await db.settings.get('self:profile');
    const cs = (await db.settings.toArray()).filter((s) => s.key.startsWith('self:check:')).map((s) => s.value).sort((a, b) => b.at - a.at);
    setChecks(cs);
    if (row && row.value) { setProf(row.value); setPicked(row.value.picked || row.value.top); setTop(row.value.top); setMe([...(row.value.me || []), '', '', ''].slice(0, 3)); setBec([...(row.value.become || []), '', '', ''].slice(0, 3)); setStep('view'); }
    else { setProf(null); setStep('intro'); }
  })(); }, []);

  if (prof === undefined) return <div className="screen" />;
  const crisis = (txt) => { if (txt && C.CRISIS_RE.test(txt)) { onClose(); window.dispatchEvent(new Event('crisis')); return true; } return false; };
  const toggle = (id) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length >= 6 ? p : [...p, id]);
  const tapTop = (id) => setTop((t) => t.includes(id) ? t.filter((x) => x !== id) : t.length >= 3 ? t : [...t, id]);
  const saveProfile = async () => {
    if (crisis([...me, ...bec].join(' '))) return;
    const v = { picked, top, me: me.filter(Boolean), become: bec.filter(Boolean), at: Date.now() };
    await db.settings.put({ key: 'self:profile', value: v }); setProf(v); setStep('view');
  };
  const runCheck = () => { const s = {}; prof.top.forEach((id) => { s[id] = 5; }); setScores(s); setLines({}); setStepSaved(false); setStepText(''); setStep('truth'); };
  const saveCheck = async () => {
    if (crisis(Object.values(lines).join(' '))) return;
    const rec = { at: Date.now(), scores, lines };
    await db.settings.put({ key: 'self:check:' + Date.now(), value: rec }); setChecks([rec, ...checks]); setStep('gap');
  };

  const wrap = (k, children) => <motion.div key={k} className="screen" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>;
  const Foot = ({ onNext, label, onBack, disabled, onSkip }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <button className="btn" onClick={onNext} disabled={disabled}>{label || T('next')}</button>
      {onSkip && <button className="link center" onClick={onSkip}>{T('skip')}</button>}
      {onBack && <button className="link center" onClick={onBack}>{T('back')}</button>}
    </div>
  );

  if (step === 'intro') return wrap('intro', <>
    <Head onClose={onClose} eyebrow={T('title')} title={T('title')} intro={T('intro')} />
    <Foot onNext={() => setStep('values')} label={T('begin')} />
  </>);

  if (step === 'values') return wrap('values', <>
    <Head onClose={onClose} eyebrow={T('title')} title={T('valuesQ')} intro={T('valuesNote')} />
    <div className="pills" style={{ flexWrap: 'wrap', gap: 8 }}>{VALUES.map((v) => <Chip key={v.id} label={v[_L]} on={picked.includes(v.id)} onClick={() => toggle(v.id)} />)}</div>
    <Foot onNext={() => { setTop(top.filter((x) => picked.includes(x))); setStep(picked.length > 3 ? 'top' : 'me'); if (picked.length <= 3) setTop(picked); }} disabled={picked.length < 1} onBack={prof ? () => setStep('view') : null} />
  </>);

  if (step === 'top') return wrap('top', <>
    <Head onClose={onClose} eyebrow={T('title')} title={T('topQ')} />
    <div className="pills" style={{ flexWrap: 'wrap', gap: 8 }}>{picked.map((id) => <Chip key={id} label={vname(id)} on={top.includes(id)} n={top.includes(id) ? top.indexOf(id) + 1 : null} onClick={() => tapTop(id)} />)}</div>
    <Foot onNext={() => setStep('me')} disabled={top.length < 1} onBack={() => setStep('values')} />
  </>);

  if (step === 'me') return wrap('me', <>
    <Head onClose={onClose} eyebrow={T('title')} title={T('meQ')} intro={T('meNote')} />
    <p className="small" dir="auto">{T('meEx')}</p>
    {[0, 1, 2].map((i) => <input key={i} dir="auto" style={field} value={me[i]} placeholder={T('typeHere')} onChange={(e) => { const n = [...me]; n[i] = e.target.value; setMe(n); }} />)}
    <Foot onNext={() => setStep('become')} onSkip={() => setStep('become')} onBack={() => setStep(picked.length > 3 ? 'top' : 'values')} />
  </>);

  if (step === 'become') return wrap('become', <>
    <Head onClose={onClose} eyebrow={T('title')} title={T('becomeQ')} intro={T('becomeNote')} />
    <p className="small" dir="auto">{T('becomeEx')}</p>
    {[0, 1, 2].map((i) => <input key={i} dir="auto" style={field} value={bec[i]} placeholder={T('typeHere')} onChange={(e) => { const n = [...bec]; n[i] = e.target.value; setBec(n); }} />)}
    <Foot onNext={saveProfile} label={T('done')} onSkip={saveProfile} onBack={() => setStep('me')} />
  </>);

  if (step === 'truth') return wrap('truth', <>
    <Head onClose={onClose} eyebrow={T('title')} title={T('truthBtn')} intro={T('truthNote')} />
    {prof.top.map((id) => (
      <div className="card" key={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <b dir="auto">{vname(id)}</b><span className="small" dir="auto">{T('truthQ')}</span>
        <input type="range" min="0" max="10" style={{ accentColor: '#E08A3C' }} value={scores[id]} onChange={(e) => setScores({ ...scores, [id]: Number(e.target.value) })} aria-label={vname(id)} />
        <div className="small" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{T('little')}</span><b>{scores[id]}/10</b><span>{T('lot')}</span></div>
        <input dir="auto" style={field} placeholder={T('lineQ')} value={lines[id] || ''} onChange={(e) => setLines({ ...lines, [id]: e.target.value })} />
      </div>))}
    <Foot onNext={saveCheck} onBack={() => setStep('view')} />
  </>);

  if (step === 'gap') {
    const sorted = [...prof.top].sort((a, b) => scores[a] - scores[b]);
    const low = sorted[0], high = sorted[sorted.length - 1];
    return wrap('gap', <>
      <Head onClose={onClose} eyebrow={T('title')} title={T('gapTitle')} intro={T('gapNote')} />
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {prof.top.map((id) => <div key={id}><div className="small">{vname(id)} · {scores[id]}/10</div><div style={{ height: 10, borderRadius: 5, background: '#D8CDB6' }}><div style={{ width: scores[id] * 10 + '%', height: 10, borderRadius: 5, background: id === low && prof.top.length > 1 && scores[low] !== scores[high] ? '#CFE3EE' : '#E08A3C' }} /></div></div>)}
      </div>
      {prof.top.length > 1 && scores[low] !== scores[high] && <p className="lead" dir="auto">{he ? `הכי קרוב אלייך עכשיו: ${vname(high)}. הכי רחוק: ${vname(low)}.` : `Closest to you right now: ${vname(high)}. Furthest: ${vname(low)}.`}</p>}
      <p className="lead" dir="auto">{T('stepQ')} <b>{vname(low)}</b></p>
      <input dir="auto" style={field} value={stepText} placeholder={T('typeHere')} onChange={(e) => setStepText(e.target.value)} />
      {stepText && !stepSaved && <button className="btn soft" onClick={async () => { if (crisis(stepText)) return; const g = await db.settings.get('weekly:goal'); await db.settings.put({ key: 'weekly:goal', value: { area: (g && g.value && g.value.area) || 'myself', sign: stepText, set: Date.now() } }); setStepSaved(true); }}>{T('stepUse')}</button>}
      {stepSaved && <p className="small">{T('stepSaved')}</p>}
      <Foot onNext={() => setStep('view')} label={T('done')} />
    </>);
  }

  // the profile page
  const last = checks[0];
  return wrap('view', <>
    <Head onClose={onClose} eyebrow={T('title')} title={T('title')} />
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="small">{T('mine')}</span>
      <p className="lead" dir="auto" style={{ margin: 0 }}>{prof.top.map(vname).join(' · ')}</p>
      {prof.picked && prof.picked.length > prof.top.length && <span className="small" dir="auto">{prof.picked.filter((x) => !prof.top.includes(x)).map(vname).join(' · ')}</span>}
    </div>
    {prof.me.length > 0 && <div className="card"><span className="small">{T('iam')}</span>{prof.me.map((x, i) => <p key={i} dir="auto" style={{ margin: '6px 0 0' }}>{x}</p>)}</div>}
    {prof.become.length > 0 && <div className="card"><span className="small">{T('becoming')}</span>{prof.become.map((x, i) => <p key={i} dir="auto" style={{ margin: '6px 0 0' }}>{x}</p>)}</div>}
    {last && <div className="card"><span className="small">{T('last')}: {new Date(last.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>{prof.top.map((id) => last.scores[id] != null && <div key={id} className="small" style={{ marginTop: 4 }}>{vname(id)}: {last.scores[id]}/10{last.lines && last.lines[id] ? ' · ' + last.lines[id] : ''}</div>)}</div>}
    <button className="btn" onClick={runCheck}>{T('truthBtn')}</button>
    <button className="link center" onClick={() => setStep('values')}>{T('edit')}</button>
    <p className="small center" dir="auto">{T('hold')}</p>
  </>);
}
