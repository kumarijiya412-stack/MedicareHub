const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  console.log('Starting MediCare Hub database seeding...');

  // Clear existing data in reverse order of foreign keys
  const tables = [
    'orders', 'cart_items', 'medicine_sellers', 'medicines',
    'medical_reports', 'appointments', 'doctors', 'recommended_tests',
    'family_genetic_history', 'symptoms', 'medical_history',
    'family_members', 'patient_cards', 'password_resets', 'users'
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }

  // 1. Seed Demo Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (full_name, email, phone, date_of_birth, password_hash, is_verified, role, profile_photo, emergency_contact, blood_group, height, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const userResult = insertUser.run(
    'Alex Morgan',
    'alex@medicare.com',
    '+1 (555) 349-8291',
    '1992-06-15',
    passwordHash,
    1,
    'patient',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    '+1 (555) 912-3847 (Dr. Marcus - Spouse)',
    'O+',
    175,
    68
  );
  const alexId = userResult.lastInsertRowid;

  const sarahResult = insertUser.run(
    'Sarah Jenkins',
    'sarah@medicare.com',
    '+1 (555) 782-1923',
    '1988-11-20',
    passwordHash,
    1,
    'patient',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    '+1 (555) 882-9011 (David - Brother)',
    'A+',
    163,
    56
  );

  // 2. Seed Verified Patient ID for Alex
  const patientIdNum = 'MCH-2026-78421';
  db.prepare(`
    INSERT INTO patient_cards (user_id, patient_id_number, qr_data, is_verified)
    VALUES (?, ?, ?, 1)
  `).run(
    alexId,
    patientIdNum,
    JSON.stringify({
      id: patientIdNum,
      name: 'Alex Morgan',
      blood: 'O+',
      emergency: '+1 (555) 912-3847',
      portal: 'https://medicarehub.health/verify/MCH-2026-78421',
      status: 'VERIFIED_ACTIVE'
    })
  );

  // 3. Seed Family Members for Alex
  const insertFamily = db.prepare(`
    INSERT INTO family_members (user_id, full_name, relation, date_of_birth, gender, blood_group, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const spouse = insertFamily.run(alexId, 'Marcus Morgan', 'spouse', '1990-03-12', 'Male', 'B+', 'Mild seasonal allergies to pollen');
  const child = insertFamily.run(alexId, 'Emma Morgan', 'child', '2019-08-24', 'Female', 'O+', 'Routine pediatric immunization up to date');
  const parent = insertFamily.run(alexId, 'Eleanor Vance', 'parent', '1962-01-18', 'Female', 'O-', 'Hypertension and Osteoarthritis');

  // 4. Seed Medical History for Alex
  const insertMedHistory = db.prepare(`
    INSERT INTO medical_history (user_id, family_member_id, category, title, diagnosed_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertMedHistory.run(alexId, null, 'condition', 'Mild Asthma', '2018-04-10', 'managed', 'Triggered during intense winter cardio or sudden dust exposure');
  insertMedHistory.run(alexId, null, 'allergy', 'Penicillin Allergy', '2010-09-15', 'active', 'Produces erythematous hives and facial flushing');
  insertMedHistory.run(alexId, null, 'surgery', 'Appendectomy (Laparoscopic)', '2016-11-22', 'resolved', 'Routine uncomplicated recovery at St. Jude Hospital');
  insertMedHistory.run(alexId, null, 'medication', 'Budesonide 200mcg Inhaler', '2023-01-15', 'active', '1 puff as needed prior to strenuous workout');
  insertMedHistory.run(alexId, parent.lastInsertRowid, 'condition', 'Primary Hypertension', '2015-06-01', 'managed', 'Maintained under Telmisartan 40mg daily');

  // 5. Seed Symptoms for Alex
  const insertSymptom = db.prepare(`
    INSERT INTO symptoms (user_id, family_member_id, symptom_name, severity, duration, logged_date, suggested_specialist, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSymptom.run(alexId, null, 'Throbbing Tension Headache', 'moderate', '3 days', '2026-10-02', 'Neurologist / General Physician', 'Frequent screen fatigue after long remote work hours');
  insertSymptom.run(alexId, null, 'Dry Night Cough', 'mild', '5 days', '2026-09-28', 'Pulmonologist / ENT Specialist', 'Worse during cold AC drafts');
  insertSymptom.run(alexId, null, 'Lower Lumbar Stiffness', 'moderate', '2 weeks', '2026-09-18', 'Orthopedic / Physiotherapist', 'Occurs after prolonged desk sitting');

  // 6. Seed Family Genetic History for Alex
  const insertGenetic = db.prepare(`
    INSERT INTO family_genetic_history (user_id, relative_relation, condition_name, age_of_onset, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertGenetic.run(alexId, 'Father', 'Coronary Artery Disease', 54, 'Underwent angioplasty stent placement in 2018; non-smoker');
  insertGenetic.run(alexId, 'Mother', 'Type 2 Diabetes Mellitus', 49, 'Managed through metformin and dietary lifestyle adjustments');
  insertGenetic.run(alexId, 'Paternal Grandfather', 'Hypertension', 58, 'Lifelong cardiovascular follow-up');

  // 7. Seed Recommended Tests for Alex
  const insertTest = db.prepare(`
    INSERT INTO recommended_tests (user_id, family_member_id, test_name, category, description, frequency, status, last_done_date, next_due_date, reminder_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTest.run(alexId, null, 'Comprehensive Lipid Profile', 'Cardiovascular', 'Measures Total Cholesterol, HDL, LDL, and Triglycerides to evaluate cardiac risk.', 'Annual', 'due', '2025-09-14', '2026-10-15', 1);
  insertTest.run(alexId, null, 'Fasting Blood Glucose & HbA1c', 'Metabolic', 'Screening test for insulin resistance and early diabetes detection.', 'Annual', 'due', '2025-08-10', '2026-10-25', 1);
  insertTest.run(alexId, null, 'Complete Blood Count (CBC)', 'General Screen', 'Evaluates red cells, white cells, hemoglobin, and platelets.', 'Annual', 'done', '2026-06-12', '2027-06-12', 1);
  insertTest.run(alexId, null, 'Serum Vitamin D (25-OH) & B12', 'Vitamins & Minerals', 'Assesses immune health, bone density, and neurological energy levels.', 'Every 6 Months', 'due', '2026-03-20', '2026-10-20', 1);
  insertTest.run(alexId, null, 'High-Sensitivity C-Reactive Protein (hs-CRP)', 'Cardiovascular', 'Inflammatory marker for arterial cardiovascular health assessment.', 'Annual', 'due', '2025-09-14', '2026-10-30', 1);

  // 8. Seed Doctors
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, specialty, qualification, experience_years, city, hospital_name, rating, review_count, consultation_fee, available_days, available_time_slots, image_url, bio, treatable_conditions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const drPriya = insertDoctor.run(
    'Dr. Priya Sharma',
    'Cardiologist',
    'MBBS, MD (Medicine), DM (Cardiology)',
    14,
    'New Delhi',
    'Apollo Heart Institute',
    4.9,
    142,
    1200,
    JSON.stringify(['Mon', 'Tue', 'Thu', 'Sat']),
    JSON.stringify(['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM', '06:00 PM']),
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    'Dr. Priya is an internationally renowned preventive cardiologist focusing on coronary artery evaluation, hypertension management, and lifestyle cardiology.',
    'Chest Pain, Hypertension, High Cholesterol, Palpitations, Heart Murmur, Family Heart Risk'
  );

  const drRajesh = insertDoctor.run(
    'Dr. Rajesh Kulkarni',
    'Neurologist',
    'MBBS, MD, DM (Neurology) - AIIMS',
    18,
    'Mumbai',
    'Fortis Healthcare',
    4.8,
    198,
    1500,
    JSON.stringify(['Mon', 'Wed', 'Fri']),
    JSON.stringify(['10:00 AM', '12:00 PM', '03:00 PM', '05:30 PM']),
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    'Senior consultant neurologist specializing in chronic migraine management, neuro-vascular disorders, neuropathic pain, and tension headaches.',
    'Headaches, Migraine, Dizziness, Neuropathy, Tremors, Sleep Disturbance'
  );

  const drAnanya = insertDoctor.run(
    'Dr. Ananya Sen',
    'Dermatologist',
    'MBBS, MD (Dermatology, Venereology & Leprosy)',
    9,
    'Bangalore',
    'Max Super Speciality Clinic',
    4.9,
    115,
    950,
    JSON.stringify(['Tue', 'Wed', 'Thu', 'Sat', 'Sun']),
    JSON.stringify(['10:30 AM', '01:00 PM', '03:30 PM', '06:30 PM']),
    'https://images.unsplash.com/photo-1594824813511-197fa3d62325?w=400&auto=format&fit=crop&q=80',
    'Passionate clinical dermatologist dealing with allergic dermatitis, psoriasis, acne scar protocols, and immunological skin concerns.',
    'Skin Rashes, Hives, Acne, Eczema, Psoriasis, Hair Fall, Skin Pigmentation'
  );

  const drVikram = insertDoctor.run(
    'Dr. Vikram Malhotra',
    'General Physician',
    'MBBS, MD (Internal Medicine)',
    12,
    'New Delhi',
    'Manipal Hospital',
    4.7,
    230,
    800,
    JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
    JSON.stringify(['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM']),
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    'Comprehensive primary care expert handling viral syndromes, unexplained fatigue, metabolic syndrome, and routine preventive annual evaluations.',
    'Fever, Cough, Cold, Weakness, Gastrointestinal Upset, Diabetes Screening'
  );

  const drSneha = insertDoctor.run(
    'Dr. Sneha Reddy',
    'Pediatrician',
    'MBBS, DNB (Pediatrics), Fellowship in Neonatology',
    11,
    'Hyderabad',
    'Rainbow Children Hospital',
    4.9,
    167,
    1000,
    JSON.stringify(['Mon', 'Wed', 'Fri', 'Sat']),
    JSON.stringify(['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM']),
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    'Child healthcare physician dedicated to pediatric nutrition, developmental milestones, childhood asthma, and immunization.',
    'Child Fever, Vaccination, Pediatric Asthma, Growth Monitoring, Colic'
  );

  const drArjun = insertDoctor.run(
    'Dr. Arjun Kapoor',
    'Orthopedic Surgeon',
    'MBBS, MS (Orthopedics), MCh (Joint Replacement)',
    15,
    'Gurgaon',
    'Medanta Bone & Joint Institute',
    4.8,
    184,
    1300,
    JSON.stringify(['Tue', 'Thu', 'Sat']),
    JSON.stringify(['11:00 AM', '01:30 PM', '04:00 PM', '06:00 PM']),
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    'Pioneering orthopedic specialist handling sports injuries, knee osteoarthritis, lumbar spinal pain, and minimally invasive arthroscopy.',
    'Back Pain, Knee Pain, Joint Stiffness, Arthritis, Sports Ligament Tear'
  );

  // 9. Seed Appointments for Alex
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (user_id, family_member_id, doctor_id, appointment_date, time_slot, reason, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAppointment.run(
    alexId,
    null,
    drPriya.lastInsertRowid,
    '2026-10-18',
    '11:00 AM',
    'Annual cardiovascular review and family risk counseling',
    'upcoming',
    'Please bring recent lipid profile results and fasting blood sugar data.'
  );

  insertAppointment.run(
    alexId,
    null,
    drRajesh.lastInsertRowid,
    '2026-09-15',
    '03:00 PM',
    'Evaluation of recurrent tension headaches and work fatigue',
    'completed',
    'Advised 20-20-20 screen rule, ergonomic chair adjustment, and hydration.'
  );

  // 10. Seed Medical Reports for Alex
  const insertReport = db.prepare(`
    INSERT INTO medical_reports (user_id, family_member_id, title, report_type, test_date, doctor_or_lab, file_name, file_path, file_size, mime_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReport.run(
    alexId,
    null,
    'Annual Complete Blood Count (CBC)',
    'Lab Test',
    '2026-06-12',
    'Dr. Lal PathLabs',
    'CBC_Alex_Morgan_June2026.pdf',
    'uploads/sample_cbc_report.pdf',
    452100,
    'application/pdf',
    'Hemoglobin 14.8 g/dL (Normal), WBC 6,400/mcL (Normal), Platelets 260,000/mcL (Normal).'
  );

  insertReport.run(
    alexId,
    null,
    'Chest X-Ray PA View (Clear)',
    'Radiology',
    '2025-11-04',
    'Apollo Diagnostic Imaging',
    'Chest_XRay_Alex_2025.jpg',
    'uploads/sample_xray.jpg',
    892400,
    'image/jpeg',
    'Bilateral lung fields clear. Normal cardiac silhouette. No pleural effusion.'
  );

  // 11. Seed Medicines & Sellers
  const insertMedicine = db.prepare(`
    INSERT INTO medicines (name, generic_name, composition, manufacturer, category, base_price, discount_percentage, prescription_required, dosage_form, packaging, description, side_effects, verified_license_no, verified_batch_no, in_stock, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSeller = db.prepare(`
    INSERT INTO medicine_sellers (medicine_id, seller_name, price, delivery_days, rating, is_best_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const medicinesList = [
    {
      name: 'Augmentin 625 Duo Tablet',
      generic_name: 'Amoxicillin & Potassium Clavulanate Tablets IP',
      composition: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
      category: 'Antibiotics',
      base_price: 215.00,
      discount_percentage: 15,
      prescription_required: 1,
      dosage_form: 'Tablet',
      packaging: 'Strip of 10 tablets',
      description: 'Augmentin 625 Duo is an antibacterial medicine used to treat bacterial infections of the ear, nose, throat, chest, lungs, and urinary tract.',
      side_effects: 'Mild diarrhea, nausea, vomiting, skin rash',
      verified_license_no: 'DL-2024-GSK-9842',
      verified_batch_no: 'BT-AUG-7819',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 182.75, delivery: 'Same Day', rating: 4.8 },
        { name: 'Tata 1mg', price: 175.50, delivery: '1-2 Days', rating: 4.7 }, // Best
        { name: 'Netmeds', price: 188.00, delivery: '2 Days', rating: 4.6 },
        { name: 'PharmEasy', price: 179.90, delivery: '1 Day', rating: 4.7 }
      ]
    },
    {
      name: 'Glycomet-GP 1 Tablet',
      generic_name: 'Glimepiride & Metformin Hydrochloride Tablets IP',
      composition: 'Glimepiride (1mg) + Metformin (500mg)',
      manufacturer: 'USV Private Limited',
      category: 'Diabetes',
      base_price: 110.00,
      discount_percentage: 12,
      prescription_required: 1,
      dosage_form: 'Tablet',
      packaging: 'Strip of 15 tablets',
      description: 'Used in the management of type 2 diabetes mellitus in adults to control elevated blood sugar levels.',
      side_effects: 'Hypoglycemia, headache, metallic taste, nausea',
      verified_license_no: 'DL-2024-USV-4412',
      verified_batch_no: 'BT-GLY-3301',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 96.80, delivery: 'Same Day', rating: 4.8 },
        { name: 'Tata 1mg', price: 92.50, delivery: '1-2 Days', rating: 4.8 },
        { name: 'Netmeds', price: 89.90, delivery: '2 Days', rating: 4.6 }, // Best
        { name: 'PharmEasy', price: 94.00, delivery: '1 Day', rating: 4.7 }
      ]
    },
    {
      name: 'Telma 40 Tablet',
      generic_name: 'Telmisartan Tablets IP 40mg',
      composition: 'Telmisartan (40mg)',
      manufacturer: 'Glenmark Pharmaceuticals Ltd',
      category: 'Cardiac',
      base_price: 240.00,
      discount_percentage: 18,
      prescription_required: 1,
      dosage_form: 'Tablet',
      packaging: 'Strip of 15 tablets',
      description: 'An angiotensin receptor blocker (ARB) utilized for treating high blood pressure and reducing future heart attack complications.',
      side_effects: 'Dizziness, sinus congestion, back pain, low blood pressure',
      verified_license_no: 'DL-2024-GLN-8123',
      verified_batch_no: 'BT-TEL-9002',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 196.80, delivery: 'Same Day', rating: 4.8 },
        { name: 'Tata 1mg', price: 189.00, delivery: '1-2 Days', rating: 4.9 }, // Best
        { name: 'Netmeds', price: 202.00, delivery: '2 Days', rating: 4.6 },
        { name: 'PharmEasy', price: 194.50, delivery: '1 Day', rating: 4.7 }
      ]
    },
    {
      name: 'Pan-D Capsule',
      generic_name: 'Pantoprazole Sodium & Domperidone SR Capsules',
      composition: 'Pantoprazole (40mg) + Domperidone (30mg)',
      manufacturer: 'Alkem Laboratories Ltd',
      category: 'Digestive Health',
      base_price: 199.00,
      discount_percentage: 15,
      prescription_required: 0,
      dosage_form: 'Capsule',
      packaging: 'Strip of 15 capsules',
      description: 'Relieves acidity, heartburn, gastroesophageal reflux disease (GERD), and associated bloating/nausea.',
      side_effects: 'Dry mouth, mild stomach pain, headache',
      verified_license_no: 'DL-2024-ALK-5109',
      verified_batch_no: 'BT-PAN-1249',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 169.15, delivery: 'Same Day', rating: 4.8 },
        { name: 'Tata 1mg', price: 162.00, delivery: '1-2 Days', rating: 4.8 },
        { name: 'Netmeds', price: 158.50, delivery: '2 Days', rating: 4.7 }, // Best
        { name: 'PharmEasy', price: 164.00, delivery: '1 Day', rating: 4.6 }
      ]
    },
    {
      name: 'Dolo 650 Tablet',
      generic_name: 'Paracetamol Tablets IP 650mg',
      composition: 'Paracetamol (650mg)',
      manufacturer: 'Micro Labs Ltd',
      category: 'Pain Relief',
      base_price: 34.00,
      discount_percentage: 10,
      prescription_required: 0,
      dosage_form: 'Tablet',
      packaging: 'Strip of 15 tablets',
      description: 'Effective antipyretic and analgesic used for headache, fever, toothache, muscle aches, and body pain.',
      side_effects: 'Rare allergic rash, liver stress if heavily overdosed',
      verified_license_no: 'DL-2024-MCL-1029',
      verified_batch_no: 'BT-DOL-8821',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 30.60, delivery: 'Same Day', rating: 4.9 },
        { name: 'Tata 1mg', price: 29.50, delivery: '1-2 Days', rating: 4.8 },
        { name: 'Netmeds', price: 31.00, delivery: '2 Days', rating: 4.6 },
        { name: 'PharmEasy', price: 28.90, delivery: '1 Day', rating: 4.8 } // Best
      ]
    },
    {
      name: 'Becosules Z Capsule',
      generic_name: 'Vitamin B-Complex with Vitamin C & Zinc Capsules',
      composition: 'Vitamin B-Complex + Vitamin C (150mg) + Zinc Sulphate (41.4mg)',
      manufacturer: 'Pfizer Products India Pvt Ltd',
      category: 'Vitamins & Supplements',
      base_price: 52.00,
      discount_percentage: 10,
      prescription_required: 0,
      dosage_form: 'Capsule',
      packaging: 'Strip of 20 capsules',
      description: 'Replenishes vital water-soluble vitamins, boosts energy metabolism, aids mouth ulcers, and fortifies tissue healing.',
      side_effects: 'Harmless bright yellow urine discoloration, mild nausea on empty stomach',
      verified_license_no: 'DL-2024-PFZ-7718',
      verified_batch_no: 'BT-BEC-5591',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 46.80, delivery: 'Same Day', rating: 4.8 },
        { name: 'Tata 1mg', price: 44.50, delivery: '1-2 Days', rating: 4.8 }, // Best
        { name: 'Netmeds', price: 47.00, delivery: '2 Days', rating: 4.7 },
        { name: 'PharmEasy', price: 45.20, delivery: '1 Day', rating: 4.7 }
      ]
    },
    {
      name: 'Allegra 120mg Tablet',
      generic_name: 'Fexofenadine Hydrochloride Tablets IP',
      composition: 'Fexofenadine (120mg)',
      manufacturer: 'Sanofi India Ltd',
      category: 'Allergy',
      base_price: 218.00,
      discount_percentage: 15,
      prescription_required: 0,
      dosage_form: 'Tablet',
      packaging: 'Strip of 10 tablets',
      description: 'Second-generation non-drowsy antihistamine for allergic rhinitis, watery itchy eyes, sneezing, and skin urticaria hives.',
      side_effects: 'Mild dizziness, headache, fatigue',
      verified_license_no: 'DL-2024-SNF-3329',
      verified_batch_no: 'BT-ALL-9912',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 185.30, delivery: 'Same Day', rating: 4.8 },
        { name: 'Tata 1mg', price: 178.00, delivery: '1-2 Days', rating: 4.9 }, // Best
        { name: 'Netmeds', price: 189.00, delivery: '2 Days', rating: 4.6 },
        { name: 'PharmEasy', price: 181.50, delivery: '1 Day', rating: 4.8 }
      ]
    },
    {
      name: 'Shelcal 500 Tablet',
      generic_name: 'Calcium & Vitamin D3 Tablets IP',
      composition: 'Elemental Calcium (500mg) + Vitamin D3 (250 IU)',
      manufacturer: 'Torrent Pharmaceuticals Ltd',
      category: 'Vitamins & Supplements',
      base_price: 131.00,
      discount_percentage: 15,
      prescription_required: 0,
      dosage_form: 'Tablet',
      packaging: 'Bottle of 15 tablets',
      description: 'High-absorption calcium supplement for bone density, osteoporosis prevention, and healthy joint cartilage.',
      side_effects: 'Constipation, slight gas or bloating',
      verified_license_no: 'DL-2024-TOR-6621',
      verified_batch_no: 'BT-SHL-4410',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 111.35, delivery: 'Same Day', rating: 4.8 },
        { name: 'Tata 1mg', price: 108.00, delivery: '1-2 Days', rating: 4.8 },
        { name: 'Netmeds', price: 105.50, delivery: '2 Days', rating: 4.7 }, // Best
        { name: 'PharmEasy', price: 110.00, delivery: '1 Day', rating: 4.7 }
      ]
    },
    {
      name: 'Budecort 200 Inhaler',
      generic_name: 'Budesonide Inhalation Aerosol CFC Free',
      composition: 'Budesonide (200mcg per actuation)',
      manufacturer: 'Cipla Limited',
      category: 'Chronic Care',
      base_price: 368.00,
      discount_percentage: 16,
      prescription_required: 1,
      dosage_form: 'Inhaler',
      packaging: '1 Inhaler of 200 metered doses',
      description: 'Inhaled corticosteroid for prophylactic treatment of asthma and chronic obstructive pulmonary disease (COPD).',
      side_effects: 'Oral thrush (preventable by water rinse), hoarse voice',
      verified_license_no: 'DL-2024-CIP-9091',
      verified_batch_no: 'BT-BUD-6781',
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      sellers: [
        { name: 'Apollo Pharmacy', price: 312.00, delivery: 'Same Day', rating: 4.9 },
        { name: 'Tata 1mg', price: 304.50, delivery: '1-2 Days', rating: 4.8 }, // Best
        { name: 'Netmeds', price: 319.00, delivery: '2 Days', rating: 4.6 },
        { name: 'PharmEasy', price: 308.00, delivery: '1 Day', rating: 4.7 }
      ]
    }
  ];

  for (const med of medicinesList) {
    const medResult = insertMedicine.run(
      med.name,
      med.generic_name,
      med.composition,
      med.manufacturer,
      med.category,
      med.base_price,
      med.discount_percentage,
      med.prescription_required,
      med.dosage_form,
      med.packaging,
      med.description,
      med.side_effects,
      med.verified_license_no,
      med.verified_batch_no,
      med.in_stock,
      med.image_url
    );
    const medId = medResult.lastInsertRowid;

    // Find the minimum seller price to flag is_best_price = 1
    const minPrice = Math.min(...med.sellers.map(s => s.price));

    for (const seller of med.sellers) {
      insertSeller.run(
        medId,
        seller.name,
        seller.price,
        seller.delivery,
        seller.rating,
        seller.price === minPrice ? 1 : 0
      );
    }
  }

  // 12. Seed Sample Past Order for Alex
  const sampleOrder = db.prepare(`
    INSERT INTO orders (user_id, order_number, total_amount, discount_amount, delivery_fee, final_amount, status, payment_method, payment_status, shipping_address, items_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleOrder.run(
    alexId,
    'ORD-2026-94812',
    240.00,
    36.00,
    0,
    204.00,
    'Delivered',
    'UPI',
    'Completed',
    'Apartment 4B, Lotus Heights, Outer Ring Road, Bangalore - 560103',
    JSON.stringify([
      {
        name: 'Pan-D Capsule',
        quantity: 1,
        seller: 'Netmeds',
        price: 158.50
      },
      {
        name: 'Becosules Z Capsule',
        quantity: 1,
        seller: 'Tata 1mg',
        price: 44.50
      }
    ])
  );

  console.log('Database seeded successfully with test users, doctors, medicines, sellers, and clinical records!');
  console.log('Test Account Credentials:');
  console.log('   Email: alex@medicare.com');
  console.log('   Password: Password123!');
  console.log('   Verified Patient ID: MCH-2026-78421');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = seed;
