const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. GET CURRENT USER PATIENT ID CARD (Authenticated)
router.get('/', authenticateToken, (req, res, next) => {
  try {
    let card = db.prepare('SELECT * FROM patient_cards WHERE user_id = ?').get(req.user.id);

    // If card doesn't exist, generate one
    if (!card) {
      const patientIdNumber = `MCH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const qrData = JSON.stringify({
        id: patientIdNumber,
        name: req.user.full_name,
        blood: req.user.blood_group || 'Not specified',
        emergency: req.user.emergency_contact || 'None',
        portal: `https://medicarehub.health/verify/${patientIdNumber}`,
        status: req.user.is_verified ? 'VERIFIED_ACTIVE' : 'PENDING'
      });

      const result = db.prepare(`
        INSERT INTO patient_cards (user_id, patient_id_number, qr_data, is_verified)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, patientIdNumber, qrData, req.user.is_verified ? 1 : 0);

      card = db.prepare('SELECT * FROM patient_cards WHERE id = ?').get(result.lastInsertRowid);
    } else {
      // Sync verification status with user
      if (req.user.is_verified && !card.is_verified) {
        db.prepare('UPDATE patient_cards SET is_verified = 1 WHERE id = ?').run(card.id);
        card.is_verified = 1;
      }
    }

    res.json({
      success: true,
      card: {
        ...card,
        holderName: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        bloodGroup: req.user.blood_group || 'Not specified',
        dob: req.user.date_of_birth,
        emergencyContact: req.user.emergency_contact || 'Not provided',
        photo: req.user.profile_photo
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. PUBLIC VERIFICATION SCAN CHECK (e.g. Hospital / Clinic QR Scanner)
router.get('/verify/:patientIdNumber', (req, res, next) => {
  try {
    const { patientIdNumber } = req.params;
    const card = db.prepare(`
      SELECT pc.patient_id_number, pc.is_verified, pc.issued_at,
             u.full_name, u.blood_group, u.emergency_contact
      FROM patient_cards pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.patient_id_number = ?
    `).get(patientIdNumber);

    if (!card) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'No active MediCare Hub digital identity found matching this ID.'
      });
    }

    res.json({
      success: true,
      valid: true,
      verificationStatus: card.is_verified ? 'VERIFIED_OFFICIAL' : 'UNVERIFIED',
      idNumber: card.patient_id_number,
      patientName: card.full_name,
      bloodGroup: card.blood_group,
      emergencyContact: card.emergency_contact,
      issuedAt: card.issued_at,
      issuer: 'MediCare Hub Universal Health Registry'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
