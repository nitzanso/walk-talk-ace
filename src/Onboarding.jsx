import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Blob, { Landscape } from './Blob.jsx';
import AceFlow from './AceFlow.jsx';
import { db, setSetting } from './db.js';
import { MESSAGES } from './content.js';
import { Sun } from './Blob.jsx';

const DEALING = ['A breakup or relationship', 'Work or money', 'Loss of someone', 'A big change or move', 'Burnout or exhaustion', 'Loneliness', 'Health', 'Family', 'Something else', 'Not sure'];
const PURPOSE = ['Feel understood', 'Calm down', 'Understand myself', 'Make a decision', 'Build a routine', 'Feel stronger', 'Just try it', 'Not sure'];

const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
};

function Multi({ options, value, onChange }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value.filter((x) => x !== 'Not sure'), o].filter((x) => o === 'Not sure' ? x === 'Not sure' : true));
  return (
    <div className="wrapchips">
      {options.map((o) => <button key={o} className={'tag' + (value.includes(o) ? ' sel' : '')} onClick={() => toggle(o)} aria-pressed={value.includes(o)} style={{ minHeight: 46, fontSize: 16 }}>{o}</button>)}
    </div>
  );
}

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(false);
  const [dealing, setDealing] = useState([]);
  const [purpose, setPurpose] = useState([]);
  const [detail, setDetail] = useState('');
  const [lang, setLang] = useState('he-IL');
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
        <h1 className="center">Which language do you want to talk in?</h1>
        <p className="small center">This is for speaking and writing to me. You can change it later. The app's own words are in English for now.</p>
        <div className="chips">
          {[['he-IL', 'עברית'], ['en-US', 'English']].map(([k, l]) => <button key={k} className={'chip' + (lang === k ? ' sel' : '')} aria-pressed={lang === k} onClick={() => setLang(k)} style={{ fontSize: 22, minHeight: 64 }}>{l}</button>)}
        </div>
        <div className="grow" />
        <button className="btn" onClick={async () => { await setSetting('lang', lang); next(); }}>Continue</button>
      </div>
    );
  } else if (step === 1) {
    body = (
      <div className="screen" style={{ paddingTop: 12 }}>
        <Landscape mood="calm" />
        <div className="center" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          <h1 style={{ fontSize: 34 }}>Walk. Talk.<br />Find your own strength.</h1>
          <p style={{ color: 'var(--muted)' }}>A place to say what's on your mind out loud while you walk, and to see what you already carry.</p>
        </div>
        <div className="grow" />
        <button className="btn" onClick={next}>Begin</button>
      </div>
    );
  } else if (step === 2) {
    body = (
      <div className="screen">
        <Blob mood="calm" size={96} float />
        <h1>Before we start</h1>
        <div className="card">
          <p><b style={{ fontWeight: 500 }}>This is not therapy</b> and it is not a crisis service. It won't diagnose anything.</p>
          <p>The reflections are <b style={{ fontWeight: 500 }}>written by AI</b>. I'm not a person.</p>
          <p>Your words stay on your phone. When you ask for a reflection, the text goes to a service that writes it. Nothing is kept there by us.</p>
          <p>If you ever feel unsafe, there is a Support page in the app with real people to call.</p>
        </div>
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 16 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 24, height: 24, marginTop: 2, accentColor: '#25264A' }} />
          <span>I'm 18 or older, and I understand this.</span>
        </label>
        <div className="grow" />
        <button className="btn" disabled={!agree} onClick={next}>Continue</button>
      </div>
    );
  } else if (step === 3) {
    body = (
      <div className="screen">
        <span className="eyebrow">Question 1 of 2</span>
        <h1>What are you dealing with right now?</h1>
        <p className="small">Pick any that fit, or “Not sure”. You can change this later.</p>
        <Multi options={DEALING} value={dealing} onChange={setDealing} />
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="If you want, say more in a sentence. Or leave it empty." dir="auto" aria-label="More detail" style={{ minHeight: 90 }} />
        <div className="grow" />
        <button className="btn" onClick={next}>{dealing.length ? 'Continue' : 'Skip'}</button>
      </div>
    );
  } else if (step === 4) {
    body = (
      <div className="screen">
        <span className="eyebrow">Question 2 of 2</span>
        <h1>What would you like from this?</h1>
        <p className="small">Pick any that fit, or “Not sure”.</p>
        <Multi options={PURPOSE} value={purpose} onChange={setPurpose} />
        <div className="grow" />
        <button className="btn" onClick={saveProfile}>{purpose.length ? 'Continue' : 'Skip'}</button>
      </div>
    );
  } else if (step === 5) {
    body = (
      <div className="screen">
        <span className="eyebrow">Today</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Blob mood={mood || 'calm'} size={130} float /></div>
        <h2 className="center">How is today?</h2>
        <div className="moods">
          {[['good', 'Good'], ['soso', 'So-so'], ['hard', 'Hard']].map(([m, l]) => (
            <motion.button key={m} className={'mood' + (mood === m ? ' sel' : '')} onClick={() => pickMood(m)} whileTap={{ scale: 0.95 }} aria-pressed={mood === m}>
              <Blob mood={m} size={56} />{l}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {mood && (
            <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p>{MESSAGES.direct[mood]}</p>
              <p className="small">You're here. That's your first way of showing up.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grow" />
        {mood && <button className="btn" onClick={next}>Continue</button>}
      </div>
    );
  } else if (step === 6) {
    body = (
      <div className="screen">
        <div style={{ display: 'flex', justifyContent: 'center' }}><motion.div animate={{ rotate: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity }}><Sun size={96} face /></motion.div></div>
        <span className="eyebrow center">Your first ace</span>
        <h1 className="center" style={{ fontSize: 27 }}>You've already got through hard things</h1>
        <div className="card">
          <p>An <b style={{ fontWeight: 500 }}>ace</b> is a time you got through something difficult, kept in your own words. You'll collect them here, and they're yours to open on a hard day.</p>
          <p><b style={{ fontWeight: 500 }}>Why start with this?</b> Remembering a time you handled something hard reminds your mind that you can.</p>
          <p className="small">In a 2021 study from the University of Zurich (<i>Emotion</i>, 75 distressed people), those who recalled a moment they felt capable found a painful memory less upsetting than those who recalled a pleasant event. It was one session in a lab, not a cure, but it points the right way.</p>
        </div>
        <div className="grow" />
        <button className="btn" onClick={next}>Let's find one</button>
        <button className="link" onClick={finish}>Skip for now</button>
      </div>
    );
  } else {
    body = <AceFlow first onClose={finish} />;
  }
  return <AnimatePresence mode="wait" initial={false}><motion.div key={step} variants={slide} initial="initial" animate="animate" exit="exit" style={{ height: '100%' }}>{body}</motion.div></AnimatePresence>;
}
