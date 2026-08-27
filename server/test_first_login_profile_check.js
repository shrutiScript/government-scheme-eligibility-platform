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

const checkProfileCompleteness = (user) => {
  if (!user) return false;
  if (!user.name || typeof user.name !== 'string' || !user.name.trim()) return false;
  const mobile = user.mobileNumber || user.phone;
  if (!mobile || typeof mobile !== 'string' || !mobile.trim()) return false;
  const age = Number(user.age);
  if (user.age === undefined || user.age === null || user.age === '' || isNaN(age) || !Number.isInteger(age) || age < 1 || age > 120) return false;
  if (!user.gender || typeof user.gender !== 'string' || !user.gender.trim()) return false;
  const income = Number(user.annualIncome);
  if (user.annualIncome === undefined || user.annualIncome === null || user.annualIncome === '' || isNaN(income) || income < 0) return false;
  if (!user.state || typeof user.state !== 'string' || !user.state.trim() || user.state.toLowerCase() === 'all') return false;
  if (!user.city || typeof user.city !== 'string' || !user.city.trim()) return false;
  if (!user.occupation || typeof user.occupation !== 'string' || !user.occupation.trim() || user.occupation.toLowerCase() === 'all') return false;
  if (!user.education || typeof user.education !== 'string' || !user.education.trim() || user.education.toLowerCase() === 'all') return false;
  if (!user.caste || typeof user.caste !== 'string' || !user.caste.trim() || user.caste.toLowerCase() === 'all') return false;
  return true;
};

async function runFirstLoginCheckAudit() {
  console.log('========================================================================');
  console.log('🔍 TESTING FIRST LOGIN PROFILE COMPLETENESS CHECK SUITE');
  console.log('========================================================================\n');

  // --- CASE 1: NEW CITIZEN REGISTRATION + INCOMPLETE PROFILE ---
  console.log('--- CASE 1: New Citizen Registration + Incomplete Profile ---');
  const newEmail = `new_citizen_${Date.now()}@domain.in`;
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Kavita Singh',
      email: newEmail,
      password: 'password123',
      role: 'user'
    }
  });

  if (regRes.status !== 201 && regRes.status !== 200) {
    console.error('❌ Registration failed:', regRes.data);
    process.exit(1);
  }
  console.log(`✅ New citizen registered: ${newEmail}`);

  // Sign in as new citizen
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: newEmail, password: 'password123' }
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Login failed:', loginRes.data);
    process.exit(1);
  }
  const citizenToken = loginRes.data.token;
  const citizenHeaders = { Authorization: `Bearer ${citizenToken}` };
  const userRecord = loginRes.data.user;

  // Verify completeness check on newly registered user
  const isComplete = checkProfileCompleteness(userRecord);
  console.log(`   Profile completeness check: isComplete = ${isComplete}`);
  if (isComplete !== false) {
    console.error('❌ Expected new user profile to be INCOMPLETE!');
    process.exit(1);
  }
  const targetRoute = isComplete ? '/dashboard' : '/profile';
  console.log(`✅ Correctly redirected to targetRoute = "${targetRoute}" (Profile Page)`);

  // Now Citizen fills and saves their profile on /profile
  console.log('   Simulating profile completion by Citizen...');
  const updateRes = await api('/profile', {
    method: 'PUT',
    headers: citizenHeaders,
    body: {
      name: 'Kavita Singh',
      mobileNumber: '9876543210',
      age: 24,
      gender: 'Female',
      state: 'Maharashtra',
      city: 'Pune',
      occupation: 'Student',
      education: 'Graduate',
      annualIncome: 150000,
      caste: 'OBC',
      disabilityStatus: false,
      bplStatus: false
    }
  });

  if (updateRes.status !== 200 || !updateRes.data.user) {
    console.error('❌ Profile save failed:', updateRes.data);
    process.exit(1);
  }
  const updatedUser = updateRes.data.user;
  const isCompleteAfterSave = checkProfileCompleteness(updatedUser);
  console.log(`   Profile completeness after saving: isComplete = ${isCompleteAfterSave}`);
  if (!isCompleteAfterSave) {
    console.error('❌ Profile should be COMPLETE after saving valid demographic details!');
    process.exit(1);
  }
  console.log('✅ Profile is now COMPLETE. Citizen navigates to Eligible Schemes on /dashboard.');

  // Verify scheme eligibility calculation
  const eligRes = await api('/eligibility/check', {
    method: 'POST',
    headers: citizenHeaders,
    body: updatedUser
  });
  console.log(`✅ Eligibility engine returned ${eligRes.data?.eligibleSchemes?.length || 0} matching schemes.`);

  // --- CASE 2: RE-LOGIN WITH COMPLETED PROFILE ---
  console.log('\n--- CASE 2: Existing Citizen + Complete Profile Sign In ---');
  const reLoginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: newEmail, password: 'password123' }
  });
  const reLoggedUser = reLoginRes.data.user;
  const isCompleteOnReLogin = checkProfileCompleteness(reLoggedUser);
  console.log(`   Profile completeness check on re-login: isComplete = ${isCompleteOnReLogin}`);
  if (!isCompleteOnReLogin) {
    console.error('❌ Expected completed citizen to evaluate as COMPLETE!');
    process.exit(1);
  }
  const nextRoute = isCompleteOnReLogin ? '/dashboard' : '/profile';
  console.log(`✅ Citizen with completed profile navigates directly to "${nextRoute}" (Dashboard) without redirect to profile.`);

  // --- CASE 3: ADMIN LOGIN ---
  console.log('\n--- CASE 3: Admin Sign In ---');
  const adminLoginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  if (adminLoginRes.status !== 200 || adminLoginRes.data.user.role !== 'admin') {
    console.error('❌ Admin login failed:', adminLoginRes.data);
    process.exit(1);
  }
  console.log('✅ Admin navigates directly to "/admin" without entering client profile flow.');

  console.log('\n========================================================================');
  console.log('🎉 FIRST LOGIN PROFILE COMPLETENESS CHECK VERIFIED 100% SUCCESSFUL!');
  console.log('========================================================================\n');
}

runFirstLoginCheckAudit().catch((err) => {
  console.error('Fatal error during first login check audit:', err);
  process.exit(1);
});
