import React from 'react';
import { motion } from 'motion/react';
import Blob, { Landscape, Sun } from './Blob.jsx';
import { db, useQuery, useSetting, setSetting } from './db.js';
import { useI18n } from './i18n.jsx';
import { Helpful, Icon } from './ui.jsx';
import { chooseOne } from './guide.js';

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function QuestionCard({ q, onDone }) {
  const { t } = useI18n();
  const [sel, setSel] = React.useState([]);
  const toggle = (o) => setSel(q.multi ? (sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o]) : [o]);
  const save = async (val) => { await db.answers.put({ qid: q.id, value: val, at: Date.now() }); onDone && onDone(); };
  return (
    <div className="card">
      <span className="eyebrow">{t('A tiny question')}</span>
      <h3>{q.text}</h3>
      <div className="wrapchips">
        {q.options.map((o) => <button key={o} className={'tag' + (sel.includes(o) ? ' sel' : '')} onClick={() => toggle(o)} aria-pressed={sel.includes(o)} style={{ minHeight: 44 }}>{o}</button>)}
      </div>
      <div className="fb">
        <button onClick={() => save([t('Not sure')])}>{t('Not sure')}</button>
        <button className="on" disabled={!sel.length} onClick={() => save(sel)} style={{ opacity: sel.length ? 1 : 0.45 }}>{t('Save')}</button>
      </div>
    </div>
  );
}

export default function Today({ open }) {
  const { t, C, lang } = useI18n();
  const { MESSAGES } = C;
  const [tone] = useSetting('tone', 'direct');
  const [name] = useSetting('name', '');
  const checks = useQuery(() => db.checks.orderBy('created').reverse().limit(30).toArray(), []);
  const aceCount = useQuery(() => db.aces.count(), [], 0);
  const words = useQuery(() => db.insights.where('kind').equals('myword').toArray(), [], []);
  const sets = useQuery(() => db.settings.toArray(), [], []);
  const refl = useQuery(() => db.reflections.toArray(), [], []);

  const today = checks.find((c) => c.created >= startOfDay());
  const pick = async (m) => { await db.checks.add({ created: Date.now(), mood: m }); if (navigator.vibrate) navigator.vibrate(15); };
  const fbs = {}; sets.filter((s) => s.key.startsWith('fb:tool:')).forEach((s) => { fbs[s.key.slice(8)] = s.value; });
  const uses = sets.filter((s) => s.key.startsWith('use:') && s.value).map((s) => s.value);
  const guide = today ? chooseOne({ tools: C.TOOLS, uses, fbs, mood: today.mood, helpedDone: uses }) : null;
  const answeredKeys = new Set(sets.filter((s) => s.key.startsWith('passed:')).map((s) => s.key));
  const ask = (() => {
    const old = refl.filter((x) => x.reflection && !x.sample && Date.now() - x.created > 8 * 3600e3 && Date.now() - x.created < 5 * 86400e3 && (x.reflection.feelings || []).length).sort((a, b) => b.created - a.created);
    for (const x of old) { for (const f of x.reflection.feelings) { if (!f.pleasant && !answeredKeys.has('passed:' + x.id + '|' + f.name)) return { x, f }; } }
    return null;
  })();
  const answerPass = (v) => db.settings.put({ key: 'passed:' + ask.x.id + '|' + ask.f.name, value: v });
  const pocketCount = aceCount + words.length;
  const hour = new Date().getHours();
  const hi = hour < 12 ? t('Good morning') : hour < 18 ? t('Hello') : t('Good evening');
  const w = today && today.mood === 'hard' && words.length ? words[Math.floor(Date.now() / 86400000) % words.length] : null;

  return (
    <div className="screen calm">
      <div className="top">
        <div><span className="eyebrow">{new Date().toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'short' })}</span><h1>{hi}{name ? ', ' + name : ''}</h1></div>
        <button className="acepill" onClick={() => open('aces')} aria-label={`${t('Your aces')}, ${aceCount}`}><Sun size={22} color="#25264A" />{aceCount}</button>
      </div>

      <div className="grow hero">
        <button className="bigmic" onClick={() => open('talk')} aria-label={t('Talk')}><Icon n="mic" size={64} color="#fff" /></button>
        <p className="lead center">{t("Say what's on your mind.")}</p>
        <p className="small center">{t('A minute is plenty. It does not have to be organized.')}</p>
      </div>

      <div className="below">
        {!today ? (
          <div className="moodrow">
            <span className="small">{t('How heavy is today?')}</span>
            <div className="pills">
              {[['good', t('Lighter')], ['soso', t('Okay')], ['hard', t('Heavy')]].map(([m, l]) => <button key={m} className="pill" onClick={() => pick(m)}>{l}</button>)}
            </div>
          </div>
        ) : (
          <>
            {guide && guide.pick && (
              <div className="hl">
                <span className="small">{t('One small thing for today')}</span>
                <b className="lead" style={{ fontWeight: 400 }}>{guide.pick.title}</b>
                <p className="small">{guide.pick.why}</p>
                <button className="btn" onClick={() => open('picker', { toolId: guide.pick.id })}>{t("Okay, let's do it")}</button>
                {guide.other && <button className="link" onClick={() => open('picker', { toolId: guide.other.id })}>{t('Something else')}</button>}
              </div>
            )}
          </>
        )}
        {ask && (
          <div className="moodrow">
            <span className="small" dir="auto">{t('You named {f} earlier. How is it now?', { f: ask.f.name })}</span>
            <div className="pills">{[['gone', t('gone')], ['smaller', t('smaller')], ['same', t('the same')], ['bigger', t('bigger')]].map(([v, l]) => <button key={v} className="pill" style={{ fontSize: 14 }} onClick={() => answerPass(v)}>{l}</button>)}</div>
          </div>
        )}
        {pocketCount > 0 && <button className="link center small" onClick={() => open('aces')}>{t('You have something in your pocket')}</button>}
        <button className="link center" onClick={() => open('picker')}>{t('Not ready to talk? Help me find one thing')}</button>
      </div>
    </div>
  );
}
