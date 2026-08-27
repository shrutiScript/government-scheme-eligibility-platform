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

async function runCategoryFilterAudit() {
  console.log('========================================================================');
  console.log('📑 TESTING ADMIN SCHEME MANAGEMENT CATEGORY FILTER SUITE');
  console.log('========================================================================\n');

  // Authenticate Admin
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  if (adminLogin.status !== 200 || !adminLogin.data.token) {
    console.error('❌ Admin login failed:', adminLogin.data);
    process.exit(1);
  }
  const adminHeaders = { Authorization: `Bearer ${adminLogin.data.token}` };
  console.log('✅ Admin authenticated. Bearer token attached.\n');

  const categories = [
    'Agriculture & Farmers',
    'Education & Scholarships',
    'Employment & Skill Development',
    'Financial Inclusion & Business',
    'General Welfare',
    'Healthcare & Health Insurance',
    'Housing & Rural Development',
    'Social Security & Pensions',
    'Women & Child Welfare'
  ];

  // 1. Test "All Categories"
  console.log('1. Testing "All Categories" / status=all:');
  const allRes = await api('/schemes?status=all&limit=100', { headers: adminHeaders });
  if (allRes.status !== 200 || !allRes.data.schemes) {
    console.error('❌ Failed fetching all schemes:', allRes.data);
    process.exit(1);
  }
  const totalSchemes = allRes.data.schemes.length;
  console.log(`✅ "All Categories" returned all ${totalSchemes} scheme(s) in catalog.\n`);

  // 2–10. Test Individual Category Filters
  console.log('2–10. Testing All 9 Specific Category Filters:');
  for (const cat of categories) {
    const encoded = encodeURIComponent(cat);
    const catRes = await api(`/schemes?status=all&category=${encoded}&limit=100`, { headers: adminHeaders });
    if (catRes.status !== 200 || !catRes.data.schemes) {
      console.error(`❌ Category filter failed for "${cat}":`, catRes.data);
      process.exit(1);
    }
    const schemes = catRes.data.schemes;
    // Verify all returned schemes belong to the requested category
    const nonMatching = schemes.filter(s => s.category?.trim().toLowerCase() !== cat.trim().toLowerCase());
    if (nonMatching.length > 0) {
      console.error(`❌ Category filter mismatch for "${cat}": Found ${nonMatching.length} non-matching schemes!`, nonMatching);
      process.exit(1);
    }
    console.log(`   ✅ [${cat}]: Found ${schemes.length} scheme(s) (All verified to match category).`);
  }

  // 11. Test Category + Search
  console.log('\n11. Testing Category + Search ("Agriculture & Farmers" + search="Fasal"):');
  const catSearchRes = await api(`/schemes?status=all&category=${encodeURIComponent('Agriculture & Farmers')}&search=Fasal`, { headers: adminHeaders });
  if (catSearchRes.status !== 200 || !catSearchRes.data.schemes || catSearchRes.data.schemes.length === 0) {
    console.error('❌ Category + Search failed:', catSearchRes.data);
    process.exit(1);
  }
  console.log(`   ✅ Category + Search returned ${catSearchRes.data.schemes.length} scheme: "${catSearchRes.data.schemes[0].title}"`);

  // 12. Test Category + Status (Active Only vs Inactive Only)
  console.log('\n12. Testing Category + Status ("Education & Scholarships" + status=active):');
  const catActiveRes = await api(`/schemes?status=active&category=${encodeURIComponent('Education & Scholarships')}`, { headers: adminHeaders });
  if (catActiveRes.status !== 200 || !catActiveRes.data.schemes) {
    console.error('❌ Category + Status active failed:', catActiveRes.data);
    process.exit(1);
  }
  console.log(`   ✅ Category + Status Active returned ${catActiveRes.data.schemes.length} active scheme(s).`);

  // 13. Test Category + Search + Status
  console.log('\n13. Testing Category + Search + Status ("Healthcare & Health Insurance" + search="Ayushman" + status=active):');
  const catSearchStatusRes = await api(`/schemes?status=active&category=${encodeURIComponent('Healthcare & Health Insurance')}&search=Ayushman`, { headers: adminHeaders });
  if (catSearchStatusRes.status !== 200 || !catSearchStatusRes.data.schemes || catSearchStatusRes.data.schemes.length === 0) {
    console.error('❌ Category + Search + Status failed:', catSearchStatusRes.data);
    process.exit(1);
  }
  console.log(`   ✅ Category + Search + Status returned "${catSearchStatusRes.data.schemes[0].title}".`);

  // 14. Test Category + Sorting (A-Z)
  console.log('\n14. Testing Category + Sorting ("Financial Inclusion & Business" + sortBy=title + sortOrder=asc):');
  const catSortRes = await api(`/schemes?status=all&category=${encodeURIComponent('Financial Inclusion & Business')}&sortBy=title&sortOrder=asc`, { headers: adminHeaders });
  if (catSortRes.status !== 200 || !catSortRes.data.schemes) {
    console.error('❌ Category + Sorting failed:', catSortRes.data);
    process.exit(1);
  }
  const titles = catSortRes.data.schemes.map(s => s.title);
  const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
  if (JSON.stringify(titles) !== JSON.stringify(sortedTitles)) {
    console.error('❌ Category schemes not sorted alphabetically:', titles, sortedTitles);
    process.exit(1);
  }
  console.log(`   ✅ Category + Sorting verified: ${titles.length} schemes properly ordered.`);

  // 15. Test Category Normalization / Casing Consistency
  console.log('\n15. Testing Casing Normalization ("healthcare & health insurance" in lowercase):');
  const lowerCatRes = await api(`/schemes?status=all&category=${encodeURIComponent('healthcare & health insurance')}`, { headers: adminHeaders });
  if (lowerCatRes.status !== 200 || !lowerCatRes.data.schemes || lowerCatRes.data.schemes.length === 0) {
    console.error('❌ Lowercase category filter failed:', lowerCatRes.data);
    process.exit(1);
  }
  console.log(`   ✅ Lowercase category successfully returned ${lowerCatRes.data.schemes.length} matching scheme(s).`);

  console.log('\n========================================================================');
  console.log('🎉 ALL 16 ADMIN CATEGORY FILTER TEST SCENARIOS PASSED 100%!');
  console.log('========================================================================\n');
}

runCategoryFilterAudit().catch((err) => {
  console.error('Fatal error during category filter audit:', err);
  process.exit(1);
});
