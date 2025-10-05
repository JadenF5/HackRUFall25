// seed.js
// scripts/seedClasses.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HackRUFall25';
const client = new MongoClient(uri);

// Use the same DB name as in your URI
// and the same collection name your app uses (`classes`)
const DB_NAME_FROM_URI = (uri.match(/\/([^/?]+)(\?|$)/) || [])[1] || 'HackRUFall25';
const COLLECTION = 'Classes';

// Base course list (code + title)
const COURSES = [
  'CS111 Introduction to Computer Science',
  'CS112 Data Structures and Algorithms',
  'CS211 Computer Organization',
  'CS213 Software Design & Development',
  'CS311 Algorithms & Complexity',
  'MATH135 Calculus I',
  'MATH136 Calculus II',
  'MATH211 Linear Algebra',
  'PHYS101 Physics I (Mechanics)',
  'PHYS102 Physics II (Electricity & Magnetism)',
  'CHEM101 General Chemistry',
  'CHEM102 Organic Chemistry',
  'ENGL101 English Composition',
  'PSYCH101 Introduction to Psychology',
  'ECON101 Principles of Economics',
  'ECE110 Introduction to Electrical & Computer Engineering',
  'ECE210 Digital Logic',
  'ECE250 Circuits',
  'CHE211 Thermodynamics',
  'ENG101 Introduction to Engineering',
  'ENG102 Engineering Design',
  'ACC201 Principles of Accounting',
  'FIN301 Corporate Finance',
  'MGT201 Principles of Management',
  'MKT301 Marketing Principles',
  'STAT201 Statistics for Business',
  'OM301 Operations Management',
  'PHIL100 Introduction to Philosophy',
  'HIST101 World History',
  'SOC101 Introduction to Sociology',
  'ART101 Introduction to Art',
  'SPAN101 Elementary Spanish I',
  'SPAN102 Elementary Spanish II',
  'FREN101 Elementary French I',
  'FREN102 Elementary French II',
  'BIO101 Introduction to Biology',
  'BIO102 General Biology Lab',
  'MATH222 Multivariable Calculus',
  'CS215 Programming Languages',
  'CS310 Computer Networks',
  'CS320 Database Systems',
  'CS330 Operating Systems',
  'CS340 Artificial Intelligence',
  'ENG201 Technical Writing',
  'ENG301 Engineering Ethics',
  'MKT302 Marketing Research',
  'PSYCH201 Cognitive Psychology',
  'SOC201 Sociology of Family',
  'HIST201 US History',
  'PHIL200 Ethics'
];

// Department lookup by prefix
const DEPT_BY_PREFIX = {
  CS: 'Computer Science',
  MATH: 'Mathematics',
  PHYS: 'Physics',
  CHEM: 'Chemistry',
  BIO: 'Biology',
  ENGL: 'English',
  ENG: 'Engineering',
  PSYCH: 'Psychology',
  ECON: 'Economics',
  ECE: 'Electrical & Computer Engineering',
  ME: 'Mechanical Engineering',
  ACC: 'Accounting',
  FIN: 'Finance',
  MGT: 'Management',
  MKT: 'Marketing',
  STAT: 'Statistics',
  OM: 'Operations Management',
  PHIL: 'Philosophy',
  HIST: 'History',
  SOC: 'Sociology',
  ART: 'Art',
  SPAN: 'World Languages',
  FREN: 'World Languages'
};

// Campus locations (pick one per class)
const CAMPUSES = ['College Ave', 'Busch', 'Livingston', 'Cook/Douglass'];

function randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function parseCourse(line) {
  // "CS111 Introduction to Computer Science" -> code="CS111", title="Introduction to Computer Science"
  const [code, ...rest] = line.split(' ');
  return { code, title: rest.join(' ').trim() };
}

function prefixFromCode(code) {
  // e.g. "CS111" -> "CS", "PHYS101" -> "PHYS"
  const m = code.match(/^[A-Z]+/);
  return m ? m[0] : '';
}

