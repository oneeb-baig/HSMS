const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',           // Your default pgAdmin username
  host: 'localhost',
  database: 'hsms_db',       // The name of the DB where you ran the SQL command
  password: 'OneeBaig.18',  // REPLACE THIS with your pgAdmin password
  port: 5432,
});

module.exports = pool;