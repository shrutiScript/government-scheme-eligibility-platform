import { evaluateSchemeEligibility } from './controllers/eligibilityController.js';

function testNoIncomeLimitLogic() {
  console.log('--- Starting No Income Limit Verification Test ---');

  // Test Case 1: Scheme with No Income Limit
  const noIncomeScheme = {
    title: 'Universal Financial Inclusion Grant',
    eligibilityCriteria: {
      noIncomeLimit: true,
      maxIncome: null,
      maxAnnualIncome: null,
      noAgeLimit: true,
      gender: 'All'
    }
  };

  const highEarnerProfile = { age: 35, annualIncome: 50000000 };
  const lowEarnerProfile = { age: 35, annualIncome: 50000 };

  const evalHigh = evaluateSchemeEligibility(noIncomeScheme, highEarnerProfile);
  console.log('High Earner (₹5 Crore) on No Income Limit scheme:', evalHigh.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalHigh.qualifyingFactors);

  const evalLow = evaluateSchemeEligibility(noIncomeScheme, lowEarnerProfile);
  console.log('Low Earner (₹50,000) on No Income Limit scheme:', evalLow.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalLow.qualifyingFactors);

  if (!evalHigh.isEligible || !evalLow.isEligible) {
    console.error('FAILED: User should be eligible regardless of income when noIncomeLimit is true.');
    process.exit(1);
  }

  // Test Case 2: Scheme with Income Limit (₹3,00,000)
  const incomeRestrictedScheme = {
    title: 'Low Income Subsidy Scheme',
    eligibilityCriteria: {
      noIncomeLimit: false,
      maxIncome: 300000,
      maxAnnualIncome: 300000,
      noAgeLimit: true,
      gender: 'All'
    }
  };

  const eligibleProfile = { age: 30, annualIncome: 200000 };
  const ineligibleProfile = { age: 30, annualIncome: 500000 };

  const evalEligible = evaluateSchemeEligibility(incomeRestrictedScheme, eligibleProfile);
  console.log('User (₹2 Lakh) on ₹3 Lakh Limit scheme:', evalEligible.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalEligible.qualifyingFactors);

  const evalIneligible = evaluateSchemeEligibility(incomeRestrictedScheme, ineligibleProfile);
  console.log('User (₹5 Lakh) on ₹3 Lakh Limit scheme:', evalIneligible.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', evalIneligible.reasonsNotEligible);

  if (!evalEligible.isEligible || evalIneligible.isEligible) {
    console.error('FAILED: Income ceiling evaluation failed for restricted scheme.');
    process.exit(1);
  }

  console.log('--- ALL NO INCOME LIMIT VERIFICATION TESTS PASSED SUCCESSFULLY ---');
}

testNoIncomeLimitLogic();
