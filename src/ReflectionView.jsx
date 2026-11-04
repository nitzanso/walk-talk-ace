import React, { useState } from 'react';
import { db } from './db.js';
import { useI18n } from './i18n.jsx';
import { Icon, Helpful } from './ui.jsx';
import { TRAPS, STRENGTHS, nm } from './knowledge.js';

const QUAD = (f) => (f.pleasant ? (f.energy === 'high' ? '#F2B24A' : '#8CC7A1') : (f.energy === 'high' ? '#E58C7B' : '#7FA6D6'));

function Row({ title, count, children, startOpen }) {
  const [o, setO] = useState(!!startOpen);
  return (
    <div className="rrow">
      <button className="lrow" onClick={() => setO(!o)} aria-expanded={o}><span>{title}</span><span className="small">{count}</span><Icon n="chev" size={18} /></button>
      {o && <div className="rbody">{children}</div>}
    </div>
  );
}

export default function ReflectionView({ r, allowPocket }) {
  const { t, he, C } = useI18n();
  const [added, setAdded] = useState(false);
  const feelings = r.feelings || [];
  const traps = r.traps || [];
  const strengths = (r.strengths || []).filter((s) => STRENGTHS[s.id]);
  const lights = r.lights || [];
  const toolId = r.tool || (traps[0] && TRAPS[traps[0].id] && TRAPS[traps[0].id].tool);
  const tool = C.TOOLS.find((x) => x.id === toolId);
  const addPocket = async () => { await db.insights.add({ kind: 'myword', quote: r.steadying.quote, created: Date.now() }); setAdded(true); };
  return (
    <div className="refl">
      <p className="lead">{r.headline || r.process}</p>
      {r.headline && r.process && <p className="small">{r.process}</p>}

      {(r.heard || r.underneath || r.holding) && (
        <Row title={t('In more depth')} count="" startOpen>
          {r.heard && <div className="mitem"><span className="small">{t('What I heard')}</span><p dir="auto">{r.heard}</p></div>}
          {r.underneath && <div className="mitem"><span className="small">{t('What may be underneath')}</span><p dir="auto">{r.underneath}</p></div>}
          {r.holding && <div className="mitem"><span className="small">{t('What you are carrying, and doing well')}</span><p dir="auto">{r.holding}</p></div>}
        </Row>
      )}
      {feelings.length > 0 && (
        <Row title={t('Feelings I heard')} count={feelings.length} startOpen>
          {feelings.map((f) => (
            <div className="fl" key={f.name + f.quote}><span className="dot" style={{ background: QUAD(f) }} /><div><b style={{ fontWeight: 500 }}>{f.name}</b><span className="small" dir="auto" style={{ display: 'block', fontStyle: 'italic' }}>“{f.quote}”</span></div></div>
          ))}
          <p className="small">{t('Color shows where a feeling sits: yellow, bright and pleasant; green, calm and pleasant; red, tense and unpleasant; blue, low and unpleasant. None of them is bad.')}</p>
        </Row>
      )}
      {traps.length > 0 && (
        <Row title={t('A thinking trap')} count={traps.length}>
          {traps.map((x) => TRAPS[x.id] && (
            <div className="mitem" key={x.id}>
              <b style={{ fontWeight: 500 }}>{nm(TRAPS[x.id], he)}</b>
              <p className="small" dir="auto" style={{ fontStyle: 'italic' }}>“{x.quote}”</p>
              <p>{x.why || nm(TRAPS[x.id].what, he)}</p>
              <p className="small">{nm(TRAPS[x.id].why, he)}</p>
              <p><b style={{ fontWeight: 500 }}>{t('To try:')}</b> {nm(TRAPS[x.id].tryIt, he)}</p>
            </div>
          ))}
          <p className="small">{t('A trap is a habit of thinking, not a flaw. Sadness and anger are never traps.')}</p>
        </Row>
      )}
      {strengths.length > 0 && (
        <Row title={t('A strength I saw')} count={strengths.length}>
          {strengths.map((x) => (
            <div className="mitem" key={x.id}>
              <b style={{ fontWeight: 500 }}>{nm(STRENGTHS[x.id], he)}</b>
              <p className="small" dir="auto" style={{ fontStyle: 'italic' }}>“{x.quote}”</p>
              <p>{x.how || nm(STRENGTHS[x.id].what, he)}</p>
              <p className="small">{t('The other side:')} {nm(STRENGTHS[x.id].shadow, he)}</p>
            </div>
          ))}
        </Row>
      )}
      {lights.length > 0 && (
        <Row title={t('What seems to bring you joy')} count={lights.length}>
          {lights.map((x) => <div className="mitem" key={x.what}><b style={{ fontWeight: 500 }}>{x.what}</b><p className="small" dir="auto" style={{ fontStyle: 'italic' }}>“{x.quote}”</p></div>)}
        </Row>
      )}
      {r.newThing && <Row title={t('What was new')} count=""><p>{r.newThing}</p></Row>}
      {r.steadying && (
        <Row title={t('A sentence of yours that steadies')} count="" startOpen>
          <p className="lead" dir="auto">“{r.steadying.quote}”</p>
          {allowPocket && (added ? <p className="small">{t('Saved in your pocket.')}</p> : <button className="link" style={{ alignSelf: 'flex-start' }} onClick={addPocket}>{t('Add to my pocket')}</button>)}
        </Row>
      )}
      {(tool || r.invitation) && (
        <Row title={t('One thing to try')} count="" startOpen>
          {tool ? (<>
            <b style={{ fontWeight: 500 }}>{tool.title}</b>
            <p>{tool.why}</p>
            <ol style={{ paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>{tool.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <p className="small">{t('For example:')} {tool.example}</p>
            {allowPocket && <Helpful kind="tool" id={tool.id} />}
          </>) : <p>{r.invitation}</p>}
        </Row>
      )}
    </div>
  );
}
