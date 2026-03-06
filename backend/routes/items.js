import express from 'express';
import pool from '../db/pool.js';
const router = express.Router();

router.get('/by-restaurant/:resid', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT fi.item_id, fi.restaurant_id, fi.name, fi.description, fi.price, fi.availability, fi.image, c.name as category_name, c.category_id FROM food_items fi LEFT JOIN categories c ON fi.category_id=c.category_id WHERE restaurant_id=$1 AND availability=true',
      [req.params.resid]
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

export default router;
