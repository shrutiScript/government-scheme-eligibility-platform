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

async function runUserProfileTest() {
  console.log('========================================================================');
  console.log('👤 TESTING CITIZEN USER PROFILE UPDATE & ELIGIBILITY ENGINE');
  console.log('========================================================================\n');

  // 1. Register a test citizen
  const email = `profile_test_${Date.now()}@domain.in`;
  console.log(`Registering new test citizen: ${email}...`);
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Ramesh Patel',
      email,
      password: 'password@123',
      role: 'user'
    }
  });

  if (regRes.status !== 201 || !regRes.data.token) {
    console.error('❌ Citizen registration failed:', regRes.data);
    process.exit(1);
  }
  const userToken = regRes.data.token;
  const userHeaders = { Authorization: `Bearer ${userToken}` };
  console.log(`✅ Citizen registered successfully. Token attached.`);

  // 2. Fetch initial profile
  console.log('\nFetching initial profile: GET /api/profile...');
  const getProfRes = await api('/profile', { headers: userHeaders });
  if (getProfRes.status !== 200 || !getProfRes.data.user) {
    console.error('❌ Get profile failed:', getProfRes.data);
    process.exit(1);
  }
  console.log(`✅ Initial profile retrieved: Name="${getProfRes.data.user.name}", Role="${getProfRes.data.user.role}"`);

  // 3. Update demographic profile
  console.log('\nUpdating demographic profile: PUT /api/profile...');
  const updateData = {
    name: 'Ramesh Kumar Patel',
    mobileNumber: '9876543210',
    age: 32,
    gender: 'Male',
    state: 'Gujarat',
    city: 'Ahmedabad',
    occupation: 'Farmer',
    education: 'Graduate',
    annualIncome: 220000,
    caste: 'OBC',
    disabilityStatus: false,
    bplStatus: true
  };

  const updateRes = await api('/profile', {
    method: 'PUT',
    headers: userHeaders,
    body: updateData
  });

  if (updateRes.status !== 200 || !updateRes.data.user) {
    console.error('❌ Update profile failed:', updateRes.data);
    process.exit(1);
  }
  const updatedUser = updateRes.data.user;
  console.log(`✅ Profile updated in MongoDB:`);
  console.log(`   - Name: "${updatedUser.name}"`);
  console.log(`   - Mobile: "${updatedUser.mobileNumber}"`);
  console.log(`   - Age: ${updatedUser.age} years`);
  console.log(`   - Location: ${updatedUser.city}, ${updatedUser.state}`);
  console.log(`   - Occupation: ${updatedUser.occupation}`);
  console.log(`   - Income: ₹${updatedUser.annualIncome}/yr`);
  console.log(`   - BPL Status: ${updatedUser.bplStatus}`);

  // Assertions
  if (
    updatedUser.name !== updateData.name ||
    updatedUser.age !== updateData.age ||
    updatedUser.state !== updateData.state ||
    updatedUser.occupation !== updateData.occupation ||
    updatedUser.annualIncome !== updateData.annualIncome
  ) {
    console.error('❌ Updated user fields mismatch in database response!');
    process.exit(1);
  }

  // 4. Test Eligibility Evaluation based on updated profile
  console.log('\nEvaluating eligibility against government schemes...');
  const eligRes = await api('/eligibility/check', {
    method: 'POST',
    body: updatedUser
  });

  if (eligRes.status !== 200 || !eligRes.data.eligibleSchemes) {
    console.error('❌ Eligibility check failed:', eligRes.data);
    process.exit(1);
  }
  console.log(`✅ Eligibility evaluated: Found ${eligRes.data.eligibleCount} eligible scheme(s) for Ramesh Patel.`);
  eligRes.data.eligibleSchemes.slice(0, 3).forEach((item, idx) => {
    const s = item.scheme;
    console.log(`   ${idx + 1}. [${s.category}] "${s.title}" (${item.matchPercentage}% match)`);
  });

  // 5. Test Bookmark / Save Scheme
  const eligibleScheme = eligRes.data.eligibleSchemes[0]?.scheme;
  if (eligibleScheme) {
    console.log(`\nTesting Bookmark scheme: "${eligibleScheme.title}" (ID: ${eligibleScheme._id})...`);
    const saveRes = await api(`/profile/saved-schemes/${eligibleScheme._id}`, {
      method: 'POST',
      headers: userHeaders
    });
    if (saveRes.status !== 200 || !saveRes.data.isSaved) {
      console.error('❌ Save scheme failed:', saveRes.data);
      process.exit(1);
    }
    console.log('✅ Scheme saved to citizen account.');

    // Fetch saved schemes
    const getSavedRes = await api('/profile/saved-schemes', { headers: userHeaders });
    if (getSavedRes.status !== 200 || getSavedRes.data.count !== 1) {
      console.error('❌ Fetch saved schemes failed:', getSavedRes.data);
      process.exit(1);
    }
    console.log(`✅ Saved schemes list verified: Contains ${getSavedRes.data.count} saved scheme.`);

    // Remove saved scheme
    const removeRes = await api(`/profile/saved-schemes/${eligibleScheme._id}`, {
      method: 'DELETE',
      headers: userHeaders
    });
    if (removeRes.status !== 200) {
      console.error('❌ Remove saved scheme failed:', removeRes.data);
      process.exit(1);
    }
    console.log('✅ Scheme removed from saved list.');
  }

  console.log('\n========================================================================');
  console.log('🎉 CITIZEN USER PROFILE & ELIGIBILITY VERIFICATION PASSED 100%!');
  console.log('========================================================================\n');
}

runUserProfileTest().catch((err) => {
  console.error('Fatal error during user profile test:', err);
  process.exit(1);
});
