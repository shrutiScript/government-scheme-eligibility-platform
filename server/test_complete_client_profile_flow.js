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

async function runCompleteProfileFlowTest() {
  console.log('========================================================================');
  console.log('🌟 COMPREHENSIVE END-TO-END CLIENT PROFILE UPDATE & PERSISTENCE TEST');
  console.log('========================================================================\n');

  // Step 1: Register citizen
  const email = `citizen_profile_audit_${Date.now()}@domain.in`;
  const password = 'password@123';
  console.log(`1. Registering citizen: ${email}...`);
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Amit Original',
      email,
      password,
      role: 'user'
    }
  });

  if (regRes.status !== 201 || !regRes.data.token) {
    console.error('❌ Registration failed:', regRes.data);
    process.exit(1);
  }
  let token = regRes.data.token;
  console.log('✅ Citizen registered. Token received.');

  // Step 2: Fetch existing initial profile
  console.log('\n2. Fetching initial profile data from MongoDB: GET /api/profile...');
  const initProf = await api('/profile', { headers: { Authorization: `Bearer ${token}` } });
  if (initProf.status !== 200 || !initProf.data.user) {
    console.error('❌ Failed to get profile:', initProf.data);
    process.exit(1);
  }
  console.log(`✅ Initial profile retrieved: Name="${initProf.data.user.name}", Role="${initProf.data.user.role}"`);

  // Step 3: Test Validation Constraints
  console.log('\n3. Testing Validation Constraints:');
  // 3a. Negative Age
  const negAgeRes = await api('/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { age: -5 }
  });
  if (negAgeRes.status === 400) {
    console.log('✅ Negative age rejected with 400 Bad Request.');
  } else {
    console.error('❌ Negative age was not rejected:', negAgeRes.data);
    process.exit(1);
  }

  // 3b. Zero Age
  const zeroAgeRes = await api('/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { age: 0 }
  });
  if (zeroAgeRes.status === 400) {
    console.log('✅ Age 0 rejected with 400 Bad Request.');
  } else {
    console.error('❌ Age 0 was not rejected:', zeroAgeRes.data);
    process.exit(1);
  }

  // 3c. Negative Income
  const negIncRes = await api('/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { annualIncome: -50000 }
  });
  if (negIncRes.status === 400) {
    console.log('✅ Negative annual income rejected with 400 Bad Request.');
  } else {
    console.error('❌ Negative annual income was not rejected:', negIncRes.data);
    process.exit(1);
  }

  // Step 4: Perform Complete Demographic Profile Update
  console.log('\n4. Updating complete demographic profile:');
  const updatePayload = {
    name: 'Amit Verma',
    mobileNumber: '9812345678',
    age: 29,
    gender: 'Male',
    state: 'Rajasthan',
    city: 'Jaipur',
    occupation: 'Self-Employed',
    education: 'Graduate',
    annualIncome: 280000,
    caste: 'EWS',
    disabilityStatus: true,
    bplStatus: false
  };

  const updateRes = await api('/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: updatePayload
  });

  if (updateRes.status !== 200 || !updateRes.data.user) {
    console.error('❌ Profile update failed:', updateRes.data);
    process.exit(1);
  }
  const updated = updateRes.data.user;
  console.log('✅ Profile updated in MongoDB successfully:');
  console.log(`   - Name: "${updated.name}"`);
  console.log(`   - Mobile: "${updated.mobileNumber}"`);
  console.log(`   - Age: ${updated.age}`);
  console.log(`   - Gender: "${updated.gender}"`);
  console.log(`   - State: "${updated.state}"`);
  console.log(`   - City: "${updated.city}"`);
  console.log(`   - Occupation: "${updated.occupation}"`);
  console.log(`   - Education: "${updated.education}"`);
  console.log(`   - Income: ₹${updated.annualIncome}`);
  console.log(`   - Caste: "${updated.caste}"`);
  console.log(`   - Disability Status: ${updated.disabilityStatus}`);
  console.log(`   - BPL Status: ${updated.bplStatus}`);

  // Assert exact matching
  Object.keys(updatePayload).forEach((k) => {
    if (updated[k] !== updatePayload[k]) {
      console.error(`❌ Field mismatch for ${k}: expected ${updatePayload[k]}, got ${updated[k]}`);
      process.exit(1);
    }
  });

  // Step 5: Test State -> City Transition (Rajasthan -> Gujarat -> Ahmedabad)
  console.log('\n5. Updating State to Gujarat and City to Ahmedabad...');
  const stateUpdateRes = await api('/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      state: 'Gujarat',
      city: 'Ahmedabad'
    }
  });

  if (stateUpdateRes.status !== 200 || stateUpdateRes.data.user.state !== 'Gujarat' || stateUpdateRes.data.user.city !== 'Ahmedabad') {
    console.error('❌ State-City update failed:', stateUpdateRes.data);
    process.exit(1);
  }
  console.log(`✅ State and City updated to Gujarat, Ahmedabad.`);

  // Step 6: Verify Scheme Eligibility Recalculation with New Profile
  console.log('\n6. Checking Scheme Eligibility with updated profile data...');
  const currentProfile = stateUpdateRes.data.user;
  const eligRes = await api('/eligibility/check', {
    method: 'POST',
    body: currentProfile
  });

  if (eligRes.status !== 200 || !Array.isArray(eligRes.data.eligibleSchemes)) {
    console.error('❌ Eligibility calculation failed:', eligRes.data);
    process.exit(1);
  }
  console.log(`✅ Eligibility calculation completed: ${eligRes.data.eligibleCount} eligible schemes found.`);
  eligRes.data.eligibleSchemes.slice(0, 3).forEach((item, i) => {
    console.log(`   ${i + 1}. "${item.scheme.title}" (${item.matchPercentage}% match)`);
  });

  // Step 7: Simulate Browser Refresh / Session Verification (GET /api/auth/me)
  console.log('\n7. Simulating browser refresh: GET /api/auth/me...');
  const refreshRes = await api('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  if (refreshRes.status !== 200 || !refreshRes.data.user) {
    console.error('❌ Refresh getMe failed:', refreshRes.data);
    process.exit(1);
  }
  const reloaded = refreshRes.data.user;
  if (reloaded.name !== 'Amit Verma' || reloaded.state !== 'Gujarat' || reloaded.city !== 'Ahmedabad' || reloaded.age !== 29) {
    console.error('❌ Reloaded profile data did not match saved values in MongoDB!');
    process.exit(1);
  }
  console.log('✅ Profile persists across browser refresh (All values intact).');

  // Step 8: Simulate Logout and Re-Login
  console.log('\n8. Simulating Logout and Re-Login...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Re-login failed:', loginRes.data);
    process.exit(1);
  }
  const newToken = loginRes.data.token;
  const reLoginUser = loginRes.data.user;

  const finalProfRes = await api('/profile', { headers: { Authorization: `Bearer ${newToken}` } });
  if (finalProfRes.status !== 200 || !finalProfRes.data.user) {
    console.error('❌ Profile fetch after re-login failed:', finalProfRes.data);
    process.exit(1);
  }
  const finalUser = finalProfRes.data.user;
  if (finalUser.name !== 'Amit Verma' || finalUser.mobileNumber !== '9812345678' || finalUser.state !== 'Gujarat' || finalUser.city !== 'Ahmedabad') {
    console.error('❌ Final profile mismatch after re-login:', finalUser);
    process.exit(1);
  }
  console.log('✅ Profile persists across logout and re-login (All values intact).');

  console.log('\n========================================================================');
  console.log('🎉 CLIENT PROFILE UPDATE & PERSISTENCE FULLY VERIFIED 100%!');
  console.log('========================================================================\n');
}

runCompleteProfileFlowTest().catch((err) => {
  console.error('Fatal error in client profile flow test:', err);
  process.exit(1);
});
