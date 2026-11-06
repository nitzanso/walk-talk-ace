import React, { useState } from 'react';
import Blob, { AceCard } from './Blob.jsx';
import { db, useQuery, findEntryForQuote } from './db.js';
import { Quote } from './ReflectionView.jsx';
import { useI18n } from './i18n.jsx';
import { motion } from 'motion/react';
import { Seg, Icon } from './ui.jsx';
import { TRAPS, STRENGTHS, nm } from './knowledge.js';

const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const when = (ts, lang) => new Date(ts).toLocaleDateString(lang, { day: 'numeric', month: 'short' }) + ' · ' + new Date(ts).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });

function Timeline({ open }) {
  const { t, he, lang } = useI18n();
  const MOODN = { good: t('Lighter'), soso: t('Okay'), hard: t('Heavy') };
  const data = useQuery(async () => {
    const [c, e, r, a] = await Promise.all([db.checks.toArray(), db.entries.toArray(), db.reflections.toArray(), db.aces.toArray()]);
    return [
      ...c.map((x) => ({ t: x.created, k: 'check', mood: x.mood })),
      ...e.map((x) => ({ t: x.created, k: 'entry', id: x.id, title: (he && x.titleHe) || x.title || (x.kind === 'breathe' ? t('Breathing, 90 seconds') : x.kind === 'talk' ? t('Walk and talk') : x.kind === 'type' ? t('Wrote something') : t('Entry')), open: true })),
      ...r.map((x) => ({ t: x.created, k: 'refl', title: x.sample ? t('Reflection (sample)') : t('Reflection'), sub: x.reflection && x.reflection.process })),
      ...a.map((x) => ({ t: x.created, k: 'ace', title: x.kind === 'small' ? t('Small ace') : t('Big ace'), sub: x.text })),
    ].sort((p, q) => q.t - p.t);
  }, [lang], []);
  if (!data.length) return <p className="lead">{t('Nothing here yet. Everything you do shows up here, newest first.')}</p>;
  const days = []; data.forEach((x) => { const k = dayKey(x.t); let d = days.find((y) => y.k === k); if (!d) { d = { k, t: x.t, items: [] }; days.push(d); } d.items.push(x); });
  const hm = (ts) => new Date(ts).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="tline">
      {days.map((d) => { const chk = d.items.find((x) => x.k === 'check'); const rows = d.items.filter((x) => x.k !== 'check'); return (
        <section key={d.k}>
          <header>{chk ? <Blob mood={chk.mood} size={28} /> : <span className="dot" />}<b>{new Date(d.t).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })}</b>{chk && <span className="small">{MOODN[chk.mood]}</span>}</header>
          {rows.map((x, i) => (
            <div key={i} className={'trow' + (x.open ? ' tap' : '')} role={x.open ? 'button' : undefined} tabIndex={x.open ? 0 : undefined} onClick={x.open ? () => open('entry', { id: x.id }) : undefined} onKeyDown={x.open ? (e) => { if (e.key === 'Enter') open('entry', { id: x.id }); } : undefined}>
              <span className="small tm">{hm(x.t)}</span>
              <span className="tt" dir="auto">{x.title}{x.sub && <span className="small ts" dir="auto">{x.sub}</span>}</span>
            </div>
          ))}
        </section>
      ); })}
    </div>
  );
}

