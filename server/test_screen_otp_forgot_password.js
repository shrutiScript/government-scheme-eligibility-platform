import dotenv from 'dotenv';
import { app } from './server.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

const TEST_PORT = 5097;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 TESTING ON-SCREEN VERIFICATION CODE FORGOT PASSWORD FLOW');
  console.log('======================================================================\n');

  await connectDB();
  const server = app.listen(TEST_PORT);

  const api = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  // 1. Register test user
  const testEmail = `screen_otp_${Date.now()}@domain.com`;
  const initialPassword = 'InitialPass@123';
  const newPassword = 'NewSecretPassword@2026';

  console.log(`1. Registering test citizen: ${testEmail}...`);
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Karan Shah',
      email: testEmail,
      password: initialPassword
    })
  });

  if (regRes.status !== 201 && regRes.status !== 200) {
    console.error('❌ Failed to register citizen:', regRes.data);
    process.exit(1);
  }
  console.log('✅ Citizen registered.');

  // 2. Request OTP on Forgot Password (should return OTP directly for on-screen display)
  console.log('\n2. Requesting verification code: POST /api/auth/forgot-password...');
  const forgotRes = await api('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail })
  });

  if (forgotRes.status === 200 && forgotRes.data.success && forgotRes.data.otp) {
    console.log('✅ Verification code generated and returned for on-screen display:');
    console.log('   Delivered OTP Code:', forgotRes.data.otp);
  } else {
    console.error('❌ Forgot password request failed:', forgotRes);
    process.exit(1);
  }

  const screenOtp = forgotRes.data.otp;

  // 3. Verify OTP
  console.log('\n3. Verifying code: POST /api/auth/verify-reset-otp...');
  const verifyRes = await api('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: screenOtp })
  });

  if (verifyRes.status === 200 && verifyRes.data.success) {
    console.log('✅ Verification code confirmed valid:', verifyRes.data.message);
  } else {
    console.error('❌ Verification code failed:', verifyRes);
    process.exit(1);
  }

  // 4. Reset Password
  console.log('\n4. Resetting password: POST /api/auth/reset-password...');
  const resetRes = await api('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      otp: screenOtp,
      newPassword,
      confirmPassword: newPassword
    })
  });

  if (resetRes.status === 200 && resetRes.data.success) {
    console.log('✅ Password successfully updated in database:', resetRes.data.message);
  } else {
    console.error('❌ Password update failed:', resetRes);
    process.exit(1);
  }

  // 5. Test Login with New Password
  console.log('\n5. Testing login with new password: POST /api/auth/login...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: newPassword })
  });

  if (loginRes.status === 200 && loginRes.data.token) {
    console.log('✅ Login succeeded with new password!');
    console.log('   Citizen:', loginRes.data.user.name);
  } else {
    console.error('❌ Login failed with new password:', loginRes);
    process.exit(1);
  }

  // 6. Test Login with Old Password (Should Fail)
  console.log('\n6. Verifying old password fails...');
  const oldLoginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: initialPassword })
  });

  if (oldLoginRes.status === 401 || oldLoginRes.status === 400) {
    console.log('✅ Old password rejected properly.');
  } else {
    console.error('❌ Old password was accepted unexpectedly.');
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log('🎉 ON-SCREEN VERIFICATION CODE FORGOT PASSWORD FLOW PASSED 100%!');
  console.log('======================================================================\n');
  server.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
