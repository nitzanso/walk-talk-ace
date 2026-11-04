// Rules that choose one gentle thing for today. Transparent: mood, the PERMA part touched least this week, what helped and what did not.
// PERMA: P positive emotion, E engagement, R relationships, M meaning, A accomplishment.
export const PERMA_OF = {
  'one-good': 'P', 'name-feeling': 'P', 'kind-company': 'P', 'remember-through': 'P', 'feel-break': 'P',
  'hobby-ten': 'E', 'senses-walk': 'E',
  'time-with-loved': 'R', 'company-near': 'R',
  'one-for-someone': 'M',
  'small-finish': 'A', 'if-then': 'A',
};
const DAY = 86400000;

// uses: [{tool, at}] shown tools; fbs: {toolId: 'helped'|'no'}; mood: 'good'|'soso'|'hard'
export function chooseOne({ tools, uses, fbs, mood, helpedDone }) {
  const week = Date.now() - 7 * DAY;
  const touched = { P: 0, E: 0, R: 0, M: 0, A: 0 };
  (helpedDone || []).forEach((h) => { if (h.at >= week && PERMA_OF[h.tool]) touched[PERMA_OF[h.tool]]++; });
  const allowed = tools.filter((x) => fbs[x.id] !== 'no' && PERMA_OF[x.id]);
  const body = ['belly-breath', 'senses-walk', 'kind-company'];
  let pool;
  if (mood === 'hard') pool = allowed.filter((x) => body.includes(x.id) || x.low);
  else {
    const order = Object.keys(touched).sort((a, b) => touched[a] - touched[b]);
    const thin = order[0];
    pool = allowed.filter((x) => PERMA_OF[x.id] === thin && x.low);
    if (!pool.length) pool = allowed;
  }
  if (!pool.length) pool = tools.filter((x) => fbs[x.id] !== 'no');
  const last = (id) => Math.max(0, ...(uses || []).filter((u) => u.tool === id).map((u) => u.at));
  const sorted = [...pool].sort((a, b) => ((fbs[b.id] === 'helped') - (fbs[a.id] === 'helped')) || (last(a.id) - last(b.id)));
  return { pick: sorted[0] || null, other: sorted[1] || null, thin: Object.keys(touched).sort((a, b) => touched[a] - touched[b])[0] };
}
