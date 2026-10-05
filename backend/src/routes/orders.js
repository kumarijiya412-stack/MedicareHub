const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sanitizeString } = require('../utils/validators');

router.use(authenticateToken);

// 1. CHECKOUT (With Mock Payment & Prescription Upload Support)
router.post('/checkout', upload.single('prescription_file'), (req, res, next) => {
  try {
    let { shipping_address, payment_method = 'UPI' } = req.body;
    shipping_address = sanitizeString(shipping_address);
    payment_method = sanitizeString(payment_method);

    if (!shipping_address) {
      return res.status(400).json({ success: false, message: 'Please provide a valid delivery address.' });
    }

    // Fetch current cart items
    const items = db.prepare(`
      SELECT ci.id, ci.quantity,
             m.id as medicine_id, m.name as medicine_name, m.generic_name,
             m.prescription_required, m.dosage_form,
             s.id as seller_id, s.seller_name, s.price as seller_price
      FROM cart_items ci
      JOIN medicines m ON ci.medicine_id = m.id
      JOIN medicine_sellers s ON ci.seller_id = s.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Check prescription requirement
    const hasRx = items.some(i => i.prescription_required === 1);
    let prescriptionFilePath = null;

    if (req.file) {
      prescriptionFilePath = `uploads/${req.file.filename}`;
    }

    if (hasRx && !prescriptionFilePath) {
      return res.status(400).json({
        success: false,
        requiresPrescription: true,
        message: 'One or more items in your cart require a valid prescription. Please upload your prescription document.'
      });
    }

    let subtotal = 0;
    const itemsSnapshot = [];

    for (const item of items) {
      const lineTotal = item.seller_price * item.quantity;
      subtotal += lineTotal;
      itemsSnapshot.push({
        medicine_id: item.medicine_id,
        name: item.medicine_name,
        seller: item.seller_name,
        unit_price: item.seller_price,
        quantity: item.quantity,
        total: lineTotal,
        prescription_required: item.prescription_required
      });
    }

    const discount = subtotal > 500 ? 50 : 0;
    const deliveryFee = subtotal > 300 ? 0 : 40;
    const finalAmount = parseFloat((subtotal - discount + deliveryFee).toFixed(2));

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    /*
     * MOCK PAYMENT INTEGRATION GATEWAY:
     * In production, this integrates with Stripe / Razorpay / PhonePe SDK.
     * Mock gateway approves payment and returns transaction reference.
     */
    const mockPaymentGateway = {
      provider: 'MediCare Hub Mock Gateway (Stripe/Razorpay compatible)',
      transactionId: `TXN_MOCK_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      paymentMethod: payment_method,
      amount: finalAmount,
      status: 'PAID'
    };

    const insertResult = db.prepare(`
      INSERT INTO orders (user_id, order_number, total_amount, discount_amount, delivery_fee, final_amount, status, payment_method, payment_status, prescription_file_path, shipping_address, items_json)
      VALUES (?, ?, ?, ?, ?, ?, 'Ordered', ?, 'Completed', ?, ?, ?)
    `).run(
      req.user.id,
      orderNumber,
      subtotal,
      discount,
      deliveryFee,
      finalAmount,
      payment_method,
      prescriptionFilePath,
      shipping_address,
      JSON.stringify(itemsSnapshot)
    );

    // Clear cart items
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(insertResult.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        ...order,
        items: itemsSnapshot
      },
      payment: mockPaymentGateway
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET USER ORDER HISTORY
router.get('/', (req, res, next) => {
  try {
    const rawOrders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    const orders = rawOrders.map(o => ({
      ...o,
      items: JSON.parse(o.items_json || '[]')
    }));

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// 3. GET SINGLE ORDER WITH TRACKING TIMELINE
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, req.user.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const items = JSON.parse(order.items_json || '[]');

    // Build realistic tracking stages
    const stages = [
      { key: 'Ordered', label: 'Order Placed', desc: 'Received and awaiting pharmacy verification' },
      { key: 'Verified', label: 'Pharmacist Verified', desc: 'Prescription & batch credentials approved' },
      { key: 'Packed', label: 'Packed & Sealed', desc: 'Packed safely in medical tamper-evident packaging' },
      { key: 'Shipped', label: 'Handed to Express Courier', desc: 'In transit with temperature-controlled logistics' },
      { key: 'Delivered', label: 'Delivered', desc: 'Package delivered to your doorstep' }
    ];

    const currentStageIndex = stages.findIndex(s => s.key === order.status);

    const trackingTimeline = stages.map((s, idx) => ({
      ...s,
      completed: currentStageIndex !== -1 && idx <= currentStageIndex,
      isCurrent: idx === currentStageIndex
    }));

    res.json({
      success: true,
      order: {
        ...order,
        items,
        trackingTimeline
      }
    });
  } catch (err) {
    next(err);
  }
});

// 4. CANCEL ORDER
router.patch('/:id/cancel', (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, req.user.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status === 'Shipped' || order.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Orders that have already shipped or delivered cannot be cancelled.' });
    }

    db.prepare('UPDATE orders SET status = "Cancelled" WHERE id = ? AND user_id = ?').run(id, req.user.id);

    res.json({
      success: true,
      message: 'Order cancelled successfully. Refund initiated to original payment method.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
