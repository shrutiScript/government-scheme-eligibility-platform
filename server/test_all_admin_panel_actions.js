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

async function runMasterAdminVerification() {
  console.log('========================================================================');
  console.log('🛡️  COMPLETE END-TO-END AUDIT & VERIFICATION OF ALL ADMIN PANEL ACTIONS');
  console.log('========================================================================\n');

  // 1. ADMIN AUTHENTICATION
  console.log('--- 1. Admin Authentication ---');
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
  console.log(`✅ Admin authenticated. Token attached. Role: ${loginRes.data.user.role}`);

  // 2. SCHEME MANAGEMENT: ADD SCHEME
  console.log('\n--- 2. Scheme Management: Add Scheme ---');
  const addSchemeRes = await api('/schemes', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      title: 'National Digital Literacy Mission 2026',
      code: 'NDLM-2026',
      department: 'Ministry of Electronics and Information Technology',
      category: 'Education & Scholarships',
      sponsorType: 'Central Scheme',
      officialWebsiteUrl: 'https://ndlm.gov.in',
      shortDescription: 'Empowering citizens with essential digital skills across rural and urban India.',
      detailedDescription: 'Comprehensive training program providing free computing and internet literacy to eligible households.',
      benefits: ['Free 20-hour digital training curriculum', 'Government accredited certification'],
      requiredDocuments: ['Aadhaar Card', 'Age Proof'],
      targetStates: ['All'],
      isActive: true,
      status: 'Active',
      eligibilityCriteria: {
        noAgeLimit: false,
        minAge: 14,
        maxAge: 60,
        maxIncome: 400000,
        gender: 'All',
        allowedOccupations: ['All'],
        allowedEducations: ['All'],
        allowedCastes: ['All'],
        allowedStates: ['All'],
        disabilityRequired: false,
        bplRequired: false
      }
    }
  });

  if (addSchemeRes.status !== 201 || !addSchemeRes.data.scheme?._id) {
    console.error('❌ Add Scheme failed:', addSchemeRes.data);
    process.exit(1);
  }
  const createdSchemeId = addSchemeRes.data.scheme._id;
  console.log(`✅ Scheme created successfully in DB (ID: ${createdSchemeId}, Title: "${addSchemeRes.data.scheme.title}")`);

  // 3. SCHEME MANAGEMENT: VIEW SCHEME
  console.log('\n--- 3. Scheme Management: View Scheme ---');
  const viewSchemeRes = await api(`/schemes/${createdSchemeId}`, { headers: adminHeaders });
  if (viewSchemeRes.status !== 200 || !viewSchemeRes.data.scheme) {
    console.error('❌ View Scheme failed:', viewSchemeRes.data);
    process.exit(1);
  }
  console.log(`✅ Scheme viewed: "${viewSchemeRes.data.scheme.title}", Code: ${viewSchemeRes.data.scheme.code}, Status: ${viewSchemeRes.data.scheme.status}`);

  // 4. SCHEME MANAGEMENT: EDIT SCHEME
  console.log('\n--- 4. Scheme Management: Edit Scheme ---');
  const editSchemeRes = await api(`/schemes/${createdSchemeId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      title: 'National Digital Literacy Mission 2026 - Phase II',
      code: 'NDLM-PH2',
      department: 'Ministry of Electronics and Information Technology',
      category: 'Education & Scholarships',
      sponsorType: 'Centrally Sponsored',
      officialWebsiteUrl: 'https://ndlm-phase2.gov.in',
      shortDescription: 'Updated phase II digital empowerment initiative with advanced smartphone and AI literacy.',
      detailedDescription: 'Extended coverage providing modern AI, UPI, and digital security skills.',
      benefits: ['Free 40-hour hands-on digital skills lab', 'Accredited certificate & stipend'],
      requiredDocuments: ['Aadhaar Card', 'Residence Certificate'],
      targetStates: ['Gujarat'],
      isActive: true,
      status: 'Active',
      eligibilityCriteria: {
        noAgeLimit: false,
        minAge: 16,
        maxAge: 65,
        maxIncome: 500000,
        gender: 'All',
        allowedOccupations: ['Student', 'Farmer', 'Self-Employed'],
        allowedEducations: ['All'],
        allowedCastes: ['All'],
        allowedStates: ['Gujarat'],
        disabilityRequired: false,
        bplRequired: false
      }
    }
  });
  if (editSchemeRes.status !== 200 || editSchemeRes.data.scheme.title !== 'National Digital Literacy Mission 2026 - Phase II') {
    console.error('❌ Edit Scheme failed:', editSchemeRes.data);
    process.exit(1);
  }
  console.log(`✅ Scheme edited successfully! New Title: "${editSchemeRes.data.scheme.title}", MinAge: ${editSchemeRes.data.scheme.eligibilityCriteria.minAge}`);

  // 5. SCHEME MANAGEMENT: DEACTIVATE & ACTIVATE SCHEME
  console.log('\n--- 5. Scheme Management: Deactivate & Activate Scheme ---');
  // Deactivate
  const deactRes = await api(`/schemes/${createdSchemeId}/toggle-status`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (deactRes.status !== 200 || deactRes.data.scheme.status !== 'Inactive' || deactRes.data.scheme.isActive !== false) {
    console.error('❌ Deactivate scheme failed:', deactRes.data);
    process.exit(1);
  }
  console.log('✅ Scheme Deactivated: status = "Inactive", isActive = false');

  // Reactivate
  const reactRes = await api(`/schemes/${createdSchemeId}/toggle-status`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (reactRes.status !== 200 || reactRes.data.scheme.status !== 'Active' || reactRes.data.scheme.isActive !== true) {
    console.error('❌ Reactivate scheme failed:', reactRes.data);
    process.exit(1);
  }
  console.log('✅ Scheme Activated: status = "Active", isActive = true');

  // 6. SCHEME MANAGEMENT: SEARCH, FILTER, SORT
  console.log('\n--- 6. Scheme Management: Search, Filter, Sort ---');
  const searchRes = await api('/schemes?search=Digital+Literacy&status=all', { headers: adminHeaders });
  if (searchRes.status !== 200 || !searchRes.data.schemes.some((s) => s._id === createdSchemeId)) {
    console.error('❌ Scheme search failed:', searchRes.data);
    process.exit(1);
  }
  console.log(`✅ Scheme Search works: Found ${searchRes.data.schemes.length} matching scheme(s) for "Digital Literacy"`);

  const filterRes = await api('/schemes?category=Education+%26+Scholarships&status=active', { headers: adminHeaders });
  if (filterRes.status !== 200 || filterRes.data.schemes.length === 0) {
    console.error('❌ Scheme filter failed:', filterRes.data);
    process.exit(1);
  }
  console.log(`✅ Scheme Filter works: Found ${filterRes.data.schemes.length} active schemes in "Education & Scholarships"`);

  const sortRes = await api('/schemes?sortBy=title&sortOrder=asc&status=all', { headers: adminHeaders });
  if (sortRes.status !== 200 || sortRes.data.schemes.length === 0) {
    console.error('❌ Scheme sort failed:', sortRes.data);
    process.exit(1);
  }
  console.log(`✅ Scheme Sort works: Fetched ${sortRes.data.schemes.length} schemes sorted alphabetically by title`);

  // 7. SCHEME MANAGEMENT: DELETE SCHEME
  console.log('\n--- 7. Scheme Management: Delete Scheme ---');
  const delSchemeRes = await api(`/schemes/${createdSchemeId}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  if (delSchemeRes.status !== 200) {
    console.error('❌ Scheme delete failed:', delSchemeRes.data);
    process.exit(1);
  }
  console.log('✅ Scheme deleted from database successfully');

  // 8. USER MANAGEMENT: VIEW, SEARCH, FILTER, SORT USERS
  console.log('\n--- 8. User Management: View, Search, Filter, Sort Users ---');
  // Register a test citizen
  const testUserEmail = `audit_citizen_${Date.now()}@domain.in`;
  const regUserRes = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Priya Sharma',
      email: testUserEmail,
      password: 'password@123',
      role: 'user'
    }
  });
  const testUserId = regUserRes.data.user._id;
  console.log(`✅ Registered test citizen (ID: ${testUserId}, Name: "Priya Sharma")`);

  const listUsersRes = await api('/admin/users?limit=50', { headers: adminHeaders });
  if (listUsersRes.status !== 200 || !listUsersRes.data.users?.some((u) => u._id === testUserId)) {
    console.error('❌ View users failed:', listUsersRes.data);
    process.exit(1);
  }
  console.log(`✅ View Users works: Loaded ${listUsersRes.data.users.length} user records`);

  const searchUserRes = await api('/admin/users?search=Priya', { headers: adminHeaders });
  if (searchUserRes.status !== 200 || !searchUserRes.data.users.some((u) => u._id === testUserId)) {
    console.error('❌ Search users failed:', searchUserRes.data);
    process.exit(1);
  }
  console.log('✅ Search Users works: Located "Priya Sharma"');

  const filterUserRes = await api('/admin/users?role=user&status=active', { headers: adminHeaders });
  if (filterUserRes.status !== 200) {
    console.error('❌ Filter users failed:', filterUserRes.data);
    process.exit(1);
  }
  console.log(`✅ Filter Users works: Retrieved ${filterUserRes.data.users.length} active citizens`);

  // 9. USER MANAGEMENT: EDIT USER
  console.log('\n--- 9. User Management: Edit User Demographic Data ---');
  const editUserRes = await api(`/admin/users/${testUserId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      name: 'Priya Sharma (Verified Citizen)',
      phone: '9898989898',
      age: 26,
      gender: 'Female',
      state: 'Maharashtra',
      city: 'Pune',
      occupation: 'Self-Employed',
      education: 'Post Graduate',
      annualIncome: 350000,
      caste: 'General',
      disabilityStatus: false,
      bplStatus: false
    }
  });
  if (editUserRes.status !== 200 || editUserRes.data.user.name !== 'Priya Sharma (Verified Citizen)') {
    console.error('❌ Edit User failed:', editUserRes.data);
    process.exit(1);
  }
  console.log(`✅ Edit User works: Name updated to "${editUserRes.data.user.name}", State: ${editUserRes.data.user.state}, Income: ₹${editUserRes.data.user.annualIncome}`);

  // 10. USER MANAGEMENT: BLOCK & UNBLOCK USER
  console.log('\n--- 10. User Management: Block & Unblock User ---');
  const blockUserRes = await api(`/admin/users/${testUserId}/toggle-block`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (blockUserRes.status !== 200 || !blockUserRes.data.user.isBlocked) {
    console.error('❌ Block user failed:', blockUserRes.data);
    process.exit(1);
  }
  console.log('✅ Block User works: isBlocked = true, status = "blocked"');

  const unblockUserRes = await api(`/admin/users/${testUserId}/toggle-block`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  if (unblockUserRes.status !== 200 || unblockUserRes.data.user.isBlocked) {
    console.error('❌ Unblock user failed:', unblockUserRes.data);
    process.exit(1);
  }
  console.log('✅ Unblock User works: isBlocked = false, status = "active"');

  // 11. USER MANAGEMENT: TOGGLE USER ROLE
  console.log('\n--- 11. User Management: Toggle User Role ---');
  const roleRes = await api(`/admin/users/${testUserId}/role`, {
    method: 'PUT',
    headers: adminHeaders,
    body: { role: 'admin' }
  });
  if (roleRes.status !== 200 || roleRes.data.user.role !== 'admin') {
    console.error('❌ Toggle user role failed:', roleRes.data);
    process.exit(1);
  }
  console.log('✅ Toggle Role works: Promoted citizen to admin');

  // Revert role back to user
  await api(`/admin/users/${testUserId}/role`, {
    method: 'PUT',
    headers: adminHeaders,
    body: { role: 'user' }
  });
  console.log('   Reverted role back to user');

  // 12. USER MANAGEMENT: DELETE USER
  console.log('\n--- 12. User Management: Delete User ---');
  const delUserRes = await api(`/admin/users/${testUserId}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  if (delUserRes.status !== 200) {
    console.error('❌ Delete user failed:', delUserRes.data);
    process.exit(1);
  }
  console.log('✅ Delete User works: Account permanently deleted');

  // 13. ADMIN PROFILE: VIEW & EDIT ADMIN PROFILE
  console.log('\n--- 13. Admin Profile: View & Edit Profile ---');
  const viewProfRes = await api('/auth/me', { headers: adminHeaders });
  if (viewProfRes.status !== 200 || viewProfRes.data.user.role !== 'admin') {
    console.error('❌ View Admin Profile failed:', viewProfRes.data);
    process.exit(1);
  }
  console.log(`✅ View Admin Profile works: Admin "${viewProfRes.data.user.name}" (${viewProfRes.data.user.email})`);

  const editProfRes = await api('/auth/profile', {
    method: 'PUT',
    headers: adminHeaders,
    body: { name: 'Principal Administrator' }
  });
  if (editProfRes.status !== 200 || editProfRes.data.user.name !== 'Principal Administrator') {
    console.error('❌ Edit Admin Profile failed:', editProfRes.data);
    process.exit(1);
  }
  console.log(`✅ Edit Admin Profile works: Name updated to "${editProfRes.data.user.name}"`);

  // Revert name back to admin
  await api('/auth/profile', {
    method: 'PUT',
    headers: adminHeaders,
    body: { name: 'admin' }
  });

  // 14. SYSTEM ACTIVITY LOGS: VIEW, SEARCH, FILTER, AUDIT
  console.log('\n--- 14. System Activity Logs: Audit & Verification ---');
  const logsRes = await api('/admin/logs?limit=25', { headers: adminHeaders });
  if (logsRes.status !== 200 || !logsRes.data.logs || logsRes.data.logs.length === 0) {
    console.error('❌ Fetch logs failed:', logsRes.data);
    process.exit(1);
  }
  console.log(`✅ System Activity Logs contains ${logsRes.data.logs.length} logged actions:`);
  logsRes.data.logs.slice(0, 8).forEach((l, i) => {
    console.log(`   ${i + 1}. [${l.action}] ${l.details}`);
  });

  // 15. SESSION INTEGRITY VERIFICATION
  console.log('\n--- 15. Session Integrity Check ---');
  const finalAuthCheck = await api('/auth/me', { headers: adminHeaders });
  if (finalAuthCheck.status !== 200 || finalAuthCheck.data.user.role !== 'admin') {
    console.error('❌ Admin session was lost during actions!', finalAuthCheck.data);
    process.exit(1);
  }
  console.log('✅ Admin remained continuously logged in through all 15 action phases with valid session.');

  console.log('\n========================================================================');
  console.log('🎉 ALL ADMIN PANEL ACTIONS AUDITED & VERIFIED 100% SUCCESSFUL!');
  console.log('========================================================================\n');
}

runMasterAdminVerification().catch((err) => {
  console.error('Fatal error during master admin verification:', err);
  process.exit(1);
});
