// Collects what happened during the phone test so Nitzan can copy it and paste it back.
const t0 = Date.now();
const stamp = () => `+${Math.round((Date.now() - t0) / 1000)}s`;

export const report = {
  events: [],
  runs: [],
};

export function addEvent(msg) {
  report.events.push(`${stamp()} ${msg}`);
  if (report.events.length > 200) report.events.shift();
}

export function addRun(run) {
  report.runs.push(run);
}

export function envInfo() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return [
    `UA: ${navigator.userAgent}`,
    `secure context: ${window.isSecureContext}`,
    `standalone (installed): ${window.matchMedia('(display-mode: standalone)').matches}`,
    `MediaRecorder: ${typeof MediaRecorder !== 'undefined'}`,
    `SpeechRecognition: ${!!SR}`,
    `WakeLock: ${'wakeLock' in navigator}`,
    `vibrate: ${'vibrate' in navigator}`,
    `online: ${navigator.onLine}`,
  ].join('\n');
}

export function reportText() {
  const runs = report.runs.map((r, i) => `RUN ${i + 1}: ${r}`).join('\n\n') || '(no runs yet)';
  return `WALK TALK ACE PHONE TEST\n\nENV\n${envInfo()}\n\n${runs}\n\nEVENTS\n${report.events.join('\n') || '(none)'}`;
}
