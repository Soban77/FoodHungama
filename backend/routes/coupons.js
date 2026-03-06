import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

/** GET /api/coupons/validate?code=XXX - Public: validate coupon code, returns discount_percent if valid */
router.get('/validate', async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if (!code) return res.json({ valid: false });
  try {
    const { rows } = await pool.query(
      'SELECT coupon_id, discount_percent FROM coupons WHERE UPPER(code)=$1 AND is_active=true AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)',
      [code]
    );
    if (!rows.length) return res.json({ valid: false });
    res.json({ valid: true, discount_percent: rows[0].discount_percent || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server' });
  }
});

export default router;
