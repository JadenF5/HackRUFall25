// routes/api.js
import express from "express";
import xss from "xss";
import collections from "../config/mongoCollections.js";
import * as courseService from "../services/courseService.js";
import { getClassRecommendations, getMajorSuggestions } from "../services/aiService.js"; // <-- changed
import * as professorService from "../services/professorService.js";

const router = express.Router();

// GET /api/classes?offset=0&limit=10
router.get("/classes", async (req, res) => {
  try {
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);
    const limit  = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);

    const { department, campus, hasPrereqs, level, sort, order } = req.query;

    // Build filter
    const match = {};
    if (department) match.department = department;
    if (campus) match.campus = campus;

    if (hasPrereqs === "true")  match.hasPrereqs = true;
    if (hasPrereqs === "false") match.hasPrereqs = false;

    if (level && ["100","200","300"].includes(level)) {
      match.levelBand = parseInt(level, 10);
    }

    // Build sort
    const sortMap = {
      department: "department",
      campus: "campus",
      level: "levelBand",
      hasPrereqs: "hasPrereqs",
      code: "code",
    };
    const sortField = sortMap[sort] || "code";
    const sortDir   = (order === "desc") ? -1 : 1;
    const sortSpec  = { [sortField]: sortDir, code: 1 }; // tie-break on code

    const col = await collections.classes();
    const [items, total] = await Promise.all([
      col.find(match).sort(sortSpec).skip(offset).limit(limit).toArray(),
      col.countDocuments(match)
    ]);

    res.json({
      items,
      total,
      nextOffset: offset + items.length,
      hasMore: offset + items.length < total
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

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

router.get("/api/buses", async (req, res) => {
  try {
    const busCol = await collections.bus();
    const buses = await busCol.find({}).toArray();
    res.json(buses);
  } catch (e) {
    console.error("Error fetching buses:", e);
    res.status(500).json({ error: "Could not fetch buses" });
  }
});

/**
 * GET /api/buses/:id
 * Returns single bus by ID
 */
router.get("/api/buses/:id", async (req, res) => {
  try {
    const busCol = await collections.bus();
    let busDoc;

    try {
      busDoc = await busCol.findOne({ _id: new ObjectId(req.params.id) });
    } catch {
      return res.status(400).json({ error: "Invalid bus ID" });
    }

    if (!busDoc) return res.status(404).json({ error: "Bus not found" });
    res.json(busDoc);
  } catch (e) {
    console.error("Error fetching bus:", e);
    res.status(500).json({ error: "Could not fetch bus" });
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
// routes/api.js
// routes/api.js
router.get("/clubs", async (req, res) => {
  try {
    const sortRaw  = String(req.query.sort || "").trim().toLowerCase();   // '' | 'alpha' | 'popularity' | 'members'
    const orderRaw = String(req.query.order || "").trim().toLowerCase();  // '' | 'asc' | 'desc'

    const clubsCol = await collections.clubs();
    let cursor = clubsCol.find({});

    if (sortRaw) {
      let sortObj;

      if (sortRaw === "alpha") {
        // Always A→Z for name; ignore order param
        sortObj = { name: 1 };
      } else if (sortRaw === "popularity" || sortRaw === "members") {
        // Apply order only to numeric fields
        const dir = orderRaw === "desc" ? 1: -1; // desc=highest first, asc=lowest first
        sortObj = { [sortRaw]: dir, name: 1 };    // tie-break by name
      } else {
        // Fallback to name asc
        sortObj = { name: 1 };
      }

      cursor = cursor.sort(sortObj);
    }
    // else: no sort → natural DB order

    const clubs = await cursor.toArray();
    res.json(clubs);
  } catch (e) {
    console.error(e);
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

// AI: suggest majors for undecided students
router.post("/ai/majors", async (req, res) => {
  try {
    const interests = xss(req.body.interests || req.body.query || "");
    const recs = await getMajorSuggestions(interests, 5);
    res.json(recs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
