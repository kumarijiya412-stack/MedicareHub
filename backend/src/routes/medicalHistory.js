const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

// GET all records (optionally filtered by family_member_id: 'self' or number)
router.get('/', (req, res, next) => {
  try {
    const { family_member_id, category } = req.query;
    let query = `
      SELECT mh.*, fm.full_name as member_name, fm.relation as member_relation
      FROM medical_history mh
      LEFT JOIN family_members fm ON mh.family_member_id = fm.id
      WHERE mh.user_id = ?
    `;
    const params = [req.user.id];

    if (family_member_id === 'self' || family_member_id === 'null') {
      query += ` AND mh.family_member_id IS NULL`;
    } else if (family_member_id && family_member_id !== 'all') {
      query += ` AND mh.family_member_id = ?`;
      params.push(parseInt(family_member_id));
    }

    if (category && category !== 'all') {
      query += ` AND mh.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY mh.created_at DESC`;

    const records = db.prepare(query).all(...params);
    res.json({ success: true, records });
  } catch (err) {
    next(err);
  }
});

// CREATE record
router.post('/', (req, res, next) => {
  try {
    let { family_member_id, category, title, diagnosed_date, status, notes } = req.body;
    title = sanitizeString(title);
    category = sanitizeString(category)?.toLowerCase();
    status = sanitizeString(status) || 'active';

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required.' });
    }

    const validCategories = ['condition', 'surgery', 'allergy', 'medication'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category. Must be condition, surgery, allergy, or medication.' });
    }

    const memberId = (family_member_id && family_member_id !== 'self') ? parseInt(family_member_id) : null;

    const result = db.prepare(`
      INSERT INTO medical_history (user_id, family_member_id, category, title, diagnosed_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      memberId,
      category,
      title,
      diagnosed_date || null,
      status,
      notes || null
    );

    const record = db.prepare(`
      SELECT mh.*, fm.full_name as member_name, fm.relation as member_relation
      FROM medical_history mh
      LEFT JOIN family_members fm ON mh.family_member_id = fm.id
      WHERE mh.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, message: 'Medical record added successfully.', record });
  } catch (err) {
    next(err);
  }
});

// UPDATE record
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    let { family_member_id, category, title, diagnosed_date, status, notes } = req.body;
    title = sanitizeString(title);
    category = sanitizeString(category)?.toLowerCase();

    const existing = db.prepare('SELECT * FROM medical_history WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    const memberId = (family_member_id && family_member_id !== 'self') ? parseInt(family_member_id) : null;

    db.prepare(`
      UPDATE medical_history SET
        family_member_id = ?,
        category = ?,
        title = ?,
        diagnosed_date = ?,
        status = ?,
        notes = ?
      WHERE id = ? AND user_id = ?
    `).run(
      family_member_id !== undefined ? memberId : existing.family_member_id,
      category || existing.category,
      title || existing.title,
      diagnosed_date !== undefined ? diagnosed_date : existing.diagnosed_date,
      status || existing.status,
      notes !== undefined ? notes : existing.notes,
      id,
      req.user.id
    );

    const record = db.prepare(`
      SELECT mh.*, fm.full_name as member_name, fm.relation as member_relation
      FROM medical_history mh
      LEFT JOIN family_members fm ON mh.family_member_id = fm.id
      WHERE mh.id = ?
    `).get(id);

    res.json({ success: true, message: 'Medical record updated.', record });
  } catch (err) {
    next(err);
  }
});

// DELETE record
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM medical_history WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    db.prepare('DELETE FROM medical_history WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true, message: 'Medical record deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
