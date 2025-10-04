// routes/api.js
import express from "express";
import xss from "xss";
import collections from "../config/mongoCollections.js";
import * as courseService from "../services/courseService.js";
import { getClassRecommendations } from "../services/aiService.js"; // <-- changed
import * as professorService from "../services/professorService.js";

const router = express.Router();

/**
 * POST /api/search
 * body: { query: "robotics and python" }
 * Returns: { local: [...], ai: [...] }
 */
router.post("/search", async (req, res) => {
  try {
    const q = xss(req.body.query || "");
    const localResults = await courseService.searchLocal(q);
    const aiRec = await getClassRecommendations(q, 5); // <-- changed
    res.json({ local: localResults, ai: aiRec });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/majors
 * Returns: all majors
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
 * Returns: classes belonging to a given major
 */
router.get("/majors/:id/classes", async (req, res) => {
  try {
    const majorsCol = await collections.majors();
    const classesCol = await collections.classes();

    const major = await majorsCol.findOne({ _id: req.params.id });
    if (!major) return res.status(404).json({ error: "Major not found" });

    const results = await classesCol.find({ major: major.name }).toArray();
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/clubs
 * Returns: all clubs
 */
router.get("/clubs", async (req, res) => {
  try {
    const clubsCol = await collections.clubs();
    const clubs = await clubsCol.find({}).toArray();
    res.json(clubs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/class/:id/ratings
 * Returns: ratings for a class
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
 * Returns: AI-generated recommendations
 */
router.post("/ai/recommend", async (req, res) => {
  try {
    const { interests } = req.body;
    const recs = await getClassRecommendations(interests, 5); // <-- changed
    res.json(recs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// add above export default router;
router.get("/search", async (req, res) => {
  try {
    const q = xss(req.query.q || req.query.query || "");
    const localResults = await courseService.searchLocal(q);
    const aiRec = await getClassRecommendations(q, 5); // <-- changed
    res.json({ local: localResults, ai: aiRec });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/class/:id/professors", async (req, res) => {
  try {
    const classesCol = await collections.classes();
    let cls = await classesCol.findOne({ _id: req.params.id });
    if (!cls) return res.status(404).json({ professors: [] });

    if (!cls.professors || cls.professors.length === 0) {
      await courseService.updateClassWithSOC(req.params.id, {
        year: 2025,
        term: 9,
        campus: "NB",
        level: "UG"
      });
      cls = await classesCol.findOne({ _id: req.params.id });
    }

    const ratings = [];
    for (const profName of cls.professors) {
      const data = await professorService.getProfessorRatings(profName);
      if (data) ratings.push(data);
    }

    // ✅ sort by highest rating first
    ratings.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    res.json({ professors: ratings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
