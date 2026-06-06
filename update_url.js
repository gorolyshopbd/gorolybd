const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '82.29.161.36',
  database: 'shopio',
  password: 'root', // assuming default or no password based on previous commands, wait, we run inside docker
  port: 5432,
});

// Since I am on the host and might not have DB exposed, better write a script on VPS.
