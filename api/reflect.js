// Vercel serverless function. The Anthropic key lives only in Vercel's environment variables (ANTHROPIC_API_KEY).
const SYSTEM = `You write a short reflection for a person who just spoke or wrote about a hard time. You are not a therapist and you never diagnose.
Rules: plain, kind, concrete. Use the person's own words for feelings (quote short phrases from their text). No "what would you say to a friend". No long question lists. At most one small optional invitation, with a concrete example. If they blamed ("you made me feel..."), offer one alternative wording in the form "I felt ___ when ___, and I needed ___" using their content, and say the original is fine too. Never mention self-harm methods. Write in the language the person used.
Return ONLY JSON: {"process": string (2-3 sentences: how the person moved through their thoughts), "feelings": [{"name": string, "quote": string}] (2-4), "newThing": string (one sentence: something that seems new or different), "invitation": string (one optional small step with an example), "wording": {"before": string, "after": string} or null}`;

const CRISIS = /(kill myself|end my life|suicid|want to die|להתאבד|התאבדות|לא רוצה לחיות|רוצה למות)/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'not configured' });
  const { text = '', tone = 'direct' } = req.body || {};
  const t = String(text).trim();
  if (t.length < 10) return res.status(400).json({ error: 'too short' });
  if (t.length > 8000) return res.status(413).json({ error: 'too long' });
  if (CRISIS.test(t)) return res.status(200).json({ crisis: true });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.REFLECT_MODEL || 'claude-haiku-5-5',
      max_tokens: 900,
      system: SYSTEM + (tone === 'warm' ? '\nTone: warm.' : '\nTone: plain and direct.'),
      messages: [{ role: 'user', content: t }],
    }),
  });
  if (!r.ok) return res.status(502).json({ error: 'upstream ' + r.status });
  const data = await r.json();
  const raw = (data.content && data.content[0] && data.content[0].text) || '';
  try {
    const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    return res.status(200).json({ reflection: json });
  } catch { return res.status(502).json({ error: 'bad format' }); }
}
