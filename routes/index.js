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

export default router;
