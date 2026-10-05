require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration for cookies and auth headers
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploads for medical reports and prescriptions
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Welcome & Health Portal on Root /
app.get('/', (req, res) => {
  // If requested from browser (Accept text/html), serve a beautiful status webpage
  if (req.accepts('html')) {
    return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MediCare Hub API • Server Online</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E11D48'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FFF8F9;
      color: #1e293b;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
    }
    .card {
      background: #ffffff;
      border: 1px solid #ffe4e6;
      border-radius: 24px;
      padding: 40px;
      max-width: 620px;
      width: 100%;
      box-shadow: 0 10px 30px -5px rgba(225, 29, 72, 0.08), 0 4px 12px -2px rgba(0,0,0,0.04);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 16px 0 8px 0;
    }
    p {
      color: #475569;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #e11d48;
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.3);
      transition: all 0.2s ease;
    }
    .btn-primary:hover {
      background: #be123c;
      transform: translateY(-1px);
    }
    .api-box {
      margin-top: 24px;
      padding: 18px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
    }
    .api-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 10px;
    }
    .endpoint-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .endpoint-list li a {
      display: flex;
      justify-content: space-between;
      color: #0f172a;
      font-size: 13px;
      text-decoration: none;
      font-family: monospace;
      padding: 6px 10px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      transition: all 0.15s ease;
    }
    .endpoint-list li a:hover {
      border-color: #f43f5e;
      color: #e11d48;
    }
    .method {
      color: #059669;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="pulse-dot"></span>
      Backend Server Active & Healthy
    </div>
    <h1>MediCare Hub REST API</h1>
    <p>
      This server is the <strong>Node.js + Express + SQLite</strong> backend for MediCare Hub. It manages user authentication, encrypted health vitals, appointments, and multi-seller pharmacy data.
    </p>

    <div style="margin-bottom: 24px;">
      <a href="http://localhost:5173" class="btn-primary">
        Open MediCare Hub Web App (http://localhost:5173) &rarr;
      </a>
    </div>

    <div class="api-box">
      <div class="api-title">Test Direct API Endpoints (Click to inspect JSON response)</div>
      <ul class="endpoint-list">
        <li>
          <a href="/api/health" target="_blank">
            <span>/api/health</span>
            <span class="method">GET JSON</span>
          </a>
        </li>
        <li>
          <a href="/api/doctors" target="_blank">
            <span>/api/doctors</span>
            <span class="method">GET JSON</span>
          </a>
        </li>
        <li>
          <a href="/api/medicines" target="_blank">
            <span>/api/medicines</span>
            <span class="method">GET JSON</span>
          </a>
        </li>
        <li>
          <a href="/api/patient-id/verify/MCH-2026-78421" target="_blank">
            <span>/api/patient-id/verify/MCH-2026-78421</span>
            <span class="method">GET JSON</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</body>
</html>
    `);
  }

  // JSON fallback
  res.json({
    status: 'online',
    service: 'MediCare Hub API',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      profile: '/api/profile',
      doctors: '/api/doctors',
      medicines: '/api/medicines',
      appointments: '/api/appointments',
      reports: '/api/reports'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MediCare Hub API',
    database: 'SQLite (WAL Active)',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount All API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/medical-history', require('./routes/medicalHistory'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/family-genetic', require('./routes/familyGenetic'));
app.use('/api/recommended-tests', require('./routes/recommendedTests'));
app.use('/api/patient-id', require('./routes/patientId'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// 404 handler for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.path} not found.` });
  }
  next();
});

// Centralized error handler
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`MediCare Hub API Server Online`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Allowed Client: ${CLIENT_URL}`);
    console.log(`Security: Helmet, httpOnly cookies, rate limits, bcrypt`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
