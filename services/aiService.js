// services/aiService.js
import 'dotenv/config';

const GROQ_KEY = process.env.GROQ_API_KEY;
if (!GROQ_KEY) {
  console.warn('[aiService] Missing GROQ_API_KEY — calls will fail until it is set.');
}

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function buildPrompt(userInterests, max) {
  return `
You recommend **Rutgers University** undergraduate classes.

Rules:
- Prefer real Rutgers courses if possible (e.g., CS, ECE, Math, Psych, HCI, etc.).
- If you know the Rutgers course **code**, include it (e.g., "CS101" or "01:198:214").
- If you're unsure about the exact Rutgers code, still recommend relevant classes, but set "code" to a short slug (no spaces).
- Output ONLY valid JSON (no prose): an array with up to ${max} objects.
- Each object MUST be: 
  {"code": string, "title": string, "reason": string (one short sentence), "prereqs": string (can be empty)}
- No extra keys, no markdown, no explanations.
- If unsure, return [].

Student interests: "${userInterests}"
`.trim();
}

async function genWithGroq(prompt, { useJsonMode = true } = {}) {
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: 'You ONLY output strict JSON arrays. No prose.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 800,
  };
  if (useJsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    if (useJsonMode && res.status === 400) {
      // retry once without JSON mode
      return genWithGroq(prompt, { useJsonMode: false });
    }
    throw new Error(`Groq ${res.status}: ${t || res.statusText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function getClassRecommendations(userInterests, max = 5) {
  if (!userInterests || !userInterests.trim()) return [];

  const prompt = buildPrompt(userInterests, max);

  let text;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      text = await genWithGroq(prompt, { useJsonMode: true });
      break;
    } catch (e) {
      if (attempt === 1) throw e;
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Extract JSON array
  const start = text.indexOf('[');
  const jsonText = start >= 0 ? text.slice(start) : text;

  try {
    const arr = JSON.parse(jsonText);
    if (!Array.isArray(arr)) throw new Error('not array');
    // normalize + add linkPath
    // inside getClassRecommendations, after you parsed `arr`:
    return arr.slice(0, max).map(it => {
      const rawCode = String(it?.code ?? '').trim();
      const title = String(it?.title ?? '').trim();
      const reason = String(it?.reason ?? '').trim();
      const prereqs = String(it?.prereqs ?? '').trim();
      // Slug/ID to use if no code was provided
      const fallbackCode = title ? title.replace(/[^A-Za-z0-9]+/g, '').slice(0, 40) : 'unknown';
      const code = rawCode || fallbackCode;
      // Your route expects /class/:id (e.g., /class/CS101)
      const linkPath = `/class/${encodeURIComponent(code)}`;
      return { code, title, reason, prereqs, linkPath };
    });
  } catch {
    return [{ code: 'AI', title: 'AI output (parse failed)', reason: text.slice(0, 300), prereqs: '', linkPath: '/class/AI' }];
  }
}

export default { getClassRecommendations };
