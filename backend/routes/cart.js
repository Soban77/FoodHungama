import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartRes = await pool.query('SELECT cart_id FROM carts WHERE user_id=$1', [req.user.user_id]);
    if (!cartRes.rows.length) return res.json({ items: [] });
    const cartId = cartRes.rows[0].cart_id;
    const { rows } = await pool.query('SELECT ci.*, fi.name, fi.image, fi.restaurant_id FROM cart_items ci LEFT JOIN food_items fi ON ci.item_id=fi.item_id WHERE cart_id=$1', [cartId]);
    res.json({ items: rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.post('/add', authMiddleware, async (req, res) => {
  const { item_id, quantity } = req.body;
  try {
    const cartRes = await pool.query('SELECT cart_id FROM carts WHERE user_id=$1', [req.user.user_id]);
    let cartId;
    if (!cartRes.rows.length) {
      const r = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id', [req.user.user_id]);
      cartId = r.rows[0].cart_id;
    } else cartId = cartRes.rows[0].cart_id;
    const itemRes = await pool.query('SELECT price FROM food_items WHERE item_id=$1', [item_id]);
    if (!itemRes.rows.length) return res.status(400).json({ error: 'item not found' });
    const price = itemRes.rows[0].price;
    const existing = await pool.query('SELECT * FROM cart_items WHERE cart_id=$1 AND item_id=$2', [cartId, item_id]);
    if (existing.rows.length) {
      await pool.query('UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id=$2 AND item_id=$3', [quantity, cartId, item_id]);
      const updated = await pool.query('SELECT * FROM cart_items WHERE cart_id=$1 AND item_id=$2', [cartId, item_id]);
      return res.json(updated.rows[0]);
    } else {
      const r = await pool.query('INSERT INTO cart_items (cart_id,item_id,quantity,price) VALUES ($1,$2,$3,$4) RETURNING *', [cartId, item_id, quantity, price]);
      return res.status(201).json(r.rows[0]);
    }
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.post('/remove', authMiddleware, async (req, res) => {
  const { item_id } = req.body;
  try {
    const cartRes = await pool.query('SELECT cart_id FROM carts WHERE user_id=$1', [req.user.user_id]);
    if (!cartRes.rows.length) return res.json({ ok: true });
    const cartId = cartRes.rows[0].cart_id;
    await pool.query('DELETE FROM cart_items WHERE cart_id=$1 AND item_id=$2', [cartId, item_id]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

export default router;
