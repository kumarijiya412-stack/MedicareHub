const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validatePassword, validateEmail, validatePhone, sanitizeString } = require('../utils/validators');

const isDev = process.env.NODE_ENV !== 'production';

// Helper to set httpOnly cookie
function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// 1. SIGN UP
router.post('/signup', async (req, res, next) => {
  try {
    let { full_name, email, phone, date_of_birth, password, confirm_password, consent } = req.body;

    full_name = sanitizeString(full_name);
    email = sanitizeString(email)?.toLowerCase();
    phone = sanitizeString(phone);

    if (!full_name || !email || !password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (!consent) {
      return res.status(400).json({ success: false, message: 'You must agree to the Terms of Service & Privacy Policy to create an account.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id, is_verified FROM users WHERE email = ?').get(email);
    if (existing) {
      if (!existing.is_verified) {
        // Resend OTP for unverified user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        db.prepare('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?').run(otp, otpExpires, existing.id);
        
        console.log(`\n========================================`);
        console.log(`[AUTH] Verification OTP for ${email}: ${otp}`);
        console.log(`========================================\n`);

        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email,
          message: 'Account exists but unverified. A new 6-digit verification code has been sent.',
          ...(isDev && { devOtp: otp })
        });
      }
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const insertResult = db.prepare(`
      INSERT INTO users (full_name, email, phone, date_of_birth, password_hash, is_verified, otp_code, otp_expires_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `).run(full_name, email, phone || null, date_of_birth || null, passwordHash, otp, otpExpires);

    const userId = insertResult.lastInsertRowid;

    // Generate initial patient ID number
    const patientIdNumber = `MCH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const qrData = JSON.stringify({
      id: patientIdNumber,
      name: full_name,
      portal: `https://medicarehub.health/verify/${patientIdNumber}`,
      issued: new Date().toISOString()
    });

    db.prepare(`
      INSERT INTO patient_cards (user_id, patient_id_number, qr_data, is_verified)
      VALUES (?, ?, ?, 0)
    `).run(userId, patientIdNumber, qrData);

    console.log(`\n========================================`);
    console.log(`[AUTH] Verification OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email,
      message: 'Account registered successfully. Please verify your email with the 6-digit code.',
      ...(isDev && { devOtp: otp })
    });
  } catch (err) {
    next(err);
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', (req, res, next) => {
  try {
    let { email, otp } = req.body;
    email = sanitizeString(email)?.toLowerCase();
    otp = sanitizeString(otp);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit verification code are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.is_verified) {
      return res.status(200).json({ success: true, message: 'Account is already verified. You can sign in.' });
    }

    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    // Mark user verified and activate patient card
    db.prepare(`
      UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires_at = NULL, updated_at = datetime('now')
      WHERE id = ?
    `).run(user.id);

    db.prepare(`
      UPDATE patient_cards SET is_verified = 1 WHERE user_id = ?
    `).run(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    setAuthCookie(res, token);

    const cleanUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      is_verified: 1,
      role: user.role,
      profile_photo: user.profile_photo,
      blood_group: user.blood_group,
      height: user.height,
      weight: user.weight,
      emergency_contact: user.emergency_contact
    };

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to MediCare Hub.',
      user: cleanUser,
      token
    });
  } catch (err) {
    next(err);
  }
});

// 3. RESEND OTP
router.post('/resend-otp', (req, res, next) => {
  try {
    let { email } = req.body;
    email = sanitizeString(email)?.toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = db.prepare('SELECT id, is_verified FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'Account is already verified.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.prepare('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?').run(otp, otpExpires, user.id);

    console.log(`\n========================================`);
    console.log(`[AUTH] Resent Verification OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    res.json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched.',
      ...(isDev && { devOtp: otp })
    });
  } catch (err) {
    next(err);
  }
});

// 4. SIGN IN
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = sanitizeString(email)?.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your email and password.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_verified) {
      // Prompt OTP verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      db.prepare('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?').run(otp, otpExpires, user.id);

      console.log(`\n========================================`);
      console.log(`[AUTH] Verification OTP for ${email}: ${otp}`);
      console.log(`========================================\n`);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email before logging in. A new 6-digit code has been sent.',
        ...(isDev && { devOtp: otp })
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    setAuthCookie(res, token);

    const cleanUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      is_verified: user.is_verified,
      role: user.role,
      profile_photo: user.profile_photo,
      blood_group: user.blood_group,
      height: user.height,
      weight: user.weight,
      emergency_contact: user.emergency_contact
    };

    res.json({
      success: true,
      message: 'Signed in successfully!',
      user: cleanUser,
      token
    });
  } catch (err) {
    next(err);
  }
});

// 5. SIGN OUT
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Signed out successfully.' });
});

// 6. CURRENT USER (ME)
router.get('/me', authenticateToken, (req, res) => {
  const patientCard = db.prepare('SELECT * FROM patient_cards WHERE user_id = ?').get(req.user.id);
  const familyMembers = db.prepare('SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);

  res.json({
    success: true,
    user: req.user,
    patientCard,
    familyMembers
  });
});

// 7. FORGOT PASSWORD
router.post('/forgot-password', authLimiter, (req, res, next) => {
  try {
    let { email } = req.body;
    email = sanitizeString(email)?.toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your account email address.' });
    }

    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
    // Generic response to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a 6-digit password reset code has been sent.'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, resetCode, expiresAt);

    console.log(`\n========================================`);
    console.log(`[AUTH] Password Reset Code for ${email}: ${resetCode}`);
    console.log(`========================================\n`);

    res.json({
      success: true,
      email,
      message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
      ...(isDev && { devResetCode: resetCode })
    });
  } catch (err) {
    next(err);
  }
});

// 8. RESET PASSWORD
router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    let { email, reset_code, new_password, confirm_password } = req.body;
    email = sanitizeString(email)?.toLowerCase();
    reset_code = sanitizeString(reset_code);

    if (!email || !reset_code || !new_password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const passCheck = validatePassword(new_password);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid reset code or request.' });
    }

    const resetRecord = db.prepare(`
      SELECT * FROM password_resets
      WHERE user_id = ? AND token = ? AND used_at IS NULL
      ORDER BY id DESC LIMIT 1
    `).get(user.id, reset_code);

    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset code.' });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newHash, user.id);
    db.prepare('UPDATE password_resets SET used_at = datetime(\'now\') WHERE id = ?').run(resetRecord.id);

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in with your new password.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
