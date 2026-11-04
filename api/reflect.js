// Vercel serverless function. The Anthropic key lives only in Vercel's environment variables (ANTHROPIC_API_KEY).
// The model fills a fixed structure. This function then checks that every quote appears word for word in the person's text, and drops anything that does not.
const TRAPS = 'mindreading (decides what someone thinks or feels without asking), me (takes all the blame), them (puts all the cause on someone else), catastrophe (jumps to the worst outcome), helpless (believes nothing they do matters)';
const STRENGTHS = 'creativity, curiosity, judgment, learning, perspective, bravery, perseverance, honesty, zest, love, kindness, social, teamwork, fairness, leadership, forgiveness, humility, prudence, selfreg, beauty, gratitude, hope, humor, spirituality';
const TOOLS = 'kind-company, belly-breath, senses-walk, name-feeling, know-guess, evidence, worst-best-likely, if-then, company-near, remember-through, feel-break, one-good, angry-sentence, wording, hobby-ten, time-with-loved, small-finish, one-for-someone';
const SYSTEM = `You read ONE recording of a person talking about something hard, and fill a structure. You are not a therapist and you never diagnose.
THE JOB of "reflection": show the person something they cannot see from inside the recording. Most often what an action, habit, repeated phrase or turn in the recording is doing for them, or a tension between two things they said. Offer it as a possibility, never a verdict.
Rules for "reflection": use only this recording, never anything else. One insight, 2 to 4 sentences. Do not repeat or lightly rephrase what they said; delete any sentence that only restates their words. Write about how things were FOR THEM, never state what another person did, thought or meant as true, and do not take their side against anyone. Never imply they did not know something about themselves (no "realized", "discovered", "finally saw"); use returning, standing in, reconnecting, so they feel stronger. No questions, no advice, no diagnosis. Vary your openings; do not start with "It sounds like". If there is no real insight, write one or two plain sentences. Never say "move on", "accept it", "be strong", "get over it", "what would you say to a friend".
Return ONLY JSON with these keys:
"reflection": as above.
"feelings": 2 to 5 of {"name": a feeling word, "quote": exact words from the text, "pleasant": true|false, "energy": "high"|"low"}.
"strengths": 0 to 1 of {"id": one of [${STRENGTHS}], "quote": exact words, "how": one sentence on how it showed up}.
"traps": 0 to 1 of {"id": one of [${TRAPS}], "quote": exact words, "why": one sentence in plain words}. ONLY if the quote clearly shows it. Sadness, grief and anger are NOT traps.
"steadying": {"quote": exact words} for one sentence of theirs that sounds steady or rational, or null.
"lights": 0 to 2 of {"what": a person, activity or hobby that seems to bring them joy, "quote": exact words}.
"action": {"text": one small concrete step with an example, "quote": the exact words of theirs it follows directly from} or null. Use null unless it clearly follows from what they said.
Every "quote" must be copied exactly from the text, in its original language. If unsure, leave the item out.`;

const CRISIS = /(kill myself|end my life|suicid|want to die|להתאבד|התאבדות|לא רוצה לחיות|רוצה למות)/i;
const BANNED = /(move on|accept it|be strong|get over|תמשיכ|לקבל ולהמשיך|תתחזק|תתגבר)/i;
const norm = (s) => String(s || '').toLowerCase().replace(/[\s"'“”‘’.,!?;:()\-־]+/g, ' ').trim();

export function clean(json, text) {
  const body = norm(text);
  const ok = (q) => q && norm(q).length > 2 && body.includes(norm(q));
  const safe = (s) => typeof s === 'string' && !BANNED.test(s);
  const arr = (a) => (Array.isArray(a) ? a : []);
  const out = {
    headline: safe(json.headline) ? json.headline : '',
    process: safe(json.process) ? json.process : '',
    reflection: safe(json.reflection) && !/\b(realized|realised|discovered)\b/i.test(json.reflection || '') ? json.reflection : '',
    action: json.action && ok(json.action.quote) && safe(json.action.text) ? { text: json.action.text, quote: json.action.quote } : null,
    heard: typeof json.heard === 'string' ? json.heard : '', // a retelling may quote their own words (e.g. "I don't accept it")
    underneath: safe(json.underneath) ? json.underneath : '',
    holding: safe(json.holding) ? json.holding : '',
    newThing: safe(json.newThing) ? json.newThing : '',
    feelings: arr(json.feelings).filter((f) => f && f.name && ok(f.quote)).slice(0, 5),
    traps: arr(json.traps).filter((x) => x && ['mindreading', 'me', 'them', 'catastrophe', 'helpless'].includes(x.id) && ok(x.quote) && safe(x.why)).slice(0, 1),
    strengths: arr(json.strengths).filter((x) => x && ok(x.quote) && safe(x.how)).slice(0, 1),
    steadying: json.steadying && ok(json.steadying.quote) ? { quote: json.steadying.quote } : null,
    lights: arr(json.lights).filter((x) => x && x.what && ok(x.quote)).slice(0, 2),
  };
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'not configured' });
  const { text = '', tone = 'direct', lang = 'en-US' } = req.body || {};
  const t = String(text).trim();
  if (t.length < 10) return res.status(400).json({ error: 'too short' });
  if (t.length > 8000) return res.status(413).json({ error: 'too long' });
  if (CRISIS.test(t)) return res.status(200).json({ crisis: true });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.REFLECT_MODEL || 'claude-haiku-5-5',
      max_tokens: 2000,
      system: SYSTEM + (tone === 'warm' ? '\nTone: warm.' : '\nTone: plain and direct.') + (String(lang).startsWith('he') ? '\nWrite every field except "id" and "tool" in Hebrew, without assuming the person\'s gender.' : ''),
      messages: [{ role: 'user', content: t }],
    }),
  });
  if (!r.ok) return res.status(502).json({ error: 'upstream ' + r.status });
  const data = await r.json();
  const raw = (data.content && data.content[0] && data.content[0].text) || '';
  try {
    const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return res.status(200).json({ reflection: clean(json, t), v: 3 });
  } catch { return res.status(502).json({ error: 'bad format' }); }
}
