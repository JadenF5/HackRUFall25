// seed.js
import { connectToDb } from "./config/mongoConnections.js";
import collections from "./config/mongoCollections.js";
import { updateClassWithSOC } from "./services/courseService.js";

async function main() {
  await connectToDb();

  const classesCol = await collections.classes();
  const majorsCol = await collections.majors();

  // Clear old data
  await classesCol.deleteMany({});
  await majorsCol.deleteMany({});

  // Insert majors
  await majorsCol.insertMany([
    { _id: "CS", name: "Computer Science", description: "Study of computation, algorithms, and programming." },
    { _id: "ENG", name: "English", description: "Study of literature, writing, and language." },
    { _id: "ECE", name: "Electrical Engineering", description: "Study of circuits, digital systems, and electronics." }
  ]);

  // Insert sample classes with real Rutgers subject codes
  const sample = [
    {
      _id: "CS101",
      subject: "198",      // Rutgers subject code for Computer Science
      number: "111",       // Intro to Computer Science
      title: "Introduction to Computer Science",
      description: "Intro to programming, problem solving with Python.",
      major: "Computer Science",
      tags: ["programming", "python", "intro"],
      professors: [],
      prereqs: [],
      difficulty: 3,
      location: "Livingston"
    },
    {
      _id: "ENG201",
      subject: "355",      // Rutgers subject code for Writing Program (01:355)
      number: "201",       // Expository Writing / Creative Writing intro-level
      title: "Introduction to Creative Writing",
      description: "Workshop for fiction and poetry.",
      major: "English",
      tags: ["writing", "creative", "workshop"],
      professors: [],
      prereqs: [],
      difficulty: 2,
      location: "College Ave"
    },
    {
      _id: "ECE250",
      subject: "332",      // Rutgers subject code for Electrical/Computer Engineering (14:332)
      number: "231",       // Digital Logic Design
      title: "Digital Systems",
      description: "Binary logic, circuits, and basics of digital design.",
      major: "Electrical Engineering",
      tags: ["hardware", "logic", "circuits"],
      professors: [],
      prereqs: ["CS101", "MATH141"],
      difficulty: 4,
      location: "Busch"
    }
  ];

  await classesCol.insertMany(sample);

  console.log("✅ Sample majors and classes inserted.");

  // 🔑 Now update professors from SOC
  try {
    await updateClassWithSOC("CS101", { year: 2025, term: 9, campus: "NB", level: "UG" });
    await updateClassWithSOC("ENG201", { year: 2025, term: 9, campus: "NB", level: "UG" });
    await updateClassWithSOC("ECE250", { year: 2025, term: 9, campus: "NB", level: "UG" });
    console.log("✅ Classes updated with professors from SOC.");
  } catch (e) {
    console.error("❌ Failed to fetch SOC data:", e);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
