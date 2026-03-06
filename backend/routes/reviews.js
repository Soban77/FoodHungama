import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { restaurant_id, rating, comment } = req.body;
  try {
    const r = await pool.query('INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *', [req.user.user_id, restaurant_id, rating, comment]);
    res.status(201).json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.get('/by-restaurant/:resid', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id=u.user_id WHERE restaurant_id=$1 ORDER BY review_date DESC', [req.params.resid]);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

export default router;
