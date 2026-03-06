import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

async function createAdmin() {
  const pw = process.env.CREATE_ADMIN_PASSWORD || 'Admin@123';
  const adminEmail = process.env.CREATE_ADMIN_EMAIL || 'admin@foodhungama.test';
  const adminName = process.env.CREATE_ADMIN_NAME || 'Admin';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hash = await bcrypt.hash(pw, saltRounds);
  try {
    const r = await pool.query(
      `INSERT INTO users (name,email,password_hash,role,phone) VALUES ($1,$2,$3,'admin',$4) RETURNING user_id`,
      [adminName, adminEmail, hash, '03000000000']
    );
    console.log('Admin created with id:', r.rows[0].user_id, 'email:', adminEmail, 'password:', pw);
    process.exit(0);
  } catch (err) {
    if (err.code === '23505') {
      console.log('Admin already exists');
      process.exit(0);
    }
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
