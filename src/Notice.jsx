import React, { useState } from 'react';
import { db } from './db.js';
import { Icon } from './ui.jsx';
import { useI18n } from './i18n.jsx';

const FEELINGS = ['Anxious', 'Angry', 'Sad', 'Numb', 'Overwhelmed', 'Something else'];

// Noticing is the skill. Step 1 names it, step 2 sizes it, step 3 answers by size: very strong means "hold" (do not act, calm the body first), otherwise a gentle choice.
export default function Notice({ onClose, open }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [feel, setFeel] = useState(null);
  const [n, setN] = useState(null);
  const [saved, setSaved] = useState(false);
  const save = async (intensity) => {
    setN(intensity);
    if (!saved) { await db.settings.put({ key: 'notice:' + Date.now(), value: { intensity, feeling: feel, at: Date.now() } }); setSaved(true); }
    setStep(3);
  };
  const high = n >= 7;
  return (
    <div className="screen">
      <div className="top"><span className="eyebrow">{t('Noticing')}</span><button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button></div>
      {step === 0 && (
        <div className="grow hero">
          <h1 className="center">{t('You noticed.')}</h1>
          <p className="lead center">{t('That already counts. Seeing it means you are not only inside it.')}</p>
          <button className="btn" onClick={() => setStep(1)}>{t('Continue')}</button>
          <button className="link" onClick={() => open('explainer', { id: 'spiral' })}>{t('Watch a 2-minute explanation')}</button>
        </div>
      )}
      {step === 1 && (
        <div className="grow hero">
          <p className="lead center">{t('What is it closest to?')}</p>
          <div className="wrapchips" style={{ justifyContent: 'center' }}>
            {FEELINGS.map((f) => <button key={f} className={'tag' + (feel === f ? ' sel' : '')} style={{ minHeight: 48, fontSize: 17 }} onClick={() => { setFeel(f); setStep(2); }}>{t(f)}</button>)}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="grow hero">
          <p className="lead center">{t('How strong is it right now?')}</p>
          <p className="small center">{t('0 is barely there. 10 is the strongest you have felt.')}</p>
          <div className="wrapchips" style={{ justifyContent: 'center', maxWidth: 320 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <button key={i} className="tag" style={{ width: 52, height: 52, justifyContent: 'center', fontSize: 18 }} onClick={() => save(i)}>{i}</button>)}
          </div>
        </div>
      )}
      {step === 3 && high && (
        <div className="grow hero">
          <h1 className="center">{t('This is the moment not to act.')}</h1>
          <p className="lead center">{t('When it is this strong, the mind pushes for something right now. Do not send, decide, or argue yet. The urge is real, and it will change.')}</p>
          <div className="card" style={{ width: '100%' }}>
            <span className="eyebrow">{t('For the body first')}</span>
            <ul style={{ paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>{t('Breathe out slower than you breathe in, for a minute or two.')}</li>
              <li>{t('Walk, even around the room.')}</li>
              <li>{t('Name five things you can see.')}</li>
            </ul>
          </div>
          <button className="btn" onClick={() => open('breathe')}>{t('Breathe with me')}</button>
          <button className="link" onClick={onClose}>{t('I will check in with myself later')}</button>
        </div>
      )}
      {step === 3 && !high && (
        <div className="grow hero">
          <h1 className="center">{t('Good. You can see it from here.')}</h1>
          <p className="lead center">{t('Nothing has to be decided now. If you want, choose what feels right:')}</p>
          <button className="btn" onClick={() => open('talk')}>{t('Say it out loud')}</button>
          <button className="btn alt" onClick={() => open('picker')}>{t('Help me find one small thing')}</button>
          <button className="link" onClick={onClose}>{t('That is enough for now')}</button>
        </div>
      )}
    </div>
  );
}
