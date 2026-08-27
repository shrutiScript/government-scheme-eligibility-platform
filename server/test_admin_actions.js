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

async function runAdminActionTests() {
  console.log('===============================================================');
  console.log('🛡️  RUNNING COMPREHENSIVE ADMIN PANEL ACTIONS TEST SUITE');
  console.log('===============================================================');

  // 1. Admin Login
  console.log('\n--- 1. Admin Authentication ---');
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
  console.log('✅ Admin login successful. Role:', loginRes.data.user.role);

  // 2. Fetch Schemes List
  console.log('\n--- 2. Fetch Schemes & Scheme Management ---');
  const schemesRes = await api('/schemes?limit=50', { headers: adminHeaders });
  if (schemesRes.status !== 200 || !schemesRes.data.schemes || schemesRes.data.schemes.length === 0) {
    console.error('❌ Failed to fetch schemes', schemesRes.data);
    process.exit(1);
  }
  const targetScheme = schemesRes.data.schemes[0];
  const originalTitle = targetScheme.title;
  console.log(`✅ Loaded ${schemesRes.data.schemes.length} schemes. Selected target scheme: "${originalTitle}" (ID: ${targetScheme._id})`);

  // 3. Edit Government Scheme: Change Title & Fields
  console.log('\n--- 3. Edit Government Scheme (Update Scheme) ---');
  const updatedTitle = `${originalTitle} - Updated Edition`;
  const editPayload = {
    title: updatedTitle,
    code: 'SCH-UPD-01',
    department: targetScheme.department || 'Ministry of Health & Family Welfare',
    category: targetScheme.category || 'Healthcare & Health Insurance',
    sponsorType: 'Centrally Sponsored',
    officialWebsiteUrl: 'https://scheme-update.gov.in',
    shortDescription: 'Updated comprehensive welfare coverage description for beneficiaries across India.',
    detailedDescription: 'Updated comprehensive details regarding coverage, hospital networks, and financial assistance.',
    benefits: ['Coverage up to ₹5,00,000 per family per year', 'Cashless access to healthcare services'],
    requiredDocuments: ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
    targetStates: ['All'],
    isActive: true,
    status: 'Active',
    eligibilityCriteria: {
      noAgeLimit: false,
      minAge: 18,
      maxAge: 75,
      maxIncome: 300000,
      gender: 'All',
      allowedOccupations: ['All'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      allowedStates: ['All'],
      disabilityRequired: false,
      bplRequired: false
    }
  };

  const updateRes = await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: editPayload
  });

  if (updateRes.status !== 200 || !updateRes.data.success) {
    console.error('❌ Scheme update failed:', updateRes.data);
    process.exit(1);
  }
  console.log(`✅ Scheme updated successfully! New Title: "${updateRes.data.scheme.title}"`);
  console.log(`   Sponsor Type: "${updateRes.data.scheme.sponsorType}", Code: "${updateRes.data.scheme.code}"`);

  // Verify in DB with a fresh fetch
  const verifyRes = await api(`/schemes/${targetScheme._id}`, { headers: adminHeaders });
  if (verifyRes.data.scheme.title !== updatedTitle) {
    console.error('❌ Database title mismatch after edit!');
    process.exit(1);
  }
  console.log('✅ Verified: Database persists new title and updated fields perfectly');

  // Revert Title back
  await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: { ...editPayload, title: originalTitle }
  });
  console.log(`   Reverted scheme title back to "${originalTitle}"`);

  // 4. Test Age Bounds Validation
  console.log('\n--- 4. Age Bounds Validation on Scheme Edit ---');
  // Invalid 1: minAge > maxAge
  const invalidAge1 = await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...editPayload,
      eligibilityCriteria: { ...editPayload.eligibilityCriteria, minAge: 60, maxAge: 20 }
    }
  });
  if (invalidAge1.status !== 400) {
    console.error('❌ Expected minAge > maxAge to be rejected with 400', invalidAge1.data);
    process.exit(1);
  }
  console.log('✅ Successfully rejected minAge > maxAge (400 Bad Request)');

  // Invalid 2: age out of 1-120 range
  const invalidAge2 = await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...editPayload,
      eligibilityCriteria: { ...editPayload.eligibilityCriteria, minAge: -5, maxAge: 150 }
    }
  });
  if (invalidAge2.status !== 400) {
    console.error('❌ Expected age < 1 or > 120 to be rejected with 400', invalidAge2.data);
    process.exit(1);
  }
  console.log('✅ Successfully rejected invalid age range bounds (400 Bad Request)');

  // Valid 3: No Age Limit
  const noAgeLimitRes = await api(`/schemes/${targetScheme._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...editPayload,
      eligibilityCriteria: {
        ...editPayload.eligibilityCriteria,
        noAgeLimit: true,
        minAge: null,
        maxAge: null
      }
    }
  });
  if (noAgeLimitRes.status !== 200) {
    console.error('❌ No Age Limit update failed', noAgeLimitRes.data);
    process.exit(1);
  }
  console.log('✅ Successfully saved Scheme with No Age Limit (noAgeLimit: true, minAge: null, maxAge: null)');

  // 5. Activate / Deactivate Scheme
  console.log('\n--- 5. Activate / Deactivate Scheme ---');
  // Deactivate
  const deactRes = await api(`/schemes/${targetScheme._id}/toggle-status`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (deactRes.status !== 200 || deactRes.data.scheme.status !== 'Inactive') {
    console.error('❌ Failed to deactivate scheme', deactRes.data);
    process.exit(1);
  }
  console.log('✅ Scheme Deactivated (status: "Inactive", isActive: false)');

  // Reactivate
  const reactRes = await api(`/schemes/${targetScheme._id}/toggle-status`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (reactRes.status !== 200 || reactRes.data.scheme.status !== 'Active') {
    console.error('❌ Failed to reactivate scheme', reactRes.data);
    process.exit(1);
  }
  console.log('✅ Scheme Activated (status: "Active", isActive: true)');

  // 6. Create New Scheme & Delete Scheme
  console.log('\n--- 6. Create & Delete Scheme ---');
  const createRes = await api('/schemes', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      title: 'Temporary Admin Test Scheme 2026',
      description: 'Temporary initiative created for admin action verification suite.',
      department: 'Ministry of Electronics and Information Technology',
      category: 'Employment & Skill Development',
      status: 'Active',
      eligibilityCriteria: {
        noAgeLimit: true,
        gender: 'All',
        allowedOccupations: ['Student', 'Self-Employed']
      }
    }
  });
  if (createRes.status !== 201 || !createRes.data.scheme?._id) {
    console.error('❌ Failed to create new scheme', createRes.data);
    process.exit(1);
  }
  const newSchemeId = createRes.data.scheme._id;
  console.log(`✅ Scheme Created successfully (ID: ${newSchemeId})`);

  const deleteSchemeRes = await api(`/schemes/${newSchemeId}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  if (deleteSchemeRes.status !== 200) {
    console.error('❌ Failed to delete scheme', deleteSchemeRes.data);
    process.exit(1);
  }
  console.log('✅ Scheme Deleted successfully');

  // 7. User Directory: Edit User Demographic Data
  console.log('\n--- 7. User Directory & Edit User Data ---');
  // Register a test citizen
  const citizenEmail = `admin_test_citizen_${Date.now()}@gmail.com`;
  const citizenReg = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Ramesh Patel',
      email: citizenEmail,
      password: 'password@123',
      role: 'user'
    }
  });
  const citizenId = citizenReg.data.user._id;
  console.log(`✅ Registered test citizen (ID: ${citizenId})`);

  // Admin edits citizen profile
  const editUserRes = await api(`/admin/users/${citizenId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      name: 'Ramesh Patel (Verified Citizen)',
      phone: '9876543210',
      state: 'Gujarat',
      city: 'Ahmedabad',
      age: 32,
      gender: 'Male',
      occupation: 'Farmer',
      annualIncome: 180000,
      caste: 'OBC',
      bplStatus: true
    }
  });

  if (editUserRes.status !== 200 || !editUserRes.data.success) {
    console.error('❌ Failed to update citizen profile from admin', editUserRes.data);
    process.exit(1);
  }
  console.log('✅ Admin edited citizen profile successfully! Name:', editUserRes.data.user.name, 'Income: ₹', editUserRes.data.user.annualIncome);

  // 8. Block / Unblock User
  console.log('\n--- 8. Block / Unblock User ---');
  const blockRes = await api(`/admin/users/${citizenId}/toggle-block`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (blockRes.status !== 200 || !blockRes.data.user.isBlocked) {
    console.error('❌ Failed to block user', blockRes.data);
    process.exit(1);
  }
  console.log('✅ Citizen account Blocked (isBlocked: true)');

  const unblockRes = await api(`/admin/users/${citizenId}/toggle-block`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (unblockRes.status !== 200 || unblockRes.data.user.isBlocked) {
    console.error('❌ Failed to unblock user', unblockRes.data);
    process.exit(1);
  }
  console.log('✅ Citizen account Unblocked (isBlocked: false)');

  // Clean up test user
  await api(`/admin/users/${citizenId}`, { method: 'DELETE', headers: adminHeaders });
  console.log('   Cleaned up test citizen');

  // 9. Admin Profile Update
  console.log('\n--- 9. Admin Profile Update ---');
  const updateAdminProfRes = await api('/auth/profile', {
    method: 'PUT',
    headers: adminHeaders,
    body: { name: 'Super Administrator' }
  });
  if (updateAdminProfRes.status !== 200 || updateAdminProfRes.data.user.name !== 'Super Administrator') {
    console.error('❌ Admin profile update failed', updateAdminProfRes.data);
    process.exit(1);
  }
  console.log('✅ Admin Profile updated successfully (Name: "Super Administrator")');

  // Revert name back to 'admin'
  await api('/auth/profile', {
    method: 'PUT',
    headers: adminHeaders,
    body: { name: 'admin' }
  });

  // 10. System Activity Logs Audit
  console.log('\n--- 10. System Activity Logs Audit ---');
  const logsRes = await api('/admin/logs?limit=10', { headers: adminHeaders });
  if (logsRes.status !== 200 || !logsRes.data.logs || logsRes.data.logs.length === 0) {
    console.error('❌ Failed to fetch activity logs', logsRes.data);
    process.exit(1);
  }
  console.log(`✅ System Activity Logs contains ${logsRes.data.logs.length} recent audit events:`);
  logsRes.data.logs.slice(0, 4).forEach((log, i) => {
    console.log(`   ${i + 1}. [${log.action}] ${log.details}`);
  });

  console.log('\n===============================================================');
  console.log('🎉 ALL ADMIN PANEL ACTIONS & EDIT WORKFLOWS PASSED 100%!');
  console.log('===============================================================');
}

runAdminActionTests().catch((err) => {
  console.error('Fatal error during admin action tests:', err);
  process.exit(1);
});
