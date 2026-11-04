import React from 'react';
import { Icon } from './ui.jsx';

export default function Support({ onClose, urgent }) {
  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">Support</span><h1>{urgent ? "You're not alone with this" : 'Talking to a person'}</h1></div>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><Icon n="close" size={20} /></button>
      </div>
      {urgent && <div className="card"><p>What you wrote sounds heavy. I'm an app, not a person, and I can't help with this the way a person can. Please reach out to someone now.</p></div>}
      <div className="card">
        <h3>In Israel</h3>
        <p><b style={{ fontWeight: 500 }}>ERAN, emotional first aid: call 1201</b>, 24 hours, every day. Hebrew, and other languages through the Olim helpline.</p>
        <p>ERAN also has chat, WhatsApp and SMS, in Hebrew, most days from about 8:00 to 2:00.</p>
        <p><b style={{ fontWeight: 500 }}>Danger right now:</b> police 100, ambulance 101.</p>
      </div>
      <div className="card">
        <h3>Somewhere else</h3>
        <p>Search for “crisis line” plus your country, or ask a person you trust to sit with you while you call.</p>
      </div>
      <div className="card" style={{ background: '#E3ECEA' }}>
        <p>If someone you trust is near, tell them one sentence: “I'm having a hard time and I don't want to be alone.”</p>
      </div>
      <p className="small">This app isn't therapy and isn't a crisis service. Numbers are checked against ERAN's own site; please confirm before relying on them.</p>
      <div className="grow" />
      <button className="btn" onClick={onClose}>Back</button>
    </div>
  );
}
