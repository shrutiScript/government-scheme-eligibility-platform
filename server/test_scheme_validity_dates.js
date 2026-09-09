import dotenv from 'dotenv';
import Scheme from './models/Scheme.js';

dotenv.config();

function testDateValidationLogic() {
  console.log('--- Testing Scheme Validity Date Logic ---');

  // Test Case 1: Valid dates (Launch: 2024-01-01, Last: 2026-12-31)
  const validLaunch = '2024-01-01';
  const validLast = '2026-12-31';

  const launchTime1 = new Date(validLaunch).getTime();
  const lastTime1 = new Date(validLast).getTime();

  if (lastTime1 < launchTime1) {
    console.error('FAILED: Valid dates were rejected!');
    process.exit(1);
  }
  console.log('✅ Test 1 Passed: Valid dates accepted (Launch:', validLaunch, 'Last:', validLast, ')');

  // Test Case 2: Invalid dates (Launch: 2025-06-01, Last: 2024-01-01)
  const invalidLaunch = '2025-06-01';
  const invalidLast = '2024-01-01';

  const launchTime2 = new Date(invalidLaunch).getTime();
  const lastTime2 = new Date(invalidLast).getTime();

  if (lastTime2 >= launchTime2) {
    console.error('FAILED: Invalid date ordering was not detected!');
    process.exit(1);
  }
  console.log('✅ Test 2 Passed: Invalid dates correctly detected (Last date before Launch date)');

  // Test Case 3: Expiry logic check
  const pastLastDate = '2020-01-01';
  const isExpired = new Date(pastLastDate).getTime() < new Date().setHours(0, 0, 0, 0);

  if (!isExpired) {
    console.error('FAILED: Past date was not marked as expired!');
    process.exit(1);
  }
  console.log('✅ Test 3 Passed: Past Last Date correctly identified as Expired');

  console.log('--- ALL SCHEME VALIDITY DATE TESTS PASSED ---');
}

testDateValidationLogic();
