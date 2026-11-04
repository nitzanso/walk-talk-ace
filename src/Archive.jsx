import React, { useState } from 'react';
import Blob, { AceCard } from './Blob.jsx';
import { db, useQuery } from './db.js';
import { useI18n } from './i18n.jsx';
import { Seg, Icon } from './ui.jsx';

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

function InsightList({ kinds, empty }) {
  const { t, he } = useI18n();
  const rows = useQuery(() => db.insights.where('kind').anyOf(kinds).toArray(), [kinds.join()], []);
  if (!rows.length) return empty ? <p className="small">{empty}</p> : null;
  return rows.map((r) => (
    <div className="card" key={r.id}>
      <p dir="auto">{he && r.he ? r.he : r.en}</p>
      {r.quote && <p className="small" dir="auto" style={{ fontStyle: 'italic' }}>“{r.quote}”</p>}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="small">{t('How sure I am:')} {t(r.confidence === 'medium' ? 'medium' : 'low')}</span>
        <button className="link" onClick={() => db.insights.delete(r.id)}>{t('Not me')}</button>
      </div>
    </div>
  ));
}

function ThemeMap({ open }) {
  const { t, he, lang } = useI18n();
  const themes = useQuery(() => db.insights.where('kind').equals('theme').toArray(), [], []);
  const entries = useQuery(async () => (await db.entries.toArray()).filter((e) => e.text).sort((a, b) => a.created - b.created), [], []);
  const [openId, setOpenId] = useState(null);
  if (!themes.length) return <div className="card"><p className="small">{t('After a few recordings, themes show up here with the words that point to them.')}</p></div>;
  const groups = [...new Set(themes.map((x) => x.group))];
  const day = (ts) => new Date(ts).toLocaleDateString(lang, { day: 'numeric', month: 'short' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3>{t('What shows up again and again')}</h3>
      <p className="small">{t('Each dot is one recording. A filled dot means the theme was in it. These are my reading of your words, not a diagnosis.')}</p>
      {groups.map((g) => {
        const rows = themes.filter((x) => x.group === g).sort((a, b) => (a.order || 0) - (b.order || 0));
        const head = rows[0];
        return (
          <div className="card" key={g}>
            <span className="eyebrow">{he && head.groupHe ? head.groupHe : head.groupEn}</span>
            {rows.map((th) => {
              const hits = entries.filter((e) => (e.themes || []).includes(th.slug));
              const isOpen = openId === th.slug;
              const last = [...hits].reverse().find((e) => e.themeQuotes && e.themeQuotes[th.slug]);
              return (
                <div key={th.slug} style={{ borderTop: '1px solid rgba(37,38,74,.08)', paddingTop: 10 }}>
                  <button className="lhead" style={{ padding: 0, fontSize: 17 }} onClick={() => setOpenId(isOpen ? null : th.slug)} aria-expanded={isOpen}>
                    <span>{he && th.he ? th.he : th.en}<span className="small" style={{ display: 'block', fontFamily: 'var(--body)' }}>{t('in {a} of {b} recordings', { a: hits.length, b: entries.length })}</span></span>
                    <Icon n="chev" />
                  </button>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '8px 0 2px' }} aria-hidden="true">
                    {entries.map((e) => <span key={e.id} title={day(e.created)} style={{ width: 14, height: 14, borderRadius: '50%', background: (e.themes || []).includes(th.slug) ? th.color || '#25264A' : 'transparent', border: '2px solid ' + (th.color || '#25264A'), opacity: (e.themes || []).includes(th.slug) ? 1 : 0.35 }} />)}
                  </div>
                  <div className="small" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{entries[0] ? day(entries[0].created) : ''}</span><span>{entries.length ? day(entries[entries.length - 1].created) : ''}</span></div>
                  {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      <p>{he && th.descHe ? th.descHe : th.desc}</p>
                      {last && <p className="small" dir="auto" style={{ fontStyle: 'italic' }}>“{last.themeQuotes[th.slug]}” · {day(last.created)}</p>}
                      {th.helps && <><b style={{ fontWeight: 500 }}>{t('What tends to help')}</b><ul style={{ paddingInlineStart: 20 }}>{(he && th.helpsHe ? th.helpsHe : th.helps).map((h) => <li key={h}>{h}</li>)}</ul></>}
                      <div className="wrapchips">{hits.map((e) => <button key={e.id} className="tag" onClick={() => open('entry', { id: e.id })}>{day(e.created)}</button>)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Patterns({ open }) {
  const { t, C } = useI18n();
  const { LIGHTS, TOOLS } = C;
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
        <h3>{t('Recent days')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
          {days.filter((d) => byDay[dayKey(d)] || showed.has(dayKey(d))).map((d) => { const m = byDay[dayKey(d)]; return (
            <div className="day" key={d.toISOString()}>{m ? <Blob mood={m} size={34} /> : <div className="ring" style={{ borderStyle: showed.has(dayKey(d)) ? 'solid' : 'dashed', background: showed.has(dayKey(d)) ? '#fff' : 'transparent' }} />}{d.getDate()}</div>
          ); })}
        </div>
        
      </div>
      <div className="card">
        <h3>{t('How days have felt')}</h3>
        <p>{checks.length ? `${t('Lighter')} ${tally.good} · ${t('Okay')} ${tally.soso} · ${t('Heavy')} ${tally.hard}` : t('Check in a few days and a pattern starts to show.')}</p>
        <p className="small">{t('Days you showed up: {n}. Never a streak, nothing resets.', { n: showed.size })}</p>
      </div>
      <ThemeMap open={open} />
      <h3 style={{ marginTop: 4 }}>{t('What steadies you')}</h3>
      <InsightList kinds={['steadies']} />
      <div className="card">
        <h3>{t('What helped')}</h3>
        {helped.length ? <div className="wrapchips">{helped.map((f) => <span key={f.key} className="tag">{name(f.key)}</span>)}</div> : <p className="small">{t('Tap “This helped” on a card and it collects here.')}</p>}
        {no.length > 0 && <><h3 style={{ marginTop: 6 }}>{t('Not for you')}</h3><div className="wrapchips">{no.map((f) => <span key={f.key} className="tag" style={{ background: '#EEE' }}>{name(f.key)}</span>)}</div><p className="small">{t("I'll show these less.")}</p></>}
      </div>
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
    <div className="screen">
      <h1>{t('Your archive')}</h1>
      <Seg value={seg} onChange={setSeg} items={[['time', t('Timeline')], ['pat', t('Patterns')], ['aces', t('Aces')], ['me', t('About me')]]} />
      {seg === 'time' && <Timeline open={open} />}
      {seg === 'pat' && <Patterns open={open} />}
      {seg === 'aces' && <Aces open={open} />}
      {seg === 'me' && <About open={open} />}
      <div style={{ height: 8 }} />
    </div>
  );
}
