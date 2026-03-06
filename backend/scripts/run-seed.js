import fs from 'fs';
import pool from '../db/pool.js';

const sql = fs.readFileSync('./seed/seed.sql', 'utf8');

(async () => {
  try {
    await pool.query(sql);
    console.log('Seed data inserted');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();