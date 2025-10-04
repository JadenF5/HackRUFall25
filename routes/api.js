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

/**
 * GET /api/majors
 * Returns: list of all majors
 */
router.get("/majors", async (req, res) => {
  try {
    const majorsCol = await collections.majors();
    const majors = await majorsCol.find({}).toArray();
    res.json(majors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/majors/:id/classes
 * Returns: list of classes in a given major
 */
router.get("/majors/:id/classes", async (req, res) => {
  try {
    const classesCol = await collections.classes();
    const results = await classesCol.find({ major: req.params.id }).toArray();
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/class/:id/ratings
 * Returns: ratings for a given class
 */
router.get("/class/:id/ratings", async (req, res) => {
  try {
    const ratingsCol = await collections.ratings();
    const results = await ratingsCol.find({ classId: req.params.id }).toArray();
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/class/:id/location
 * Returns: building + coordinates for class
 */
router.get("/class/:id/location", async (req, res) => {
  try {
    const classesCol = await collections.classes();
    const cls = await classesCol.findOne({ _id: req.params.id });
    if (!cls) return res.status(404).json({ error: "Not found" });
    res.json({ building: cls.building, coords: cls.coords });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/ai/recommend
 * body: { interests: "AI and robotics" }
 * Returns: AI-generated recommended classes
 */
router.post("/ai/recommend", async (req, res) => {
  try {
    const { interests } = req.body;
    const recs = await aiService.getClassRecommendations(interests, 5);
    res.json(recs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
