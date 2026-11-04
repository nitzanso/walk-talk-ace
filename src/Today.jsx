import React from 'react';
import { motion } from 'motion/react';
import Blob, { Landscape, Sun } from './Blob.jsx';
import { db, useQuery, useSetting, setSetting } from './db.js';
import { useI18n } from './i18n.jsx';
import { Helpful, Icon } from './ui.jsx';

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
  const { MESSAGES, LIGHTS, QUESTIONS } = C;
  const [tone] = useSetting('tone', 'direct');
  const [name] = useSetting('name', '');
  const [skipQ, , qReady] = useSetting('skipQ', {});
  const [since] = useSetting('onboardedAt', Date.now());
  const checks = useQuery(() => db.checks.orderBy('created').reverse().limit(30).toArray(), []);
  const aceCount = useQuery(() => db.aces.count(), [], 0);
  const answers = useQuery(() => db.answers.toArray(), []);
  const words = useQuery(() => db.insights.where('kind').equals('myword').toArray(), [], []);
  const fbs = useQuery(() => db.settings.where('key').startsWith('fb:').toArray(), []);
  const total = useQuery(async () => (await db.aces.count()) + (await db.checks.count()) + (await db.entries.count()) + (await db.toolbox.count()), [], 0);

  const [seenV, setSeenV, seenReady] = useSetting('seenV', null);
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
  const hi = hour < 12 ? t('Good morning') : hour < 18 ? t('Hello') : t('Good evening');

  const options = [
    ['picker', 'sun', t('Help me find one thing'), t('Tell me where you are, I offer one small thing')],
    ['talk', 'mic', t('Talk'), t('Say it out loud, walking or not')],
    ['type', 'pen', t('Type'), t('Write a few lines')],
    ['lights', 'sun', t('A little light'), t('A short, researched idea')],
    ['breathe', 'wind', t('Breathe'), t('About 90 seconds')],
  ];

  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">{new Date().toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'short' })}</span><h1>{hi}{name ? ', ' + name : ''}</h1></div>
        <button className="acepill" onClick={() => open('aces')} aria-label={`${t('Your aces')}, ${aceCount}`}><Sun size={26} color="#25264A" />{aceCount}</button>
      </div>

      <Landscape mood={mood} />
      {seenReady && seenV !== 3 && (
        <div className="card" style={{ background: '#E3ECEA' }}>
          <span className="eyebrow">{t("What's new")}</span>
          <p>{t('Gentler tools, and a new button below: “Help me find one thing”. It asks where you are and offers just one small thing.')}</p>
          <div className="fb"><button className="on" onClick={() => setSeenV(3)}>{t('Got it')}</button></div>
        </div>
      )}

      {!today ? (
        <div className="card">
          <h3>{t('How is today?')}</h3>
          <div className="moods">
            {[['good', t('Good')], ['soso', t('So-so')], ['hard', t('Hard')]].map(([m, l]) => (
              <motion.button key={m} className="mood" whileTap={{ scale: 0.95 }} onClick={() => pick(m)}><Blob mood={m} size={52} />{l}</motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card"><p>{MESSAGES[tone][today.mood]}</p></div>
      )}
      {today && today.mood === 'hard' && words.length > 0 && (() => { const w = words[Math.floor(Date.now() / 86400000) % words.length]; return (
        <div className="card" style={{ background: '#FFF3CF' }}>
          <span className="eyebrow">{t('From you, on a steadier day')}</span>
          <p dir="auto" style={{ fontFamily: 'var(--display)', fontSize: 20, lineHeight: 1.35 }}>“{w.quote}”</p>
          <p className="small">{new Date(w.created).toLocaleDateString(lang, { day: 'numeric', month: 'long' })}</p>
        </div>); })()}

      <div>
        <h2 style={{ marginBottom: 10 }}>{t('What would help right now?')}</h2>
        <div className="chips">
          {options.map(([id, ic, name, sub], i) => (
            <motion.button key={id} className="chip" whileTap={{ scale: 0.98 }} onClick={() => open(id === 'lights' ? 'library' : id)} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'start', background: i === 0 ? 'var(--butter)' : 'var(--card)', minHeight: 64 }}>
              <Icon n={ic} />
              <span style={{ flex: 1 }}>{name}<br /><span className="small" style={{ fontWeight: 400 }}>{sub}</span></span>
              
            </motion.button>
          ))}
        </div>
      </div>

      {light && (
        <div className="lcard">
          <button className="lhead" onClick={() => setLightOpen(!lightOpen)} aria-expanded={lightOpen}>
            <span><span className="eyebrow" style={{ display: 'block' }}>{t('Little light for today')}</span>{light.title}</span>
            <Icon n="chev" />
          </button>
          {lightOpen && (
            <div className="lbody">
              <p><b>{t('What research found.')}</b> {light.finding}</p>
              <p><b>{t('For you.')}</b> {light.forYou}</p>
              <p><b>{t('Try it.')}</b> {light.tryIt}</p>
              <p className="small">{light.caveat}</p>
              <Helpful kind="light" id={light.id} />
            </div>
          )}
        </div>
      )}

      {qToday && <QuestionCard q={q} />}
      {q && <button className="link" onClick={() => setSetting('skipQ', { ...(skipQ || {}), [q.id]: Date.now() })}>{t('Ask me this another day')}</button>}

      <p className="small center">{t("You've shown up {n} times. It never resets.", { n: total })}</p>
      <div style={{ height: 8 }} />
    </div>
  );
}
