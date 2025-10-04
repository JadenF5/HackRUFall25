// services/aiService.js
import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Send a prompt to Gemini to generate class recommendations.
 * Returns an array of short objects {title, reason, confidence}
 */
export async function getClassRecommendations(userInterests, max = 5) {
  if (!userInterests || userInterests.trim() === "") return [];

  const prompt = `
You are an assistant that recommends university classes (title and short reason).
Given student interests or goals, suggest up to ${max} relevant undergraduate classes (title, 1-line reason why it's useful, and prerequisites if any).
Student input: "${userInterests}"
Return JSON array of objects: [{"title":"", "reason":"", "prereqs":""}]
`;

  try {
    const resp = await client.models.generateContent({
      model: "gemini-2.5-flash", // adjust model name if needed
      contents: prompt,
      config: {
        // optional thinking config shown in your notes
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // the API may return the text in different fields; adjust if necessary
    const text = resp.text || (resp?.candidates?.[0]?.content ?? "");
    // Attempt to extract JSON from output
    const jsonStart = text.indexOf("[");
    const jsonText = jsonStart >= 0 ? text.slice(jsonStart) : text;
    try {
      const parsed = JSON.parse(jsonText);
      return parsed.slice(0, max);
    } catch (e) {
      // fallback: return text as single recommendation
      return [{ title: "AI output", reason: text.substring(0, 400), prereqs: "" }];
    }
  } catch (e) {
    console.error("AI service error", e);
    return [{ title: "AI error", reason: e.message, prereqs: "" }];
  }
}