function Me({ open }) {
  const goQuote = async (q) => { const id = await findEntryForQuote(q); if (id) open('entry', { id, quote: q }); };
  const { t, he, C } = useI18n();
  const [opened, setOpened] = useState(false);
  const [view, setView] = useState(null);
  const ins = useQuery(() => db.insights.toArray(), [], []);
  const refl = useQuery(() => db.reflections.toArray(), [], []);
  const sets = useQuery(() => db.settings.toArray(), [], []);
  const aces = useQuery(() => db.aces.count(), [], 0);
  const ents = useQuery(() => db.entries.toArray(), [], []);
  const E = ents.filter((x) => x.reflection).sort((a, b) => a.created - b.created);
  const growthRows = E.filter((x) => x.reflection.growth);
  const half = Math.ceil(E.length / 2);
  const names = (arr) => new Set(arr.flatMap((x) => (x.reflection.feelings || []).map((f) => f.name)));
  const early = names(E.slice(0, half)); const late = names(E.slice(half));
  const newer = [...late].filter((n) => !early.has(n)).slice(0, 5); const quieter = [...early].filter((n) => !late.has(n)).slice(0, 5);
  const R = [...refl.filter((x) => !x.sample).map((x) => x.reflection), ...ents.map((x) => x.reflection)].filter(Boolean);
  const tally = (list, key) => { const m = {}; list.forEach((r) => (r[key] || []).forEach((x) => { const k = x.id || x.name; (m[k] = m[k] || []).push(x); })); return Object.entries(m).sort((p, q) => q[1].length - p[1].length); };
  const strengthsR = tally(R, 'strengths').filter(([id]) => STRENGTHS[id]);
  const trapsR = tally(R, 'traps').filter(([id]) => TRAPS[id]);
  const feelR = tally(R, 'feelings');
  const strengthI = ins.filter((x) => x.kind === 'strength');
  const themes = ins.filter((x) => x.kind === 'theme');
  const steady = ins.filter((x) => x.kind === 'steadies');
  const wonder = ins.filter((x) => x.kind === 'open');
  const words = ins.filter((x) => x.kind === 'myword');
  const helped = sets.filter((f) => f.key.startsWith('fb:') && f.value === 'helped').map((f) => { const [, kind, id] = f.key.split(':'); const src = kind === 'light' ? C.LIGHTS : C.TOOLS; return (src.find((x) => x.id === id) || {}).title; }).filter(Boolean);
  const passed = {}; sets.filter((x) => x.key.startsWith('passed:')).forEach((x) => { const n = x.key.split('|')[1]; (passed[n] = passed[n] || []).push(x.value); });
  const txt = (r) => (he && r.he ? r.he : r.en);
  const nStrength = strengthsR.length + strengthI.length;
  const nTraps = trapsR.length + themes.length;
  const nFeel = feelR.length;
  const nHelps = steady.length + helped.length + words.length + aces;
  const noticed = sets.filter((x) => x.key.startsWith('notice:') && x.value).map((x) => x.value).sort((a, b) => b.at - a.at);
  const nNotice = noticed.length;
  const lowered = noticed.filter((x) => x.after === 'lower').length;
  const answered = noticed.filter((x) => x.after).length;
  const nMoving = growthRows.length;
  const empty = nNotice + nMoving + nStrength + nTraps + nFeel + nHelps + wonder.length === 0;
  const PASS = { gone: t('gone'), smaller: t('smaller'), same: t('the same'), bigger: t('bigger') };

  if (empty) return <p className="lead">{t('As you talk, I will gently note what I see. Nothing here yet.')}</p>;

  if (!opened) return (
    <div className="reveal">
      <motion.div className="orb" animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
      <p className="lead center">{t("Here is what I've noticed, in your words.")}</p>
      <p className="small center">{t('You can remove anything that is not you.')}</p>
      <button className="btn" onClick={() => setOpened(true)}>{t('Open')}</button>
    </div>
  );

  const Back = () => <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setView(null)}>← {t('Back')}</button>;
  const Item = ({ r }) => (
    <div className="mitem"><p dir="auto">{txt(r)}</p>{r.quote && <Quote q={r.quote} onQuote={goQuote} />}<button className="link small" onClick={() => db.insights.delete(r.id)}>{t('Not me')}</button></div>
  );
  const Sit = ({ q }) => <div className="sit"><span className="small">{t('A question to sit with')}</span><p dir="auto">{q}</p></div>;
  const Page = ({ title, intro, children }) => <motion.div className="mpage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><Back /><h2>{title}</h2>{intro && <p className="small">{intro}</p>}{children}</motion.div>;
  const MeRow = ({ title, count, onClick, sub }) => <button className="lrow big" onClick={onClick}><span>{title}{sub && <span className="small" style={{ display: 'block', fontFamily: 'var(--body)' }}>{sub}</span>}</span><span className="small">{count}</span></button>;

  if (view === 'noticing') return (
    <Page title={t('Noticing')} intro={t('Each time you see it, you are watching it and not only inside it.')}>
      {answered > 0 && <div className="mitem"><p>{t('{a} of {b} times you checked again, it was lower.', { a: lowered, b: answered })}</p></div>}
      {noticed.map((x) => (
        <div className="mitem" key={x.at}>
          <span className="small">{new Date(x.at).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <p>{x.feeling ? t(x.feeling) : ''} · {x.intensity}/10{x.after ? ' → ' + ({ lower: t('lower'), same: t('the same'), higher: t('higher') }[x.after]) : ''}</p>
        </div>
      ))}
      <Sit q={t('What tends to come right before it starts?')} />
    </Page>);
  if (view === 'moving') return (
    <Page title={t('How you are moving')} intro={t('How each day connects to the ones before it. These are guesses, and you know yourself best.')}>
      {(newer.length > 0 || quieter.length > 0) && (
        <div className="mitem">
          {newer.length > 0 && <p><b style={{ fontWeight: 500 }}>{t('New lately')}:</b> {newer.join(', ')}</p>}
          {quieter.length > 0 && <p><b style={{ fontWeight: 500 }}>{t('Quieter lately')}:</b> {quieter.join(', ')}</p>}
        </div>
      )}
      {[...growthRows].reverse().map((x) => (
        <button className="mitem tapitem" key={x.id} onClick={() => open('entry', { id: x.id })} style={{ textAlign: 'start', background: 'none', border: 0, borderBottom: '1px solid rgba(37,38,74,.1)' }}>
          <span className="small">{new Date(x.created).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <span dir="auto">{x.reflection.growth}</span>
        </button>
      ))}
      <Sit q={t('Looking at these days in a row, what would you say has changed in you since the first one?')} />
    </Page>);
  if (view === 'strengths') return (
    <Page title={t('What you are good at')} intro={t('Strengths are things that feel like you and give you energy. This is a way of seeing yourself, not a test.')}>
      {strengthsR.map(([id, hits]) => (<div className="mitem" key={id}><b style={{ fontWeight: 500 }}>{nm(STRENGTHS[id], he)} <span className="small">· {hits.length}×</span></b><p>{nm(STRENGTHS[id].what, he)}</p><Quote q={hits[hits.length - 1].quote} onQuote={goQuote} /><p className="small">{t('The other side:')} {nm(STRENGTHS[id].shadow, he)}</p></div>))}
      {strengthI.map((r) => <Item key={r.id} r={r} />)}
      <Sit q={t('Think of one place where this strength protected you, and one where it cost you something.')} />
    </Page>);
  if (view === 'traps') return (
    <Page title={t('What tends to come up')} intro={t('Habits of thinking and recurring themes, so you can meet them gently. Not flaws.')}>
      {trapsR.map(([id, hits]) => (<div className="mitem" key={id}><b style={{ fontWeight: 500 }}>{nm(TRAPS[id], he)} <span className="small">· {hits.length}×</span></b><p>{nm(TRAPS[id].what, he)}</p><Quote q={hits[hits.length - 1].quote} onQuote={goQuote} /></div>))}
      {themes.map((th) => <div className="mitem" key={th.id}><b style={{ fontWeight: 500 }}>{he && th.he ? th.he : th.en}</b>{(th.desc || th.descHe) && <p className="small" dir="auto">{he && th.descHe ? th.descHe : th.desc}</p>}<button className="link small" onClick={() => db.insights.delete(th.id)}>{t('Not me')}</button></div>)}
      <Sit q={t('Whose voice does this sound like, and when did you first hear it?')} />
    </Page>);
  if (view === 'feelings') return (
    <Page title={t('Feelings')} intro={t('The feelings you named, and what happened to them. Feelings move.')}>
      {feelR.map(([name, hits]) => (<div className="mitem" key={name}><b style={{ fontWeight: 500 }}>{name} <span className="small">· {hits.length}×</span></b><Quote q={hits[hits.length - 1].quote} onQuote={goQuote} />{passed[name] && <p className="small">{t('Later you said it was')}: {passed[name].map((v) => PASS[v] || v).join(', ')}</p>}</div>))}
      <Sit q={t('Which of these feelings have you not yet let speak in full?')} />
    </Page>);
  if (view === 'helps') return (
    <Page title={t('What helps you')}>
      {words.map((w) => <div className="mitem" key={w.id}><p className="lead" dir="auto">“{w.quote}”</p></div>)}
      {steady.map((r) => <Item key={r.id} r={r} />)}
      {helped.map((h) => <div className="mitem" key={h}><p>{h}</p></div>)}
      {aces > 0 && <div className="mitem"><p>{t('You have {n} aces in your pocket.', { n: aces })}</p></div>}
    </Page>);
  if (view === 'wonder') return <Page title={t('Still wondering')}>{wonder.map((r) => <Item key={r.id} r={r} />)}</Page>;

  return (
    <motion.div className="mpage" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
      <h2>{t('What I notice')}</h2>
      <MeRow title={he ? 'מי אני' : 'Who I am'} count="" sub={he ? 'ערכים, מי אני, מי אני הופכ/ת להיות' : 'Values, who I am, who I am becoming'} onClick={() => open('self')} />
      <MeRow title={he ? 'צ׳ק-אין שבועי' : 'Weekly check-in'} count="" onClick={() => open('weekly')} />
      {nNotice > 0 && <MeRow title={t('Noticing')} count={nNotice} onClick={() => setView('noticing')} />}
      {nMoving > 0 && <MeRow title={t('How you are moving')} count={nMoving} onClick={() => setView('moving')} />}
      {nStrength > 0 && <MeRow title={t('What you are good at')} count={nStrength} onClick={() => setView('strengths')} />}
      {nTraps > 0 && <MeRow title={t('What tends to come up')} count={nTraps} onClick={() => setView('traps')} />}
      {nFeel > 0 && <MeRow title={t('Feelings')} count={nFeel} onClick={() => setView('feelings')} />}
      {nHelps > 0 && <MeRow title={t('What helps you')} count={nHelps} onClick={() => setView('helps')} />}
      {wonder.length > 0 && <MeRow title={t('Still wondering')} count={wonder.length} onClick={() => setView('wonder')} />}
    </motion.div>
  );
}

function Pocket({ open }) {
  const { t } = useI18n();
  const words = useQuery(() => db.insights.where('kind').equals('myword').toArray(), [], []);
  const answers = useQuery(() => db.answers.toArray(), [], []);
  const refl = useQuery(() => db.reflections.toArray(), [], []);
  const lights = [...new Set([...['fills', 'myself'].flatMap((q) => (answers.find((a) => a.qid === q) || {}).value || []).filter((v) => v !== 'Not sure' && v !== t('Not sure')), ...refl.flatMap((x) => ((x.reflection && !x.sample && x.reflection.lights) || []).map((l) => l.what))])];
  return (
    <div className="plain">
      <section className="grp"><span className="eyebrow">{t('Aces')}</span><Aces open={open} /></section>
      <section className="grp"><span className="eyebrow">{t('My words')}</span>
        {words.length ? words.map((w) => <div className="mitem" key={w.id}><p className="lead" dir="auto">“{w.quote}”</p><button className="link small" onClick={() => db.insights.delete(w.id)}>{t('Remove')}</button></div>) : <p className="small">{t('Sentences of yours that steady you will collect here. After a reflection, you can add one.')}</p>}
      </section>
      <section className="grp"><span className="eyebrow">{t('What lights me up')}</span>
        {lights.length ? <div className="wrapchips">{lights.map((l) => <span className="tag" key={l}>{l}</span>)}</div> : <p className="small">{t('Things and people that bring you joy collect here as you talk.')}</p>}
      </section>
    </div>
  );
}

export function Aces({ open }) {
  const { t } = useI18n();
  const aces = useQuery(() => db.aces.orderBy('created').reverse().toArray(), [], []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button className="btn soft" onClick={() => open('ace')}><Icon n="plus" size={20} /> {t('Add an ace')}</button>
      {aces.length === 0 ? <div className="card"><p>{t("Your aces are proof of hard things you've handled. Add one any time.")}</p></div> : (
        <div className="acegrid">{aces.map((a) => <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ width: '100%' }}><AceCard text={a.text} small={a.kind === 'small'} /></div><button className="link" style={{ fontSize: 14 }} onClick={() => db.aces.delete(a.id)}>{t('Remove')}</button></div>)}</div>
      )}
    </div>
  );
}

