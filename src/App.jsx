import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useSetting } from './db.js';
import { Overlay, Icon } from './ui.jsx';
import Onboarding from './Onboarding.jsx';
import Today from './Today.jsx';
import Archive, { Aces } from './Archive.jsx';
import Library from './Library.jsx';
import Picker from './Picker.jsx';
import More from './More.jsx';
import Talk from './Talk.jsx';
import Type from './Type.jsx';
import Breathe from './Breathe.jsx';
import AceFlow from './AceFlow.jsx';
import Reflection from './Reflection.jsx';
import Support from './Support.jsx';
import EntryDetail from './EntryDetail.jsx';
import { I18n, useI18n } from './i18n.jsx';

const TABS = [['today', 'Today', 'sun'], ['archive', 'Archive', 'path'], null, ['library', 'Library', 'book'], ['more', 'More', 'user']];

export default function App() { return <I18n><Shell /></I18n>; }

function Shell() {
  const { t } = useI18n();
  const [onboarded, , ready] = useSetting('onboarded', false);
  const [done, setDone] = useState(false);
  const [tab, setTab] = useState('today');
  const [ov, setOv] = useState(null); // {name, text}
  const open = (name, extra = {}) => {
    if (['today', 'archive', 'library', 'more'].includes(name)) { setTab(name); setOv(null); return; }
    setOv({ name, ...extra });
  };
  const close = () => setOv(null);
  useEffect(() => { const h = () => setOv({ name: 'support', urgent: true }); window.addEventListener('crisis', h); return () => window.removeEventListener('crisis', h); }, []);

  if (!ready) return <div className="app" />;
  if (!onboarded && !done) return <div className="app"><Onboarding onFinish={() => setDone(true)} /></div>;

  const crisis = () => setOv({ name: 'support', urgent: true });
  const reflect = (text) => setOv({ name: 'reflect', text });

  return (
    <div className="app">
      <div className="view">
        {tab === 'today' && <Today open={open} />}
        {tab === 'archive' && <Archive open={open} />}
        {tab === 'library' && <Library />}
        {tab === 'more' && <More open={open} />}
        <AnimatePresence>
          {ov && (
            <Overlay key={ov.name}>
              {ov.name === 'talk' && <Talk onDone={close} onReflect={reflect} onCrisis={crisis} />}
              {ov.name === 'type' && <Type onDone={close} onReflect={reflect} onCrisis={crisis} />}
              {ov.name === 'picker' && <Picker onClose={close} open={open} />}
              {ov.name === 'breathe' && <Breathe onClose={close} />}
              {ov.name === 'ace' && <AceFlow onClose={close} />}
              {ov.name === 'aces' && <AcesList onClose={close} open={open} />}
              {ov.name === 'reflect' && <Reflection text={ov.text} onClose={close} />}
              {ov.name === 'entry' && <EntryDetail id={ov.id} onClose={close} open={open} />}
              {ov.name === 'support' && <Support urgent={ov.urgent} onClose={close} />}
            </Overlay>
          )}
        </AnimatePresence>
      </div>
      {!ov && <nav className="tabbar" aria-label="Main">
        {TABS.map((tb) => tb ? (
          <button key={tb[0]} className={'tab' + (tab === tb[0] && !ov ? ' on' : '')} onClick={() => open(tb[0])} aria-current={tab === tb[0] ? 'page' : undefined}>
            <Icon n={tb[2]} size={24} />{t(tb[1])}<span className="ind" />
          </button>
        ) : (
          <div key="rec" style={{ position: 'relative' }}>
            <button className="fab" onClick={() => open('talk')} aria-label={t('Talk')}><Icon n="mic" size={34} color="#fff" /></button>
            <span className="fablabel">{t('Talk')}</span>
          </div>
        ))}
      </nav>}
    </div>
  );
}

function AcesList({ onClose, open }) {
  const { t } = useI18n();
  // reuse Archive's aces view inside an overlay
  return (
    <div className="screen">
      <div className="top"><h1>{t('Your aces')}</h1><button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon n="close" size={20} /></button></div>
      <Aces open={open} />
    </div>
  );
}
