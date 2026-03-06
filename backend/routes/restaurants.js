import express from 'express';
import pool from '../db/pool.js';
const router = express.Router();

// GET /api/restaurants
router.get('/', async (req,res) => {
  try {
    const { rows } = await pool.query('SELECT restaurant_id, owner_id, name, address, phone, opening_hours, rating, image FROM restaurants ORDER BY name');
    res.json(rows);
  } catch(err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

// GET /api/restaurants/:id
router.get('/:id', async (req,res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM restaurants WHERE restaurant_id=$1', [req.params.id]);
    if(!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch(err){ console.error(err); res.status(500).json({ error:'server' }); }
});

export default router;
