import { db } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    const res = await db.query("SELECT * FROM users WHERE email='admin@shopio.com'");
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  }
  process.exit();
}
check();
