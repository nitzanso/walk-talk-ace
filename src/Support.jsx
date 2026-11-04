import React from 'react';
import { Icon } from './ui.jsx';
import { useI18n } from './i18n.jsx';

export default function Support({ onClose, urgent }) {
  const { t } = useI18n();
  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">{t('Support')}</span><h1>{urgent ? t("You're not alone with this") : t('Talking to a person')}</h1></div>
        <button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button>
      </div>
      {urgent && <div className="card"><p>{t("What you wrote sounds heavy. I'm an app, not a person, and I can't help with this the way a person can. Please reach out to someone now.")}</p></div>}
      <div className="card">
        <h3>{t('In Israel')}</h3>
        <p><b style={{ fontWeight: 500 }}>{t('ERAN, emotional first aid: call 1201')}</b>{t(', 24 hours, every day. Hebrew, and other languages through the Olim helpline.')}</p>
        <p>{t('ERAN also has chat, WhatsApp and SMS, in Hebrew, most days from about 8:00 to 2:00.')}</p>
        <p><b style={{ fontWeight: 500 }}>{t('Danger right now:')}</b> {t('police 100, ambulance 101.')}</p>
      </div>
      <div className="card">
        <h3>{t('Somewhere else')}</h3>
        <p>{t('Search for “crisis line” plus your country, or ask a person you trust to sit with you while you call.')}</p>
      </div>
      <div className="card" style={{ background: '#E3ECEA' }}>
        <p>{t("If someone you trust is near, tell them one sentence: “I'm having a hard time and I don't want to be alone.”")}</p>
      </div>
      <p className="small">{t("This app isn't therapy and isn't a crisis service. Numbers are checked against ERAN's own site; please confirm before relying on them.")}</p>
      <div className="grow" />
      <button className="btn" onClick={onClose}>{t('Back')}</button>
    </div>
  );
}
