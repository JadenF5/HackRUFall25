import express from "express";
import xss from "xss";
import collections from "../config/mongoCollections.js";
import * as courseService from "../services/courseService.js";
import * as aiService from "../services/aiService.js";

const router = express.Router();

/**
 * POST /api/search
 * body: { query: "I like robotics and python" }
 * Returns: array of class objects
 */
router.post("/search", async (req, res) => {
  try {
    const q = xss(req.body.query || "");
    // First try local keyword filter
    const localResults = await courseService.searchLocal(q);
    // Also ask AI for improved recommendations
    const aiRec = await aiService.getClassRecommendations(q, 5);
    res.json({ local: localResults, ai: aiRec });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
