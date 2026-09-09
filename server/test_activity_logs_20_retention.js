import mongoose from 'mongoose';
import ActivityLog from './models/ActivityLog.js';
import { logActivity, pruneActivityLogs } from './utils/activityLogger.js';

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

async function runActivityLogRetentionAudit() {
  console.log('========================================================================');
  console.log('📜 TESTING SYSTEM ACTIVITY LOGS STRICT 20-RECORD RETENTION RULE');
  console.log('========================================================================\n');

  // 1. Admin Authentication
  console.log('1. Authenticating Administrator...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'admin@123' }
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Admin login failed:', loginRes.data);
    process.exit(1);
  }
  const adminHeaders = { Authorization: `Bearer ${loginRes.data.token}` };
  console.log('✅ Admin authenticated. Bearer token acquired.\n');

  // 2. Connect to MongoDB directly to verify database records
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/government_scheme_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // 3. Clear existing logs and insert exactly 20 test records with staggered timestamps
  console.log('2. Populating database with exactly 20 initial activity logs...');
  await ActivityLog.deleteMany({});

  const baseTime = Date.now() - 100000;
  for (let i = 1; i <= 20; i++) {
    await ActivityLog.create({
      action: `Action #${i}`,
      details: `Activity details for test log item number ${i}`,
      user: { name: 'admin', email: 'admin@gmail.com', role: 'admin' },
      createdAt: new Date(baseTime + i * 1000)
    });
  }

  let dbCount = await ActivityLog.countDocuments();
  let apiRes = await api('/admin/logs', { headers: adminHeaders });
  console.log(`   Initial State: DB Count = ${dbCount}, API Count = ${apiRes.data.logs.length}`);
  if (dbCount !== 20 || apiRes.data.logs.length !== 20) {
    console.error('❌ Expected exactly 20 records initially!');
    process.exit(1);
  }
  console.log('✅ Exactly 20 records present in DB and returned by API.\n');

  // 4. Add 21st Record via logActivity
  console.log('3. Adding 21st record (Action #21)...');
  await logActivity({
    action: 'Action #21',
    details: '21st record to test 1 oldest deletion',
    user: { _id: loginRes.data.user._id, name: 'admin', email: 'admin@gmail.com', role: 'admin' }
  });

  dbCount = await ActivityLog.countDocuments();
  apiRes = await api('/admin/logs', { headers: adminHeaders });
  console.log(`   After 21st record: DB Count = ${dbCount}, API Count = ${apiRes.data.logs.length}`);

  if (dbCount !== 20 || apiRes.data.logs.length !== 20) {
    console.error(`❌ Expected DB Count to be strictly 20, but got ${dbCount}`);
    process.exit(1);
  }

  // Verify Action #1 (the oldest record) was deleted and Action #21 is present
  const action1 = await ActivityLog.findOne({ action: 'Action #1' });
  const action21 = await ActivityLog.findOne({ action: 'Action #21' });
  if (action1) {
    console.error('❌ Oldest record (Action #1) was not deleted!');
    process.exit(1);
  }
  if (!action21) {
    console.error('❌ Newest record (Action #21) was not found!');
    process.exit(1);
  }
  console.log('✅ Action #1 (oldest) was permanently deleted from MongoDB.');
  console.log('✅ Action #21 (newest) is present. Total in MongoDB remains exactly 20.\n');

  // 5. Add 22nd Record via logActivity
  console.log('4. Adding 22nd record (Action #22)...');
  await logActivity({
    action: 'Action #22',
    details: '22nd record to test subsequent oldest deletion',
    user: { _id: loginRes.data.user._id, name: 'admin', email: 'admin@gmail.com', role: 'admin' }
  });

  dbCount = await ActivityLog.countDocuments();
  const action2 = await ActivityLog.findOne({ action: 'Action #2' });
  const action22 = await ActivityLog.findOne({ action: 'Action #22' });
  if (dbCount !== 20 || action2 || !action22) {
    console.error('❌ 22nd record retention check failed!', { dbCount, action2Exists: !!action2, action22Exists: !!action22 });
    process.exit(1);
  }
  console.log('✅ Action #2 (next oldest) was permanently deleted from MongoDB.');
  console.log('✅ Action #22 is present. Total in MongoDB remains exactly 20.\n');

  // 6. Add 23rd Record via logActivity
  console.log('5. Adding 23rd record (Action #23)...');
  await logActivity({
    action: 'Action #23',
    details: '23rd record test',
    user: { _id: loginRes.data.user._id, name: 'admin', email: 'admin@gmail.com', role: 'admin' }
  });

  dbCount = await ActivityLog.countDocuments();
  const action3 = await ActivityLog.findOne({ action: 'Action #3' });
  const action23 = await ActivityLog.findOne({ action: 'Action #23' });
  if (dbCount !== 20 || action3 || !action23) {
    console.error('❌ 23rd record retention check failed!', { dbCount, action3Exists: !!action3, action23Exists: !!action23 });
    process.exit(1);
  }
  console.log('✅ Action #3 (next oldest) was permanently deleted from MongoDB.');
  console.log('✅ Action #23 is present. Total in MongoDB remains exactly 20.\n');

  // 7. Verify Admin API endpoint /api/admin/logs
  console.log('6. Verifying /api/admin/logs API response...');
  apiRes = await api('/admin/logs', { headers: adminHeaders });
  if (apiRes.status !== 200 || apiRes.data.logs.length !== 20) {
    console.error('❌ API failed or count != 20:', apiRes.data);
    process.exit(1);
  }
  console.log(`✅ API returned exactly ${apiRes.data.logs.length} records.`);
  console.log(`   Latest log in API: "${apiRes.data.logs[0].action}" (${apiRes.data.logs[0].details})`);
  console.log(`   Oldest log in API: "${apiRes.data.logs[19].action}" (${apiRes.data.logs[19].details})`);

  // 8. Verify Admin Session is intact
  console.log('\n7. Verifying Admin session & token are fully intact...');
  const meRes = await api('/auth/me', { headers: adminHeaders });
  if (meRes.status !== 200 || meRes.data.user.role !== 'admin') {
    console.error('❌ Admin session lost:', meRes.data);
    process.exit(1);
  }
  console.log(`✅ Admin session remains valid: ${meRes.data.user.email} (${meRes.data.user.role}).`);

  console.log('\n========================================================================');
  console.log('🎉 STRICT 20 RECORD ACTIVITY LOG RETENTION VERIFIED 100% SUCCESSFUL!');
  console.log('========================================================================\n');

  await mongoose.disconnect();
}

runActivityLogRetentionAudit().catch((err) => {
  console.error('Fatal error during activity log retention audit:', err);
  process.exit(1);
});
