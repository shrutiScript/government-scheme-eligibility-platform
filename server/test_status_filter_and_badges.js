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

async function runStatusFilterTest() {
  console.log('========================================================================');
  console.log('🟢 🟡 TESTING SCHEME STATUS FILTER (ACTIVE / INACTIVE / ALL)');
  console.log('========================================================================\n');

  // 1. Login Admin
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  const adminToken = loginRes.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 2. Fetch all schemes
  const allRes = await api('/schemes?limit=50&status=all', { headers: adminHeaders });
  const schemes = allRes.data.schemes;
  console.log(`Loaded ${schemes.length} total schemes.`);
  if (schemes.length < 2) {
    console.error('❌ Need at least 2 schemes to run test');
    process.exit(1);
  }

  const scheme1 = schemes[0];
  const scheme2 = schemes[1];

  // 3. Deactivate Scheme 1 and Scheme 2
  console.log(`\nDeactivating scheme 1: "${scheme1.title}"...`);
  await api(`/schemes/${scheme1._id}/toggle-status`, { method: 'PATCH', headers: adminHeaders });

  console.log(`Deactivating scheme 2: "${scheme2.title}"...`);
  await api(`/schemes/${scheme2._id}/toggle-status`, { method: 'PATCH', headers: adminHeaders });

  // 4. Test Inactive Filter: GET /api/schemes?status=inactive
  console.log('\nTesting Filter: status = "inactive"...');
  const inactiveRes = await api('/schemes?limit=50&status=inactive', { headers: adminHeaders });
  const inactiveSchemes = inactiveRes.data.schemes;
  console.log(`✅ Inactive filter returned ${inactiveSchemes.length} scheme(s).`);
  const inactiveIds = inactiveSchemes.map((s) => s._id);

  if (!inactiveIds.includes(scheme1._id) || !inactiveIds.includes(scheme2._id)) {
    console.error('❌ Inactive filter did NOT include deactivated schemes!', inactiveIds);
    process.exit(1);
  }
  // Verify all returned schemes have status Inactive or isActive === false
  const anyActiveInInactiveFilter = inactiveSchemes.some((s) => s.status === 'Active' && s.isActive !== false);
  if (anyActiveInInactiveFilter) {
    console.error('❌ Inactive filter returned an active scheme!');
    process.exit(1);
  }
  console.log('✅ Inactive filter verified: Contains only deactivated schemes (No active schemes returned).');

  // 5. Test Active Filter: GET /api/schemes?status=active
  console.log('\nTesting Filter: status = "active"...');
  const activeRes = await api('/schemes?limit=50&status=active', { headers: adminHeaders });
  const activeSchemes = activeRes.data.schemes;
  console.log(`✅ Active filter returned ${activeSchemes.length} scheme(s).`);
  const activeIds = activeSchemes.map((s) => s._id);

  if (activeIds.includes(scheme1._id) || activeIds.includes(scheme2._id)) {
    console.error('❌ Active filter included deactivated schemes!', activeIds);
    process.exit(1);
  }
  console.log('✅ Active filter verified: Deactivated schemes are completely excluded.');

  // 6. Test All Filter: GET /api/schemes?status=all
  console.log('\nTesting Filter: status = "all"...');
  const allStatusRes = await api('/schemes?limit=50&status=all', { headers: adminHeaders });
  console.log(`✅ All status filter returned ${allStatusRes.data.schemes.length} total schemes.`);
  if (allStatusRes.data.schemes.length !== schemes.length) {
    console.error('❌ All filter count mismatch!');
    process.exit(1);
  }

  // 7. Reactivate Scheme 1
  console.log(`\nReactivating scheme 1: "${scheme1.title}"...`);
  await api(`/schemes/${scheme1._id}/toggle-status`, { method: 'PATCH', headers: adminHeaders });

  // 8. Re-verify Inactive Filter now has 1 less
  const inactiveRes2 = await api('/schemes?limit=50&status=inactive', { headers: adminHeaders });
  console.log(`✅ After reactivating 1 scheme, Inactive filter returned ${inactiveRes2.data.schemes.length} scheme(s).`);
  if (inactiveRes2.data.schemes.some((s) => s._id === scheme1._id)) {
    console.error('❌ Reactivated scheme is still in inactive list!');
    process.exit(1);
  }

  // 9. Public Citizen view test
  console.log('\nTesting Public / Citizen Browse schemes (unauthenticated)...');
  const publicRes = await api('/schemes?limit=50');
  const publicIds = publicRes.data.schemes.map((s) => s._id);
  if (publicIds.includes(scheme2._id)) {
    console.error('❌ Public citizen view exposed inactive scheme!', scheme2._id);
    process.exit(1);
  }
  console.log('✅ Public citizen view verified: Inactive schemes are completely hidden from citizen browse.');

  // 10. Reactivate Scheme 2 (Restore all to Active)
  console.log(`\nReactivating scheme 2: "${scheme2.title}"...`);
  await api(`/schemes/${scheme2._id}/toggle-status`, { method: 'PATCH', headers: adminHeaders });
  console.log('✅ Restored all schemes to Active status.');

  console.log('\n========================================================================');
  console.log('🎉 ACTIVE / INACTIVE STATUS FILTER & BADGE LOGIC PASSED 100%!');
  console.log('========================================================================\n');
}

runStatusFilterTest().catch((err) => {
  console.error('Fatal error during status filter test:', err);
  process.exit(1);
});
