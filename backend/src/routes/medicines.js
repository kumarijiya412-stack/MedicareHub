const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET MEDICINES LIST (With Search, Category, and Seller Comparisons)
router.get('/', (req, res, next) => {
  try {
    const { search, category, prescription_required } = req.query;

    let query = 'SELECT * FROM medicines WHERE in_stock = 1';
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR generic_name LIKE ? OR composition LIKE ? OR manufacturer LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (prescription_required !== undefined && prescription_required !== '') {
      query += ` AND prescription_required = ?`;
      params.push(parseInt(prescription_required));
    }

    query += ` ORDER BY name ASC`;

    const medicines = db.prepare(query).all(...params);

    // Attach sellers and best price to each medicine
    const populated = medicines.map(med => {
      const sellers = db.prepare(`
        SELECT * FROM medicine_sellers
        WHERE medicine_id = ?
        ORDER BY price ASC
      `).all(med.id);

      const lowestSeller = sellers.length > 0 ? sellers[0] : null;

      return {
        ...med,
        sellers,
        bestPrice: lowestSeller ? lowestSeller.price : med.base_price,
        bestSellerName: lowestSeller ? lowestSeller.seller_name : null,
        sellerCount: sellers.length,
        verifiedBadge: {
          verified: true,
          licenseNo: med.verified_license_no,
          batchNo: med.verified_batch_no,
          standard: 'CDSCO / WHO-GMP Verified'
        }
      };
    });

    // Categories list for tabs
    const categories = db.prepare('SELECT DISTINCT category FROM medicines ORDER BY category ASC').all().map(r => r.category);

    res.json({
      success: true,
      medicines: populated,
      categories: ['All', ...categories]
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET SINGLE MEDICINE WITH FULL SELLER COMPARISON
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const med = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);

    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine product not found.' });
    }

    const sellers = db.prepare(`
      SELECT * FROM medicine_sellers
      WHERE medicine_id = ?
      ORDER BY price ASC
    `).all(med.id);

    const lowestSeller = sellers.length > 0 ? sellers[0] : null;

    res.json({
      success: true,
      medicine: {
        ...med,
        sellers,
        bestPrice: lowestSeller ? lowestSeller.price : med.base_price,
        bestSellerName: lowestSeller ? lowestSeller.seller_name : null,
        verifiedBadge: {
          verified: true,
          licenseNo: med.verified_license_no,
          batchNo: med.verified_batch_no,
          issuer: 'Central Drugs Standard Control Organisation',
          qualityTested: '100% Genuine Batch Assurance'
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
