// config/mongoCollections.js
import { getDb } from "./mongoConnections.js";

export default {
  classes: async function () {
    const db = getDb();
    return db.collection("classes");
  },
  majors: async function () {
    const db = getDb();
    return db.collection("majors");
  },
  clubs: async function () {
    const db = getDb();
    return db.collection("clubs");
  },
  ratings: async function () {
    const db = getDb();
    return db.collection("ratings");
  }
};
