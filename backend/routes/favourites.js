import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM favourites WHERE user_id=$1 ORDER BY added_date DESC', [req.user.user_id]);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.post('/', authMiddleware, async (req, res) => {
  const { restaurant_id, item_id } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO favourites (user_id, restaurant_id, item_id) VALUES ($1,$2,$3) RETURNING *', [req.user.user_id, restaurant_id, item_id]);
    res.status(201).json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM favourites WHERE favourite_id=$1 AND user_id=$2', [req.params.id, req.user.user_id]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

export default router;
