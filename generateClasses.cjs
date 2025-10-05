// require("dotenv").config(); 
// const { MongoClient } = require("mongodb");
// const Groq = require("groq-sdk");

// // Groq setup
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// // MongoDB connection
// const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
// const client = new MongoClient(uri);
// const dbName = "HackRUFall25";
// const collectionName = "Classes";

// // Sample courses
// const courses = [
//   "CS111 Introduction to Computer Science",
//   "CS112 Data Structures and Algorithms",
//   "CS211 Computer Organization",
//   "CS213 Software Design & Development",
//   "CS311 Algorithms & Complexity",
//   "MATH135 Calculus I",
//   "MATH136 Calculus II",
//   "MATH211 Linear Algebra",
//   "PHYS101 Physics I (Mechanics)",
//   "CHEM101 General Chemistry",
//   "ENGL101 English Composition",
//   "PSYCH101 Introduction to Psychology",
//   "ECON101 Principles of Economics",
//   "ECE110 Introduction to Electrical & Computer Engineering",
//   "ECE210 Digital Logic",
//   "ECE250 Circuits",
//   "CHE211 Thermodynamics",
//   "ENG101 Introduction to Engineering",
//   "ENG102 Engineering Design",
//   "ACC201 Principles of Accounting",
//   "FIN301 Corporate Finance",
//   "MGT201 Principles of Management",
//   "MKT301 Marketing Principles",
//   "STAT201 Statistics for Business",
//   "OM301 Operations Management",
//   "PHIL100 Introduction to Philosophy",
//   "HIST101 World History",
//   "SOC101 Introduction to Sociology",
//   "ART101 Introduction to Art",
//   "SPAN101 Elementary Spanish I",
//   "FREN101 Elementary French I",
//   "BIO101 Introduction to Biology",
//   "BIO102 General Biology Lab",
//   "CHEM102 Organic Chemistry",
//   "PHYS102 Physics II (Electricity & Magnetism)",
//   "MATH222 Multivariable Calculus",
//   "CS215 Programming Languages",
//   "CS310 Computer Networks",
//   "CS320 Database Systems",
//   "CS330 Operating Systems",
//   "CS340 Artificial Intelligence",
//   "ENG201 Technical Writing",
//   "ENG301 Engineering Ethics",
//   "MKT302 Marketing Research",
//   "PSYCH201 Cognitive Psychology",
//   "SOC201 Sociology of Family",
//   "HIST201 US History",
//   "PHIL200 Ethics",
//   "SPAN102 Elementary Spanish II",
//   "FREN102 Elementary French II"
// ];

// // Map of course prefixes to departments
// const departmentMap = {
//   CS: "Computer Science",
//   MATH: "Mathematics",
//   PHYS: "Physics",
//   CHEM: "Chemistry",
//   BIO: "Biology",
//   ENGL: "English",
//   ENG: "Engineering",
//   PSYCH: "Psychology",
//   ECON: "Economics",
//   ECE: "Electrical & Computer Engineering",
//   ME: "Mechanical Engineering",
//   ACC: "Accounting",
//   FIN: "Finance",
//   MGT: "Management",
//   MKT: "Marketing",
//   STAT: "Statistics",
//   OM: "Operations Management",
//   PHIL: "Philosophy",
//   HIST: "History",
//   SOC: "Sociology",
//   ART: "Art",
//   SPAN: "Languages",
//   FREN: "Languages"
// };

// // Generate description
// async function generateDescription(courseCode) {
//   try {
//     // Generate description, location, prereqs
//     async function generateDetails(courseCode) {
//       try {
//         const response = await groq.chat.completions.create({
//           model: "llama-3.1-8b-instant",
//           messages: [
//         { role: "system", content: "You are an assistant that generates short, clear Rutgers class descriptions, prereqs, and campus location." },
//         { role: "user", content: `For the Rutgers course ${courseCode}, provide: 1) a 2-3 sentence description, 2) any prereqs as a list of course codes, and 3) the campus/location.` }
//       ],
//       max_tokens: 150

//     });

//     return response.choices[0].message.content.trim();

//   } catch (error) {
//     console.error("Groq API error:", error);
//     return null;
//   }
// }

// // Main function
// async function main() {
//   try {
//     await client.connect();
//     const db = client.db(dbName);
//     const collection = db.collection(collectionName);

//     for (const course of courses) {
//       console.log(`Generating details for ${course}...`);

//       const exists = await collection.findOne({ code: course });
//       if (exists) {
//         console.log(`${course} already exists. Skipping.`);
//         continue;
//       }

//       const {description, prereqs, location} = await generateDescription(course);

//       // Extract department from course code prefix
//       const prefix = course.split(/[\s:]/)[0].match(/[A-Z]+/)[0];
//       const department = departmentMap[prefix] || "Unknown";

//       const courseDoc = {
//         code: course,
//         department,
//         description: description || "Description unavailable.",
//         prereqs,
//         location,
//         createdAt: new Date(),
//       };

//       await collection.insertOne(courseDoc);
//       console.log(`Inserted ${course} into MongoDB.`);
//     }

