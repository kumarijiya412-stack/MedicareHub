const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

const DISCLAIMER = "This is not a medical diagnosis. Suggested specialist types are based on general triage guidance. Please consult a qualified medical professional for diagnosis and treatment.";

// Specialist mapping engine
function determineSpecialist(symptomText) {
  const s = symptomText.toLowerCase();

  if (/headache|migraine|dizzy|dizziness|fainting|numbness|tingling|seizure|tremor|memory/.test(s)) {
    return 'Neurologist';
  }
  if (/chest pain|palpitation|heart|hypertension|angina|pulse|shortness of breath/.test(s)) {
    return 'Cardiologist';
  }
  if (/rash|itch|acne|hive|eczema|skin|psoriasis|hair fall|scalp|dermat/.test(s)) {
    return 'Dermatologist';
  }
  if (/cough|asthma|wheez|breath|chest congestion|bronchitis|lung/.test(s)) {
    return 'Pulmonologist';
  }
  if (/throat|ear|sinus|nasal|tonsil|hearing|nose bleed/.test(s)) {
    return 'ENT Specialist';
  }
  if (/back pain|joint|knee|neck|spine|fracture|stiff|sprain|ortho|bone/.test(s)) {
    return 'Orthopedic Specialist';
  }
  if (/stomach|acid|reflux|gerd|nausea|vomit|diarrhea|bloat|abdomen|constipat|ulcer/.test(s)) {
    return 'Gastroenterologist';
  }
  if (/anxiety|depress|panic|insomnia|sleep|stress|mood/.test(s)) {
    return 'Psychiatrist / Psychologist';
  }
  if (/period|cramp|pregnancy|menstrual|pelvic|vaginal|ovary/.test(s)) {
    return 'Gynecologist';
  }
  if (/kidney|urinary|urine|bladder|flank pain/.test(s)) {
    return 'Urologist / Nephrologist';
  }
  if (/eye|vision|blur|cataract|dry eye|red eye/.test(s)) {
    return 'Ophthalmologist';
  }
  if (/child|baby|infant|pediatric|colic/.test(s)) {
    return 'Pediatrician';
  }

  return 'General Physician / Internal Medicine';
}

// 1. GET SYMPTOMS TIMELINE
router.get('/', (req, res, next) => {
  try {
    const { family_member_id } = req.query;
    let query = `
      SELECT s.*, fm.full_name as member_name, fm.relation as member_relation
      FROM symptoms s
      LEFT JOIN family_members fm ON s.family_member_id = fm.id
      WHERE s.user_id = ?
    `;
    const params = [req.user.id];

    if (family_member_id === 'self' || family_member_id === 'null') {
      query += ` AND s.family_member_id IS NULL`;
    } else if (family_member_id && family_member_id !== 'all') {
      query += ` AND s.family_member_id = ?`;
      params.push(parseInt(family_member_id));
    }

    query += ` ORDER BY s.logged_date DESC, s.created_at DESC`;

    const symptoms = db.prepare(query).all(...params);

    // Grouping by date for timeline convenience
    const timeline = {};
    for (const item of symptoms) {
      const dateKey = item.logged_date || 'Unspecified Date';
      if (!timeline[dateKey]) timeline[dateKey] = [];
      timeline[dateKey].push(item);
    }

    res.json({
      success: true,
      symptoms,
      timeline,
      disclaimer: DISCLAIMER
    });
  } catch (err) {
    next(err);
  }
});

// 2. LOG A SYMPTOM
router.post('/', (req, res, next) => {
  try {
    let { family_member_id, symptom_name, severity, duration, logged_date, notes } = req.body;
    symptom_name = sanitizeString(symptom_name);
    severity = sanitizeString(severity)?.toLowerCase() || 'mild';
    duration = sanitizeString(duration);
    logged_date = sanitizeString(logged_date) || new Date().toISOString().split('T')[0];

    if (!symptom_name) {
      return res.status(400).json({ success: false, message: 'Please describe the symptom you are experiencing.' });
    }

    const validSeverities = ['mild', 'moderate', 'severe'];
    if (!validSeverities.includes(severity)) {
      severity = 'mild';
    }

    const suggested_specialist = determineSpecialist(symptom_name + ' ' + (notes || ''));
    const memberId = (family_member_id && family_member_id !== 'self') ? parseInt(family_member_id) : null;

    const result = db.prepare(`
      INSERT INTO symptoms (user_id, family_member_id, symptom_name, severity, duration, logged_date, suggested_specialist, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      memberId,
      symptom_name,
      severity,
      duration || '1 day',
      logged_date,
      suggested_specialist,
      notes || null
    );

    const newSymptom = db.prepare(`
      SELECT s.*, fm.full_name as member_name
      FROM symptoms s
      LEFT JOIN family_members fm ON s.family_member_id = fm.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Symptom logged to your timeline.',
      symptom: newSymptom,
      disclaimer: DISCLAIMER
    });
  } catch (err) {
    next(err);
  }
});

// 3. DELETE SYMPTOM
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM symptoms WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Symptom log not found.' });
    }

    db.prepare('DELETE FROM symptoms WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true, message: 'Symptom log deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
