import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isMongoConnected = false;
const dataDir = path.join(__dirname, '../../../data');

export function getIsMongoConnected() {
  return isMongoConnected;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessaudit';
  try {
    console.log(`[Database] Attempting connection to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log('[Database] MongoDB connected successfully.');
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB connection failed (${err.message}).`);
    console.log('[Database] Activating integrated persistent file/memory database fallback.');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
}

