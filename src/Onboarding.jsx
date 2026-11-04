import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Blob, { Landscape } from './Blob.jsx';
import AceFlow from './AceFlow.jsx';
import { db, setSetting } from './db.js';
import { Sun } from './Blob.jsx';
import { useI18n } from './i18n.jsx';

const DEALING = ['A breakup or relationship', 'Work or money', 'Loss of someone', 'A big change or move', 'Burnout or exhaustion', 'Loneliness', 'Health', 'Family', 'Something else', 'Not sure'];
const PURPOSE = ['Feel understood', 'Calm down', 'Understand myself', 'Make a decision', 'Build a routine', 'Feel stronger', 'Just try it', 'Not sure'];

const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
};

function Multi({ options, value, onChange, none }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : o === none ? [o] : [...value.filter((x) => x !== none), o]);
  return (
    <div className="wrapchips">
      {options.map((o) => <button key={o} className={'tag' + (value.includes(o) ? ' sel' : '')} onClick={() => toggle(o)} aria-pressed={value.includes(o)} style={{ minHeight: 46, fontSize: 16 }}>{o}</button>)}
    </div>
  );
}

export default function Onboarding({ onFinish }) {
  const { t, C } = useI18n();
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(false);
  const [dealing, setDealing] = useState([]);
  const [purpose, setPurpose] = useState([]);
  const [detail, setDetail] = useState('');
  const [lang, setLang] = useState('he-IL');
  const [name, setName] = useState('');
  const [mood, setMood] = useState(null);
  const next = () => setStep((s) => s + 1);

  const saveProfile = async () => {
    await db.answers.put({ qid: 'dealing', value: dealing, text: detail, at: Date.now() });
    await db.answers.put({ qid: 'goal', value: purpose, at: Date.now() });
    await setSetting('tone', 'direct');
    next();
  };
  const pickMood = (m) => { setMood(m); db.checks.add({ created: Date.now(), mood: m }).catch(() => {}); if (navigator.vibrate) navigator.vibrate(15); };
  const finish = async () => { await setSetting('onboardedAt', Date.now()); await setSetting('onboarded', true); onFinish(); };

  let body;
  if (step === 0) {
    body = (
      <div className="screen">
        <Blob mood="calm" size={110} float />
        <h1 className="center" style={{ fontSize: 26 }}>באיזו שפה תרצו לדבר?<br />Which language do you want to use?</h1>
        <p className="small center">אפשר לשנות מאוחר יותר · You can change this later</p>
        <div className="chips">
          {[['he-IL', 'עברית'], ['en-US', 'English']].map(([k, l]) => <button key={k} className={'chip' + (lang === k ? ' sel' : '')} aria-pressed={lang === k} onClick={() => setLang(k)} style={{ fontSize: 22, minHeight: 64 }}>{l}</button>)}
        </div>
        <div className="grow" />
        <button className="btn" onClick={async () => { await setSetting('lang', lang); next(); }}>המשך · Continue</button>
      </div>
    );
  } else if (step === 1) {
    body = (
      <div className="screen" style={{ paddingTop: 12 }}>
        <Landscape mood="calm" />
        <div className="center" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          <h1 style={{ fontSize: 34 }}>{t('Walk. Talk.')}<br />{t('Find your own strength.')}</h1>
          <p style={{ color: 'var(--muted)' }}>{t("A place to say what's on your mind out loud while you walk, and to see what you already carry.")}</p>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} dir="auto" placeholder={t('What should I call you?')} aria-label={t('What should I call you?')} autoComplete="given-name" style={{ height: 56, borderRadius: 28, border: 0, padding: '0 20px', fontSize: 18, background: '#fff', textAlign: 'center' }} />
        <div className="grow" />
        <button className="btn" onClick={async () => { await setSetting('name', name.trim()); next(); }}>{t('Begin')}</button>
      </div>
    );
  } else if (step === 2) {
    body = (
      <div className="screen">
        <Blob mood="calm" size={96} float />
        <h1>{t('Before we start')}</h1>
        <div className="card">
          <p><b style={{ fontWeight: 500 }}>{t('This is not therapy')}</b> {t("and it is not a crisis service. It won't diagnose anything.")}</p>
          <p>{t('The reflections are')} <b style={{ fontWeight: 500 }}>{t('written by AI')}</b>{t(". I'm not a person.")}</p>
          <p>{t('Your words stay on your phone. When you ask for a reflection, the text goes to a service that writes it. Nothing is kept there by us.')}</p>
          <p>{t('If you ever feel unsafe, there is a Support page in the app with real people to call.')}</p>
        </div>
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 16 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 24, height: 24, marginTop: 2, accentColor: '#25264A' }} />
          <span>{t("I'm 18 or older, and I understand this.")}</span>
        </label>
        <div className="grow" />
        <button className="btn" disabled={!agree} onClick={next}>{t('Continue')}</button>
      </div>
    );
  } else if (step === 3) {
    body = (
      <div className="screen">
        <span className="eyebrow">{t('Question 1 of 2')}</span>
        <h1>{t('What are you dealing with right now?')}</h1>
        <p className="small">{t('Pick any that fit, or “Not sure”. You can change this later.')}</p>
        <Multi options={DEALING.map((x) => t(x))} value={dealing} onChange={setDealing} none={t('Not sure')} />
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t('If you want, say more in a sentence. Or leave it empty.')} dir="auto" aria-label={t('More detail')} style={{ minHeight: 90 }} />
        <div className="grow" />
        <button className="btn" onClick={next}>{dealing.length ? t('Continue') : t('Skip')}</button>
      </div>
    );
  } else if (step === 4) {
    body = (
      <div className="screen">
        <span className="eyebrow">{t('Question 2 of 2')}</span>
        <h1>{t('What would you like from this?')}</h1>
        <p className="small">{t('Pick any that fit, or “Not sure”.')}</p>
        <Multi options={PURPOSE.map((x) => t(x))} value={purpose} onChange={setPurpose} none={t('Not sure')} />
        <div className="grow" />
        <button className="btn" onClick={saveProfile}>{purpose.length ? t('Continue') : t('Skip')}</button>
      </div>
    );
  } else if (step === 5) {
    body = (
      <div className="screen">
        <span className="eyebrow">{t('Today')}</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Blob mood={mood || 'calm'} size={130} float /></div>
        <h2 className="center">{t('How is today?')}</h2>
        <div className="moods">
          {[['good', t('Good')], ['soso', t('So-so')], ['hard', t('Hard')]].map(([m, l]) => (
            <motion.button key={m} className={'mood' + (mood === m ? ' sel' : '')} onClick={() => pickMood(m)} whileTap={{ scale: 0.95 }} aria-pressed={mood === m}>
              <Blob mood={m} size={56} />{l}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {mood && (
            <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p>{C.MESSAGES.direct[mood]}</p>
              <p className="small">{t("You're here. That's your first way of showing up.")}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grow" />
        {mood && <button className="btn" onClick={next}>{t('Continue')}</button>}
      </div>
    );
  } else if (step === 6) {
    body = (
      <div className="screen">
        <div style={{ display: 'flex', justifyContent: 'center' }}><motion.div animate={{ rotate: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity }}><Sun size={96} face /></motion.div></div>
        <span className="eyebrow center">{t('Your first ace')}</span>
        <h1 className="center" style={{ fontSize: 27 }}>{t("You've already got through hard things")}</h1>
        <div className="card">
          <p>{t("An ace is a time you got through something difficult, kept in your own words. You'll collect them here, and they're yours to open on a hard day.")}</p>
          <p><b style={{ fontWeight: 500 }}>{t('Why start with this?')}</b> {t('Remembering a time you handled something hard reminds your mind that you can.')}</p>
          <p className="small">{t('In a 2021 study from the University of Zurich (Emotion, 75 distressed people), those who recalled a moment they felt capable found a painful memory less upsetting than those who recalled a pleasant event. It was one session in a lab, not a cure, but it points the right way.')}</p>
        </div>
        <div className="grow" />
        <button className="btn" onClick={next}>{t("Let's find one")}</button>
        <button className="link" onClick={finish}>{t('Skip for now')}</button>
      </div>
    );
  } else {
    body = <AceFlow first onClose={finish} />;
  }
  return <AnimatePresence mode="wait" initial={false}><motion.div key={step} variants={slide} initial="initial" animate="animate" exit="exit" style={{ height: '100%' }}>{body}</motion.div></AnimatePresence>;
}
