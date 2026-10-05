const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

// 1. GET ALL REPORTS
router.get('/', (req, res, next) => {
  try {
    const { family_member_id, report_type } = req.query;
    let query = `
      SELECT mr.*, fm.full_name as member_name
      FROM medical_reports mr
      LEFT JOIN family_members fm ON mr.family_member_id = fm.id
      WHERE mr.user_id = ?
    `;
    const params = [req.user.id];

    if (family_member_id === 'self' || family_member_id === 'null') {
      query += ` AND mr.family_member_id IS NULL`;
    } else if (family_member_id && family_member_id !== 'all') {
      query += ` AND mr.family_member_id = ?`;
      params.push(parseInt(family_member_id));
    }

    if (report_type && report_type !== 'all') {
      query += ` AND mr.report_type = ?`;
      params.push(report_type);
    }

    query += ` ORDER BY mr.test_date DESC, mr.created_at DESC`;

    const reports = db.prepare(query).all(...params);

    // Format file url
    const formatted = reports.map(r => ({
      ...r,
      url: `/uploads/${path.basename(r.file_path)}`
    }));

    res.json({ success: true, reports: formatted });
  } catch (err) {
    next(err);
  }
});

// 2. UPLOAD REPORT
router.post('/upload', upload.single('report_file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a PDF or image file to upload.' });
    }

    let { family_member_id, title, report_type, test_date, doctor_or_lab, notes } = req.body;
    title = sanitizeString(title);
    report_type = sanitizeString(report_type) || 'Lab Test';
    test_date = sanitizeString(test_date) || new Date().toISOString().split('T')[0];
    doctor_or_lab = sanitizeString(doctor_or_lab);

    if (!title) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Report title is required.' });
    }

    const memberId = (family_member_id && family_member_id !== 'self') ? parseInt(family_member_id) : null;
    const relativeFilePath = `uploads/${req.file.filename}`;

    const result = db.prepare(`
      INSERT INTO medical_reports (user_id, family_member_id, title, report_type, test_date, doctor_or_lab, file_name, file_path, file_size, mime_type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      memberId,
      title,
      report_type,
      test_date,
      doctor_or_lab || null,
      req.file.originalname,
      relativeFilePath,
      req.file.size,
      req.file.mimetype,
      notes || null
    );

    const newReport = db.prepare(`
      SELECT mr.*, fm.full_name as member_name
      FROM medical_reports mr
      LEFT JOIN family_members fm ON mr.family_member_id = fm.id
      WHERE mr.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Medical report securely uploaded and categorized.',
      report: {
        ...newReport,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
});

// 3. DOWNLOAD REPORT
router.get('/:id/download', (req, res, next) => {
  try {
    const { id } = req.params;
    const report = db.prepare('SELECT * FROM medical_reports WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const absolutePath = path.join(__dirname, '../../', report.file_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on server.' });
    }

    res.download(absolutePath, report.file_name);
  } catch (err) {
    next(err);
  }
});

// 4. DELETE REPORT
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const report = db.prepare('SELECT * FROM medical_reports WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Attempt to remove file from disk
    const absolutePath = path.join(__dirname, '../../', report.file_path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    db.prepare('DELETE FROM medical_reports WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true, message: 'Medical report deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
