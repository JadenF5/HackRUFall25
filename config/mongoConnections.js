// config/mongoConnections.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { mongoConfig as settingsMongo } from "../settings.js"; // adjust path if needed

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// prefer environment variable, then fall back to settings.js
const serverUrl = process.env.MONGO_URI || settingsMongo?.serverUrl;
if (!serverUrl) {
  throw new Error("No MongoDB connection string found. Set MONGO_URI or provide settings.js");
}

const mongoConfig = {
  serverUrl,
  database: process.env.MONGO_DB_NAME || settingsMongo?.database || "HackRUFall25"
};

let _connection = undefined;
let _db = undefined;

export async function connectToDb() {
  if (!_connection) {
    // if the serverUrl looks like mongodb+srv use it directly
    _connection = await MongoClient.connect(mongoConfig.serverUrl, {
      useUnifiedTopology: true
    });
    _db = _connection.db(mongoConfig.database);
  }
  return _db;
}

export function getDb() {
  if (!_db) throw new Error("Call connectToDb first!");
  return _db;
}
