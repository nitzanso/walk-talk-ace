// Builds the short summary of earlier recordings that is sent with a new one, so a reflection can speak about growth and change.
// The person can read exactly this text in More, and switch it off.
import { db, getSetting } from './db.js';

const day = (ms) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const top = (list, key, n) => {
  const m = {}; list.forEach((r) => (r[key] || []).forEach((x) => { const k = x.id || x.name; m[k] = (m[k] || 0) + 1; }));
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, c]) => `${k} (${c})`);
};

export async function buildMemory() {
  if ((await getSetting('useMemory', true)) === false) return '';
  const ents = (await db.entries.toArray()).filter((e) => e.reflection && (e.reflection.reflection || e.reflection.process));
  const rs = (await db.reflections.toArray()).filter((r) => !r.sample && r.reflection).map((r) => ({ created: r.created, reflection: r.reflection }));
  const all = [...ents.map((e) => ({ created: e.created, reflection: e.reflection })), ...rs].sort((a, b) => a.created - b.created);
  if (!all.length) return '';
  const R = all.map((x) => x.reflection);
  const lines = all.slice(-8).map((x) => {
    const f = (x.reflection.feelings || []).slice(0, 3).map((y) => y.name).join(', ');
    const txt = (x.reflection.reflection || x.reflection.process || '').replace(/\s+/g, ' ').slice(0, 230);
    return `- ${day(x.created)}: feelings ${f || 'n/a'}. ${txt}`;
  });
  const out = [
    `Earlier recordings: ${all.length}, from ${day(all[0].created)} to ${day(all[all.length - 1].created)}.`,
    'Latest recordings, oldest to newest:', ...lines,
    `Strengths seen most: ${top(R, 'strengths', 3).join(', ') || 'none yet'}.`,
    `Thinking patterns seen: ${top(R, 'traps', 2).join(', ') || 'none yet'}.`,
    `Feelings named most: ${top(R, 'feelings', 5).join(', ') || 'none yet'}.`,
  ].join('\n');
  return out.slice(0, 3000);
}
