const port = process.env.PORT || 5002;
const baseURL = `http://localhost:${port}/api`;

async function api(path, { method = 'GET', body = null, headers = {} } = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${baseURL}${path}`, options);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}
  return {
    status: res.status,
    data
  };
}

async function runSessionIsolationAndRefreshAudit() {
  console.log('========================================================================');
  console.log('🔒 AUDITING USER SESSION ISOLATION & REFRESH PERSISTENCE');
  console.log('========================================================================\n');

  // --- 1. USER A (Shreya) SETUP ---
  console.log('--- 1. Setting up User A (Shreya) ---');
  const shreyaEmail = `shreya_${Date.now()}@domain.in`;
  const regShreya = await api('/auth/register', {
    method: 'POST',
    body: { name: 'Shreya Patel', email: shreyaEmail, password: 'password123', role: 'user' }
  });
  if (regShreya.status !== 200 && regShreya.status !== 201) {
    console.error('❌ Registration failed for Shreya:', regShreya.data);
    process.exit(1);
  }
  const shreyaLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: shreyaEmail, password: 'password123' }
  });
  const shreyaToken = shreyaLogin.data.token;
  const shreyaHeaders = { Authorization: `Bearer ${shreyaToken}` };

  // Shreya saves her profile
  const shreyaProfileRes = await api('/profile', {
    method: 'PUT',
    headers: shreyaHeaders,
    body: {
      name: 'Shreya Patel',
      mobileNumber: '9988776655',
      age: 22,
      gender: 'Female',
      state: 'Gujarat',
      city: 'Ahmedabad',
      occupation: 'Student',
      education: 'Graduate',
      annualIncome: 120000,
      caste: 'General',
      disabilityStatus: false,
      bplStatus: false
    }
  });
  console.log(`✅ Shreya profile saved: Name = "${shreyaProfileRes.data.user.name}", Age = ${shreyaProfileRes.data.user.age}, State = "${shreyaProfileRes.data.user.state}"`);

  // --- 2. USER B (Dhruv) SETUP ---
  console.log('\n--- 2. Setting up User B (Dhruv) ---');
  const dhruvEmail = `dhruv_${Date.now()}@domain.in`;
  const regDhruv = await api('/auth/register', {
    method: 'POST',
    body: { name: 'Dhruv Sharma', email: dhruvEmail, password: 'password123', role: 'user' }
  });
  if (regDhruv.status !== 200 && regDhruv.status !== 201) {
    console.error('❌ Registration failed for Dhruv:', regDhruv.data);
    process.exit(1);
  }
  const dhruvLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: dhruvEmail, password: 'password123' }
  });
  const dhruvToken = dhruvLogin.data.token;
  const dhruvHeaders = { Authorization: `Bearer ${dhruvToken}` };

  // Dhruv saves his profile
  const dhruvProfileRes = await api('/profile', {
    method: 'PUT',
    headers: dhruvHeaders,
    body: {
      name: 'Dhruv Sharma',
      mobileNumber: '9123456780',
      age: 45,
      gender: 'Male',
      state: 'Maharashtra',
      city: 'Mumbai',
      occupation: 'Farmer',
      education: '10th Pass',
      annualIncome: 80000,
      caste: 'OBC',
      disabilityStatus: false,
      bplStatus: true
    }
  });
  console.log(`✅ Dhruv profile saved: Name = "${dhruvProfileRes.data.user.name}", Age = ${dhruvProfileRes.data.user.age}, State = "${dhruvProfileRes.data.user.state}"`);

  // --- 3. AUDIT STRICT USER ISOLATION (ZERO DATA MIXING) ---
  console.log('\n--- 3. Verifying User Isolation ---');
  const dhruvFetchProfile = await api('/profile', { headers: dhruvHeaders });
  const dhruvData = dhruvFetchProfile.data.user;

  if (dhruvData.name === 'Shreya Patel' || dhruvData.gender === 'Female' || dhruvData.state === 'Gujarat') {
    console.error('❌ CRITICAL ERROR: Shreya data leaked to Dhruv session!', dhruvData);
    process.exit(1);
  }
  console.log('✅ Dhruv session received strictly Dhruv data:');
  console.log(`   Name: ${dhruvData.name}`);
  console.log(`   Gender: ${dhruvData.gender}`);
  console.log(`   State: ${dhruvData.state}`);
  console.log(`   Occupation: ${dhruvData.occupation}`);

  // --- 4. AUDIT SESSION RESTORATION ON REFRESH ---
  console.log('\n--- 4. Verifying Session Restoration on Refresh (/api/auth/me) ---');
  // Refresh simulation for Shreya
  const shreyaRefresh = await api('/auth/me', {
    headers: { Authorization: `Bearer ${shreyaToken}`, 'X-Role-Context': 'user' }
  });
  if (shreyaRefresh.status === 200 && shreyaRefresh.data.user?.email === shreyaEmail) {
    console.log(`✅ Shreya session perfectly restored across refresh: ${shreyaRefresh.data.user.name} (${shreyaRefresh.data.user.email})`);
  } else {
    console.error('❌ Shreya session failed to restore across refresh:', shreyaRefresh);
    process.exit(1);
  }

  // Refresh simulation for Dhruv
  const dhruvRefresh = await api('/auth/me', {
    headers: { Authorization: `Bearer ${dhruvToken}`, 'X-Role-Context': 'user' }
  });
  if (dhruvRefresh.status === 200 && dhruvRefresh.data.user?.email === dhruvEmail) {
    console.log(`✅ Dhruv session perfectly restored across refresh: ${dhruvRefresh.data.user.name} (${dhruvRefresh.data.user.email})`);
  } else {
    console.error('❌ Dhruv session failed to restore across refresh:', dhruvRefresh);
    process.exit(1);
  }

  // Refresh simulation for Admin
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  const adminToken = adminLogin.data.token;
  const adminRefresh = await api('/auth/me', {
    headers: { Authorization: `Bearer ${adminToken}`, 'X-Role-Context': 'admin' }
  });
  if (adminRefresh.status === 200 && adminRefresh.data.user?.role === 'admin') {
    console.log(`✅ Admin session perfectly restored across refresh: ${adminRefresh.data.user.email} (Role: admin)`);
  } else {
    console.error('❌ Admin session failed to restore across refresh:', adminRefresh);
    process.exit(1);
  }

  // --- 5. AUDIT INVALID TOKEN BEHAVIOR ---
  console.log('\n--- 5. Verifying Invalid Token Handling ---');
  const invalidRes = await api('/auth/me', {
    headers: { Authorization: 'Bearer invalid_fake_token_12345', 'X-Role-Context': 'user' }
  });
  if (invalidRes.status === 401) {
    console.log('✅ Invalid token correctly rejected with HTTP 401 Unauthorized.');
  } else {
    console.error('❌ Expected 401 for invalid token, got:', invalidRes.status);
    process.exit(1);
  }

  console.log('\n========================================================================');
  console.log('🎉 USER ISOLATION, REFRESH PERSISTENCE & SESSION MANAGEMENT AUDIT PASSED 100%!');
  console.log('========================================================================\n');
}

runSessionIsolationAndRefreshAudit().catch((err) => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
