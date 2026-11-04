import Dexie, { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

export const db = new Dexie('walk-talk-ace');
db.version(1).stores({
  aces: '++id,created',
  checks: '++id,created',
  toolbox: '++id,created',
  entries: '++id,created',
});
db.version(2).stores({
  aces: '++id,created',
  checks: '++id,created',
  toolbox: '++id,created',
  entries: '++id,created',
  settings: 'key',
  allowed: '++id,created',
  answers: 'qid',
  reflections: '++id,created',
});

db.version(3).stores({
  aces: '++id,created',
  checks: '++id,created',
  toolbox: '++id,created',
  entries: '++id,created',
  settings: 'key',
  allowed: '++id,created',
  answers: 'qid',
  reflections: '++id,created',
  insights: '++id,created,kind',
});

const TABLES = ['aces', 'checks', 'toolbox', 'entries', 'settings', 'allowed', 'answers', 'reflections', 'insights'];

export function useQuery(fn, deps = [], initial = []) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    const sub = liveQuery(fn).subscribe({ next: setV, error: () => {} });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return v;
}

export async function getSetting(key, fallback = null) {
  const r = await db.settings.get(key);
  return r ? r.value : fallback;
}
export function setSetting(key, value) {
  return db.settings.put({ key, value });
}
export function useSetting(key, fallback = null) {
  const [v, setV] = useState(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sub = liveQuery(() => db.settings.get(key)).subscribe({
      next: (r) => { setV(r ? r.value : fallback); setReady(true); },
      error: () => setReady(true),
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [v, (val) => setSetting(key, val), ready];
}

export async function showUpCount() {
  const [a, c, t, e] = await Promise.all([db.aces.count(), db.checks.count(), db.toolbox.count(), db.entries.count()]);
  return { total: a + c + t + e, aces: a };
}

export async function exportAll() {
  const out = {};
  for (const t of TABLES) out[t] = await db[t].toArray();
  return out;
}

export async function wipeAll() {
  await Promise.all(TABLES.map((t) => db[t].clear()));
}

// Adds the contents of a pack file to what is already on the phone. Rows that are already there (same date or same words) are updated, not duplicated.
export async function importPack(pack) {
  if (!pack || typeof pack !== 'object') throw new Error('Not a pack file');
  const done = (await getSetting('importedPacks', [])) || [];
  if (pack.packId && done.includes(pack.packId)) return { skipped: true };
  let n = 0;
  if (pack.replaceInsights) await db.insights.clear();
  const keyOf = { entries: (r) => r.created, reflections: (r) => r.created, aces: (r) => r.text, toolbox: (r) => r.text, allowed: (r) => r.text };
  for (const t of ['aces', 'checks', 'toolbox', 'entries', 'allowed', 'reflections', 'insights']) {
    const rows = (pack[t] || []).map(({ id, ...r }) => r);
    if (!rows.length) continue;
    if (keyOf[t]) {
      const existing = await db[t].toArray();
      for (const r of rows) {
        const hit = existing.find((e) => keyOf[t](e) === keyOf[t](r));
        if (hit) await db[t].update(hit.id, r); else await db[t].add(r);
        n++;
      }
    } else { await db[t].bulkAdd(rows); n += rows.length; }
  }
  for (const a of pack.answers || []) { await db.answers.put(a); n++; }
  for (const s of pack.settings || []) { await db.settings.put(s); n++; }
  if (pack.packId) await setSetting('importedPacks', [...done, pack.packId]);
  return { added: n };
}

const normQ = (s) => String(s || '').toLowerCase().replace(/[\s"'“”‘’.,!?;:()\-־]+/g, ' ').trim();
// Finds the saved recording that contains a quote, so a quote can lead back to what was said that day.
export async function findEntryForQuote(q) {
  const n = normQ(q); if (n.length < 3) return null;
  const all = await db.entries.toArray();
  const hit = all.filter((e) => e.text && normQ(e.text).includes(n)).sort((a, b) => b.created - a.created)[0];
  return hit ? hit.id : null;
}
