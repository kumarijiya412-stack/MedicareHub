const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

// 1. GET ALL APPOINTMENTS
router.get('/', (req, res, next) => {
  try {
    const { family_member_id, status } = req.query;

    let query = `
      SELECT a.*,
             d.name as doctor_name, d.specialty as doctor_specialty, d.hospital_name,
             d.consultation_fee, d.image_url as doctor_image, d.city as doctor_city,
             fm.full_name as member_name, fm.relation as member_relation
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN family_members fm ON a.family_member_id = fm.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (family_member_id === 'self' || family_member_id === 'null') {
      query += ` AND a.family_member_id IS NULL`;
    } else if (family_member_id && family_member_id !== 'all') {
      query += ` AND a.family_member_id = ?`;
      params.push(parseInt(family_member_id));
    }

    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.appointment_date ASC, a.time_slot ASC`;

    const appointments = db.prepare(query).all(...params);

    const upcomingCount = appointments.filter(a => a.status === 'upcoming' || a.status === 'rescheduled').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;

    res.json({
      success: true,
      appointments,
      counts: { upcoming: upcomingCount, completed: completedCount, total: appointments.length }
    });
  } catch (err) {
    next(err);
  }
});

// 2. BOOK APPOINTMENT
router.post('/', (req, res, next) => {
  try {
    let { doctor_id, family_member_id, appointment_date, time_slot, reason, notes } = req.body;
    reason = sanitizeString(reason);
    time_slot = sanitizeString(time_slot);
    appointment_date = sanitizeString(appointment_date);

    if (!doctor_id || !appointment_date || !time_slot || !reason) {
      return res.status(400).json({ success: false, message: 'Doctor, date, time slot, and reason for visit are required.' });
    }

    const doctor = db.prepare('SELECT id, name FROM doctors WHERE id = ?').get(doctor_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Selected doctor not found.' });
    }

    // Check slot collision for this doctor at the exact date and slot
    const collision = db.prepare(`
      SELECT id FROM appointments
      WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status IN ('upcoming', 'rescheduled')
    `).get(doctor_id, appointment_date, time_slot);

    if (collision) {
      return res.status(409).json({ success: false, message: 'This time slot was just taken by another patient. Please choose another slot.' });
    }

    const memberId = (family_member_id && family_member_id !== 'self') ? parseInt(family_member_id) : null;

    const result = db.prepare(`
      INSERT INTO appointments (user_id, family_member_id, doctor_id, appointment_date, time_slot, reason, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'upcoming', ?)
    `).run(
      req.user.id,
      memberId,
      doctor_id,
      appointment_date,
      time_slot,
      reason,
      notes || null
    );

    const newAppointment = db.prepare(`
      SELECT a.*,
             d.name as doctor_name, d.specialty as doctor_specialty, d.hospital_name,
             d.consultation_fee, d.image_url as doctor_image, d.city as doctor_city,
             fm.full_name as member_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN family_members fm ON a.family_member_id = fm.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `Appointment successfully confirmed with ${doctor.name} on ${appointment_date} at ${time_slot}.`,
      appointment: newAppointment
    });
  } catch (err) {
    next(err);
  }
});

// 3. RESCHEDULE APPOINTMENT
router.patch('/:id/reschedule', (req, res, next) => {
  try {
    const { id } = req.params;
    let { appointment_date, time_slot, reason } = req.body;
    appointment_date = sanitizeString(appointment_date);
    time_slot = sanitizeString(time_slot);

    const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (!appointment_date || !time_slot) {
      return res.status(400).json({ success: false, message: 'New date and time slot are required.' });
    }

    // Check collision
    const collision = db.prepare(`
      SELECT id FROM appointments
      WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND id != ? AND status IN ('upcoming', 'rescheduled')
    `).get(appt.doctor_id, appointment_date, time_slot, id);

    if (collision) {
      return res.status(409).json({ success: false, message: 'This slot is already booked for this doctor. Please pick another slot.' });
    }

    db.prepare(`
      UPDATE appointments SET
        appointment_date = ?,
        time_slot = ?,
        reason = ?,
        status = 'rescheduled'
      WHERE id = ? AND user_id = ?
    `).run(
      appointment_date,
      time_slot,
      reason ? sanitizeString(reason) : appt.reason,
      id,
      req.user.id
    );

    const updated = db.prepare(`
      SELECT a.*,
             d.name as doctor_name, d.specialty as doctor_specialty, d.hospital_name,
             d.consultation_fee, d.image_url as doctor_image, d.city as doctor_city,
             fm.full_name as member_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN family_members fm ON a.family_member_id = fm.id
      WHERE a.id = ?
    `).get(id);

    res.json({
      success: true,
      message: 'Appointment successfully rescheduled.',
      appointment: updated
    });
  } catch (err) {
    next(err);
  }
});

// 4. CANCEL APPOINTMENT
router.patch('/:id/cancel', (req, res, next) => {
  try {
    const { id } = req.params;
    const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    db.prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ? AND user_id = ?`).run(id, req.user.id);
    res.json({ success: true, message: 'Appointment has been cancelled.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
