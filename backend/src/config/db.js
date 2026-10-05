const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'medicare.db');
const db = new Database(dbPath);

// Enable WAL mode & foreign keys for reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      date_of_birth TEXT,
      password_hash TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      otp_code TEXT,
      otp_expires_at TEXT,
      role TEXT DEFAULT 'patient',
      profile_photo TEXT,
      emergency_contact TEXT,
      blood_group TEXT,
      height REAL,
      weight REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS patient_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      patient_id_number TEXT UNIQUE NOT NULL,
      qr_data TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      issued_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      relation TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      blood_group TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      family_member_id INTEGER,
      category TEXT NOT NULL, -- condition, surgery, allergy, medication
      title TEXT NOT NULL,
      diagnosed_date TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      family_member_id INTEGER,
      symptom_name TEXT NOT NULL,
      severity TEXT NOT NULL, -- mild, moderate, severe
      duration TEXT NOT NULL,
      logged_date TEXT NOT NULL,
      suggested_specialist TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_genetic_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      relative_relation TEXT NOT NULL,
      condition_name TEXT NOT NULL,
      age_of_onset INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recommended_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      family_member_id INTEGER,
      test_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      frequency TEXT,
      status TEXT DEFAULT 'due', -- due, done
      last_done_date TEXT,
      next_due_date TEXT,
      reminder_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      qualification TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      city TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 50,
      consultation_fee REAL NOT NULL,
      available_days TEXT NOT NULL,
      available_time_slots TEXT NOT NULL,
      image_url TEXT,
      bio TEXT,
      treatable_conditions TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      family_member_id INTEGER,
      doctor_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'upcoming', -- upcoming, completed, cancelled, rescheduled
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      family_member_id INTEGER,
      title TEXT NOT NULL,
      report_type TEXT NOT NULL, -- Lab Test, Radiology, Prescription, Discharge Summary, Other
      test_date TEXT NOT NULL,
      doctor_or_lab TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      composition TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      category TEXT NOT NULL,
      base_price REAL NOT NULL,
      discount_percentage INTEGER DEFAULT 10,
      prescription_required INTEGER DEFAULT 0,
      dosage_form TEXT NOT NULL,
      packaging TEXT NOT NULL,
      description TEXT,
      side_effects TEXT,
      verified_license_no TEXT NOT NULL,
      verified_batch_no TEXT NOT NULL,
      in_stock INTEGER DEFAULT 1,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS medicine_sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_id INTEGER NOT NULL,
      seller_name TEXT NOT NULL,
      price REAL NOT NULL,
      delivery_days TEXT NOT NULL,
      rating REAL DEFAULT 4.7,
      is_best_price INTEGER DEFAULT 0,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      medicine_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES medicine_sellers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      total_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      delivery_fee REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      status TEXT DEFAULT 'Ordered', -- Ordered, Verified, Packed, Shipped, Delivered, Cancelled
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'Completed',
      prescription_file_path TEXT,
      shipping_address TEXT NOT NULL,
      items_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

initSchema();

module.exports = db;
