// services/courseService.js
import collections from "../config/mongoCollections.js";
import axios from "axios";

/**
 * Basic local keyword search: tokenizes query and matches against course title, description, tags
 */
export async function searchLocal(query, limit = 20) {
  const classesCol = await collections.classes();
  if (!query || query.trim() === "") {
    return await classesCol.find({}).limit(limit).toArray();
  }
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const regexes = tokens.map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));

  const or = regexes.map((r) => ({
    $or: [
      { title: r },
      { description: r },
      { tags: r },
      { major: r }
    ]
  }));

  const results = await classesCol.find({ $and: or }).limit(limit).toArray();
  return results;
}

/**
 * Placeholder: call Rutgers Course API (you referenced this repo in your brief).
 * Implement as needed using axios to fetch remote course data.
 */
export async function fetchFromRutgersAPI(codeOrQuery) {
  // Example - you will need to adapt according to the Rutgers API's actual endpoints
  // See your project notes for the API link. :contentReference[oaicite:2]{index=2}
  try {
    const resp = await axios.get(`https://rutgers-course-api.example/courses?q=${encodeURIComponent(codeOrQuery)}`);
    return resp.data;
  } catch (e) {
    console.warn("Rutgers API call failed", e.message);
    return null;
  }
}