//     console.log("Finished generating classes!");
//   } catch (err) {
//     console.error("Error:", err);
//   } finally {
//     await client.close();
//   }
// }

// main();


require("dotenv").config();
const { MongoClient } = require("mongodb");
const Groq = require("groq-sdk");

// Groq setup
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// MongoDB connection
const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
const dbName = "HackRUFall25";
const collectionName = "Classes";

// Sample courses
const courses = [
  "CS111 Introduction to Computer Science",
  "CS112 Data Structures and Algorithms",
  "CS211 Computer Organization",
  "CS213 Software Design & Development",
  "CS311 Algorithms & Complexity",
  "MATH135 Calculus I",
  "MATH136 Calculus II",
  "MATH211 Linear Algebra",
  "PHYS101 Physics I (Mechanics)",
  "CHEM101 General Chemistry",
  "ENGL101 English Composition",
  "PSYCH101 Introduction to Psychology",
  "ECON101 Principles of Economics",
  "ECE110 Introduction to Electrical & Computer Engineering",
  "ECE210 Digital Logic",
  "ECE250 Circuits",
  "CHE211 Thermodynamics",
  "ENG101 Introduction to Engineering",
  "ENG102 Engineering Design",
  "ACC201 Principles of Accounting",
  "FIN301 Corporate Finance",
  "MGT201 Principles of Management",
  "MKT301 Marketing Principles",
  "STAT201 Statistics for Business",
  "OM301 Operations Management",
  "PHIL100 Introduction to Philosophy",
  "HIST101 World History",
  "SOC101 Introduction to Sociology",
  "ART101 Introduction to Art",
  "SPAN101 Elementary Spanish I",
  "FREN101 Elementary French I",
  "BIO101 Introduction to Biology",
  "BIO102 General Biology Lab",
  "CHEM102 Organic Chemistry",
  "PHYS102 Physics II (Electricity & Magnetism)",
  "MATH222 Multivariable Calculus",
  "CS215 Programming Languages",
  "CS310 Computer Networks",
  "CS320 Database Systems",
  "CS330 Operating Systems",
  "CS340 Artificial Intelligence",
  "ENG201 Technical Writing",
  "ENG301 Engineering Ethics",
  "MKT302 Marketing Research",
  "PSYCH201 Cognitive Psychology",
  "SOC201 Sociology of Family",
  "HIST201 US History",
  "PHIL200 Ethics",
  "SPAN102 Elementary Spanish II",
  "FREN102 Elementary French II"
];

// Map of course prefixes to departments
const departmentMap = {
  CS: "Computer Science",
  MATH: "Mathematics",
  PHYS: "Physics",
  CHEM: "Chemistry",
  BIO: "Biology",
  ENGL: "English",
  ENG: "Engineering",
  PSYCH: "Psychology",
  ECON: "Economics",
  ECE: "Electrical & Computer Engineering",
  ME: "Mechanical Engineering",
  ACC: "Accounting",
  FIN: "Finance",
  MGT: "Management",
  MKT: "Marketing",
  STAT: "Statistics",
  OM: "Operations Management",
  PHIL: "Philosophy",
  HIST: "History",
  SOC: "Sociology",
  ART: "Art",
  SPAN: "Languages",
  FREN: "Languages"
};

// Generate course details using Groq
async function generateDetails(courseCode) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an assistant that generates short Rutgers class descriptions and prereqs.",
        },
        {
          role: "user",
          content: `For the Rutgers course ${courseCode}, provide a JSON object with keys: "description" (2-3 sentences) and "prereqs" (array of course codes).`,
        },
      ],
      max_tokens: 120
    });

    const rawText = response.choices[0].message.content.trim();

    // Attempt to extract JSON safely
    let description = "Description unavailable.";
    let prereqs = [];

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        description = parsed.description || rawText;
        prereqs = Array.isArray(parsed.prereqs) ? parsed.prereqs : [];
      } catch (e) {
        console.warn(`Failed to parse JSON for ${courseCode}, using raw text as description.`);
        description = rawText;
        prereqs = [];
      }
    } else {
      description = rawText;
    }

    // Convert prereqs array to displayable string
    const prereqDisplay = prereqs.length > 0 ? prereqs.join(", ") : "None";

    return { description, prereqs: prereqDisplay };
  } catch (error) {
    console.error(`Groq API error for ${courseCode}:`, error);
    return { description: "Description unavailable.", prereqs: "None" };
  }
}

// Main function
async function main() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    for (const course of courses) {
      console.log(`Generating details for ${course}...`);

      const exists = await collection.findOne({ code: course });
      if (exists) {
        console.log(`${course} already exists. Skipping.`);
        continue;
      }

      const { description, prereqs } = await generateDetails(course);

      // Extract department from course code prefix
      const prefix = course.split(/[\s:]/)[0].match(/[A-Z]+/)[0];
      const department = departmentMap[prefix] || "Unknown";

      const courseDoc = {
        code: course,
        department,
        description,
        prereqs,
        createdAt: new Date(),
      };

      await collection.insertOne(courseDoc);
      console.log(`Inserted ${course} into MongoDB.`);
    }

    console.log("✅ Finished generating all classes!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

main();
