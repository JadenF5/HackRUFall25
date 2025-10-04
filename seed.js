// seed.js
import { connectToDb } from "./config/mongoConnections.js";
import collections from "./config/mongoCollections.js";

async function main() {
  await connectToDb();
  const classesCol = await collections.classes();

  const sample = [
    {
      _id: "CS101",
      title: "Introduction to Computer Science",
      description: "Intro to programming, problem solving with Python.",
      major: "Computer Science",
      tags: ["programming", "python", "intro"],
      prereqs: [],
      difficulty: 3,
      location: "Livingston"
    },
    {
      _id: "ENG201",
      title: "Intro to Creative Writing",
      description: "Workshop for fiction and poetry.",
      major: "English",
      tags: ["writing", "creative", "workshop"],
      prereqs: [],
      difficulty: 2,
      location: "College Ave"
    },
    {
      _id: "ECE250",
      title: "Digital Systems",
      description: "Binary logic, circuits, and basics of digital design.",
      major: "Electrical Engineering",
      tags: ["hardware", "logic", "circuits"],
      prereqs: ["CS101", "MATH141"],
      difficulty: 4,
      location: "Busch"
    },
    {
      _id: "MA011",
      title: "Precalculus I Workshop",
      description: "A workshop course that covers algebra, functions, and trigonometry to prepare students for calculus.",
      major: "Mathematics",
      tags: ["precalculus", "algebra", "trigonometry", "workshop"],
      prereqs: [],
      difficulty: 2,
      location: "Livingston"
    },
  ];

  await classesCol.deleteMany({});
  await classesCol.insertMany(sample);
  console.log("Seed complete");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
