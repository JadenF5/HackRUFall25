// scripts/seedClubs.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HackRUFall25';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const prefixes = [
  'Rutgers', 'RU', 'Scarlet', 'New Brunswick', 'Campus', 'Society of', 'Association of',
  'Club', 'Union', 'Council', 'Coalition', 'Circle', 'Collective'
];

const topics = [
  'Computer Science', 'Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Robotics',
  'Mathematics', 'Statistics', 'Biology', 'Chemistry', 'Physics',
  'Psychology', 'Neuroscience', 'Cognitive Science', 'Economics', 'Finance',
  'Entrepreneurship', 'Consulting', 'Marketing', 'Product Design', 'UX/UI',
  'Debate', 'Model UN', 'Public Speaking', 'Journalism', 'Photography',
  'Film', 'Music Production', 'A Cappella', 'Jazz', 'Orchestra',
  'Dance', 'K-Pop', 'Bharatanatyam', 'Ballroom', 'Hip Hop',
  'Anime', 'Board Games', 'Esports', 'Hackers', 'Open Source',
  'Sustainability', 'Clean Energy', 'Gardening', 'Hiking', 'Astronomy',
  'Volunteering', 'Tutoring', 'STEM Outreach', 'Mental Health', 'Health & Fitness',
];

const descriptors = [
  'Society', 'Club', 'Association', 'Circle', 'Collective', 'Network',
  'Guild', 'League', 'Union', 'Initiative', 'Chapter', 'Community'
];

function makeNameSet(count) {
  const set = new Set();
  while (set.size < count) {
    const name = `${pick(prefixes)} ${pick(topics)} ${pick(descriptors)}`.replace(/\s+/g, ' ').trim();
    set.add(name);
  }
  return Array.from(set);
}

function makeDescription(topic) {
  const lines = [
    `A student-led group focused on ${topic.toLowerCase()} with weekly meetings, workshops, and socials.`,
    `We host guest speakers, hands-on projects, and collaborative events related to ${topic.toLowerCase()}.`,
    `Open to all majors and experience levels — come learn, build, and connect!`,
  ];
  return lines.join(' ');
}

function buildClubDoc(name) {
  const topicWord = topics.find(t => name.includes(t)) || 'Student Life';
  const popularity = rand(2, 5);      // 2–5 stars
  const members = rand(25, 400);      // rough headcount
  return {
    _id: slugify(name),                // pretty, stable URL id
    name,
    description: makeDescription(topicWord),
    popularity,
    members,
    createdAt: new Date(),
  };
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(); // from URI
    const col = db.collection('clubs');

    const names = makeNameSet(50);
    const docs = names.map(buildClubDoc);

    // Upsert to avoid duplicates when reseeding
    const ops = docs.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true
      }
    }));

    const res = await col.bulkWrite(ops, { ordered: false });
    console.log('Seeded clubs:', { upserts: res.upsertedCount, modified: res.modifiedCount, matched: res.matchedCount });
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
