import { db } from './backend/config/db.js';
db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categories'")
  .then(res => {
    console.log(res.rows);
    process.exit(0);
  })
  .catch(console.error);
