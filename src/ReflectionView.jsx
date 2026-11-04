import React, { useState } from 'react';
import { db, findEntryForQuote } from './db.js';
import { useI18n } from './i18n.jsx';
import { Icon } from './ui.jsx';
import { TRAPS, STRENGTHS, nm } from './knowledge.js';

const QUAD = (f) => (f.pleasant ? (f.energy === 'high' ? '#F2B24A' : '#8CC7A1') : (f.energy === 'high' ? '#E58C7B' : '#7FA6D6'));

// A quote of the person's own. Tapping it goes back to what they said that day, with the sentence marked.
export function Quote({ q, onQuote }) {
  const { t } = useI18n();
  if (!q) return null;
  return (
    <button className={'qlink small' + (onQuote ? ' tap' : '')} dir="auto" onClick={() => onQuote && onQuote(q)} disabled={!onQuote} aria-label={`${t('See where I said this')}: ${q}`}>
      “{q}”
    </button>
  );
}

// Only one section is open at a time. Opening one closes the other.
function Section({ id, title, openId, setOpenId, children }) {
  const o = openId === id;
  return (
    <div className="rrow">
      <button className="lrow" onClick={() => setOpenId(o ? null : id)} aria-expanded={o}><span>{title}</span><span style={{ display: 'inline-flex', transform: o ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}><Icon n="chev" size={18} /></span></button>
      {o && <div className="rbody">{children}</div>}
    </div>
  );
}

export default function ReflectionView({ r, allowPocket, onQuote }) {
  const { t, he } = useI18n();
  const [added, setAdded] = useState(false);
  const [skip, setSkip] = useState(false);
  const feelings = r.feelings || [];
  const traps = (r.traps || []).filter((x) => TRAPS[x.id]);
  const strengths = (r.strengths || []).filter((s) => STRENGTHS[s.id]);
  const lights = r.lights || [];
  const action = !skip && r.action && r.action.text ? r.action : null;
  const legacy = !r.reflection ? [r.headline, r.heard, r.underneath, r.holding].filter(Boolean) : [];
  const prose = r.reflection ? [r.reflection] : legacy.length ? legacy : [r.process].filter(Boolean);
  const stood = strengths.length + traps.length > 0;
  const first = feelings.length ? 'feel' : stood ? 'stood' : null;
  const [openId, setOpenId] = useState(first);
  const addPocket = async () => { await db.insights.add({ kind: 'myword', quote: r.steadying.quote, created: Date.now() }); setAdded(true); };
  const notForMe = async () => { setSkip(true); try { await db.settings.put({ key: 'noact:' + Date.now(), value: r.action.text.slice(0, 80) }); } catch {} };
  return (
    <div className="refl">
      <div className="rprose">{prose.map((p, i) => <p key={i} className={i === 0 ? 'lead' : ''} dir="auto">{p}</p>)}</div>

      {r.steadying && (
        <div className="rkeep">
          <span className="small">{t('A sentence of yours to keep')}</span>
          <Quote q={r.steadying.quote} onQuote={onQuote} />
          {allowPocket && (added ? <span className="small">{t('Saved in your pocket.')}</span> : <button className="link small" onClick={addPocket}>{t('Add to my pocket')}</button>)}
        </div>
      )}

      {feelings.length > 0 && (
        <Section id="feel" title={t('What did I feel?')} openId={openId} setOpenId={setOpenId}>
          {feelings.map((f) => (
            <div className="fl" key={f.name + f.quote}><span className="dot" style={{ background: QUAD(f) }} /><div><b style={{ fontWeight: 500 }}>{f.name}</b><Quote q={f.quote} onQuote={onQuote} /></div></div>
          ))}
          <p className="small">{t('Color shows where a feeling sits: yellow, bright and pleasant; green, calm and pleasant; red, tense and unpleasant; blue, low and unpleasant. None of them is bad.')}</p>
        </Section>
      )}

      {stood && (
        <Section id="stood" title={t('What stood out?')} openId={openId} setOpenId={setOpenId}>
          {strengths.map((x) => (
            <div className="mitem" key={x.id}>
              <span className="small">{t('A strength')}</span>
              <b style={{ fontWeight: 500 }}>{nm(STRENGTHS[x.id], he)}</b>
              <Quote q={x.quote} onQuote={onQuote} />
              <p>{x.how || nm(STRENGTHS[x.id].what, he)}</p>
              <p className="small">{t('The other side:')} {nm(STRENGTHS[x.id].shadow, he)}</p>
            </div>
          ))}
          {traps.map((x) => (
            <div className="mitem" key={x.id}>
              <span className="small">{t('A pattern I noticed')}</span>
              <b style={{ fontWeight: 500 }}>{nm(TRAPS[x.id], he)}</b>
              <Quote q={x.quote} onQuote={onQuote} />
              <p>{x.why || nm(TRAPS[x.id].what, he)}</p>
              <p className="small">{t('A habit of thinking, not a flaw. Sadness and anger are never traps.')}</p>
            </div>
          ))}
        </Section>
      )}

      {lights.length > 0 && (
        <Section id="joy" title={t('What lit me up?')} openId={openId} setOpenId={setOpenId}>
          {lights.map((x) => <div className="mitem" key={x.what}><b style={{ fontWeight: 500 }}>{x.what}</b><Quote q={x.quote} onQuote={onQuote} /></div>)}
        </Section>
      )}

      {action && (
        <Section id="act" title={t('Is there one small thing?')} openId={openId} setOpenId={setOpenId}>
          <p dir="auto">{action.text}</p>
          <p className="small">{t('Because you said:')}</p>
          <Quote q={action.quote} onQuote={onQuote} />
          <button className="link small" style={{ alignSelf: 'flex-start' }} onClick={notForMe}>{t('Not for me')}</button>
        </Section>
      )}
    </div>
  );
}
