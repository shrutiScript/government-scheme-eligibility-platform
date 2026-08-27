const baseURL = 'http://localhost:5000/api';

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

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING SCHEME RECOMMENDATIONS & PROFILE MATCHING TEST SUITE');
  console.log('===============================================================');

  // 1. Login Admin
  const adminRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  if (adminRes.status !== 200) {
    console.error('❌ Admin login failed', adminRes.data);
    process.exit(1);
  }
  const adminToken = adminRes.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log('✅ 1. Admin login successful');

  // 2. Clean up test user if exists
  const usersRes = await api('/admin/users', { headers: adminHeaders });
  if (usersRes.status === 200 && usersRes.data.users) {
    const existing = usersRes.data.users.find(u => u.email === 'testcitizen@gmail.com');
    if (existing) {
      await api(`/admin/users/${existing._id}`, { method: 'DELETE', headers: adminHeaders });
    }
  }

  // 3. Register a test citizen
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Pooja Patel',
      email: 'testcitizen@gmail.com',
      password: 'password@123',
      role: 'user'
    }
  });
  if (regRes.status !== 201) {
    console.error('❌ Citizen registration failed', regRes.data);
    process.exit(1);
  }
  const citizenToken = regRes.data.token;
  const citizenHeaders = { Authorization: `Bearer ${citizenToken}` };
  console.log('✅ 2. Citizen registered & token generated successfully');

  // 4. Update Citizen Profile: 25 y/o female in Gujarat, income 200,000, student, OBC
  console.log('\n--- 3. Updating Citizen Profile ---');
  const profileData = {
    name: 'Pooja Patel',
    age: 25,
    gender: 'Female',
    state: 'Gujarat',
    city: 'Ahmedabad',
    annualIncome: 200000,
    occupation: 'Student',
    education: 'Graduate',
    caste: 'OBC',
    disabilityStatus: false,
    bplStatus: false
  };

  const updateProfileRes = await api('/profile', {
    method: 'PUT',
    headers: citizenHeaders,
    body: profileData
  });

  if (updateProfileRes.status !== 200 || !updateProfileRes.data.success) {
    console.error('❌ Profile update failed:', updateProfileRes.data);
    process.exit(1);
  }
  console.log('✅ Profile updated with demographic fields successfully');

  // 5. Test Profile-Based Recommendations API for logged-in Citizen
  console.log('\n--- 4. Testing Profile-Based Scheme Recommendations ---');
  const recRes = await api('/eligibility/recommendations', { headers: citizenHeaders });
  if (recRes.status !== 200 || !recRes.data.success) {
    console.error('❌ Recommendations request failed:', recRes.data);
    process.exit(1);
  }

  console.log(`✅ Recommendations returned successfully!`);
  console.log(`   isProfileEvaluated: ${recRes.data.isProfileEvaluated}`);
  console.log(`   eligibleCount: ${recRes.data.eligibleCount}`);
  console.log(`   recommended count: ${recRes.data.recommended?.length}`);

  if (!recRes.data.isProfileEvaluated || recRes.data.eligibleCount === 0) {
    console.error('❌ Expected profile to be evaluated and eligible schemes returned');
    process.exit(1);
  }

  // 6. Test Inactive Schemes Exclusion
  console.log('\n--- 5. Testing Inactive Scheme Exclusion ---');
  // Admin creates an Inactive scheme
  const inactiveSchemeRes = await api('/schemes', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      title: 'Discontinued Special State Allowance',
      description: 'An old discontinued scheme for students in Gujarat',
      department: 'Ministry of Education',
      category: 'Education & Scholarships',
      state: 'Gujarat',
      status: 'Inactive',
      eligibilityCriteria: {
        minAge: 18,
        maxAge: 30,
        gender: 'All',
        allowedStates: ['Gujarat'],
        allowedOccupations: ['Student']
      }
    }
  });

  const inactiveSchemeId = inactiveSchemeRes.data.scheme?._id;
  console.log(`   Created test inactive scheme (ID: ${inactiveSchemeId})`);

  // Citizen fetches recommendations again
  const recAfterInactiveRes = await api('/eligibility/recommendations', { headers: citizenHeaders });
  const foundInactiveInRec = (recAfterInactiveRes.data.recommended || []).some(s => s._id === inactiveSchemeId);
  const foundInactiveInEligible = (recAfterInactiveRes.data.eligibleSchemes || []).some(item => item.scheme?._id === inactiveSchemeId);

  if (foundInactiveInRec || foundInactiveInEligible) {
    console.error('❌ FAIL: Inactive scheme appeared in citizen recommendations!');
    process.exit(1);
  }
  console.log('✅ Inactive scheme was correctly EXCLUDED from citizen recommendations');

  // Citizen fetches public browse schemes
  const browseRes = await api('/schemes', { headers: citizenHeaders });
  const foundInactiveInBrowse = (browseRes.data.schemes || []).some(s => s._id === inactiveSchemeId);
  if (foundInactiveInBrowse) {
    console.error('❌ FAIL: Inactive scheme appeared in citizen browse schemes!');
    process.exit(1);
  }
  console.log('✅ Inactive scheme was correctly EXCLUDED from citizen browse schemes');

  // 7. Test Dynamic Recalculation on Profile Change
  console.log('\n--- 6. Testing Dynamic Recalculation on Profile Change ---');
  // Change state to 'Rajasthan' and age to 65
  const updateProfile2Res = await api('/profile', {
    method: 'PUT',
    headers: citizenHeaders,
    body: {
      ...profileData,
      state: 'Rajasthan',
      age: 65,
      occupation: 'Senior Citizen',
      bplStatus: true
    }
  });

  if (updateProfile2Res.status !== 200) {
    console.error('❌ Profile 2nd update failed');
    process.exit(1);
  }

  const rec2Res = await api('/eligibility/recommendations', { headers: citizenHeaders });
  console.log(`✅ Updated Profile Recommendations: eligibleCount = ${rec2Res.data.eligibleCount}`);
  
  // Cleanup test inactive scheme
  if (inactiveSchemeId) {
    await api(`/schemes/${inactiveSchemeId}`, { method: 'DELETE', headers: adminHeaders });
    console.log('   Cleaned up test inactive scheme');
  }

  // Cleanup test user
  await api(`/admin/users/${regRes.data.user._id}`, { method: 'DELETE', headers: adminHeaders });
  console.log('   Cleaned up test citizen');

  console.log('\n===============================================================');
  console.log('🎉 ALL SCHEME RECOMMENDATIONS & PROFILE MATCHING TESTS PASSED!');
  console.log('===============================================================');
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
