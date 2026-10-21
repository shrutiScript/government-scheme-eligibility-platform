import Scheme from '../models/Scheme.js';

export const initialSchemes = [
  {
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    shortDescription: 'Financial benefit of ₹6,000 per year transferred directly to landholding farmer families across India.',
    description: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme with 100% funding from the Government of India. Under the scheme, financial benefit of ₹6,000/- per year is provided to all landholding farmer families across the country, payable in three equal installments of ₹2,000/- each every four months directly into their Aadhaar-seeded bank accounts. It helps farmers meet financial needs in procuring various inputs to ensure proper crop health and appropriate yields.',
    department: 'Ministry of Agriculture and Farmers Welfare',
    category: 'Agriculture & Farmers',
    state: 'All India',
    beneficiaries: 'Small and marginal farmers holding cultivable land',
    benefitAmount: '₹6,000 / year',
    benefits: [
      'Direct cash transfer of ₹2,000 every 4 months directly to Aadhaar-linked bank accounts.',
      '100% centrally funded scheme with zero broker intervention.',
      'Enables purchase of seeds, fertilizers, equipment, and agricultural inputs.',
      'Automatic integration with Kisan Credit Card (KCC) for low-interest crop loans.'
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 75,
      gender: 'All',
      maxIncome: 300000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['Farmer', 'Agriculture', 'Self Employed'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Aadhaar Card', 'Landholding Records / Khasra-Khatauni', 'Bank Account Details (Aadhaar Seeded)', 'Active Mobile Number'],
    applicationProcess: '1. Visit the official portal pmkisan.gov.in.\n2. Click on "New Farmer Registration" under Farmers Corner.\n3. Enter Aadhaar Number, Select State, and fill in land holding details.\n4. Alternatively, visit your nearest Common Service Centre (CSC) for offline verification.',
    officialWebsiteUrl: 'https://pmkisan.gov.in',
    helpline: '155261 / 1800115526 (Toll Free)',
    launchDate: '2019-02-24',
    tags: ['Farmers', 'Agriculture', 'PM-KISAN', 'Direct Transfer', 'Financial Assistance'],
    status: 'Active',
    viewCount: 1420
  },
  {
    title: 'Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)',
    shortDescription: 'Free health insurance cover up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    description: 'Ayushman Bharat PM-JAY is the world’s largest health insurance scheme fully financed by the government. It offers a health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization across public and empaneled private hospitals in India. It covers over 1,900 medical procedures including surgeries, oncology, cardiology, and ICU care.',
    department: 'Ministry of Health and Family Welfare',
    category: 'Healthcare & Health Insurance',
    state: 'All India',
    beneficiaries: 'Poor and vulnerable families identified via Socio-Economic Caste Census (SECC)',
    benefitAmount: '₹5,00,000 Health Cover',
    benefits: [
      'Cashless and paperless access to healthcare services at empaneled hospitals.',
      'Covers up to ₹5 Lakh per family per year with no cap on family size or age.',
      'Includes pre-hospitalization (up to 3 days) and post-hospitalization (up to 15 days) expenses.',
      'Portability across all empaneled hospitals throughout India.'
    ],
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 120,
      gender: 'All',
      maxIncome: 250000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['All'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: true
    },
    documentsRequired: ['Aadhaar Card', 'Ration Card / SECC Household ID', 'Income Certificate', 'Mobile Number'],
    applicationProcess: '1. Check eligibility on pmjay.gov.in or call 14555.\n2. Visit any empaneled hospital or Ayushman Mitra booth with Aadhaar card and Ration card.\n3. Ayushman Mitra verifies identity and issues instant Ayushman Golden Card.',
    officialWebsiteUrl: 'https://pmjay.gov.in',
    helpline: '14555 / 1800111565 (Toll Free)',
    launchDate: '2018-09-23',
    tags: ['Healthcare', 'Insurance', 'PMJAY', 'Cashless Hospitalization', 'Free Treatment'],
    status: 'Active',
    viewCount: 2310
  },
  {
    title: 'Pradhan Mantri Awas Yojana (PMAY-U / PMAY-G)',
    shortDescription: 'Financial assistance for construction of pucca houses for low income urban and rural homeless families.',
    description: 'Pradhan Mantri Awas Yojana aims to provide housing for all eligible rural and urban families. Eligible beneficiaries get interest subvention and direct financial assistance of up to ₹2.67 Lakh for building or purchasing their first home equipped with basic amenities like toilet, electricity, and LPG connection.',
    department: 'Ministry of Housing and Urban Affairs',
    category: 'Housing & Rural Development',
    state: 'All India',
    beneficiaries: 'EWS, LIG and MIG homeless families or owners of kutcha houses',
    benefitAmount: 'Up to ₹2,67,000 Financial Assistance',
    benefits: [
      'Financial grant of ₹1.2 Lakh to ₹1.3 Lakh for rural house construction.',
      'Interest subsidy of up to 6.5% on home loans for urban beneficiaries under CLSS.',
      'Mandatory co-ownership for female head of the family.',
      'Basic amenities provided in convergence with Swachh Bharat and Ujjwala schemes.'
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 70,
      gender: 'All',
      maxIncome: 600000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['All'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Aadhaar Card', 'Income Certificate', 'Property Documents / Land Records', 'Bank Passbook', 'Affidavit of No Pucca House'],
    applicationProcess: '1. Visit pmaymis.gov.in for urban application or Awaasoft portal for rural.\n2. Submit Citizen Assessment form with income and Aadhaar details.\n3. Geotagging of land site followed by direct fund release in installments.',
    officialWebsiteUrl: 'https://pmaymis.gov.in',
    helpline: '1800-11-6163 / 1800-11-3377',
    launchDate: '2015-06-25',
    tags: ['Housing', 'PMAY', 'Home Loan Subsidy', 'Rural Housing', 'Urban Housing'],
    status: 'Active',
    viewCount: 1890
  },
  {
    title: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    shortDescription: 'Collateral-free business loans up to ₹10 Lakh for micro, small businesses, shopkeepers and startups.',
    description: 'PMMY is a flagship scheme to extend collateral-free loans up to ₹10 Lakh to micro-enterprises and non-corporate small business units under Shishu (up to ₹50,000), Kishor (₹50k to ₹5 Lakh), and Tarun (₹5 Lakh to ₹10 Lakh) categories to foster entrepreneurship.',
    department: 'Ministry of Finance',
    category: 'Financial Inclusion & Business',
    state: 'All India',
    beneficiaries: 'Small business owners, shopkeepers, artisans, street vendors and micro-entrepreneurs',
    benefitAmount: 'Up to ₹10,00,000 Loan',
    benefits: [
      '100% collateral-free loan with affordable interest rates.',
      'Mudra Card provided for working capital cash withdrawal.',
      'No processing fee for Shishu and Kishor loan categories.',
      'Promotes self-employment and job creation in non-farm sector.'
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 65,
      gender: 'All',
      maxIncome: 1000000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['Self Employed', 'Business', 'Artisan', 'Shopkeeper', 'Vendor'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Business Plan Proposal', 'Aadhaar Card & PAN Card', 'Bank Statement (Last 6 Months)', 'Proof of Business Address / GST Registration'],
    applicationProcess: '1. Apply online via UdyamiMitra portal (udyamimitra.in) or visit any commercial/Gramin bank branch.\n2. Submit Mudra application form with business proposal and KYC documents.\n3. Sanctioned funds credited directly to business loan account with Mudra Card.',
    officialWebsiteUrl: 'https://www.mudra.org.in',
    helpline: '1800-180-1111 / 1800-11-0001',
    launchDate: '2015-04-08',
    tags: ['Mudra', 'Business Loan', 'Startup', 'Collateral Free', 'MSME'],
    status: 'Active',
    viewCount: 1650
  },
  {
    title: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    shortDescription: 'Maternity benefit cash incentive of ₹5,000 for pregnant women and lactating mothers for first child.',
    description: 'PMMVY is a Direct Benefit Transfer (DBT) scheme under which financial incentive of ₹5,000 is provided to Pregnant Women and Lactating Mothers (PW&LM) for the first living child, helping improve health seeking behavior and compensating for wage loss during maternity.',
    department: 'Ministry of Women and Child Development',
    category: 'Women & Child Welfare',
    state: 'All India',
    beneficiaries: 'Pregnant women and lactating mothers for first live birth',
    benefitAmount: '₹5,000 Cash Incentive',
    benefits: [
      '₹5,000 direct cash transfer in three installments directly to beneficiary account.',
      'Encourages timely antenatal checkup (ANC) and institutional delivery.',
      'Additional ₹1,000 benefit under Janani Suraksha Yojana (JSY).',
      'Provides nutritional support during pregnancy and lactation.'
    ],
    eligibilityCriteria: {
      minAge: 19,
      maxAge: 45,
      gender: 'Female',
      maxIncome: 500000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['All'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Mother-Child Protection (MCP) Card', 'Aadhaar Card of Mother and Husband', 'Bank Account Passbook (Aadhaar Linked)'],
    applicationProcess: '1. Register at nearest Anganwadi Centre (AWC) or approved health facility within 150 days of LMP.\n2. Fill Form 1A along with copy of MCP Card and Aadhaar.\n3. Installments released automatically upon completion of mandatory health checkups.',
    officialWebsiteUrl: 'https://pmmvy.wcd.gov.in',
    helpline: '011-23382393 / 1800-11-6555',
    launchDate: '2017-01-01',
    tags: ['Maternity', 'Women Welfare', 'PMMVY', 'Direct Benefit Transfer', 'Child Health'],
    status: 'Active',
    viewCount: 980
  },
  {
    title: 'National Social Assistance Programme - Old Age Pension (IGNOAPS)',
    shortDescription: 'Monthly social security pension for senior citizens living below the poverty line.',
    description: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS) under NSAP provides monthly social security pension to senior citizens aged 60 years and above belonging to BPL households, assisting them with basic living expenses and dignity in old age.',
    department: 'Ministry of Rural Development',
    category: 'Social Security & Pensions',
    state: 'All India',
    beneficiaries: 'Elderly citizens aged 60+ belonging to BPL households',
    benefitAmount: '₹1,000 - ₹3,000 / month',
    benefits: [
      'Monthly financial pension credited directly to beneficiary bank/post office account.',
      '₹1,000 to ₹3,000 per month depending on state top-up and age (60-79 yrs vs 80+ yrs).',
      'Life-long pension coverage with no annual renewal required.',
      'Provides social security and financial dignity to elderly citizens.'
    ],
    eligibilityCriteria: {
      minAge: 60,
      maxAge: 120,
      gender: 'All',
      maxIncome: 120000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['All'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: true
    },
    documentsRequired: ['Age Proof / Birth Certificate / Aadhaar Card', 'BPL Card / Ration Card', 'Bank Passbook / Post Office Account', 'Passport Size Photos'],
    applicationProcess: '1. Submit application form to Block Development Officer (BDO) in rural areas or Gram Panchayat / Municipal Corporation in urban areas.\n2. Local verification conducted by Panchayat secretary / Revenue officer.\n3. Sanction letter issued and monthly pension activated.',
    officialWebsiteUrl: 'https://nsap.nic.in',
    helpline: '1800-180-1555 (Toll Free)',
    launchDate: '2007-11-19',
    tags: ['Pension', 'Senior Citizens', 'Old Age', 'NSAP', 'Social Security'],
    status: 'Active',
    viewCount: 1120
  },
  {
    title: 'PM Vishwakarma Scheme',
    shortDescription: 'Comprehensive support including toolkit incentive of ₹15,000 and low-interest loans for traditional artisans.',
    description: 'PM Vishwakarma scheme provides end-to-end holistic support to traditional artisans and craftspeople (carpenters, blacksmiths, goldsmiths, tailors, weavers, etc.) with official PM Vishwakarma Certificate & ID, basic and advanced skill training, ₹15,000 toolkit incentive, and collateral-free credit support up to ₹3 Lakh at 5% interest rate.',
    department: 'Ministry of Micro, Small and Medium Enterprises',
    category: 'Employment & Skill Development',
    state: 'All India',
    beneficiaries: 'Artisans and craftspeople working with hands and tools in 18 traditional trades',
    benefitAmount: '₹15,000 Toolkit + ₹3 Lakh Loan',
    benefits: [
      'Official PM Vishwakarma Certificate and ID Card recognition.',
      '₹15,000 e-voucher / incentive for modern toolkit purchase.',
      'Basic skill training (5-7 days) with ₹500/day stipend.',
      'Collateral-free loan up to ₹3 Lakh at concessional 5% interest rate.'
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 70,
      gender: 'All',
      maxIncome: 400000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['Artisan', 'Self Employed', 'Worker', 'Laborer'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Aadhaar Card', 'Mobile Number linked with Aadhaar', 'Bank Passbook Details', 'Trade Verification Certificate'],
    applicationProcess: '1. Register at nearest Common Service Centre (CSC) with biometric verification.\n2. Three-tier verification: Gram Panchayat / ULB level, District Implementation Committee, and Screening Committee.\n3. Download PM Vishwakarma Digital Certificate and claim toolkit e-voucher.',
    officialWebsiteUrl: 'https://pmvishwakarma.gov.in',
    helpline: '1800-267-7777 / 011-23061574',
    launchDate: '2023-09-17',
    tags: ['Vishwakarma', 'Artisans', 'Skill Training', 'Toolkit Incentive', 'Craftsmanship'],
    status: 'Active',
    viewCount: 1750
  },
  {
    title: 'Post-Matric Scholarship for SC/ST/OBC Students',
    shortDescription: 'Financial scholarship covering tuition fees and maintenance allowance for higher education.',
    description: 'Post-Matric Scholarship is a flagship scheme designed to provide financial support to SC, ST, and OBC students pursuing post-secondary/higher education degrees, professional courses, and diplomas across recognized colleges and universities in India.',
    department: 'Ministry of Social Justice and Empowerment',
    category: 'Education & Scholarships',
    state: 'All India',
    beneficiaries: 'SC, ST, and OBC students pursuing Class 11, 12, ITI, Diploma, Graduation, or Post-Graduation',
    benefitAmount: 'Full Tuition Fee + ₹1,200/month Allowance',
    benefits: [
      '100% reimbursement of non-refundable tuition fees charged by institutions.',
      'Monthly maintenance allowance ranging from ₹550 to ₹1,200/month.',
      'Special disability allowance for differently-abled scholars.',
      'Direct Benefit Transfer (DBT) straight to student bank account.'
    ],
    eligibilityCriteria: {
      minAge: 15,
      maxAge: 35,
      gender: 'All',
      maxIncome: 250000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['Student'],
      allowedEducations: ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate'],
      allowedCastes: ['SC', 'ST', 'OBC'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Caste Certificate issued by competent authority', 'Family Income Certificate', 'Mark Sheets of previous qualifying exam', 'College Fee Receipt & Bonafide Certificate', 'Aadhaar Card & Bank Passbook'],
    applicationProcess: '1. Register on National Scholarship Portal (scholarships.gov.in) or State Scholarship Portal.\n2. Complete One-Time Registration (OTR) with Aadhaar Face/e-KYC.\n3. Fill online form, upload certificates, and submit to institute verification officer.',
    officialWebsiteUrl: 'https://scholarships.gov.in',
    helpline: '0120-6619540 (NSP Helpdesk)',
    launchDate: '2021-03-01',
    tags: ['Scholarship', 'Education', 'SC ST OBC', 'Higher Education', 'Tuition Fee Waiver'],
    status: 'Active',
    viewCount: 1980
  },
  {
    title: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
    shortDescription: 'Micro-credit loan facility of up to ₹50,000 for urban street vendors with 7% interest subsidy.',
    description: 'PM SVANidhi is a special micro-credit facility for street vendors to restart their livelihoods post-pandemic. It provides working capital loans of ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and ₹50,000 (3rd tranche) with prompt repayment incentives and cashback on digital transactions.',
    department: 'Ministry of Housing and Urban Affairs',
    category: 'Financial Inclusion & Business',
    state: 'All India',
    beneficiaries: 'Urban street vendors, hawkers, push-cart operators and traditional sellers',
    benefitAmount: 'Up to ₹50,00,0 Loan',
    benefits: [
      '100% collateral-free micro-working capital loan.',
      '7% per annum interest subsidy on timely repayment.',
      'Digital cashback up to ₹1,200 per year on UPI transactions.',
      'Higher loan eligibility unlocked upon successful repayment of earlier tranches.'
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 65,
      gender: 'All',
      maxIncome: 300000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['Vendor', 'Shopkeeper', 'Self Employed', 'Laborer'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Certificate of Vending (CoV) / Identity Card issued by ULB', 'Aadhaar Card', 'Bank Account Passbook (Aadhaar Seeded)', 'Voter ID Card'],
    applicationProcess: '1. Visit pmsvanidhi.mohua.gov.in or approach nearest Common Service Centre (CSC).\n2. Search CoV status using mobile number or Urban Local Body (ULB) survey ID.\n3. Submit loan application and select preferred lending bank / NBFC.',
    officialWebsiteUrl: 'https://pmsvanidhi.mohua.gov.in',
    helpline: '1800-11-1979 (Toll Free)',
    launchDate: '2020-06-01',
    tags: ['SVANidhi', 'Street Vendors', 'Micro Credit', 'Interest Subsidy', 'Collateral Free'],
    status: 'Active',
    viewCount: 1340
  },
  {
    title: 'Mukhyamantri Ladli Behna Yojana',
    shortDescription: 'Monthly financial assistance of ₹1,250 directly transferred to eligible women in Madhya Pradesh.',
    description: 'Ladli Behna Yojana is a flagship state welfare initiative aimed at promoting health, nutrition, and financial independence for women aged 21-60 years residing in Madhya Pradesh by depositing ₹1,250 per month into their DBT-enabled bank accounts.',
    department: 'Department of Women and Child Development, MP',
    category: 'Women & Child Welfare',
    state: 'Madhya Pradesh',
    beneficiaries: 'Married, widowed, divorced, or abandoned women of MP state aged 21 to 60',
    benefitAmount: '₹1,250 / month',
    benefits: [
      'Direct monthly deposit of ₹1,250 into beneficiary bank account.',
      'Fosters self-reliance and decision-making power among women.',
      'Covers domestic healthcare, nutrition, and children educational needs.',
      'Transparent verification via Samagra ID portal.'
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 60,
      gender: 'Female',
      maxIncome: 250000,
      minIncome: 0,
      allowedStates: ['Madhya Pradesh'],
      allowedOccupations: ['All'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Samagra Family ID & Member ID', 'Aadhaar Card of Applicant', 'Bank Account linked with Aadhaar & e-KYC Active', 'Active Mobile Number'],
    applicationProcess: '1. Fill form at special Gram Panchayat / Ward camp organzed in MP.\n2. Submit Samagra ID and Aadhaar for live biometric e-KYC photo capture.\n3. Track application status online at cmladlibehna.mp.gov.in.',
    officialWebsiteUrl: 'https://cmladlibehna.mp.gov.in',
    helpline: '0755-2700800',
    launchDate: '2023-03-05',
    tags: ['Ladli Behna', 'MP Government', 'Women Assistance', 'Monthly Pension', 'DBT'],
    status: 'Active',
    viewCount: 2890
  },
  {
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    shortDescription: 'Comprehensive crop insurance covering risk against non-preventable natural risks at very low premium.',
    description: 'PMFBY provides comprehensive crop insurance coverage for crops against natural calamities, pests, and diseases. Farmers pay a nominal premium of 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops, with remaining premium subsidized 50:50 by Central and State Governments.',
    department: 'Ministry of Agriculture and Farmers Welfare',
    category: 'Agriculture & Farmers',
    state: 'All India',
    beneficiaries: 'All farmers including sharecroppers and tenant farmers growing notified crops',
    benefitAmount: 'Full Financial Compensation for Crop Loss',
    benefits: [
      'Comprehensive insurance from pre-sowing to post-harvest loss.',
      'Very low farmer premium: 1.5% for Rabi, 2% for Kharif.',
      'Use of satellites, drones, and smartphone apps for rapid claim assessment.',
      'Direct claim settlement credited straight to farmer bank account.'
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 80,
      gender: 'All',
      maxIncome: 1000000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['Farmer', 'Agriculture'],
      allowedEducations: ['All'],
      allowedCastes: ['All'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Land Ownership Proof / Land Sowing Certificate', 'Aadhaar Card', 'Bank Passbook Details', 'Crop Sowing Declaration'],
    applicationProcess: '1. Apply online at pmfby.gov.in or via Crop Insurance App.\n2. Alternatively, apply through loaning bank branch, CSC, or insurance agent before cut-off date.\n3. Report crop loss within 72 hours of occurrence via Crop Insurance App.',
    officialWebsiteUrl: 'https://pmfby.gov.in',
    helpline: '14447 / 1800-200-5142',
    launchDate: '2016-02-18',
    tags: ['Fasal Bima', 'Crop Insurance', 'PMFBY', 'Agriculture Support', 'Claim Settlement'],
    status: 'Active',
    viewCount: 1150
  },
  {
    title: 'Stand-Up India Scheme',
    shortDescription: 'Bank loans between ₹10 Lakh and ₹1 Crore for SC/ST and Women entrepreneurs setting up greenfield enterprises.',
    description: 'Stand-Up India facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up greenfield enterprises in manufacturing, services, trading, or agriculture-allied activities.',
    department: 'Department of Financial Services, Ministry of Finance',
    category: 'Financial Inclusion & Business',
    state: 'All India',
    beneficiaries: 'SC/ST and Women entrepreneurs setting up first-time business ventures',
    benefitAmount: '₹10 Lakh to ₹1 Crore Loan',
    benefits: [
      'Composite loan covering 75% of project cost (Term loan + Working capital).',
      'Concessional interest rate not exceeding Bank Base Rate + 3% + Tenor Premium.',
      'Repayable in 7 years with a maximum moratorium period of 18 months.',
      'Credit Guarantee Scheme for Stand-Up India (CGSSI) coverage.'
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 70,
      gender: 'All',
      maxIncome: 5000000,
      minIncome: 0,
      allowedStates: ['All'],
      allowedOccupations: ['Self Employed', 'Business'],
      allowedEducations: ['12th Pass', 'Graduate', 'Post Graduate'],
      allowedCastes: ['SC', 'ST', 'OBC', 'General'],
      disabilityRequired: false,
      bplRequired: false
    },
    documentsRequired: ['Detailed Business Project Report', 'Identity Proof (Aadhaar Card / PAN Card)', 'Caste Certificate (if applying under SC/ST quota)', 'Business Premises Lease / Ownership Proof', 'Bank Statement (Last 12 Months)'],
    applicationProcess: '1. Register online on Stand-Up Mitra portal (standupmitra.in).\n2. Select Handholding Support (Financial / Technical) or direct loan application.\n3. Application assigned to selected Bank Branch for appraisal and sanction.',
    officialWebsiteUrl: 'https://www.standupmitra.in',
    helpline: '1800-180-1111 / 022-67221555',
    launchDate: '2016-04-05',
    tags: ['Stand Up India', 'Women Entrepreneurs', 'SC ST Loan', 'Business Financing', 'Startup India'],
    status: 'Active',
    viewCount: 1470
  }
];

export const seedSchemesIfEmpty = async () => {
  try {
    const count = await Scheme.countDocuments();
    if (count === 0) {
      console.log('[Seed] Government schemes collection is empty. Seeding initial schemes...');
      await Scheme.insertMany(initialSchemes);
      console.log(`[Seed] Successfully seeded ${initialSchemes.length} rich government schemes!`);
    } else {
      console.log(`[Seed] Database already contains ${count} schemes. Skipping seeding.`);
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed schemes:', error.message);
  }
};

