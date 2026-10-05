const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

const GENETIC_DISCLAIMER = "This hereditary risk analysis is strictly informational and based on recognized medical familial risk patterns. It is NOT a clinical diagnosis or genetic laboratory test. Please discuss these familial insights with your physician or genetic counselor.";

function calculateHereditaryRisk(records) {
  const risks = [];
  const conditionMap = {
    heart: { count: 0, firstDegree: false, earlyOnset: false, relatives: [] },
    diabetes: { count: 0, firstDegree: false, earlyOnset: false, relatives: [] },
    hypertension: { count: 0, firstDegree: false, earlyOnset: false, relatives: [] },
    cancer: { count: 0, firstDegree: false, earlyOnset: false, relatives: [], types: [] },
    asthma: { count: 0, firstDegree: false, earlyOnset: false, relatives: [] },
  };

  const firstDegreeList = ['father', 'mother', 'brother', 'sister', 'sibling', 'parent'];

  for (const item of records) {
    const rel = item.relative_relation.toLowerCase();
    const cond = item.condition_name.toLowerCase();
    const isFirstDegree = firstDegreeList.some(f => rel.includes(f));
    const age = item.age_of_onset ? parseInt(item.age_of_onset) : 60;

    if (/heart|cardiac|coronary|artery|angioplasty|bypass|infarction/.test(cond)) {
      conditionMap.heart.count++;
      conditionMap.heart.relatives.push(`${item.relative_relation} (${item.condition_name})`);
      if (isFirstDegree) conditionMap.heart.firstDegree = true;
      if (age < 55) conditionMap.heart.earlyOnset = true;
    }

    if (/diabet|sugar|glucose|t2d|insulin/.test(cond)) {
      conditionMap.diabetes.count++;
      conditionMap.diabetes.relatives.push(`${item.relative_relation} (${item.condition_name})`);
      if (isFirstDegree) conditionMap.diabetes.firstDegree = true;
      if (age < 50) conditionMap.diabetes.earlyOnset = true;
    }

    if (/hypertens|high bp|blood pressure/.test(cond)) {
      conditionMap.hypertension.count++;
      conditionMap.hypertension.relatives.push(`${item.relative_relation} (${item.condition_name})`);
      if (isFirstDegree) conditionMap.hypertension.firstDegree = true;
    }

    if (/cancer|carcinoma|oncolog|tumor|malignan|melanoma/.test(cond)) {
      conditionMap.cancer.count++;
      conditionMap.cancer.relatives.push(`${item.relative_relation} (${item.condition_name})`);
      conditionMap.cancer.types.push(item.condition_name);
      if (isFirstDegree) conditionMap.cancer.firstDegree = true;
      if (age < 50) conditionMap.cancer.earlyOnset = true;
    }

    if (/asthma|allergy|eczema|atopic/.test(cond)) {
      conditionMap.asthma.count++;
      conditionMap.asthma.relatives.push(`${item.relative_relation} (${item.condition_name})`);
      if (isFirstDegree) conditionMap.asthma.firstDegree = true;
    }
  }

  // Heart evaluation
  if (conditionMap.heart.count > 0) {
    let level = 'Moderate';
    let badgeColor = 'amber';
    if (conditionMap.heart.firstDegree && conditionMap.heart.earlyOnset) {
      level = 'Elevated';
      badgeColor = 'rose';
    } else if (conditionMap.heart.count >= 2) {
      level = 'Elevated';
      badgeColor = 'rose';
    }

    risks.push({
      category: 'Coronary Artery & Cardiovascular Disease',
      level,
      badgeColor,
      relativesInvolved: conditionMap.heart.relatives,
      summary: `You have ${conditionMap.heart.count} direct or extended relative(s) with cardiovascular conditions. First-degree family history is a well-established clinical marker for familial atherosclerosis.`,
      recommendedActions: [
        'Annual fasting lipid profile (LDL, HDL, Triglycerides, ApoB)',
        'Periodic blood pressure check and baseline ECG / 2D Echo',
        'Consider coronary calcium scoring (CAC) in consultation with a cardiologist',
        'Prioritize Mediterranean-style low saturated fat diet and regular aerobic conditioning'
      ]
    });
  }

  // Diabetes evaluation
  if (conditionMap.diabetes.count > 0) {
    let level = conditionMap.diabetes.firstDegree ? 'Elevated' : 'Moderate';
    let badgeColor = conditionMap.diabetes.firstDegree ? 'rose' : 'amber';

    risks.push({
      category: 'Type 2 Diabetes Mellitus',
      level,
      badgeColor,
      relativesInvolved: conditionMap.diabetes.relatives,
      summary: `Family history in a parent or sibling increases personal lifetime risk by approximately 2x to 4x due to shared genetic insulin receptor sensitivities and metabolic traits.`,
      recommendedActions: [
        'Fasting blood glucose & HbA1c test every 6-12 months',
        'Maintain a balanced glycemic index nutrition plan with high dietary fiber',
        'Weekly minimum of 150 minutes moderate intensity exercise or resistance training',
        'Track waist-to-hip ratio and visceral adiposity'
      ]
    });
  }

  // Hypertension evaluation
  if (conditionMap.hypertension.count > 0) {
    risks.push({
      category: 'Primary Arterial Hypertension',
      level: conditionMap.hypertension.firstDegree ? 'Moderate' : 'Mild Awareness',
      badgeColor: conditionMap.hypertension.firstDegree ? 'amber' : 'emerald',
      relativesInvolved: conditionMap.hypertension.relatives,
      summary: `Genetic factors account for 30-50% of blood pressure variance. Familial presence suggests heightened sodium sensitivity and vascular tone reactivity.`,
      recommendedActions: [
        'Home blood pressure log (morning & evening reading every quarter)',
        'Keep dietary sodium below 2,000 mg/day (DASH diet protocol)',
        'Routine kidney function (serum creatinine & eGFR) test'
      ]
    });
  }

  // Cancer evaluation
  if (conditionMap.cancer.count > 0) {
    risks.push({
      category: 'Familial Oncology Awareness',
      level: (conditionMap.cancer.firstDegree && conditionMap.cancer.earlyOnset) ? 'Elevated' : 'Moderate',
      badgeColor: (conditionMap.cancer.firstDegree && conditionMap.cancer.earlyOnset) ? 'rose' : 'amber',
      relativesInvolved: conditionMap.cancer.relatives,
      summary: `Presence of ${conditionMap.cancer.types.join(', ')} in relatives indicates the value of proactive, age-appropriate preventive screening.`,
      recommendedActions: [
        'Discuss earliest recommended age for screening (colonoscopy, mammography, low-dose CT)',
        'Report any persistent, unexplained constitutional symptoms promptly to your doctor',
        'Ask your doctor whether formal genetic predisposition testing (e.g. BRCA, Lynch syndrome) is warranted'
      ]
    });
  }

  // If no risks recorded yet
  if (risks.length === 0) {
    risks.push({
      category: 'Standard Population Risk Profile',
      level: 'Baseline',
      badgeColor: 'emerald',
      relativesInvolved: [],
      summary: 'No high-risk hereditary conditions currently recorded. Continue general preventive care and update this registry if family diagnoses occur.',
      recommendedActions: [
        'Routine annual physical and age-based preventive screenings',
        'Balanced whole-food nutrition, adequate sleep, and active lifestyle'
      ]
    });
  }

  return risks;
}

