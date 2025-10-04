// services/aiService.js
import 'dotenv/config';

// ---- Safety: require key early (but don't crash routes on import if you prefer) ----
const GROQ_KEY = process.env.GROQ_API_KEY;
if (!GROQ_KEY) {
  console.warn('[aiService] Missing GROQ_API_KEY — calls will fail until it is set.');
}

// Node 18+ has global fetch. If you’re on Node 16, install node-fetch and:
// import fetch from 'node-fetch';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// Prompt builder kept tiny and strict
function buildPrompt(userInterests, max) {
  return `
Return ONLY valid JSON (no prose): an array with up to ${max} objects.
Each object: {"title": string, "reason": string (one short sentence), "prereqs": string (can be empty)}.
If unsure, return [].
Student interests: "${userInterests}"
`.trim();
}

// Call Groq’s OpenAI-compatible endpoint
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

  if (useJsonMode) {
    // Some Groq models support OpenAI-style JSON mode. If it errors, we retry without it.
    body.response_format = { type: 'json_object' };
  }

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
    // If response_format caused a 400, retry once without JSON mode.
    if (useJsonMode && res.status === 400) {
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

  // Optional light retry (e.g., for transient 429)
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

  // Defensive JSON extraction
  const start = text.indexOf('[');
  const jsonText = start >= 0 ? text.slice(start) : text;

  try {
    const arr = JSON.parse(jsonText);
    if (!Array.isArray(arr)) throw new Error('not array');
    return arr.slice(0, max).map(it => ({
      title: String(it?.title ?? '').trim(),
      reason: String(it?.reason ?? '').trim(),
      prereqs: String(it?.prereqs ?? '').trim(),
    }));
  } catch {
    return [{ title: 'AI output (parse failed)', reason: text.slice(0, 300), prereqs: '' }];
  }
}

// Support both named and namespace/default imports
export default { getClassRecommendations };
