// config/mongoCollections.js
import { getDb } from "./mongoConnections.js";

export default {
  classes: async function () {
    const db = getDb();
    return db.collection("Classes");
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


//This is a push comment