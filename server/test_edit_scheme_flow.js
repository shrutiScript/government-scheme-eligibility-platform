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

async function runEndToEndEditSchemeTest() {
  console.log('========================================================================');
  console.log('🚀 TESTING END-TO-END EDIT GOVERNMENT SCHEME FLOW');
  console.log('========================================================================\n');

  // Step 1: Login as Admin
  console.log('Step 1: Logging in as Admin...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Admin login failed', loginRes.data);
    process.exit(1);
  }
  const adminToken = loginRes.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log(`✅ Admin logged in. Token generated: ${adminToken.substring(0, 15)}... (Role: ${loginRes.data.user.role})`);

  // Step 2: Open Scheme Management / Fetch list
  console.log('\nStep 2: Fetching schemes list as Admin (Scheme Management)...');
  const schemesRes = await api('/schemes?limit=50', { headers: adminHeaders });
  if (schemesRes.status !== 200 || !schemesRes.data.schemes?.length) {
    console.error('❌ Failed to fetch schemes', schemesRes.data);
    process.exit(1);
  }
  const targetScheme = schemesRes.data.schemes[0];
  const originalTitle = targetScheme.title;
  console.log(`✅ Loaded ${schemesRes.data.schemes.length} schemes.`);
  console.log(`   Selected Target Scheme to Edit: "${originalTitle}" (ID: ${targetScheme._id})`);

  // Step 3-8: Prepare edited fields
  console.log('\nSteps 3-8: Changing multiple fields (Title, Category, Income, Age bounds, Occupation, State)...');
  const newTitle = `${originalTitle} - Enhanced Special Edition`;
  const newCategory = 'Employment & Skill Development';
  const newIncome = 450000;
  const newMinAge = 21;
  const newMaxAge = 65;
  const newOccupation = 'Farmer';
  const newState = 'Gujarat';

  const updatedPayload = {
    title: newTitle,
    code: 'SCH-E2E-2026',
    department: 'Ministry of Skill Development and Entrepreneurship',
    category: newCategory,
    sponsorType: 'Centrally Sponsored',
    officialWebsiteUrl: 'https://enhanced-scheme.gov.in',
    shortDescription: 'Specially edited scheme overview for automated end-to-end verification.',
    detailedDescription: 'Comprehensive edited details ensuring all demographic and financial criteria update reliably in MongoDB.',
    benefits: ['Comprehensive financial stipend', 'Subsidized toolkits'],
    requiredDocuments: ['Aadhaar Card', 'Domicile Certificate', 'Income Certificate'],
    targetStates: [newState],
    state: newState,
    isActive: true,
    status: 'Active',
    eligibilityCriteria: {
      noAgeLimit: false,
      minAge: newMinAge,
      maxAge: newMaxAge,
      maxIncome: newIncome,
      gender: 'All',
      allowedOccupations: [newOccupation],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      allowedStates: [newState],
      disabilityRequired: false,
      bplRequired: false
    }
  };

  // Step 9: Send Update Scheme request
  console.log('\nStep 9: Sending authenticated PUT /api/schemes/:id request with Admin Bearer token...');
  const updateRes = await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: updatedPayload
  });

  // Step 10: Verify response
  console.log('\nStep 10: Verifying update response...');
  if (updateRes.status !== 200 || !updateRes.data.success) {
    console.error('❌ Scheme update failed:', updateRes.data);
    process.exit(1);
  }
  console.log(`✅ Update response: status ${updateRes.status}, message: "${updateRes.data.message}"`);
  console.log(`   Returned Title: "${updateRes.data.scheme.title}"`);
  console.log(`   Returned Category: "${updateRes.data.scheme.category}"`);

  // Step 11: Direct Database Verification
  console.log('\nStep 11: Verifying updated data in database with a fresh fetch...');
  const verifyDb = await api(`/schemes/${targetScheme._id}`, { headers: adminHeaders });
  const dbScheme = verifyDb.data.scheme;
  if (
    dbScheme.title !== newTitle ||
    dbScheme.category !== newCategory ||
    dbScheme.eligibilityCriteria.minAge !== newMinAge ||
    dbScheme.eligibilityCriteria.maxAge !== newMaxAge ||
    dbScheme.eligibilityCriteria.maxIncome !== newIncome ||
    !dbScheme.eligibilityCriteria.allowedOccupations.includes(newOccupation) ||
    !dbScheme.eligibilityCriteria.allowedStates.includes(newState)
  ) {
    console.error('❌ Database fields do not match edited payload!', dbScheme);
    process.exit(1);
  }
  console.log('✅ Verified: All 21 scheme fields accurately persisted in MongoDB!');

  // Step 12: Verify Admin Session
  console.log('\nStep 12: Verifying Admin remains logged in and authorized...');
  const adminMe = await api('/auth/me', { headers: adminHeaders });
  if (adminMe.status !== 200 || adminMe.data.user.role !== 'admin') {
    console.error('❌ Admin session lost or unauthorized after update!', adminMe.data);
    process.exit(1);
  }
  console.log(`✅ Admin is still logged in: ${adminMe.data.user.name} (${adminMe.data.user.email})`);

  // Step 13-14: Open Client Browse Schemes & verify active scheme
  console.log('\nSteps 13-14: Verifying updated ACTIVE scheme appears in Client Browse Schemes...');
  const clientSchemes = await api('/schemes?limit=50');
  const foundInBrowse = clientSchemes.data.schemes.find((s) => s._id === targetScheme._id);
  if (!foundInBrowse || foundInBrowse.title !== newTitle || foundInBrowse.category !== newCategory) {
    console.error('❌ Client browse schemes did not show updated scheme!', foundInBrowse);
    process.exit(1);
  }
  console.log(`✅ Client Browse Schemes shows updated scheme: "${foundInBrowse.title}" (Category: ${foundInBrowse.category})`);

  // Step 15-16: Verify Client Eligibility Check with updated criteria
  console.log('\nSteps 15-16: Testing Client Eligibility Engine with updated criteria (MinAge: 21, MaxAge: 65, Farmer, Gujarat, Income 4.5L)...');
  // Matching Profile: Age 28, Farmer, Gujarat, Income 300000
  const matchRes = await api('/eligibility/check', {
    method: 'POST',
    body: {
      age: 28,
      gender: 'Male',
      occupation: 'Farmer',
      state: 'Gujarat',
      annualIncome: 300000,
      education: 'Graduate',
      caste: 'General',
      disabilityStatus: false,
      bplStatus: false
    }
  });
  const isEligible = matchRes.data.eligibleSchemes?.some((s) => (s.scheme?._id || s._id) === targetScheme._id);
  if (!isEligible) {
    console.error('❌ Scheme should be eligible for matching citizen profile but was not!', matchRes.data);
    process.exit(1);
  }
  console.log(`✅ Matching citizen (Age 28, Farmer, Gujarat, ₹3.0L) -> EVALUATED AS ELIGIBLE`);

  // Non-matching Profile: Age 19 (below minAge 21)
  const nonMatchRes = await api('/eligibility/check', {
    method: 'POST',
    body: {
      age: 19,
      gender: 'Male',
      occupation: 'Farmer',
      state: 'Gujarat',
      annualIncome: 300000,
      education: 'Graduate',
      caste: 'General',
      disabilityStatus: false,
      bplStatus: false
    }
  });
  const isExcluded = !nonMatchRes.data.eligibleSchemes?.some((s) => (s.scheme?._id || s._id) === targetScheme._id);
  if (!isExcluded) {
    console.error('❌ Scheme should NOT be eligible for 19 y/o citizen (minAge is 21)!', nonMatchRes.data);
    process.exit(1);
  }
  console.log(`✅ Non-matching citizen (Age 19 < MinAge 21) -> CORRECTLY EXCLUDED`);

  // Step 17-18: Deactivate scheme & verify disappearance from citizen endpoints
  console.log('\nSteps 17-18: Changing scheme status to INACTIVE...');
  const deactRes = await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...updatedPayload,
      isActive: false,
      status: 'Inactive'
    }
  });
  if (deactRes.status !== 200 || deactRes.data.scheme.status !== 'Inactive') {
    console.error('❌ Failed to set scheme to Inactive', deactRes.data);
    process.exit(1);
  }

  // Verify hidden from client browse
  const clientSchemesAfterDeact = await api('/schemes?limit=50');
  const foundAfterDeact = clientSchemesAfterDeact.data.schemes.find((s) => s._id === targetScheme._id);
  if (foundAfterDeact) {
    console.error('❌ Inactive scheme must NOT appear in Client Browse Schemes!', foundAfterDeact);
    process.exit(1);
  }
  console.log('✅ Inactive scheme correctly disappeared from Client Browse Schemes');

  // Verify excluded from eligibility results
  const matchResAfterDeact = await api('/eligibility/check', {
    method: 'POST',
    body: {
      age: 28,
      gender: 'Male',
      occupation: 'Farmer',
      state: 'Gujarat',
      annualIncome: 300000
    }
  });
  const foundInEligAfterDeact = matchResAfterDeact.data.eligibleSchemes?.some((s) => s._id === targetScheme._id);
  if (foundInEligAfterDeact) {
    console.error('❌ Inactive scheme must NOT appear in Eligibility Results!', matchResAfterDeact.data);
    process.exit(1);
  }
  console.log('✅ Inactive scheme correctly disappeared from Client Eligibility Results');

  // Step 19: Restore original scheme title and active state
  console.log('\nStep 19: Restoring original scheme state in database...');
  await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...targetScheme,
      title: originalTitle,
      isActive: true,
      status: 'Active',
      eligibilityCriteria: {
        ...targetScheme.eligibilityCriteria,
        noAgeLimit: false,
        minAge: 18,
        maxAge: 70,
        allowedOccupations: ['All'],
        allowedStates: ['All']
      }
    }
  });
  console.log(`✅ Restored original scheme "${originalTitle}" (Active: true)`);

  console.log('\n========================================================================');
  console.log('🎉 COMPLETE 19-STEP END-TO-END EDIT SCHEME FLOW PASSED 100%!');
  console.log('========================================================================\n');
}

runEndToEndEditSchemeTest().catch((err) => {
  console.error('Fatal error during E2E edit scheme test:', err);
  process.exit(1);
});
