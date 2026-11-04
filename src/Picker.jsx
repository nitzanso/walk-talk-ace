import React, { useState } from 'react';
import { db, useQuery } from './db.js';
import { useI18n } from './i18n.jsx';
import { Helpful, Icon } from './ui.jsx';

// One tool at a time, chosen from where the person is. Max two alternatives, then company instead.
const TOPICS = [
  ['heavy', 'It just hurts'],
  ['thoughts', 'A thought keeps going round'],
  ['urge', 'I feel a pull to do something'],
  ['empty', 'It feels empty or lonely'],
  ['anger', 'I feel angry'],
  ['body', "I don't know. I just feel off"],
];

export default function Picker({ onClose, open }) {
  const { t, C } = useI18n();
  const { TOOLS } = C;
  const [topic, setTopic] = useState(null);
  const [low, setLow] = useState(null);
  const [n, setN] = useState(0);
  const fbs = useQuery(() => db.settings.where('key').startsWith('fb:tool:').toArray(), [], []);
  const uses = useQuery(() => db.settings.where('key').startsWith('use:').toArray(), [], []);
  const val = (id) => (fbs.find((f) => f.key === 'fb:tool:' + id) || {}).value;
  const lastUsed = (id) => Math.max(0, ...uses.filter((u) => u.value && u.value.tool === id).map((u) => u.value.at));

  const ranked = topic && low !== null ? TOOLS
    .filter((x) => x.for.includes(topic) && (!low || x.low) && val(x.id) !== 'no')
    .sort((a, b) => ((val(b.id) === 'helped') - (val(a.id) === 'helped')) || (lastUsed(a.id) - lastUsed(b.id))) : [];
  const tool = ranked[n];
  const shown = React.useRef(null);
  React.useEffect(() => {
    if (tool && shown.current !== tool.id) { shown.current = tool.id; db.settings.put({ key: 'use:' + Date.now(), value: { tool: tool.id, topic, at: Date.now() } }); }
  }, [tool, topic]);

  return (
    <div className="screen">
      <div className="top">
        <div><span className="eyebrow">{t('One thing at a time')}</span><h1>{t('What would help right now?')}</h1></div>
        <button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button>
      </div>

      {!topic && (
        <>
          <p>{t("No pressure. Pick the closest, and I'll offer one small thing. You can say no to it.")}</p>
          <div className="chips">
            {TOPICS.map(([id, label]) => <button key={id} className="chip" style={{ minHeight: 56, textAlign: 'start' }} onClick={() => setTopic(id)}>{t(label)}</button>)}
            <button className="chip" style={{ minHeight: 56, textAlign: 'start', background: '#E3ECEA' }} onClick={() => open('support', { urgent: true })}>{t("I don't see a way through this")}</button>
          </div>
        </>
      )}

      {topic && low === null && (
        <>
          <p>{t('How much energy do you have right now?')}</p>
          <div className="chips">
            <button className="chip" style={{ minHeight: 56, textAlign: 'start' }} onClick={() => setLow(true)}>{t('Very little')}</button>
            <button className="chip" style={{ minHeight: 56, textAlign: 'start' }} onClick={() => setLow(false)}>{t('Some')}</button>
          </div>
        </>
      )}

      {topic && low !== null && tool && n < 3 && (
        <div className="card">
          <h3>{tool.title}</h3>
          <p>{tool.why}</p>
          <ol style={{ paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>{tool.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          <p className="small">{t('For example:')} {tool.example}</p>
          <p className="small">{t('Only if it feels right. You can stop any time.')}</p>
          <Helpful kind="tool" id={tool.id} />
          {n < 2 && ranked[n + 1] && <button className="link" onClick={() => setN(n + 1)}>{t('Show me a different one')}</button>}
        </div>
      )}

      {topic && low !== null && (!tool || n >= 3 || (n >= 2 && false)) && (
        <div className="card">
          <p>{t("That's enough searching for today. Sometimes nothing on a list fits, and that's okay. If you want company, you can talk or type here, or reach someone you trust.")}</p>
          <div className="chips">
            <button className="chip" onClick={() => open('talk')}>{t('Talk')}</button>
            <button className="chip" onClick={() => open('support')}>{t('Talking to a person')}</button>
          </div>
        </div>
      )}

      {topic && low !== null && tool && n >= 2 && (
        <p className="small">{t('Nothing fits? That is allowed. You can talk or type instead, or reach a person you trust.')}</p>
      )}

      <div className="grow" />
      {topic && <button className="link" onClick={() => { setTopic(null); setLow(null); setN(0); }}>{t('Start over')}</button>}
      <button className="btn" onClick={onClose}>{t('Back')}</button>
    </div>
  );
}
