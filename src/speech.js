// Microphone and live-caption helpers. Every failure becomes a plain sentence the person can act on.
export function micMessage(name) {
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'Chrome is blocking the microphone for this app. Tap the lock icon (or the three dots, then Settings, then Site settings), set Microphone to Allow, then try again.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return "I can't find a microphone on this phone.";
  if (name === 'NotReadableError' || name === 'AbortError') return 'Another app is using the microphone. Close it (a call, a voice recorder) and try again.';
  return 'The microphone did not start.';
}
export function speechMessage(code) {
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'Live words is blocked. Check that Microphone is set to Allow for this app in Chrome, and that Google voice typing is turned on in your phone settings.';
  if (code === 'network') return 'Live words needs an internet connection. Check your signal and try again.';
  if (code === 'audio-capture') return "Live words can't reach the microphone. Close other apps that use it.";
  if (code === 'language-not-supported') return "This phone's speech service doesn't support that language for live words.";
  return 'Live words stopped.';
}
export function dictationSupported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }

// Asks for the microphone once, up front, so the permission prompt appears reliably, then lets go of it.
export async function micPermission() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return { ok: false, code: 'unsupported', message: 'This browser cannot use the microphone here. Open the app in Chrome.' };
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
    return { ok: true };
  } catch (e) { return { ok: false, code: e.name, message: micMessage(e.name) }; }
}

const lc = (x) => x.toLowerCase().replace(/[.,!?]/g, '').trim();
// Joins pieces of speech, skipping a piece when the next one starts with it or contains it (a repeat).
export function joinSegs(segs) {
  const parts = (segs || []).filter((x) => x && x.t);
  const out = [];
  parts.forEach((x, i) => {
    const nxt = parts[i + 1];
    if (nxt && lc(nxt.t).includes(lc(x.t))) return;
    const prev = out[out.length - 1];
    if (prev && (lc(prev).endsWith(lc(x.t)) || lc(prev) === lc(x.t))) return;
    out.push(x.t);
  });
  return out.join(' ').trim();
}

// Live captions. onText gets the whole text so far. onError gets {code,message,fatal}. Returns { stop, text }.
export function startDictation({ lang, onText, onError, onAudio }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const h = { stopped: false, final: '', rec: null, netErrors: 0 };
  const begin = () => {
    const rec = new SR();
    rec.lang = lang; rec.continuous = true; rec.interimResults = true;
    rec.onaudiostart = () => onAudio && onAudio();
    h.segs = [];
    rec.onresult = (e) => {
      // Android Chrome re-sends the whole sentence so far as a new "final" result. Rebuild from this session's results by index and drop any piece that the next piece repeats.
      for (let i = e.resultIndex; i < e.results.length; i++) h.segs[i] = { t: e.results[i][0].transcript.trim(), f: e.results[i].isFinal };
      onText(h.final.concat(' ', joinSegs(h.segs)).trim());
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'network') h.netErrors++;
      const fatal = e.error !== 'network' || h.netErrors >= 2;
      if (fatal) h.stopped = true;
      onError({ code: e.error, message: speechMessage(e.error), fatal });
    };
    rec.onend = () => { h.final = (h.final + ' ' + joinSegs(h.segs)).trim(); h.segs = []; if (!h.stopped) setTimeout(() => { if (!h.stopped) { try { begin(); } catch {} } }, 250); };
    h.rec = rec;
    try { rec.start(); } catch (e) { h.stopped = true; onError({ code: e.name, message: speechMessage(e.name), fatal: true }); }
  };
  begin();
  return {
    stop() { h.stopped = true; try { h.rec && h.rec.stop(); } catch {} return (h.final + ' ' + joinSegs(h.segs)).trim(); },
    text() { return (h.final + ' ' + joinSegs(h.segs)).trim(); },
  };
}
