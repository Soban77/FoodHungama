import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      `INSERT INTO users (name,email,password_hash,phone,role,address) VALUES ($1,$2,$3,$4,'customer',$5) RETURNING user_id,name,email,phone,role,address,created_at`,
      [name, email, hash, phone, address]
    );
    const user = result.rows[0];
    await pool.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.user_id]);
    const token = jwt.sign({ user_id: user.user_id, role: user.role, email: user.email }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  try {
    const { rows } = await pool.query('SELECT user_id,name,email,password_hash,role FROM users WHERE email=$1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'invalid' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'invalid' });
    const token = jwt.sign({ user_id: user.user_id, role: user.role, email: user.email }, process.env.JWT_SECRET);
    res.json({ user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
