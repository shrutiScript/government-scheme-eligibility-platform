import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5002/api';

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING PROFILE FORM VALIDATION & PERSISTENCE TEST SUITE');
  console.log('======================================================================\n');

  // Helper fetch
  const api = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  // 1. Register a test citizen
  const testEmail = `profile_val_${Date.now()}@example.com`;
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Initial Name',
      email: testEmail,
      password: 'Password@123'
    })
  });

  if (regRes.status !== 201 && regRes.status !== 200) {
    console.error('❌ Failed to register citizen:', regRes.data);
    process.exit(1);
  }

  const token = regRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log(`✅ Test citizen registered: ${testEmail}`);

  // Base valid payload
  const validPayload = {
    name: 'Rahul Sharma',
    mobileNumber: '9876543210',
    age: 28,
    gender: 'Male',
    annualIncome: 350000,
    state: 'Maharashtra',
    city: 'Mumbai',
    occupation: 'Salaried',
    education: 'Graduate',
    caste: 'General',
    disabilityStatus: false,
    bplStatus: false
  };

  // --- TEST 1: Full Name Validation ---
  console.log('\n--- 1. Full Name Validation ---');
  
  // Empty name
  let res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, name: '   ' })
  });
  if (res.status === 400 && res.data.errors?.name) {
    console.log('✅ Empty name rejected properly:', res.data.message);
  } else {
    console.error('❌ Empty name was not rejected properly:', res);
    process.exit(1);
  }

  // Name with numbers/special characters
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, name: 'Rahul123#' })
  });
  if (res.status === 400 && res.data.errors?.name) {
    console.log('✅ Name with numbers/special chars rejected properly:', res.data.message);
  } else {
    console.error('❌ Name with numbers was not rejected properly:', res);
    process.exit(1);
  }

  // Single character name
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, name: 'R' })
  });
  if (res.status === 400 && res.data.errors?.name) {
    console.log('✅ Single character name rejected properly:', res.data.message);
  } else {
    console.error('❌ Single character name was not rejected properly:', res);
    process.exit(1);
  }

  // --- TEST 2: Mobile Number Validation ---
  console.log('\n--- 2. Mobile Number Validation ---');
  // 9 digits (invalid)
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, mobileNumber: '987654321' })
  });
  if (res.status === 400 && res.data.errors?.mobileNumber) {
    console.log('✅ 9-digit mobile number rejected properly:', res.data.message);
  } else {
    console.error('❌ 9-digit mobile number was not rejected properly:', res);
    process.exit(1);
  }

  // Mobile with letters
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, mobileNumber: '987654321A' })
  });
  if (res.status === 400 && res.data.errors?.mobileNumber) {
    console.log('✅ Mobile with alphabets rejected properly:', res.data.message);
  } else {
    console.error('❌ Mobile with alphabets was not rejected properly:', res);
    process.exit(1);
  }

  // --- TEST 3: Age Validation ---
  console.log('\n--- 3. Age Validation ---');
  // Age = 0 (invalid)
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, age: 0 })
  });
  if (res.status === 400 && res.data.errors?.age) {
    console.log('✅ Age 0 rejected properly:', res.data.message);
  } else {
    console.error('❌ Age 0 was not rejected properly:', res);
    process.exit(1);
  }

  // Age = 125 (invalid)
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, age: 125 })
  });
  if (res.status === 400 && res.data.errors?.age) {
    console.log('✅ Age > 120 rejected properly:', res.data.message);
  } else {
    console.error('❌ Age > 120 was not rejected properly:', res);
    process.exit(1);
  }

  // Negative Age
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, age: -5 })
  });
  if (res.status === 400 && res.data.errors?.age) {
    console.log('✅ Negative age rejected properly:', res.data.message);
  } else {
    console.error('❌ Negative age was not rejected properly:', res);
    process.exit(1);
  }

  // --- TEST 4: Gender Validation ---
  console.log('\n--- 4. Gender Validation ---');
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, gender: '' })
  });
  if (res.status === 400 && res.data.errors?.gender) {
    console.log('✅ Empty gender rejected properly:', res.data.message);
  } else {
    console.error('❌ Empty gender was not rejected properly:', res);
    process.exit(1);
  }

  // --- TEST 5: Annual Income Validation ---
  console.log('\n--- 5. Annual Income Validation ---');
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, annualIncome: -5000 })
  });
  if (res.status === 400 && res.data.errors?.annualIncome) {
    console.log('✅ Negative annual income rejected properly:', res.data.message);
  } else {
    console.error('❌ Negative annual income was not rejected properly:', res);
    process.exit(1);
  }

  // --- TEST 6–10: State, City, Occupation, Education, Caste Validation ---
  console.log('\n--- 6–10. Dropdowns & Location Validation ---');
  // Empty state
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, state: '' })
  });
  if (res.status === 400 && res.data.errors?.state) {
    console.log('✅ Empty state rejected properly:', res.data.message);
  } else {
    console.error('❌ Empty state was not rejected properly:', res);
    process.exit(1);
  }

  // Empty city
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, city: '' })
  });
  if (res.status === 400 && res.data.errors?.city) {
    console.log('✅ Empty city rejected properly:', res.data.message);
  } else {
    console.error('❌ Empty city was not rejected properly:', res);
    process.exit(1);
  }

  // Empty occupation
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, occupation: '' })
  });
  if (res.status === 400 && res.data.errors?.occupation) {
    console.log('✅ Empty occupation rejected properly:', res.data.message);
  } else {
    console.error('❌ Empty occupation was not rejected properly:', res);
    process.exit(1);
  }

  // Empty education
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, education: '' })
  });
  if (res.status === 400 && res.data.errors?.education) {
    console.log('✅ Empty education rejected properly:', res.data.message);
  } else {
    console.error('❌ Empty education was not rejected properly:', res);
    process.exit(1);
  }

  // Empty caste
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...validPayload, caste: '' })
  });
  if (res.status === 400 && res.data.errors?.caste) {
    console.log('✅ Empty caste rejected properly:', res.data.message);
  } else {
    console.error('❌ Empty caste was not rejected properly:', res);
    process.exit(1);
  }

  // --- TEST 11: Valid Profile Save and Database Persistence ---
  console.log('\n--- 11. Valid Profile Save and Database Persistence ---');
  res = await api('/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(validPayload)
  });

  if (res.status === 200 && res.data.success && res.data.user) {
    console.log('✅ Valid profile saved successfully in database!');
    console.log('   Saved User Name:', res.data.user.name);
    console.log('   Saved Mobile:', res.data.user.mobileNumber);
    console.log('   Saved Age:', res.data.user.age);
    console.log('   Saved State / City:', `${res.data.user.state} / ${res.data.user.city}`);
    console.log('   Saved Annual Income: ₹' + res.data.user.annualIncome);
  } else {
    console.error('❌ Valid profile save failed:', res);
    process.exit(1);
  }

  // --- TEST 12: Verify Fresh Fetch from Database ---
  console.log('\n--- 12. Fresh Fetch from Database Verification ---');
  const getProfileRes = await api('/profile', { headers: authHeaders });
  if (getProfileRes.status === 200 && getProfileRes.data.user) {
    const u = getProfileRes.data.user;
    if (
      u.name === validPayload.name &&
      u.mobileNumber === validPayload.mobileNumber &&
      u.age === validPayload.age &&
      u.gender === validPayload.gender &&
      u.annualIncome === validPayload.annualIncome &&
      u.state === validPayload.state &&
      u.city === validPayload.city &&
      u.occupation === validPayload.occupation &&
      u.education === validPayload.education &&
      u.caste === validPayload.caste
    ) {
      console.log('✅ Fresh database profile fetch completely matches saved data!');
    } else {
      console.error('❌ Mismatch in fetched database profile:', u);
      process.exit(1);
    }
  } else {
    console.error('❌ Failed to fetch fresh profile:', getProfileRes);
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log('🎉 ALL 12 PROFILE VALIDATION & PERSISTENCE TESTS PASSED 100%!');
  console.log('======================================================================\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
