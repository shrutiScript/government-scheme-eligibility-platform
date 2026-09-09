import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const BASE_URL = 'http://localhost:5002/api';

const api = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, data: { message: err.message } };
  }
};

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING DELETE PERSISTENCE & DATABASE CLEANUP VERIFICATION SUITE');
  console.log('======================================================================\n');

  // 1. Health check
  const healthRes = await api('/health');
  if (!healthRes.ok) {
    console.error('❌ Server health check failed. Is the server running?');
    process.exit(1);
  }
  console.log('✅ Server is healthy.\n');

  // 2. Admin Login
  console.log('--- 1. Admin Authentication ---');
  const adminLoginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });

  if (!adminLoginRes.ok || !adminLoginRes.data?.token) {
    console.error('❌ Admin login failed:', adminLoginRes.data);
    process.exit(1);
  }

  const adminToken = adminLoginRes.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}`, 'X-Role-Context': 'admin' };
  console.log('✅ Admin login successful.\n');

  // 3. Register a test citizen user
  console.log('--- 2. Citizen Registration & Authentication ---');
  const testUserEmail = `test_delete_${Date.now()}@example.com`;
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Delete Test Citizen',
      email: testUserEmail,
      password: 'password123',
      role: 'user'
    }
  });

  if (!regRes.ok || !regRes.data?.token) {
    console.error('❌ Citizen registration failed:', regRes.data);
    process.exit(1);
  }

  const citizenToken = regRes.data.token;
  const citizenId = regRes.data.user._id;
  const citizenHeaders = { Authorization: `Bearer ${citizenToken}`, 'X-Role-Context': 'user' };
  console.log(`✅ Citizen registered: ${testUserEmail} (ID: ${citizenId})\n`);

  // 4. Admin creates 2 temporary schemes for testing
  console.log('--- 3. Admin Creates 2 Test Schemes ---');
  const scheme1Res = await api('/schemes', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      title: `Test Scheme Alpha ${Date.now()}`,
      category: 'Agriculture & Farmers',
      department: 'Ministry of Agriculture',
      description: 'Test scheme for bookmark deletion persistence',
      status: 'Active'
    }
  });

  const scheme2Res = await api('/schemes', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      title: `Test Scheme Beta ${Date.now()}`,
      category: 'Healthcare & Health Insurance',
      department: 'Ministry of Health',
      description: 'Second test scheme for admin permanent deletion',
      status: 'Active'
    }
  });

  if (!scheme1Res.ok || !scheme2Res.ok) {
    console.error('❌ Failed to create test schemes:', scheme1Res.data, scheme2Res.data);
    process.exit(1);
  }

  const scheme1Id = scheme1Res.data.scheme._id;
  const scheme2Id = scheme2Res.data.scheme._id;
  console.log(`✅ Created Scheme 1: ${scheme1Id} ("${scheme1Res.data.scheme.title}")`);
  console.log(`✅ Created Scheme 2: ${scheme2Id} ("${scheme2Res.data.scheme.title}")\n`);

  // 5. Citizen bookmarks Scheme 1 and Scheme 2
  console.log('--- 4. Citizen Bookmarks Schemes ---');
  const save1Res = await api(`/profile/saved-schemes/${scheme1Id}`, { method: 'POST', headers: citizenHeaders });
  const save2Res = await api(`/profile/saved-schemes/${scheme2Id}`, { method: 'POST', headers: citizenHeaders });

  if (!save1Res.ok || !save2Res.ok) {
    console.error('❌ Failed to save schemes for citizen:', save1Res.data, save2Res.data);
    process.exit(1);
  }

  const savedListBefore = await api('/profile/saved-schemes', { headers: citizenHeaders });
  console.log(`✅ Citizen currently has ${savedListBefore.data.savedSchemes.length} saved schemes (Expected: 2).\n`);
  if (savedListBefore.data.savedSchemes.length !== 2) {
    console.error('❌ Expected 2 saved schemes before deletion');
    process.exit(1);
  }

  // 6. Citizen Deletes Scheme 1 from Saved List
  console.log('--- 5. Citizen Deletes Scheme 1 from Saved Schemes ---');
  const deleteSavedRes = await api(`/profile/saved-schemes/${scheme1Id}`, {
    method: 'DELETE',
    headers: citizenHeaders
  });

  if (!deleteSavedRes.ok || deleteSavedRes.data?.isSaved !== false) {
    console.error('❌ Delete saved scheme failed:', deleteSavedRes.data);
    process.exit(1);
  }
  console.log('✅ Delete API returned success:', deleteSavedRes.data.message);

  // 7. Verify Database Persistence of Citizen Saved Scheme Deletion
  console.log('--- 6. Verify Database Persistence of Saved Scheme Deletion ---');
  const savedListAfter = await api('/profile/saved-schemes', { headers: citizenHeaders });
  console.log(`📊 Saved schemes count after deletion: ${savedListAfter.data.savedSchemes.length} (Expected: 1)`);
  
  const hasDeletedScheme1 = savedListAfter.data.savedSchemes.some(
    (item) => (item.scheme?._id || item.scheme) === scheme1Id
  );
  if (hasDeletedScheme1) {
    console.error('❌ Deleted Scheme 1 still appeared in saved schemes list!');
    process.exit(1);
  }
  console.log('✅ Deleted Scheme 1 is NOT present in /api/profile/saved-schemes.');

  // Check /api/auth/me (Simulating refresh / relogin)
  const meRes = await api('/auth/me', { headers: citizenHeaders });
  const userSaved = meRes.data.user.savedSchemes || [];
  const hasDeletedScheme1InMe = userSaved.some((item) => (item.scheme?._id || item.scheme) === scheme1Id);
  if (hasDeletedScheme1InMe) {
    console.error('❌ Deleted Scheme 1 still present in user.savedSchemes from /auth/me!');
    process.exit(1);
  }
  console.log('✅ Deleted Scheme 1 is permanently absent from user document in MongoDB /auth/me.\n');

  // 8. Admin Permanently Deletes Scheme 2 from MongoDB
  console.log('--- 7. Admin Permanently Deletes Scheme 2 from MongoDB ---');
  const deleteScheme2Res = await api(`/schemes/${scheme2Id}`, {
    method: 'DELETE',
    headers: adminHeaders
  });

  if (!deleteScheme2Res.ok) {
    console.error('❌ Admin delete scheme failed:', deleteScheme2Res.data);
    process.exit(1);
  }
  console.log('✅ Admin delete scheme returned success:', deleteScheme2Res.data.message);

  // Verify Scheme 2 is 404 from DB
  const getDeletedSchemeRes = await api(`/schemes/${scheme2Id}`, { headers: adminHeaders });
  if (getDeletedSchemeRes.status !== 404) {
    console.error('❌ Deleted Scheme 2 was still found via GET /api/schemes/:id!');
    process.exit(1);
  }
  console.log('✅ Scheme 2 correctly returns 404 Not Found from MongoDB.');

  // Verify Citizen savedSchemes is now 0 and automatically cleaned up
  const savedListAfterAdminDelete = await api('/profile/saved-schemes', { headers: citizenHeaders });
  console.log(`📊 Citizen saved schemes count: ${savedListAfterAdminDelete.data.savedSchemes.length} (Expected: 0)`);
  if (savedListAfterAdminDelete.data.savedSchemes.length !== 0) {
    console.error('❌ Orphan deleted scheme still appeared in citizen saved list!');
    process.exit(1);
  }
  console.log('✅ Citizen saved list is clean (0 items).\n');

  // 9. Admin Permanently Deletes Test Citizen User from MongoDB
  console.log('--- 8. Admin Permanently Deletes Test Citizen User ---');
  const deleteUserRes = await api(`/admin/users/${citizenId}`, {
    method: 'DELETE',
    headers: adminHeaders
  });

  if (!deleteUserRes.ok) {
    console.error('❌ Admin delete user failed:', deleteUserRes.data);
    process.exit(1);
  }
  console.log('✅ Admin delete user returned success:', deleteUserRes.data.message);

  // Verify Citizen User cannot log in anymore
  const reLoginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: 'password123' }
  });
  if (reLoginRes.ok || reLoginRes.status === 200) {
    console.error('❌ Deleted citizen was still able to login!');
    process.exit(1);
  }
  console.log(`✅ Deleted user cannot log in (HTTP ${reLoginRes.status}: ${reLoginRes.data.message}).`);

  // Verify User is gone from Admin Users list
  const usersListRes = await api(`/admin/users?search=${encodeURIComponent(testUserEmail)}`, {
    headers: adminHeaders
  });
  const foundUser = (usersListRes.data.users || []).find((u) => u._id === citizenId);
  if (foundUser) {
    console.error('❌ Deleted user still found in admin users query!');
    process.exit(1);
  }
  console.log('✅ Deleted user is absent from admin users list.\n');

  // 10. Security policy checks for Admin Deletion
  console.log('--- 9. Security Policy: Admin Self-Delete and Admin-Delete-Admin Protection ---');
  const meAdminRes = await api('/auth/me', { headers: adminHeaders });
  const adminId = meAdminRes.data.user._id;

  const selfDeleteRes = await api(`/admin/users/${adminId}`, {
    method: 'DELETE',
    headers: adminHeaders
  });

  if (selfDeleteRes.status !== 403) {
    console.error('❌ Security Policy Violation: Admin was allowed to delete self!', selfDeleteRes.data);
    process.exit(1);
  }
  console.log(`✅ Admin cannot delete their own account (HTTP 403: ${selfDeleteRes.data.message}).`);

  // Clean up Scheme 1 that was created during tests
  await api(`/schemes/${scheme1Id}`, { method: 'DELETE', headers: adminHeaders });

  console.log('\n======================================================================');
  console.log('🎉 ALL DELETE PERSISTENCE & DATABASE CLEANUP TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================================');
}

runTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
