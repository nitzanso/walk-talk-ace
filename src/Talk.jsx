import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { addEvent, addRun } from './report.js';
import { db, useSetting } from './db.js';
import { useI18n } from './i18n.jsx';
import { Icon } from './ui.jsx';
import { micPermission, startDictation, dictationSupported, micMessage } from './speech.js';

function HoldButton({ onComplete, label }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(null);
  const start = () => { setHolding(true); timer.current = setTimeout(() => { setHolding(false); onComplete(); }, 700); };
  const cancel = () => { clearTimeout(timer.current); setHolding(false); };
  return (
    <button className="hold" onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onComplete(); }} aria-label={label} onContextMenu={(e) => e.preventDefault()}>
      <span className="fill" style={{ transform: `scaleX(${holding ? 1 : 0})`, transition: holding ? 'transform .7s linear' : 'transform .2s' }} />
      <span>{label}</span>
    </button>
  );
}

export default function Talk({ onDone, onReflect, onCrisis }) {
  const { t, C } = useI18n();
  const [lang, setLang] = useSetting('lang', 'he-IL');
  const [method, setMethod] = useState('live'); // live | record
  const [phase, setPhase] = useState('ready'); // ready | going | result
  const [secs, setSecs] = useState(0);
  const [live, setLive] = useState('');
  const [heard, setHeard] = useState(false);
  const [problem, setProblem] = useState(null); // {message, fatal}
  const [result, setResult] = useState(null);
  const st = useRef({});

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    const s = st.current;
    try { s.dict && s.dict.stop(); } catch {}
    try { s.mr && s.mr.state !== 'inactive' && s.mr.stop(); } catch {}
    try { s.stream && s.stream.getTracks().forEach((t) => t.stop()); } catch {}
    try { s.lock && s.lock.release(); } catch {}
    clearInterval(s.tick);
    if (s.vis) document.removeEventListener('visibilitychange', s.vis);
  }

  async function requestLock() {
    try {
      if ('wakeLock' in navigator) { st.current.lock = await navigator.wakeLock.request('screen'); addEvent('wake lock granted'); return 'granted'; }
      return 'not supported';
    } catch (e) { addEvent('wake lock refused ' + e.name); return 'refused'; }
  }

  async function start(chosen = method) {
    const s = st.current;
    cleanup();
    Object.assign(s, { started: Date.now(), events: [], chunks: [], method: chosen });
    setMethod(chosen); setLive(''); setSecs(0); setHeard(false); setProblem(null); setResult(null);
    addEvent(`start ${chosen} ${lang}`);

    const perm = await micPermission();
    if (!perm.ok) {
      addRun(`${chosen} ${lang}: mic ${perm.code}`);
      setResult({ error: perm.message, code: perm.code }); setPhase('result'); return;
    }
    s.lockState = await requestLock();
    s.vis = () => { s.events.push(`${Math.round((Date.now() - s.started) / 1000)}s page ${document.visibilityState}`); if (document.visibilityState === 'visible') requestLock(); };
    document.addEventListener('visibilitychange', s.vis);
    s.tick = setInterval(() => setSecs(Math.round((Date.now() - s.started) / 1000)), 1000);

    try {
      if (chosen === 'live') {
        if (!dictationSupported()) { setProblem({ message: "Live words isn't available in this browser. Recording audio instead is possible.", fatal: true }); setPhase('going'); return; }
        await new Promise((r) => setTimeout(r, 200));
        s.dict = startDictation({
          lang,
          onText: (t) => { setLive(t); },
          onAudio: () => setHeard(true),
          onError: (e) => { s.events.push('speech ' + e.code); addEvent('speech ' + e.code); setProblem(e); },
        });
      } else {
        s.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
        s.mr = new MediaRecorder(s.stream, mime ? { mimeType: mime } : undefined);
        s.mr.ondataavailable = (e) => { if (e.data && e.data.size) s.chunks.push(e.data); };
        s.mr.start(1000);
      }
      setPhase('going');
    } catch (e) {
      addRun(`${chosen} ${lang}: FAILED ${e.name} ${e.message}`);
      cleanup();
      setResult({ error: e.name === 'NotAllowedError' ? micMessage(e.name) : t('The recording did not start ({n}).', { n: e.name }), code: e.name });
      setPhase('result');
    }
  }

  function stop() {
    const s = st.current;
    const dur = Math.round((Date.now() - s.started) / 1000);
    const common = `${dur}s, wake lock ${s.lockState}, events: ${s.events.join('; ') || 'none'}`;
    const finish = (extra, res) => {
      addRun(`${s.method} ${lang}: ${common}\n${extra}`);
      setResult(res); setPhase('result');
      db.entries.add({ created: Date.now(), kind: 'talk', seconds: dur, text: res.text || undefined, audio: !!res.url }).catch(() => {});
    };
    if (s.method === 'live') {
      const text = (s.dict ? s.dict.stop() : '') || live;
      cleanup();
      finish(`TRANSCRIPT: ${text || '(empty)'}`, { text: (text || '').trim() });
    } else {
      const done = () => {
        const blob = new Blob(s.chunks, { type: s.mr.mimeType });
        cleanup();
        finish(`audio ${s.mr.mimeType} ${blob.size} bytes`, { url: URL.createObjectURL(blob), size: blob.size });
      };
      s.mr.onstop = done;
      try { s.mr.stop(); } catch { done(); }
    }
  }

  const close = () => { cleanup(); onDone(); };

  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">{t('Walk and talk')}</span><h1>{t('Say it out loud')}</h1></div>
        <button className="iconbtn" onClick={close} aria-label={t('Close')}><Icon n="close" size={20} /></button>
      </div>

      {phase === 'ready' && (
        <>
          <p>{t("Say whatever is on your mind. There's no right way. Keep the screen on and hold the phone however you normally do on a walk.")}</p>
          <div className="pills" role="group" aria-label="Language">
            <button className={'pill' + (lang === 'he-IL' ? ' on' : '')} onClick={() => setLang('he-IL')}>עברית</button>
            <button className={'pill' + (lang === 'en-US' ? ' on' : '')} onClick={() => setLang('en-US')}>English</button>
          </div>
          <div className="grow" />
          <button className="btn" onClick={() => start('live')}><Icon n="mic" color="#fff" size={24} />{t('Start talking')}</button>
          <button className="link" onClick={() => start('record')}>{t('Record the sound only (no text)')}</button>
        </>
      )}

      {phase === 'going' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <motion.div style={{ width: 150, height: 150, borderRadius: '50%', background: 'var(--lav)' }} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
          <h2 className="center">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</h2>
          {problem && (
            <div className="card" style={{ background: '#FFF3CF' }} role="alert">
              <p>{t(problem.message)}</p>
              {problem.fatal && <button className="btn soft" onClick={() => start('record')}>{t('Record the sound instead')}</button>}
            </div>
          )}
          {method === 'live' ? (
            <div className="card" dir="auto" style={{ minHeight: 120 }}>
              <p>{live || (problem ? '' : heard ? t('Listening… start talking.') : t('Starting the microphone…'))}</p>
              {!live && secs > 12 && !problem && <p className="small">{t('Nothing heard yet. Move the phone closer to your mouth, or check that live words is working in this language.')}</p>}
            </div>
          ) : <p className="small center">{t("Recording sound only. It plays back afterwards but isn't turned into text yet.")}</p>}
          <div className="grow" />
          <HoldButton label={t('Hold to stop')} onComplete={stop} />
        </>
      )}

      {phase === 'result' && (
        <>
          {result?.error && <div className="card" style={{ background: '#FFF3CF' }} role="alert"><p>{t(result.error)}</p></div>}
          {result?.text !== undefined && <div className="card" dir="auto"><p>{result.text || t('Nothing was heard this time.')}</p></div>}
          {result?.url && (
            <div className="card">
              <p>{t('Recorded. Play it back:')}</p>
              <audio src={result.url} controls style={{ width: '100%' }} />
              <p className="small">{t("Turning sound into text isn't switched on yet, so this can't be reflected on for now.")}</p>
            </div>
          )}
          <div className="grow" />
          {result?.text && <button className="btn" onClick={() => (C.CRISIS_RE.test(result.text) ? onCrisis() : onReflect(result.text))}>{t('Get my reflection')}</button>}
          <button className="btn alt" onClick={() => start(method)}>{result?.error ? t('Try again') : t('Talk again')}</button>
          <button className="link" onClick={close}>{t('Done for now')}</button>
        </>
      )}
    </div>
  );
}
