// services/aiService.js
import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// the client will also pick GEMINI_API_KEY from env automatically if you prefer: new GoogleGenAI({})

export async function getClassRecommendations(userInterests, max = 5) {
  if (!userInterests || !userInterests.trim()) return [];

  const prompt = `
You are an assistant that recommends university classes (title and short reason).
Given student interests or goals, suggest up to ${max} relevant undergraduate classes (title, one-line reason why it's useful, and prerequisites if any).
Student input: "${userInterests}"
Return ONLY valid JSON: an array of objects like
[{"title":"..","reason":"..","prereqs":".."}, ...]
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // optional: disables "thinking" for faster/cheaper replies
      }
    });

    // quickstart pattern: response.text contains the model output
    const text = response?.text ?? response?.candidates?.[0]?.content ?? "";

    // try to extract the JSON array from the text
    const start = text.indexOf("[");
    const jsonText = start >= 0 ? text.slice(start) : text;

    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) return parsed.slice(0, max);
      return [{ title: "AI output", reason: String(text).slice(0, 300), prereqs: "" }];
    } catch (parseErr) {
      // fallback: return raw text if parsing failed
      return [{ title: "AI output (parse failed)", reason: String(text).slice(0, 300), prereqs: "" }];
    }
  } catch (err) {
    console.error("AI service error:", err);
    return [{ title: "AI error", reason: err?.message ?? String(err), prereqs: "" }];
  }
}
