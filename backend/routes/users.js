import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT user_id,name,email,phone,role,wallet_balance,address,created_at FROM users WHERE user_id=$1', [req.user.user_id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.put('/me', authMiddleware, async (req, res) => {
  const { name, phone, address } = req.body;
  try {
    const { rows } = await pool.query('UPDATE users SET name=$1,phone=$2,address=$3 WHERE user_id=$4 RETURNING user_id,name,email,phone,role,wallet_balance,address,created_at', [name, phone, address, req.user.user_id]);
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

export default router;