function About({ open }) {
  const { t, C } = useI18n();
  const { QUESTIONS } = C;
  const answers = useQuery(() => db.answers.toArray(), [], []);
  const label = (id) => id === 'dealing' ? t('What you are dealing with') : id === 'goal' ? t('What you want from this') : (QUESTIONS.find((q) => q.id === id) || {}).text || id;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ background: '#E3ECEA' }}>
        <h3>{t("What I'm learning about you")}</h3>
        <p className="small">{t('Only what you told me. You can remove any of it.')}</p>
      </div>
      <h3>{t('Strengths I see in you')}</h3>
      <InsightList kinds={['strength']} />
      <h3>{t('Things I am still wondering')}</h3>
      <InsightList kinds={['open']} />
      <h3>{t('What you told me')}</h3>
      {answers.length === 0 && <div className="card"><p>{t('Nothing yet. A tiny question shows up on Today now and then.')}</p></div>}
      {answers.map((a) => (
        <div className="card" key={a.qid}>
          <span className="eyebrow">{label(a.qid)}</span>
          <div className="wrapchips">{(a.value || []).map((v) => <span className="tag" key={v}>{v}</span>)}</div>
          {a.text && <p dir="auto">{a.text}</p>}
          <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => db.answers.delete(a.qid)}>{t('Remove')}</button>
        </div>
      ))}
    </div>
  );
}

export default function Archive({ open }) {
  const { t } = useI18n();
  const [seg, setSeg] = useState('time');
  return (
    <div className="screen plain">
      <h1>{t('Your archive')}</h1>
      <Seg value={seg} onChange={setSeg} items={[['time', t('Timeline')], ['me', t('Me')], ['aces', t('Pocket')]]} />
      {seg === 'time' && <Timeline open={open} />}
      {seg === 'aces' && <Pocket open={open} />}
      {seg === 'me' && <Me open={open} />}
      <div style={{ height: 8 }} />
    </div>
  );
}
