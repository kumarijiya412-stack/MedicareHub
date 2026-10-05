const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

const PREVENTIVE_GUIDELINE_DISCLAIMER = "Preventive screening schedules are informational and based on standard adult health guidelines. Individual testing intervals should always be customized with your physician.";

// 1. GET RECOMMENDED TESTS
router.get('/', (req, res, next) => {
  try {
    const { family_member_id, status } = req.query;
    let query = `
      SELECT rt.*, fm.full_name as member_name
      FROM recommended_tests rt
      LEFT JOIN family_members fm ON rt.family_member_id = fm.id
      WHERE rt.user_id = ?
    `;
    const params = [req.user.id];

    if (family_member_id === 'self' || family_member_id === 'null') {
      query += ` AND rt.family_member_id IS NULL`;
    } else if (family_member_id && family_member_id !== 'all') {
      query += ` AND rt.family_member_id = ?`;
      params.push(parseInt(family_member_id));
    }

    if (status && status !== 'all') {
      query += ` AND rt.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY rt.status ASC, rt.next_due_date ASC`;

    const tests = db.prepare(query).all(...params);

    // Summary counts
    const dueCount = tests.filter(t => t.status === 'due').length;
    const doneCount = tests.filter(t => t.status === 'done').length;

    res.json({
      success: true,
      tests,
      counts: { due: dueCount, done: doneCount, total: tests.length },
      disclaimer: PREVENTIVE_GUIDELINE_DISCLAIMER
    });
  } catch (err) {
    next(err);
  }
});

// 2. ADD A TEST REMINDER
router.post('/', (req, res, next) => {
  try {
    let { family_member_id, test_name, category, description, frequency, status, next_due_date, last_done_date, reminder_enabled } = req.body;
    test_name = sanitizeString(test_name);
    category = sanitizeString(category) || 'General Screen';

    if (!test_name) {
      return res.status(400).json({ success: false, message: 'Test name is required.' });
    }

    const memberId = (family_member_id && family_member_id !== 'self') ? parseInt(family_member_id) : null;

    const result = db.prepare(`
      INSERT INTO recommended_tests (user_id, family_member_id, test_name, category, description, frequency, status, last_done_date, next_due_date, reminder_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      memberId,
      test_name,
      category,
      description || null,
      frequency || 'Annual',
      status || 'due',
      last_done_date || null,
      next_due_date || null,
      reminder_enabled !== undefined ? (reminder_enabled ? 1 : 0) : 1
    );

    const newTest = db.prepare(`
      SELECT rt.*, fm.full_name as member_name
      FROM recommended_tests rt
      LEFT JOIN family_members fm ON rt.family_member_id = fm.id
      WHERE rt.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Preventive test added to your tracker.',
      test: newTest
    });
  } catch (err) {
    next(err);
  }
});

// 3. TOGGLE DUE / DONE STATUS
router.patch('/:id/toggle-status', (req, res, next) => {
  try {
    const { id } = req.params;
    const test = db.prepare('SELECT * FROM recommended_tests WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    const newStatus = test.status === 'due' ? 'done' : 'due';
    const nowStr = new Date().toISOString().split('T')[0];
    const updatedLastDone = newStatus === 'done' ? nowStr : test.last_done_date;

    // Recalculate next due date if marked done (1 year forward by default)
    let updatedNextDue = test.next_due_date;
    if (newStatus === 'done') {
      const nextDate = new Date();
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      updatedNextDue = nextDate.toISOString().split('T')[0];
    }

    db.prepare(`
      UPDATE recommended_tests SET
        status = ?,
        last_done_date = ?,
        next_due_date = ?
      WHERE id = ? AND user_id = ?
    `).run(newStatus, updatedLastDone, updatedNextDue, id, req.user.id);

    const updated = db.prepare(`
      SELECT rt.*, fm.full_name as member_name
      FROM recommended_tests rt
      LEFT JOIN family_members fm ON rt.family_member_id = fm.id
      WHERE rt.id = ?
    `).get(id);

    res.json({
      success: true,
      message: `Test marked as ${newStatus.toUpperCase()}.`,
      test: updated
    });
  } catch (err) {
    next(err);
  }
});

// 4. TOGGLE REMINDER NOTIFICATION
router.patch('/:id/toggle-reminder', (req, res, next) => {
  try {
    const { id } = req.params;
    const test = db.prepare('SELECT * FROM recommended_tests WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    const newReminder = test.reminder_enabled ? 0 : 1;
    db.prepare('UPDATE recommended_tests SET reminder_enabled = ? WHERE id = ? AND user_id = ?').run(newReminder, id, req.user.id);

    res.json({
      success: true,
      message: `Reminders ${newReminder ? 'enabled' : 'disabled'} for this test.`,
      reminder_enabled: newReminder
    });
  } catch (err) {
    next(err);
  }
});

// 5. DELETE TEST
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const test = db.prepare('SELECT id FROM recommended_tests WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    db.prepare('DELETE FROM recommended_tests WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true, message: 'Test removed from tracker.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
