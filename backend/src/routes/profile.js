const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { validatePassword, validatePhone, sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

// 1. GET PROFILE
router.get('/', (req, res) => {
  const user = db.prepare(`
    SELECT id, full_name, email, phone, date_of_birth, is_verified, role, profile_photo, emergency_contact, blood_group, height, weight, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  const patientCard = db.prepare('SELECT * FROM patient_cards WHERE user_id = ?').get(req.user.id);
  const familyMembers = db.prepare('SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);

  // Quick stats
  const reportsCount = db.prepare('SELECT COUNT(*) as count FROM medical_reports WHERE user_id = ?').get(req.user.id).count;
  const appointmentsCount = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE user_id = ? AND status = "upcoming"').get(req.user.id).count;
  const testsDueCount = db.prepare('SELECT COUNT(*) as count FROM recommended_tests WHERE user_id = ? AND status = "due"').get(req.user.id).count;

  res.json({
    success: true,
    user,
    patientCard,
    familyMembers,
    stats: {
      reportsCount,
      appointmentsCount,
      testsDueCount
    }
  });
});

// 2. UPDATE PROFILE
router.put('/', (req, res, next) => {
  try {
    let { full_name, phone, date_of_birth, emergency_contact, blood_group, height, weight, profile_photo } = req.body;

    full_name = sanitizeString(full_name) || req.user.full_name;
    phone = sanitizeString(phone);
    emergency_contact = sanitizeString(emergency_contact);
    blood_group = sanitizeString(blood_group);

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }

    db.prepare(`
      UPDATE users SET
        full_name = ?,
        phone = ?,
        date_of_birth = ?,
        emergency_contact = ?,
        blood_group = ?,
        height = ?,
        weight = ?,
        profile_photo = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      full_name,
      phone || null,
      date_of_birth || null,
      emergency_contact || null,
      blood_group || null,
      height ? parseFloat(height) : null,
      weight ? parseFloat(weight) : null,
      profile_photo || null,
      req.user.id
    );

    // Also update QR code data in patient card
    const patientCard = db.prepare('SELECT * FROM patient_cards WHERE user_id = ?').get(req.user.id);
    if (patientCard) {
      const updatedQr = JSON.stringify({
        id: patientCard.patient_id_number,
        name: full_name,
        blood: blood_group || 'Not specified',
        emergency: emergency_contact || 'None',
        portal: `https://medicarehub.health/verify/${patientCard.patient_id_number}`,
        status: patientCard.is_verified ? 'VERIFIED_ACTIVE' : 'PENDING'
      });
      db.prepare('UPDATE patient_cards SET qr_data = ? WHERE id = ?').run(updatedQr, patientCard.id);
    }

    const updatedUser = db.prepare(`
      SELECT id, full_name, email, phone, date_of_birth, is_verified, role, profile_photo, emergency_contact, blood_group, height, weight
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
});

// 3. CHANGE PASSWORD
router.post('/change-password', async (req, res, next) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const isCurrentValid = await bcrypt.compare(current_password, user.password_hash);

    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const passCheck = validatePassword(new_password);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newHash, req.user.id);

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (err) {
    next(err);
  }
});

// 4. FAMILY MEMBERS CRUD
router.get('/family', (req, res) => {
  const family = db.prepare('SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at ASC').all(req.user.id);
  res.json({ success: true, family });
});

router.post('/family', (req, res, next) => {
  try {
    let { full_name, relation, date_of_birth, gender, blood_group, notes } = req.body;
    full_name = sanitizeString(full_name);
    relation = sanitizeString(relation)?.toLowerCase();

    if (!full_name || !relation) {
      return res.status(400).json({ success: false, message: 'Family member name and relation are required.' });
    }

    const validRelations = ['child', 'parent', 'spouse', 'sibling', 'other'];
    if (!validRelations.includes(relation)) {
      return res.status(400).json({ success: false, message: 'Invalid relationship type.' });
    }

    const result = db.prepare(`
      INSERT INTO family_members (user_id, full_name, relation, date_of_birth, gender, blood_group, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      full_name,
      relation,
      date_of_birth || null,
      gender || null,
      blood_group || null,
      notes || null
    );

    const newMember = db.prepare('SELECT * FROM family_members WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `${full_name} added to your family profile!`,
      member: newMember
    });
  } catch (err) {
    next(err);
  }
});

router.put('/family/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    let { full_name, relation, date_of_birth, gender, blood_group, notes } = req.body;
    full_name = sanitizeString(full_name);
    relation = sanitizeString(relation)?.toLowerCase();

    const existing = db.prepare('SELECT * FROM family_members WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Family member not found.' });
    }

    db.prepare(`
      UPDATE family_members SET
        full_name = ?,
        relation = ?,
        date_of_birth = ?,
        gender = ?,
        blood_group = ?,
        notes = ?
      WHERE id = ? AND user_id = ?
    `).run(
      full_name || existing.full_name,
      relation || existing.relation,
      date_of_birth !== undefined ? date_of_birth : existing.date_of_birth,
      gender !== undefined ? gender : existing.gender,
      blood_group !== undefined ? blood_group : existing.blood_group,
      notes !== undefined ? notes : existing.notes,
      id,
      req.user.id
    );

    const updated = db.prepare('SELECT * FROM family_members WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Family member profile updated.',
      member: updated
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/family/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM family_members WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Family member not found.' });
    }

    db.prepare('DELETE FROM family_members WHERE id = ? AND user_id = ?').run(id, req.user.id);

    res.json({
      success: true,
      message: `${existing.full_name}'s profile has been removed.`
    });
  } catch (err) {
    next(err);
  }
});

// 5. DATA EXPORT (JSON FORMAT)
router.get('/export', (req, res) => {
  const user = db.prepare('SELECT id, full_name, email, phone, date_of_birth, blood_group, height, weight, emergency_contact, created_at FROM users WHERE id = ?').get(req.user.id);
  const patientCard = db.prepare('SELECT patient_id_number, is_verified, issued_at FROM patient_cards WHERE user_id = ?').get(req.user.id);
  const family = db.prepare('SELECT * FROM family_members WHERE user_id = ?').all(req.user.id);
  const medicalHistory = db.prepare('SELECT * FROM medical_history WHERE user_id = ?').all(req.user.id);
  const symptoms = db.prepare('SELECT * FROM symptoms WHERE user_id = ?').all(req.user.id);
  const genetic = db.prepare('SELECT * FROM family_genetic_history WHERE user_id = ?').all(req.user.id);
  const tests = db.prepare('SELECT * FROM recommended_tests WHERE user_id = ?').all(req.user.id);
  const appointments = db.prepare('SELECT * FROM appointments WHERE user_id = ?').all(req.user.id);
  const reports = db.prepare('SELECT id, title, report_type, test_date, doctor_or_lab, file_name, file_size FROM medical_reports WHERE user_id = ?').all(req.user.id);

  const exportPayload = {
    app: 'MediCare Hub',
    exportedAt: new Date().toISOString(),
    user,
    patientCard,
    family,
    medicalHistory,
    symptoms,
    familyGeneticHistory: genetic,
    preventiveTests: tests,
    appointments,
    medicalReports: reports
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="medicare_export_${req.user.id}_${Date.now()}.json"`);
  res.send(JSON.stringify(exportPayload, null, 2));
});

// 6. DELETE ACCOUNT
router.delete('/account', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password confirmation is required to delete your account.' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: 'Your account and all associated health records have been permanently erased.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