function numberFromCode(code) {
  const m = code.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : NaN;
}

function guessPrereqs(code) {
  // Light heuristics: 200+ level -> require the intro in same prefix
  // e.g., CS320 -> prereq "CS112"
  const prefix = prefixFromCode(code);
  const num = numberFromCode(code);
  if (!prefix || isNaN(num)) return [];

  if (prefix === 'CS') {
    if (num >= 300) return ['CS112'];
    if (num >= 200) return ['CS111'];
  }
  if (prefix === 'ECE') {
    if (num >= 200) return ['MATH135'];
  }
  if (prefix === 'MATH') {
    if (num >= 200) return ['MATH135'];
  }
  if (prefix === 'PHYS') {
    if (num >= 200) return ['PHYS101', 'MATH135'];
  }
  if (prefix === 'CHEM') {
    if (num >= 200) return ['CHEM101'];
  }
  if (prefix === 'FIN' || prefix === 'MGT' || prefix === 'MKT' || prefix === 'STAT' || prefix === 'OM' || prefix === 'ACC') {
    if (num >= 300) return ['STAT201']; // rough business prereq
  }
  // Defaults
  if (num >= 200) return [];
  return [];
}

function makeDescription({ code, title, department }) {
  // Short, consistent description without hitting an API
  const base = `${title} introduces core concepts in ${department.toLowerCase()} with an emphasis on practical skills and foundations.`;
  const extras = {
    CS: 'Topics may include programming paradigms, data structures, algorithms, and software tools.',
    MATH: 'Covers problem-solving, proof techniques, and real-world applications.',
    PHYS: 'Focuses on modeling, experiments, and mathematical formulations of physical systems.',
    CHEM: 'Includes structure, reactivity, and lab-based skills for chemical analysis.',
    BIO: 'Explores cellular processes, systems, and methods used in modern biology.',
    ECE: 'Blends hardware and software perspectives for modern computing systems.',
    ENGL: 'Develops clear writing, reading, and argumentation across genres.',
    PSYCH: 'Examines cognition, behavior, and research methods.',
    ECON: 'Analyzes markets, incentives, and macro/microeconomic frameworks.',
    STAT: 'Introduces probability, inference, and data analysis workflows.'
  };
  const pref = prefixFromCode(code);
  const extra = extras[pref] || '';
  return [base, extra].filter(Boolean).join(' ');
}

function levelBandFromNumber(n) {
  if (isNaN(n)) return null;
  if (n >= 300) return 300;
  if (n >= 200) return 200;
  if (n >= 100) return 100;
  return null;
}

function buildDoc(line) {
  const { code, title } = parseCourse(line);
  const prefix = prefixFromCode(code);
  const department = DEPT_BY_PREFIX[prefix] || 'General Studies';
  const campus = randPick(CAMPUSES);
  const prereqsArr = guessPrereqs(code);
  const num = numberFromCode(code);

  return {
    _id: code,
    code,
    title,
    department,
    campus,
    prereqs: prereqsArr,
    description: makeDescription({ code, title, department }),
    // NEW derived fields:
    levelBand: levelBandFromNumber(num),    // 100 | 200 | 300 | null
    hasPrereqs: Array.isArray(prereqsArr) && prereqsArr.length > 0, // true/false
    createdAt: new Date(),
  };
}

async function main() {
  await client.connect();
  const db = client.db(DB_NAME_FROM_URI);
  const col = db.collection(COLLECTION);

  // Build docs
  const docs = COURSES.map(buildDoc);

  // Upsert so you can re-run safely
  const ops = docs.map(doc => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: doc },
      upsert: true
    }
  }));

  const res = await col.bulkWrite(ops, { ordered: false });
  console.log('Seeded classes:', {
    upserted: res.upsertedCount,
    modified: res.modifiedCount,
    matched: res.matchedCount
  });

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
