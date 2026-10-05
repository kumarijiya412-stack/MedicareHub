const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. GET ALL DOCTORS (With Filters)
router.get('/', (req, res, next) => {
  try {
    const { search, specialty, city, min_rating } = req.query;

    let query = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR specialty LIKE ? OR treatable_conditions LIKE ? OR hospital_name LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (specialty && specialty !== 'All') {
      query += ` AND specialty = ?`;
      params.push(specialty);
    }

    if (city && city !== 'All') {
      query += ` AND city = ?`;
      params.push(city);
    }

    if (min_rating) {
      query += ` AND rating >= ?`;
      params.push(parseFloat(min_rating));
    }

    query += ` ORDER BY rating DESC, review_count DESC`;

    const rawDoctors = db.prepare(query).all(...params);

    const doctors = rawDoctors.map(doc => ({
      ...doc,
      available_days: JSON.parse(doc.available_days || '[]'),
      available_time_slots: JSON.parse(doc.available_time_slots || '[]')
    }));

    // Extract unique specialties and cities for frontend filter dropdowns
    const allSpecialties = db.prepare('SELECT DISTINCT specialty FROM doctors ORDER BY specialty ASC').all().map(r => r.specialty);
    const allCities = db.prepare('SELECT DISTINCT city FROM doctors ORDER BY city ASC').all().map(r => r.city);

    res.json({
      success: true,
      doctors,
      filters: {
        specialties: allSpecialties,
        cities: allCities
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET SUGGESTED DOCTORS (Based on logged symptoms and medical history)
router.get('/suggested', authenticateToken, (req, res, next) => {
  try {
    // 1. Fetch user recent symptoms
    const recentSymptoms = db.prepare(`
      SELECT symptom_name, suggested_specialist
      FROM symptoms
      WHERE user_id = ?
      ORDER BY logged_date DESC LIMIT 3
    `).all(req.user.id);

    // 2. Fetch user active medical conditions
    const activeConditions = db.prepare(`
      SELECT title FROM medical_history
      WHERE user_id = ? AND category = 'condition' AND status != 'resolved'
      LIMIT 3
    `).all(req.user.id);

    // Collect targeted specialties
    const targetSpecialties = new Set();
    const reasonsMap = {};

    for (const sym of recentSymptoms) {
      if (sym.suggested_specialist) {
        // May contain multiple e.g. "Neurologist / General Physician"
        const specs = sym.suggested_specialist.split('/').map(s => s.trim());
        for (const s of specs) {
          targetSpecialties.add(s);
          if (!reasonsMap[s]) reasonsMap[s] = `Suggested based on your recent symptom: "${sym.symptom_name}"`;
        }
      }
    }

    for (const cond of activeConditions) {
      const lower = cond.title.toLowerCase();
      if (/asthma|lung|breath/.test(lower)) {
        targetSpecialties.add('Pulmonologist');
        targetSpecialties.add('General Physician');
        reasonsMap['Pulmonologist'] = `Suggested based on condition: "${cond.title}"`;
      } else if (/heart|cardiac|hypertension|blood pressure/.test(lower)) {
        targetSpecialties.add('Cardiologist');
        reasonsMap['Cardiologist'] = `Suggested based on condition: "${cond.title}"`;
      } else if (/diabet/.test(lower)) {
        targetSpecialties.add('General Physician');
        reasonsMap['General Physician'] = `Suggested for diabetes care: "${cond.title}"`;
      }
    }

    // Default fallback to Cardiologist and General Physician if no symptoms logged
    if (targetSpecialties.size === 0) {
      targetSpecialties.add('General Physician');
      targetSpecialties.add('Cardiologist');
      reasonsMap['General Physician'] = 'Recommended for comprehensive annual health check-up';
      reasonsMap['Cardiologist'] = 'Recommended based on preventive cardiovascular guidelines';
    }

    const doctors = [];
    for (const specialty of targetSpecialties) {
      const docs = db.prepare(`
        SELECT * FROM doctors
        WHERE specialty LIKE ? OR specialty = ?
        ORDER BY rating DESC LIMIT 2
      `).all(`%${specialty}%`, specialty);

      for (const d of docs) {
        if (!doctors.some(existing => existing.id === d.id)) {
          doctors.push({
            ...d,
            available_days: JSON.parse(d.available_days || '[]'),
            available_time_slots: JSON.parse(d.available_time_slots || '[]'),
            recommendationReason: reasonsMap[specialty] || `Top-rated specialist in ${specialty}`
          });
        }
      }
    }

    res.json({
      success: true,
      suggestedDoctors: doctors.slice(0, 4)
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET SINGLE DOCTOR PROFILE
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const formatted = {
      ...doc,
      available_days: JSON.parse(doc.available_days || '[]'),
      available_time_slots: JSON.parse(doc.available_time_slots || '[]')
    };

    res.json({ success: true, doctor: formatted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
