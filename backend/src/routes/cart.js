const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// 1. GET CART
router.get('/', (req, res, next) => {
  try {
    const items = db.prepare(`
      SELECT ci.id, ci.quantity, ci.created_at,
             m.id as medicine_id, m.name as medicine_name, m.generic_name,
             m.composition, m.manufacturer, m.prescription_required,
             m.dosage_form, m.packaging, m.image_url,
             s.id as seller_id, s.seller_name, s.price as seller_price,
             s.delivery_days, s.is_best_price
      FROM cart_items ci
      JOIN medicines m ON ci.medicine_id = m.id
      JOIN medicine_sellers s ON ci.seller_id = s.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(req.user.id);

    let subtotal = 0;
    let prescriptionRequired = false;

    for (const item of items) {
      subtotal += item.seller_price * item.quantity;
      if (item.prescription_required) {
        prescriptionRequired = true;
      }
    }

    const discount = subtotal > 500 ? 50 : 0;
    const deliveryFee = subtotal > 300 || subtotal === 0 ? 0 : 40;
    const total = subtotal > 0 ? (subtotal - discount + deliveryFee) : 0;

    res.json({
      success: true,
      items,
      summary: {
        itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        prescriptionRequired
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. ADD TO CART
router.post('/', (req, res, next) => {
  try {
    const { medicine_id, seller_id, quantity = 1 } = req.body;

    if (!medicine_id || !seller_id) {
      return res.status(400).json({ success: false, message: 'Medicine and seller selection are required.' });
    }

    // Check if seller exists for this medicine
    const seller = db.prepare('SELECT id, price FROM medicine_sellers WHERE id = ? AND medicine_id = ?').get(seller_id, medicine_id);
    if (!seller) {
      return res.status(400).json({ success: false, message: 'Invalid medicine or seller combination.' });
    }

    // Check if already in cart
    const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND medicine_id = ? AND seller_id = ?').get(req.user.id, medicine_id, seller_id);

    if (existing) {
      const newQty = existing.quantity + parseInt(quantity);
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      db.prepare(`
        INSERT INTO cart_items (user_id, medicine_id, seller_id, quantity)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, medicine_id, seller_id, parseInt(quantity));
    }

    res.json({ success: true, message: 'Item added to your medical cart.' });
  } catch (err) {
    next(err);
  }
});

// 3. UPDATE QUANTITY
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const parsedQty = parseInt(quantity);
    if (parsedQty <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(id, req.user.id);
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?').run(parsedQty, id, req.user.id);
    res.json({ success: true, message: 'Cart updated.' });
  } catch (err) {
    next(err);
  }
});

// 4. REMOVE ITEM
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (err) {
    next(err);
  }
});

// 5. CLEAR CART
router.delete('/', (req, res, next) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
