// services/aiService.js
import 'dotenv/config';

const GROQ_KEY = process.env.GROQ_API_KEY;
if (!GROQ_KEY) console.warn('[aiService] Missing GROQ_API_KEY — calls will fail until it is set.');
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

/* -------------------- utils -------------------- */
function parseArrayish(text) {
  if (!text || typeof text !== 'string') return null;

  // 1) try to parse entire text
  try {
    const full = JSON.parse(text);
    if (Array.isArray(full)) return full;
    if (full && typeof full === 'object') {
      for (const k of Object.keys(full)) {
        if (Array.isArray(full[k])) return full[k];
      }
    }
  } catch (_) {}

  // 2) slice the first bracketed array
  const start = text.indexOf('[');
  const end   = text.lastIndexOf(']');
  if (start >= 0 && end > start) {
    const candidate = text.slice(start, end + 1);
    try {
      const arr = JSON.parse(candidate);
      if (Array.isArray(arr)) return arr;
    } catch (_) {}
  }
  return null;
}

async function genWithGroq(prompt) {
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: 'You MUST output a strict JSON array only. No prose, no wrapper object, no markdown.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 800,
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Groq ${res.status}: ${t || res.statusText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

/* ----------------- CLASSES ----------------- */
function buildPromptClasses(userInterests, max) {
  return `
You recommend **Rutgers University** undergraduate classes.

Rules:
- Prefer real Rutgers courses if possible (e.g., CS, ECE, Math, Psych, HCI, etc.).
- If you know the Rutgers course **code**, include it (e.g., "CS111", "CS112", or "01:198:214").
- If unsure about an exact Rutgers code, still recommend relevant classes and set "code" to a short slug (no spaces).
- Output ONLY a JSON array (no prose, no wrapper object) with up to ${max} objects.
- Each object MUST be: {"code": string, "title": string, "reason": string (one short sentence), "prereqs": string (can be empty)}
- Never return an empty array; if unsure, suggest Rutgers-appropriate intros.

Student interests: "${userInterests}"
`.trim();
}

function fallbackClassSuggestions(userInterests, max = 5) {
  const q = (userInterests || '').toLowerCase();
  const suggestions = [];
  const push = (code, title, reason, prereqs = '') =>
    suggestions.length < max && suggestions.push({ code, title, reason, prereqs });

  if (q.includes('python')) {
    push('CS111', 'Intro to Computer Science (Python)', 'Start programming in Python and core CS concepts.');
    push('CS112', 'Data Structures in Python', 'Covers lists, stacks, queues, trees and algorithms.', 'CS111');
    push('DS101', 'Intro to Data Science (Python)', 'Data wrangling, visualization and basics of ML.', 'CS111');
  }
  if (q.includes('ai') || q.includes('machine learning')) {
    push('CS344', 'Intro to Machine Learning', 'Supervised/unsupervised learning foundations.', 'CS112');
  }
  if (q.includes('robot')) {
    push('ECE470', 'Intro to Robotics', 'Kinematics and control of robotic systems.', 'CS112 or Calc II');
  }
  if (q.includes('web')) {
    push('CS210', 'Web Programming', 'Frontend + backend web fundamentals.', 'CS111');
  }
  if (q.includes('security') || q.includes('cyber')) {
    push('CS356', 'Computer Security', 'Foundations of system and network security.', 'CS112');
  }

  // generic fillers
  push('CS201', 'Computer Systems', 'C programming, memory, processes and OS basics.', 'CS112');
  push('MATH151', 'Calculus I', 'Calculus for STEM foundations.');
  push('STAT201', 'Statistics I', 'Probability and statistics basics.');

  return suggestions.slice(0, max);
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

// --- majors finder: suggests Rutgers majors + prereqs ---
function buildMajorsPrompt(userInterests, max) {
  return `
You recommend **Rutgers University** undergraduate majors.

Rules:
- Prefer real Rutgers majors (e.g., Computer Science, ECE, Psychology, Business Analytics, HCI, etc.).
- Output ONLY valid JSON (no prose): array with up to ${max} objects.
- Each object MUST be:
  {"code": string, "name": string, "reason": string (one short sentence), "prereqs": string (short list or empty)}
- "code" should be a short slug (e.g., "CS", "ECE", "PSY", "BAIT"). If unsure, make a short alphanumeric slug without spaces.
- No extra keys, no markdown.
- If unsure, return [].

Student interests: "${userInterests}"
`.trim();
}

export async function getMajorSuggestions(userInterests, max = 5) {
  if (!userInterests || !userInterests.trim()) return [];
  const prompt = buildMajorsPrompt(userInterests, max);

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

  const start = text.indexOf('[');
  const jsonText = start >= 0 ? text.slice(start) : text;

  try {
    const arr = JSON.parse(jsonText);
    if (!Array.isArray(arr)) throw new Error('not array');

    return arr.slice(0, max).map(it => {
      const rawCode = String(it?.code ?? '').trim();
      const name = String(it?.name ?? '').trim();
      const reason = String(it?.reason ?? '').trim();
      const prereqs = String(it?.prereqs ?? '').trim();

      const fallback = (name || 'Major').replace(/[^A-Za-z0-9]+/g, '').slice(0, 20) || 'Major';
      const code = rawCode || fallback;

      // point to your majors view; adjust if your route differs
      const linkPath = `/majors/${encodeURIComponent(code)}`;
      return { code, name, reason, prereqs, linkPath };
    });
  } catch {
    return [{ code: 'AI', name: 'AI output (parse failed)', reason: text.slice(0, 300), prereqs: '', linkPath: '/majors/AI' }];
  }
}

// keep default export updated
export default { getClassRecommendations, getMajorSuggestions };
