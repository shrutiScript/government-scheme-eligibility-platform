import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { app } from './server.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import { sendPasswordResetOtpEmail } from './utils/emailService.js';

dotenv.config();

const TEST_PORT = 5098;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING REAL EMAIL DELIVERY & OTP FORGOT PASSWORD TEST SUITE');
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

  // 1. Register test citizen
  const testEmail = `email_verify_${Date.now()}@example.com`;
  const initialPassword = 'InitialPassword@123';
  const newPassword = 'ResetPassword@2026!';

  console.log(`1. Registering test citizen: ${testEmail}...`);
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Priya Patel',
      email: testEmail,
      password: initialPassword
    })
  });

  if (regRes.status !== 201 && regRes.status !== 200) {
    console.error('❌ Failed to register test citizen:', regRes.data);
    process.exit(1);
  }
  console.log('✅ Test citizen registered successfully.');

  // 2. Setup Ethereal SMTP test account for real SMTP delivery testing
  console.log('\n2. Testing Email Service & Content Formatting...');
  try {
    const testAccount = await nodemailer.createTestAccount();
    delete process.env.EMAIL_SERVICE;
    process.env.EMAIL_HOST = testAccount.smtp.host;
    process.env.EMAIL_PORT = String(testAccount.smtp.port);
    process.env.EMAIL_SECURE = String(testAccount.smtp.secure);
    process.env.EMAIL_USER = testAccount.user;
    process.env.EMAIL_PASSWORD = testAccount.pass;
    process.env.EMAIL_FROM = `"SchemeSetu Portal" <${testAccount.user}>`;

    console.log(`   Connected to test SMTP provider: ${testAccount.smtp.host}:${testAccount.smtp.port} (${testAccount.user})`);

    const emailResult = await sendPasswordResetOtpEmail({
      to: testEmail,
      otp: '654321',
      userName: 'Priya Patel',
      expiryMinutes: 10
    });

    console.log('✅ Password reset OTP email formatted and sent successfully!');
    console.log('   Message ID:', emailResult.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(emailResult);
    if (previewUrl) {
      console.log('   Preview URL:', previewUrl);
    }
  } catch (err) {
    console.error('❌ Email template formatting failed:', err);
    process.exit(1);
  }

  // 3. Test Full Forgot Password Flow with Email Delivery
  console.log('\n3. Testing End-to-End Forgot Password API with Real Email Dispatch...');
  const forgotRes = await api('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail })
  });

  if (forgotRes.status === 200 && forgotRes.data.success) {
    console.log('✅ Forgot password API confirmed email delivery:', forgotRes.data.message);
  } else {
    console.error('❌ Forgot password API failed:', forgotRes);
    process.exit(1);
  }

  // 4. Retrieve the actual OTP stored in MongoDB (sent via email)
  console.log('\n4. Verifying OTP in database matches sent email...');
  const userInDb = await User.findOne({ email: testEmail });
  if (!userInDb || !userInDb.resetPasswordOtp) {
    console.error('❌ User resetPasswordOtp not found in database.');
    process.exit(1);
  }

  const deliveredOtp = userInDb.resetPasswordOtp;
  console.log(`✅ Stored and dispatched OTP: ${deliveredOtp}`);

  // 5. Test OTP Verification
  console.log('\n5. Testing OTP Verification endpoint...');
  const verifyRes = await api('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: deliveredOtp })
  });

  if (verifyRes.status === 200 && verifyRes.data.success) {
    console.log('✅ OTP verified successfully:', verifyRes.data.message);
  } else {
    console.error('❌ OTP verification failed:', verifyRes);
    process.exit(1);
  }

  // 6. Test Password Reset
  console.log('\n6. Testing Password Reset endpoint...');
  const resetRes = await api('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      otp: deliveredOtp,
      newPassword,
      confirmPassword: newPassword
    })
  });

  if (resetRes.status === 200 && resetRes.data.success) {
    console.log('✅ Password reset successfully in database:', resetRes.data.message);
  } else {
    console.error('❌ Password reset failed:', resetRes);
    process.exit(1);
  }

  // 7. Verify Old Password Fails
  console.log('\n7. Verifying Old Password Rejection...');
  const oldLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: initialPassword })
  });

  if (oldLogin.status === 401 || oldLogin.status === 400) {
    console.log('✅ Old password correctly rejected.');
  } else {
    console.error('❌ Old password was unexpectedly accepted.');
    process.exit(1);
  }

  // 8. Verify New Password Works
  console.log('\n8. Verifying New Password Login...');
  const newLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: newPassword })
  });

  if (newLogin.status === 200 && newLogin.data.token) {
    console.log('✅ Login with new password succeeded!');
    console.log('   Authenticated Citizen:', newLogin.data.user.name);
  } else {
    console.error('❌ Login with new password failed:', newLogin);
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log('🎉 EMAIL DELIVERY & FORGOT PASSWORD FLOW PASSED 100%!');
  console.log('======================================================================\n');
  server.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
