import express from "express";
import collections from "../config/mongoCollections.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const classesCol = await collections.classes();
  const top = await classesCol.find({}).limit(20).toArray();
  res.render("home", { classes: top });
});

router.get("/class/:id", async (req, res) => {
  const id = req.params.id;
  const classesCol = await collections.classes();
  const cls = await classesCol.findOne({ _id: id }) || {};
  res.render("class", { cls });
});

router.get("/major/:id", async (req, res) => {
  const majorsCol = await collections.majors();
  const classesCol = await collections.classes();
  const major = await majorsCol.findOne({ _id: req.params.id });
  const classes = await classesCol.find({ major: major.name }).toArray();
  res.render("major", { major, classes });
});

router.get("/club/:id", async (req, res) => {
  const clubsCol = await collections.clubs();
  const club = await clubsCol.findOne({ _id: req.params.id });
  res.render("club", { club });
});

export default router;
