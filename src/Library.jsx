import React, { useState } from 'react';
import { db, useQuery } from './db.js';
import { useI18n } from './i18n.jsx';
import { Seg, Helpful, Icon } from './ui.jsx';
import { EXPLAINERS } from './explainers.js';

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
  const { t, C } = useI18n();
  const { LIGHTS, TOOLS, ALLOWED_EXAMPLES } = C;
  const fbs = useQuery(() => db.settings.where('key').startsWith('fb:').toArray(), [], []);
  const allowed = useQuery(() => db.allowed.toArray(), [], []);
  const [txt, setTxt] = useState('');
  const mine = useQuery(() => db.toolbox.toArray(), [], []);
  const [own, setOwn] = useState('');
  const addOwn = async () => { const v = own.trim(); if (!v) return; await db.toolbox.add({ created: Date.now(), kind: 'mine', text: v }); setOwn(''); };
  const [warn, setWarn] = useState(false);
  const answers = useQuery(() => db.answers.toArray(), [], []);
  const good = fbs.filter((f) => f.value === 'helped');
  const title = (k) => { const [, kind, id] = k.split(':'); return ((kind === 'light' ? LIGHTS : TOOLS).find((x) => x.id === id) || {}).title || id; };
  const best = ['fills', 'myself'].flatMap((q) => (answers.find((a) => a.qid === q) || {}).value || []).filter((v) => v !== 'Not sure' && v !== t('Not sure'));
  const add = async (v) => {
    const t = v.trim(); if (!t) return;
    if (/self.?harm|hurt myself|starv|purge|not eat|להרעיב|לפגוע בעצמי/i.test(t)) { setWarn(true); return; }
    setWarn(false);
    if (!allowed.some((a) => a.text === t)) await db.allowed.add({ created: Date.now(), text: t });
    setTxt('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card"><h3>{t('Things that helped me')}</h3>{good.length ? <div className="wrapchips">{good.map((f) => <span className="tag" key={f.key}>{title(f.key)}</span>)}</div> : <p className="small">{t('Tap “This helped” on a card and it lands here.')}</p>}
        {mine.filter((m) => m.text).map((m) => <button key={m.id} className="tag sel" dir="auto" onClick={() => db.toolbox.delete(m.id)} aria-label={`${t('Remove')} ${m.text}`}>{m.text} ×</button>)}
        <p className="small">{t('Add something that helped you that is not on a card.')}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={own} onChange={(e) => setOwn(e.target.value)} dir="auto" placeholder={t('For example: loud music while walking')} aria-label={t('Add something that helped you that is not on a card.')} style={{ flex: 1, minWidth: 0, height: 48, borderRadius: 24, border: 0, padding: '0 16px', fontSize: 16, background: '#fff' }} />
          <button className="iconbtn" onClick={addOwn} aria-label={t('Add')}><Icon n="plus" size={20} /></button>
        </div></div>
      <div className="card">
        <h3>{t("Things I'm not judging myself for")}</h3>
        <p className="small">{t('In hard times, some things are just ok. Add yours.')}</p>
        <div className="wrapchips">
          {allowed.map((a) => <button key={a.id} className="tag sel" onClick={() => db.allowed.delete(a.id)} aria-label={`${t('Remove')} ${a.text}`}>{a.text} ×</button>)}
          {ALLOWED_EXAMPLES.filter((e) => !allowed.some((a) => a.text === e)).map((e) => <button key={e} className="tag" onClick={() => add(e)}>+ {e}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={t('Add your own')} dir="auto" aria-label={t('Add your own')} style={{ flex: 1, minWidth: 0, height: 48, borderRadius: 24, border: 0, padding: '0 16px', fontSize: 16, background: '#fff' }} />
          <button className="iconbtn" onClick={() => add(txt)} aria-label={t('Add')}><Icon n="plus" size={20} /></button>
        </div>
        {warn && <p className="small">{t('That one is something to talk about with a person, not to put on this list. The Support page in More has people to call.')}</p>}
      </div>
      <div className="card">
        <h3>{t('Me at my best')}</h3>
        {best.length ? <div className="wrapchips">{best.map((b) => <span className="tag" key={b}>{b}</span>)}{['fills', 'myself'].map((q) => (answers.find((a) => a.qid === q) || {}).text).filter(Boolean).map((tx) => <p key={tx} dir="auto" style={{ width: '100%' }}>{tx}</p>)}</div> : <p className="small">{t('Answer the tiny questions on Today and the things that fill you up collect here.')}</p>}
      </div>
    </div>
  );
}

export default function Library({ onClose, open }) {
  const { t, C, he } = useI18n();
  const { LIGHTS, TOOLS } = C;
  const [seg, setSeg] = useState('watch');
  return (
    <div className="screen">
      <div className="top"><h1>{t('Library')}</h1>{onClose && <button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button>}</div>
      <Seg value={seg} onChange={setSeg} items={[['watch', t('Watch')], ['lights', t('Little lights')], ['tools', t('Try this')], ['mine', t('Mine')]]} />
      {seg === 'watch' && EXPLAINERS.map((x) => <button key={x.id} className="lrow big" onClick={() => open && open('explainer', { id: x.id })}><span>{x[he ? 'he' : 'en'].title}<span className="small" style={{ display: 'block', fontFamily: 'var(--body)' }}>{x.minutes} {t('min')}</span></span><Icon n="chev" size={18} /></button>)}
      {seg === 'lights' && LIGHTS.map((l) => (
        <Item key={l.id} title={l.title} kind="light" id={l.id}>
          <p><b>{t('What research found.')}</b> {l.finding}</p><p><b>{t('For you.')}</b> {l.forYou}</p><p><b>{t('Try it.')}</b> {l.tryIt}</p><p className="small">{l.caveat}</p>
        </Item>
      ))}
      {seg === 'tools' && TOOLS.map((tl) => (
        <Item key={tl.id} title={tl.title} kind="tool" id={tl.id}>
          <p><b>{t('Why.')}</b> {tl.why}</p>
          <ol style={{ paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>{tl.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          <p className="small">{t('For example:')} {tl.example}</p>
        </Item>
      ))}
      {seg === 'mine' && <Mine />}
      <div style={{ height: 8 }} />
    </div>
  );
}
