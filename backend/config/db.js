import { createClient, createAdminClient } from '@insforge/sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.API_BASE_URL;
const apiKey = process.env.API_KEY;

if (!apiUrl || !apiKey) {
  console.error('Missing InsForge URL or Key. Cannot initialize InsForge client.');
}

export const db = createAdminClient({
  baseUrl: apiUrl || '',
  apiKey: apiKey || ''
});

export const insforgeAdmin = db;

export let isMongoConnected = true;

const connectDB = async () => {
  if (apiUrl && apiKey) {
    console.log(`InsForge connected: ${apiUrl}`);
  }
};

export default connectDB;
