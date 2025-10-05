// routes/index.js
import express from "express";
import collections from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// /**
//  * GET /
//  * Homepage with featured classes
//  */
router.get("/", async (req, res) => {
  const classesCol = await collections.classes();
  const top = await classesCol.find({}).limit(10).toArray();
  res.render("home", { classes: top });
});

// /**
//  * GET /class/:id
//  * Show details for a single class
//  */
router.get("/class/:id", async (req, res) => {
  const classesCol = await collections.classes();
  const cls = await classesCol.findOne({ _id: req.params.id });
  if (!cls) return res.status(404).render("error", { message: "Class not found" });
  res.render("class", { cls });
});

// /**
//  * GET /majors
//  * Page showing all majors
//  */
router.get("/majors", async (req, res) => {
  const majorsCol = await collections.majors();
  const majors = await majorsCol.find({}).toArray();
  res.render("majors", { majors });
});

// /**
//  * GET /major/:id
//  * Page showing a single major + its classes
//  */
router.get("/major/:id", async (req, res) => {
  const majorsCol = await collections.majors();
  const classesCol = await collections.classes();

  const major = await majorsCol.findOne({ _id: req.params.id });
  if (!major) return res.status(404).render("error", { message: "Major not found" });

  const classes = await classesCol.find({ major: major.name }).toArray();
  res.render("major", { major, classes });
});

// /**
//  * GET /clubs
//  * Page showing all clubs
//  */
router.get("/clubs", async (req, res) => {
  const clubsCol = await collections.clubs();
  const clubs = await clubsCol.find({}).toArray();
  res.render("clubs", { clubs });
});

// /**
//  * GET /club/:id
//  * Page showing a single club
//  */
router.get("/club/:id", async (req, res) => {
  const clubsCol = await collections.clubs();
  const club = await clubsCol.findOne({ _id: req.params.id });
  if (!club) return res.status(404).render("error", { message: "Club not found" });
  res.render("club", { club });
});

/**
 * GET /
 * Homepage with featured classes
 */
router.get("/", async (req, res) => {
  try {
    const classesCol = await collections.classes();
    const classes = await classesCol.find({}).toArray(); // fetch all classes
    res.render("home", { classes });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load classes." });
  }
});

/**
 * GET /class/:id
 * Show details for a single class
 */
router.get("/class/:id", async (req, res) => {
  try {
    const classesCol = await collections.classes();
    const cls = await classesCol.findOne({ _id: req.params.id });
    if (!cls) return res.status(404).render("error", { message: "Class not found" });
    res.render("class", { cls });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load class." });
  }
});

router.get("/ai", (req, res) => res.render("ai", { title: "AI Helpers • ClassFoRU" }));

router.get("/map", (req, res) => {
  res.render("map", { title: "Campus Map • ClassFoRU" });
});


export default router;
