import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from './models/Scheme.js';
import { evaluateSchemeEligibility } from './controllers/eligibilityController.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/government-scheme-eligibility-platform';

async function testNoAgeLimit() {
  console.log('--- Starting No Age Limit Verification Test ---');

  // Test 1: Scheme with No Age Limit
  const noAgeScheme = {
    title: 'Universal Citizen Welfare Scheme Test',
    eligibilityCriteria: {
      noAgeLimit: true,
      minAge: null,
      maxAge: null,
      gender: 'All',
      maxIncome: 1000000
    }
  };

  const youngProfile = { age: 5, annualIncome: 200000 };
  const seniorProfile = { age: 85, annualIncome: 200000 };

  const evalYoung = evaluateSchemeEligibility(noAgeScheme, youngProfile);
  console.log('No Age Limit Scheme (Age 5):', evalYoung.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalYoung.qualifyingFactors);

  const evalSenior = evaluateSchemeEligibility(noAgeScheme, seniorProfile);
  console.log('No Age Limit Scheme (Age 85):', evalSenior.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalSenior.qualifyingFactors);

  if (!evalYoung.isEligible || !evalSenior.isEligible) {
    console.error('FAILED: User should be eligible regardless of age when noAgeLimit is true.');
    process.exit(1);
  }

  // Test 2: Scheme with Age Limit (18-60)
  const ageLimitedScheme = {
    title: 'Youth Employment Skill Scheme Test',
    eligibilityCriteria: {
      noAgeLimit: false,
      minAge: 18,
      maxAge: 60,
      gender: 'All',
      maxIncome: 1000000
    }
  };

  const childProfile = { age: 12, annualIncome: 100000 };
  const adultProfile = { age: 30, annualIncome: 100000 };
  const elderlyProfile = { age: 75, annualIncome: 100000 };

  const evalChild = evaluateSchemeEligibility(ageLimitedScheme, childProfile);
  console.log('Age Limited Scheme (Age 12):', evalChild.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalChild.reasonsNotEligible);

  const evalAdult = evaluateSchemeEligibility(ageLimitedScheme, adultProfile);
  console.log('Age Limited Scheme (Age 30):', evalAdult.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalAdult.qualifyingFactors);

  const evalElderly = evaluateSchemeEligibility(ageLimitedScheme, elderlyProfile);
  console.log('Age Limited Scheme (Age 75):', evalElderly.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalElderly.reasonsNotEligible);

  if (evalChild.isEligible || !evalAdult.isEligible || evalElderly.isEligible) {
    console.error('FAILED: Age limit evaluation failed for restricted scheme.');
    process.exit(1);
  }

  console.log('--- ALL NO AGE LIMIT VERIFICATION TESTS PASSED SUCCESSFULLY ---');
}

testNoAgeLimit().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
