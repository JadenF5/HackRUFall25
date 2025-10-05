// routes/index.js
import express from "express";
import collections from "../config/mongoCollections.js";
import { majors } from "../services/Majors.js"; // 👈 your hardcoded majors

import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * GET /
 * Homepage with featured classes
 */
router.get("/", async (req, res) => {
  try {
    const classesCol = await collections.classes();
    const top = await classesCol.find({}).limit(10).toArray();
    res.render("home", { classes: top });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load homepage." });
  }
});

/**
 * GET /majors
 * Page showing all majors
 */
router.get("/majors", (req, res) => {
  res.render("majors", { majors });
});

/**
 * GET /major/:id
 * Show a single major + classes (hardcoded majors, classes from DB)
 */
router.get("/major/:id", async (req, res) => {
  try {
    const classesCol = await collections.classes();
    const major = majors.find(m => m._id === req.params.id);

    if (!major) return res.status(404).render("error", { message: "Major not found" });

    // For now, filter classes by major name
    const classes = await classesCol.find({ major: major.name }).toArray();
    res.render("major", { major, classes });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load major." });
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

/**
 * GET /clubs
 * List of all clubs
 */
router.get("/clubs", async (req, res) => {
  try {
    const clubsCol = await collections.clubs();
    const clubs = await clubsCol.find({}).toArray();
    res.render("clubs", { clubs });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load clubs." });
  }
});

/**
 * GET /club/:id
 * Show a single club
 */
router.get("/club/:id", async (req, res) => {
  try {
    const clubsCol = await collections.clubs();
    const club = await clubsCol.findOne({ _id: req.params.id });
    if (!club) return res.status(404).render("error", { message: "Club not found" });
    res.render("club", { club });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load club." });
  }
});

/**
 * GET /bus
 * Show bus routes (hardcoded for now)
 */
router.get("/bus", async (req, res) => {
  try {
    // Hardcoded bus data
    const buses = [
      {
        name: "A Route",
        stops: [
          "College Avenue Student Center",
          "The Yard (Scott Hall)",
          "Student Activities Center",
          "Stadium West Lot",
          "Hill Center",
          "Science Buildings",
          "Busch Student Center",
          "Werblin Recreation Center"
        ]
      },
      {
        name: "H Route",
        stops: [
          "College Avenue Student Center",
          "The Yard (Scott Hall)",
          "Student Activities Center",
          "Werblin Recreation Center",
          "Busch Student Center",
          "Allison Road Classroom Building",
          "Hill Center",
          "Stadium West Lot"
        ]
      },
      {
        name: "LX Route",
        stops: [
          "College Avenue Student Center",
          "The Yard (Scott Hall)",
          "Student Activities Center",
          "Livingston Plaza",
          "Livingston Student Center",
          "Quads"
        ]
      },
      {
        name: "B Route",
        stops: [
          "Livingston Student Center",
          "Quads",
          "Hill Center",
          "Science Buildings",
          "Busch Student Center",
          "Livingston Plaza"
        ]
      },
      {
        name: "F Route",
        stops: [
          "Red Oak Lane",
          "Lipman Hall",
          "College Hall",
          "Student Activities Center",
          "The Yard (Scott Hall)"
        ]
      },
      {
        name: "BL Route",
        stops: [
          "Jersey Mike's Arena",
          "Livingston Student Center",
          "Quads",
          "Busch Student Center",
          "Rodkin",
          "Stadium West Lot",
          "Hill Center",
          "Science Buildings"
        ]
      },
      {
        name: "C Route",
        stops: [
          "Stadium West Lot",
          "Hill Center",
          "Allison Road Classroom Building",
          "Hill Center"
        ]
      },
      {
        name: "EE Route",
        stops: [
          "College Avenue Student Center",
          "The Yard (Scott Hall)",
          "SoCam Apartments",
          "Red Oak Lane",
          "Lipman Hall",
          "Biel Road",
          "Henderson Apartments",
          "Gibbons",
          "College Hall",
          "SoCam Apartments",
          "Sutdent Activities Center"
        ]
      },
      {
        name:"REXB Route",
        stops: [
          "Red Oak Lane",
          "Lipman Hall",
          "College Hall",
          "Hill Center",
          "Allison Road Classroom Building",
          "Hill Center"
        ]
      },
      {
        name: "REXL Route",
        stops: [
          "Red Oak Lane",
          "Lipman Hall",
          "College Hall",
          "Livingston Plaza",
          "Livingston Student Center"
        ]
      }
    ];

    // Render the buses page
    res.render("bus", { buses });
  } catch (e) {
    console.error("Error loading bus routes:", e);
    res.status(500).render("error", { message: "Could not load bus routes" });
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