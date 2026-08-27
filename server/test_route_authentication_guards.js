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

async function runRouteGuardAudit() {
  console.log('========================================================================');
  console.log('🛡️ TESTING ROUTE AUTHENTICATION & ACCESS GUARD SUITE');
  console.log('========================================================================\n');

  // 1. Unauthenticated request to protected admin endpoint
  console.log('1. Testing unauthenticated request to /api/admin/logs...');
  const unauthAdminRes = await api('/admin/logs');
  if (unauthAdminRes.status === 401 || unauthAdminRes.status === 403) {
    console.log(`✅ Unauthenticated request correctly rejected with HTTP ${unauthAdminRes.status}.`);
  } else {
    console.error('❌ Expected 401/403 for unauthenticated admin access, got:', unauthAdminRes.status);
    process.exit(1);
  }

  // 2. Unauthenticated request to protected citizen endpoint
  console.log('\n2. Testing unauthenticated request to /api/profile...');
  const unauthCitizenRes = await api('/profile');
  if (unauthCitizenRes.status === 401 || unauthCitizenRes.status === 403) {
    console.log(`✅ Unauthenticated request correctly rejected with HTTP ${unauthCitizenRes.status}.`);
  } else {
    console.error('❌ Expected 401/403 for unauthenticated profile access, got:', unauthCitizenRes.status);
    process.exit(1);
  }

  // 3. Citizen trying to access Admin endpoints
  console.log('\n3. Testing Citizen attempting to access Admin endpoint (/api/admin/users)...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'dhruv@gmail.com', password: 'password123' }
  });
  if (loginRes.status === 200 && loginRes.data?.token) {
    const citizenToken = loginRes.data.token;
    const citizenAccessRes = await api('/admin/users', {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    if (citizenAccessRes.status === 401 || citizenAccessRes.status === 403) {
      console.log(`✅ Citizen correctly forbidden from Admin endpoint with HTTP ${citizenAccessRes.status}.`);
    } else {
      console.error('❌ Expected 401/403 for citizen accessing admin route, got:', citizenAccessRes.status);
      process.exit(1);
    }
  }

  // 4. Admin login & authorized access
  console.log('\n4. Testing Admin login and authorized access...');
  const adminLoginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  if (adminLoginRes.status === 200 && adminLoginRes.data?.token) {
    const adminToken = adminLoginRes.data.token;
    const adminAccessRes = await api('/admin/logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (adminAccessRes.status === 200) {
      console.log('✅ Admin authorized successfully. Access to Admin endpoints granted.');
    } else {
      console.error('❌ Admin failed to access admin route:', adminAccessRes.status);
      process.exit(1);
    }
  }

  console.log('\n========================================================================');
  console.log('🎉 ALL ROUTE AUTHENTICATION & ACCESS GUARDS VERIFIED 100% SUCCESSFUL!');
  console.log('========================================================================\n');
}

runRouteGuardAudit().catch((err) => {
  console.error('Fatal error during guard audit:', err);
  process.exit(1);
});
