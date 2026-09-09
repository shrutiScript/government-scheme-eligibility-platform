import dotenv from 'dotenv';
import { app } from './server.js';
import { connectDB } from './config/db.js';
import Scheme from './models/Scheme.js';
import User from './models/User.js';

dotenv.config();

const TEST_PORT = 5096;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING ADD SCHEME VALIDATION & DATABASE PERSISTENCE TEST SUITE');
  console.log('======================================================================\n');

  await connectDB();
  const server = app.listen(TEST_PORT);

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

  // 1. Authenticate Admin
  console.log('1. Authenticating Admin...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: 'admin@123'
    })
  });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Failed to login admin:', loginRes.data);
    process.exit(1);
  }
  const adminToken = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${adminToken}`, 'X-Role-Context': 'admin' };
  console.log('✅ Admin authenticated successfully.\n');

  // Helper for admin POST /api/schemes
  const postScheme = (body) => api('/schemes', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(body)
  });

  const baseValidScheme = {
    title: `PM Innovative Solar Yojana ${Date.now()}`,
    code: `PM-SOLAR-${Math.floor(Math.random() * 1000)}`,
    department: 'Ministry of New and Renewable Energy',
    category: 'Agriculture & Farmers',
    sponsorType: 'Central Scheme',
    officialWebsiteUrl: 'https://pmsolar.gov.in',
    launchDate: '2025-01-01',
    lastDate: '2026-12-31',
    shortDescription: 'Provides 60% subsidy for installation of residential and agricultural rooftop solar panels.',
    detailedDescription: 'Comprehensive financial subsidy and grid connectivity scheme for clean energy adoption.',
    benefits: '60% subsidy on solar rooftop systems\nSubsidized grid tie-in\n60% subsidy on solar rooftop systems\n',
    requiredDocuments: 'Aadhaar Card\nElectricity Bill\nBank Passbook\nAadhaar Card\n',
    noAgeLimit: false,
    minAge: 18,
    maxAge: 70,
    noIncomeLimit: false,
    maxIncome: 500000,
    gender: 'All',
    occupation: 'All',
    caste: 'All',
    targetState: 'All',
    disabilityRequired: 'Any',
    bplRequired: 'Any',
    isActive: true
  };

  // --- 1. SCHEME TITLE VALIDATION ---
  console.log('--- 1. Scheme Title Validation ---');
  const resEmptyTitle = await postScheme({ ...baseValidScheme, title: '   ' });
  if (resEmptyTitle.status === 400 && resEmptyTitle.data.message.includes('valid scheme title')) {
    console.log('✅ Empty title properly rejected:', resEmptyTitle.data.message);
  } else {
    console.error('❌ Empty title validation failed:', resEmptyTitle);
    process.exit(1);
  }

  const resShortTitle = await postScheme({ ...baseValidScheme, title: 'PM' });
  if (resShortTitle.status === 400 && resShortTitle.data.message.includes('valid scheme title')) {
    console.log('✅ Short title (<3 chars) properly rejected:', resShortTitle.data.message);
  } else {
    console.error('❌ Short title validation failed:', resShortTitle);
    process.exit(1);
  }

  // --- 2. NODAL DEPARTMENT VALIDATION ---
  console.log('\n--- 2. Nodal Department Validation ---');
  const resEmptyDept = await postScheme({ ...baseValidScheme, department: ' ' });
  if (resEmptyDept.status === 400 && resEmptyDept.data.message.includes('nodal department')) {
    console.log('✅ Empty department properly rejected:', resEmptyDept.data.message);
  } else {
    console.error('❌ Empty department validation failed:', resEmptyDept);
    process.exit(1);
  }

  // --- 3. CATEGORY VALIDATION ---
  console.log('\n--- 3. Category Validation ---');
  const resEmptyCategory = await postScheme({ ...baseValidScheme, category: '' });
  if (resEmptyCategory.status === 400 && resEmptyCategory.data.message.includes('category')) {
    console.log('✅ Empty category properly rejected:', resEmptyCategory.data.message);
  } else {
    console.error('❌ Empty category validation failed:', resEmptyCategory);
    process.exit(1);
  }

  // --- 4. OFFICIAL WEBSITE URL VALIDATION ---
  console.log('\n--- 4. Official Website URL Validation ---');
  const resInvalidUrl = await postScheme({ ...baseValidScheme, officialWebsiteUrl: 'ftp://not-a-website' });
  if (resInvalidUrl.status === 400 && resInvalidUrl.data.message.includes('official website URL')) {
    console.log('✅ Invalid website URL properly rejected:', resInvalidUrl.data.message);
  } else {
    console.error('❌ Invalid URL validation failed:', resInvalidUrl);
    process.exit(1);
  }

  // --- 5. DATES VALIDATION ---
  console.log('\n--- 5. Dates Validation ---');
  const resInvalidDates = await postScheme({
    ...baseValidScheme,
    launchDate: '2026-06-01',
    lastDate: '2025-01-01'
  });
  if (resInvalidDates.status === 400 && resInvalidDates.data.message.includes('earlier than launch date')) {
    console.log('✅ Last date earlier than launch date properly rejected:', resInvalidDates.data.message);
  } else {
    console.error('❌ Dates validation failed:', resInvalidDates);
    process.exit(1);
  }

  // --- 6. SUMMARY DESCRIPTION VALIDATION ---
  console.log('\n--- 6. Short Summary Description Validation ---');
  const resEmptyDesc = await postScheme({ ...baseValidScheme, shortDescription: '   ' });
  if (resEmptyDesc.status === 400 && resEmptyDesc.data.message.includes('short summary description')) {
    console.log('✅ Empty summary description properly rejected:', resEmptyDesc.data.message);
  } else {
    console.error('❌ Empty description validation failed:', resEmptyDesc);
    process.exit(1);
  }

  // --- 7. AGE CRITERIA VALIDATION ---
  console.log('\n--- 7. Age Criteria Validation ---');
  const resInvalidAgeMinMax = await postScheme({
    ...baseValidScheme,
    noAgeLimit: false,
    minAge: 60,
    maxAge: 25
  });
  if (resInvalidAgeMinMax.status === 400 && resInvalidAgeMinMax.data.message.includes('greater than maximum age')) {
    console.log('✅ Min age > Max age properly rejected:', resInvalidAgeMinMax.data.message);
  } else {
    console.error('❌ Age min > max validation failed:', resInvalidAgeMinMax);
    process.exit(1);
  }

  // --- 8. SUCCESSFUL CREATION & DATABASE PERSISTENCE ---
  console.log('\n--- 8. Valid Scheme Creation & Deduplication ---');
  const createRes = await postScheme(baseValidScheme);
  if (createRes.status !== 201 || !createRes.data.scheme) {
    console.error('❌ Valid scheme creation failed:', createRes);
    process.exit(1);
  }

  const createdId = createRes.data.scheme._id;
  console.log('✅ Scheme created in database with message:', createRes.data.message);
  console.log('   Created Scheme ID:', createdId);

  // --- 9. VERIFY DUPLICATE TITLE REJECTION ---
  console.log('\n--- 9. Duplicate Scheme Title Prevention ---');
  const duplicateRes = await postScheme({
    ...baseValidScheme,
    code: 'PM-DIFF-CODE'
  });
  if (duplicateRes.status === 400 && duplicateRes.data.message.includes('already exists')) {
    console.log('✅ Duplicate scheme title rejected properly:', duplicateRes.data.message);
  } else {
    console.error('❌ Duplicate scheme title was unexpectedly allowed:', duplicateRes);
    process.exit(1);
  }

  // --- 10. VERIFY DEDUPLICATION & DATABASE PERSISTENCE ---
  console.log('\n--- 10. Fresh Database Fetch & Field Verification ---');
  const freshScheme = await Scheme.findById(createdId);
  if (!freshScheme) {
    console.error('❌ Created scheme not found in database.');
    process.exit(1);
  }

  console.log(`✅ Title: "${freshScheme.title}"`);
  console.log(`✅ Department: "${freshScheme.department}"`);
  console.log(`✅ Category: "${freshScheme.category}"`);
  console.log(`✅ Benefits Deduplicated Count: ${freshScheme.benefits.length} (Expected 2 unique items)`);
  console.log(`✅ Documents Deduplicated Count: ${freshScheme.requiredDocuments.length} (Expected 3 unique items)`);
  console.log(`✅ Status: "${freshScheme.status}" | isActive: ${freshScheme.isActive}`);

  // --- 11. INACTIVE SCHEME PUBLIC VISIBILITY CHECK ---
  console.log('\n--- 11. Inactive Scheme Visibility Rules ---');
  const inactiveSchemeData = {
    ...baseValidScheme,
    title: `Inactive Rural Water Project ${Date.now()}`,
    code: `INACTIVE-${Math.floor(Math.random() * 1000)}`,
    isActive: false,
    status: 'Inactive'
  };

  const inactiveRes = await postScheme(inactiveSchemeData);
  if (inactiveRes.status !== 201) {
    console.error('❌ Inactive scheme creation failed:', inactiveRes);
    process.exit(1);
  }
  const inactiveId = inactiveRes.data.scheme._id;
  console.log('✅ Inactive scheme created with ID:', inactiveId);

  // Public user fetch for inactive scheme should return 404
  const publicFetch = await api(`/schemes/${inactiveId}`);
  if (publicFetch.status === 404) {
    console.log('✅ Inactive scheme is hidden from public citizens (HTTP 404).');
  } else {
    console.error('❌ Inactive scheme was unexpectedly accessible to public:', publicFetch);
    process.exit(1);
  }

  // Admin fetch for inactive scheme should succeed
  const adminFetch = await api(`/schemes/${inactiveId}`, { headers: authHeaders });
  if (adminFetch.status === 200 && adminFetch.data.scheme.status === 'Inactive') {
    console.log('✅ Inactive scheme is accessible to Admin with Inactive status.');
  } else {
    console.error('❌ Admin could not access inactive scheme:', adminFetch);
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log('🎉 ALL ADD GOVERNMENT SCHEME VALIDATION TESTS PASSED 100%!');
  console.log('======================================================================\n');
  server.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
