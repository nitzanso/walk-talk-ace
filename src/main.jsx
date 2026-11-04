import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/varela-round/400.css';
import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import './styles.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

// Make sure a phone that cached an older copy picks up the newest version. Only the app files are refreshed; the person's data is never touched.
(async () => {
  try {
    const r = await fetch('./version.json?ts=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const { build } = await r.json();
    if (typeof __BUILD__ !== 'undefined' && build !== __BUILD__ && !sessionStorage.getItem('reloaded-for-' + build)) {
      sessionStorage.setItem('reloaded-for-' + build, '1');
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((g) => g.unregister()));
      if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); }
      location.reload();
    }
  } catch { /* offline: keep what we have */ }
})();