// 1. GET ALL FAMILY GENETIC CONDITIONS & RISK PANEL
router.get('/', (req, res, next) => {
  try {
    const records = db.prepare(`
      SELECT * FROM family_genetic_history
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    const hereditaryAnalysis = calculateHereditaryRisk(records);

    res.json({
      success: true,
      records,
      hereditaryAnalysis,
      disclaimer: GENETIC_DISCLAIMER
    });
  } catch (err) {
    next(err);
  }
});

// 2. ADD GENETIC CONDITION
router.post('/', (req, res, next) => {
  try {
    let { relative_relation, condition_name, age_of_onset, notes } = req.body;
    relative_relation = sanitizeString(relative_relation);
    condition_name = sanitizeString(condition_name);

    if (!relative_relation || !condition_name) {
      return res.status(400).json({ success: false, message: 'Relative relation and condition name are required.' });
    }

    const result = db.prepare(`
      INSERT INTO family_genetic_history (user_id, relative_relation, condition_name, age_of_onset, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      relative_relation,
      condition_name,
      age_of_onset ? parseInt(age_of_onset) : null,
      notes || null
    );

    const newRecord = db.prepare('SELECT * FROM family_genetic_history WHERE id = ?').get(result.lastInsertRowid);
    const allRecords = db.prepare('SELECT * FROM family_genetic_history WHERE user_id = ?').all(req.user.id);
    const updatedAnalysis = calculateHereditaryRisk(allRecords);

    res.status(201).json({
      success: true,
      message: 'Family health condition added to genetic history.',
      record: newRecord,
      hereditaryAnalysis: updatedAnalysis,
      disclaimer: GENETIC_DISCLAIMER
    });
  } catch (err) {
    next(err);
  }
});

// 3. DELETE GENETIC CONDITION
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM family_genetic_history WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    db.prepare('DELETE FROM family_genetic_history WHERE id = ? AND user_id = ?').run(id, req.user.id);

    const allRecords = db.prepare('SELECT * FROM family_genetic_history WHERE user_id = ?').all(req.user.id);
    const updatedAnalysis = calculateHereditaryRisk(allRecords);

    res.json({
      success: true,
      message: 'Record removed from genetic history.',
      hereditaryAnalysis: updatedAnalysis
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
