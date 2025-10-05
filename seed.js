// // seed.js
// import { connectToDb } from "./config/mongoConnections.js";
// import collections from "./config/mongoCollections.js";
// import { updateClassWithSOC } from "./services/courseService.js";

// async function main() {
//   await connectToDb();

//   const classesCol = await collections.classes();
//   const majorsCol = await collections.majors();

//   // Clear old data
//   await classesCol.deleteMany({});
//   await majorsCol.deleteMany({});

//   // Insert majors
//   await majorsCol.insertMany([
//     { _id: "CS", name: "Computer Science", description: "Study of computation, algorithms, and programming." },
//     { _id: "ENG", name: "English", description: "Study of literature, writing, and language." },
//     { _id: "ECE", name: "Electrical Engineering", description: "Study of circuits, digital systems, and electronics." }
//   ]);

//   // Insert sample classes with real Rutgers subject codes
//   const sample = [
//     {
//       _id: "CS101",
//       subject: "198",      // Rutgers subject code for Computer Science
//       number: "111",       // Intro to Computer Science
//       title: "Introduction to Computer Science",
//       description: "Intro to programming, problem solving with Python.",
//       major: "Computer Science",
//       tags: ["programming", "python", "intro"],
//       professors: [],
//       prereqs: [],
//       difficulty: 3,
//       location: "Livingston"
//     },
//     {
//       _id: "ENG201",
//       subject: "355",      // Rutgers subject code for Writing Program (01:355)
//       number: "201",       // Expository Writing / Creative Writing intro-level
//       title: "Introduction to Creative Writing",
//       description: "Workshop for fiction and poetry.",
//       major: "English",
//       tags: ["writing", "creative", "workshop"],
//       professors: [],
//       prereqs: [],
//       difficulty: 2,
//       location: "College Ave"
//     },
//     {
//       _id: "ECE250",
//       subject: "332",      // Rutgers subject code for Electrical/Computer Engineering (14:332)
//       number: "231",       // Digital Logic Design
//       title: "Digital Systems",
//       description: "Binary logic, circuits, and basics of digital design.",
//       major: "Electrical Engineering",
//       tags: ["hardware", "logic", "circuits"],
//       professors: [],
//       prereqs: ["CS101", "MATH141"],
//       difficulty: 4,
//       location: "Busch"
//     }
//   ];

//   await classesCol.insertMany(sample);

//   console.log("✅ Sample majors and classes inserted.");

//   // 🔑 Now update professors from SOC
//   try {
//     await updateClassWithSOC("CS101", { year: 2025, term: 9, campus: "NB", level: "UG" });
//     await updateClassWithSOC("ENG201", { year: 2025, term: 9, campus: "NB", level: "UG" });
//     await updateClassWithSOC("ECE250", { year: 2025, term: 9, campus: "NB", level: "UG" });
//     console.log("✅ Classes updated with professors from SOC.");
//   } catch (e) {
//     console.error("❌ Failed to fetch SOC data:", e);
//   }

//   process.exit(0);
// }

// main().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });


// seed.js
import { connectToDb } from "./config/mongoConnections.js";
import collections from "./config/mongoCollections.js";

async function main() {
  await connectToDb();

  const classesCol = await collections.classes();

  // Clear old classes
  await classesCol.deleteMany({});

  // Full list of classes with department
  const classes = [
    { code: "CS111 Introduction to Computer Science", department: "Computer Science" },
    { code: "CS112 Data Structures and Algorithms", department: "Computer Science" },
    { code: "CS211 Computer Organization", department: "Computer Science" },
    { code: "CS213 Software Design & Development", department: "Computer Science" },
    { code: "CS215 Programming Languages", department: "Computer Science" },
    { code: "CS310 Computer Networks", department: "Computer Science" },
    { code: "CS320 Database Systems", department: "Computer Science" },
    { code: "CS330 Operating Systems", department: "Computer Science" },
    { code: "CS340 Artificial Intelligence", department: "Computer Science" },
    { code: "MATH135 Calculus I", department: "Mathematics" },
    { code: "MATH136 Calculus II", department: "Mathematics" },
    { code: "MATH211 Linear Algebra", department: "Mathematics" },
    { code: "MATH222 Multivariable Calculus", department: "Mathematics" },
    { code: "PHYS101 Physics I (Mechanics)", department: "Physics" },
    { code: "PHYS102 Physics II (Electricity & Magnetism)", department: "Physics" },
    { code: "CHEM101 General Chemistry", department: "Chemistry" },
    { code: "CHEM102 Organic Chemistry", department: "Chemistry" },
    { code: "CHE211 Thermodynamics", department: "Chemistry" },
    { code: "ENGL101 English Composition", department: "English" },
    { code: "ENG201 Technical Writing", department: "Engineering" },
    { code: "ENG301 Engineering Ethics", department: "Engineering" },
    { code: "PSYCH101 Introduction to Psychology", department: "Psychology" },
    { code: "PSYCH201 Cognitive Psychology", department: "Psychology" },
    { code: "ECON101 Principles of Economics", department: "Economics" },
    { code: "ACC201 Principles of Accounting", department: "Accounting" },
    { code: "FIN301 Corporate Finance", department: "Finance" },
    { code: "MGT201 Principles of Management", department: "Management" },
    { code: "MKT301 Marketing Principles", department: "Marketing" },
    { code: "MKT302 Marketing Research", department: "Marketing" },
    { code: "STAT201 Statistics for Business", department: "Statistics" },
    { code: "OM301 Operations Management", department: "Operations Management" },
    { code: "ECE110 Introduction to Electrical & Computer Engineering", department: "Electrical & Computer Engineering" },
    { code: "ECE210 Digital Logic", department: "Electrical & Computer Engineering" },
    { code: "ECE250 Circuits", department: "Electrical & Computer Engineering" },
    { code: "ENG101 Introduction to Engineering", department: "Engineering" },
    { code: "ENG102 Engineering Design", department: "Engineering" },
    { code: "PHIL100 Introduction to Philosophy", department: "Philosophy" },
    { code: "PHIL200 Ethics", department: "Philosophy" },
    { code: "HIST101 World History", department: "History" },
    { code: "HIST201 US History", department: "History" },
    { code: "SOC101 Introduction to Sociology", department: "Sociology" },
    { code: "SOC201 Sociology of Family", department: "Sociology" },
    { code: "ART101 Introduction to Art", department: "Art" },
    { code: "SPAN101 Elementary Spanish I", department: "Languages" },
    { code: "SPAN102 Elementary Spanish II", department: "Languages" },
    { code: "FREN101 Elementary French I", department: "Languages" },
    { code: "FREN102 Elementary French II", department: "Languages" },
    { code: "BIO101 Introduction to Biology", department: "Biology" },
    { code: "BIO102 General Biology Lab", department: "Biology" }
  ];

  // Insert into MongoDB
  await classesCol.insertMany(classes);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
