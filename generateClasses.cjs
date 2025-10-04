require('dotenv').config();
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
const dbName = 'rutgersDB';
const collectionName = 'Classes';

// Hugging Face API
const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY;
const MODEL = 'gpt2'; // You can switch to other hosted models if desired

// Example Rutgers classes — start with a few
const rutgersClasses = [
  { code: 'CS101', name: 'Introduction to Computer Science' },
  { code: 'MATH201', name: 'Calculus II' },
  { code: 'PHIL100', name: 'Introduction to Philosophy' }
];

// Delay function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate class description via Hugging Face API
async function generateDescription(course) {
  const prompt = `Write a concise 2-3 sentence description for the Rutgers class ${course.code} - ${course.name}.`;

  const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt })
  });

  const data = await response.json();

  // Hugging Face may return an error field if the model is loading
  if (data.error) {
    console.error('Hugging Face API error:', data.error);
    return 'Description could not be generated at this time.';
  }

  // Depending on the model, output may be an array of text objects
  if (Array.isArray(data)) return data[0].generated_text.trim();
  if (data.hasOwnProperty('generated_text')) return data.generated_text.trim();

  return data.toString().trim();
}

// Main function
async function main() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const classesCollection = db.collection(collectionName);

    for (const course of rutgersClasses) {
      const existing = await classesCollection.findOne({ code: course.code });
      if (existing) {
        console.log(`${course.code} already exists. Skipping.`);
        continue;
      }

      console.log(`Generating description for ${course.code}...`);
      const description = await generateDescription(course);

      await classesCollection.insertOne({
        code: course.code,
        name: course.name,
        description,
        featured: true
      });

      console.log(`Inserted ${course.code} into MongoDB.`);
      await sleep(300); // 300ms delay
    }

    console.log('Finished generating classes!');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoClient.close();
  }
}

main();
