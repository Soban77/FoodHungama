import fs from 'fs';
import pool from '../db/pool.js';

const sql = fs.readFileSync('./migrations/init.sql', 'utf8');

(async () => {
  try {
    await pool.query(sql);
    console.log('Schema initialized');
    process.exit(0);
  } catch (err) {
    console.error('Init error:', err);
    process.exit(1);
  }
})();