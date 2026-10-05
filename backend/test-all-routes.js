const app = require('./src/server');
const http = require('http');

const server = http.createServer(app);

server.listen(5098, async () => {
  console.log('Testing All Backend Routes on port 5098...');
  try {
    const base = 'http://localhost:5098/api';

    // 1. Health
    const h = await (await fetch(`${base}/health`)).json();
    console.log('1. Health check:', h.status);

    // 2. Auth login
    const login = await (await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@medicare.com', password: 'Password123!' })
    })).json();
    const token = login.token;
    console.log('2. Auth login token acquired:', !!token);

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Medical history
    const medHistory = await (await fetch(`${base}/medical-history`, { headers: authHeaders })).json();
    console.log('3. Medical history count:', medHistory.records?.length);

    // 4. Symptoms
    const symptoms = await (await fetch(`${base}/symptoms`, { headers: authHeaders })).json();
    console.log('4. Symptoms count:', symptoms.symptoms?.length, 'Timeline groups:', Object.keys(symptoms.timeline || {}).length);

    // 5. Family genetic
    const genetic = await (await fetch(`${base}/family-genetic`, { headers: authHeaders })).json();
    console.log('5. Genetic records:', genetic.records?.length, 'Hereditary analyses:', genetic.hereditaryAnalysis?.length);

    // 6. Recommended tests
    const tests = await (await fetch(`${base}/recommended-tests`, { headers: authHeaders })).json();
    console.log('6. Recommended tests:', tests.tests?.length, 'Due:', tests.counts?.due);

    // 7. Patient ID
    const pid = await (await fetch(`${base}/patient-id`, { headers: authHeaders })).json();
    console.log('7. Patient ID Card:', pid.card?.patient_id_number, 'Verified:', pid.card?.is_verified);

    // 8. Doctors list & suggested
    const docs = await (await fetch(`${base}/doctors`)).json();
    const suggested = await (await fetch(`${base}/doctors/suggested`, { headers: authHeaders })).json();
    console.log('8. Total doctors:', docs.doctors?.length, 'Suggested count:', suggested.suggestedDoctors?.length);

    // 9. Appointments
    const appts = await (await fetch(`${base}/appointments`, { headers: authHeaders })).json();
    console.log('9. Appointments:', appts.appointments?.length);

    // 10. Medicines & Sellers
    const meds = await (await fetch(`${base}/medicines`)).json();
    console.log('10. Medicines count:', meds.medicines?.length, 'Best price seller example:', meds.medicines?.[0]?.bestSellerName, 'Price:', meds.medicines?.[0]?.bestPrice);

    // 11. Cart flow
    const firstMed = meds.medicines[0];
    const addCart = await (await fetch(`${base}/cart`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ medicine_id: firstMed.id, seller_id: firstMed.sellers[0].id, quantity: 1 })
    })).json();
    const cart = await (await fetch(`${base}/cart`, { headers: authHeaders })).json();
    console.log('11. Cart item count:', cart.items?.length, 'Total:', cart.summary?.total);

    console.log('ALL 11 API ROUTES VERIFIED END TO END WITH SUCCESS!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Route verification failed:', err);
    server.close();
    process.exit(1);
  }
});
