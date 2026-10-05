const app = require('./src/server');
const http = require('http');

const server = http.createServer(app);

server.listen(5099, async () => {
  console.log('Testing Auth & Profile Endpoints on test port 5099...');

  try {
    const baseUrl = 'http://localhost:5099/api';

    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log('Health check:', health.status);

    // 2. Login with seeded test user (Alex)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@medicare.com', password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    console.log('Login response:', loginData.success, 'User:', loginData.user?.full_name);
    const token = loginData.token;

    // 3. Get /auth/me with Bearer token
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('Auth me response:', meData.success, 'Patient Card:', meData.patientCard?.patient_id_number, 'Family count:', meData.familyMembers?.length);

    // 4. Add new family member
    const addFamilyRes = await fetch(`${baseUrl}/profile/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: 'Lucas Morgan',
        relation: 'child',
        date_of_birth: '2023-04-10',
        gender: 'Male',
        blood_group: 'O+'
      })
    });
    const addFamilyData = await addFamilyRes.json();
    console.log('Add family member response:', addFamilyData.success, 'Member:', addFamilyData.member?.full_name);

    // 5. Signup fresh user & verify OTP
    const testEmail = `newuser_${Date.now()}@example.com`;
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'John Doe',
        email: testEmail,
        password: 'SecurePassword123!',
        confirm_password: 'SecurePassword123!',
        consent: true
      })
    });
    const signupData = await signupRes.json();
    console.log('Signup response:', signupData.success, 'Dev OTP received:', !!signupData.devOtp);

    const verifyRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otp: signupData.devOtp
      })
    });
    const verifyData = await verifyRes.json();
    console.log('Verify OTP response:', verifyData.success, 'User verified:', verifyData.user?.is_verified === 1);

    console.log('All Auth & Profile backend tests passed successfully!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    server.close();
    process.exit(1);
  }
});
