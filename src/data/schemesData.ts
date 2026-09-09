import { Scheme } from '../types/scheme';

export const REAL_MOSJE_SCHEMES: Scheme[] = [
  // --- NSFDC SCHEMES (Scheduled Castes) ---
  {
    id: 'nsfdc-gls',
    code: 'NSFDC-TL-01',
    name: 'NSFDC General Term Loan Scheme',
    hindiName: 'एनएसएफडीसी सामान्य मियादी ऋण योजना',
    agency: 'NSFDC',
    agencyFullName: 'National Scheduled Castes Finance & Development Corporation',
    targetCommunity: ['SC'],
    tagline: 'Credit assistance up to ₹50 Lakh for viable self-employment and business projects.',
    description: 'Provides concessional term credit to Scheduled Caste entrepreneurs for setting up industrial units, service sector enterprises, or transport operations.',
    hindiDescription: 'अनुसूचित जाति के उद्यमियों को औद्योगिक, सेवा क्षेत्र या परिवहन उपक्रम स्थापित करने हेतु ₹50 लाख तक का रियायती ऋण प्रदान करता है।',
    maxProjectCost: 5000000,
    maxLoanAmount: 4500000, // 90% of project cost
    interestSlabs: [
      { minAmount: 0, maxAmount: 500000, ratePercent: 6.0, description: 'Up to ₹5 Lakh: 6.0% p.a.' },
      { minAmount: 500001, maxAmount: 1000000, ratePercent: 7.0, description: '₹5L to ₹10L: 7.0% p.a.' },
      { minAmount: 1000001, maxAmount: 5000000, ratePercent: 8.0, description: 'Above ₹10L: 8.0% p.a.' }
    ],
    maxTenureYears: 10,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SMALL_BUSINESS', 'TRANSPORT_VEHICLE', 'AGRICULTURE', 'GREEN_BUSINESS'],
    keyBenefits: [
      'Financing up to 90% of project cost',
      'Extended repayment tenure up to 10 years',
      '6-month moratorium period during initial setup'
    ],
    requiredDocuments: [
      'Aadhaar Card / Voter ID',
      'Caste Certificate (SC) issued by Competent Authority (Tehsildar/SDM)',
      'Income Certificate issued by Competent Authority',
      'Detailed Project Report (DPR) / Cost Quotation',
      'Bank Account Passbook (Aadhaar linked)'
    ],
    rules: [
      {
        ruleId: 'RULE-NSFDC-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC'],
        explanation: 'Beneficiary must belong to Scheduled Caste (SC) community.',
        weight: 35
      },
      {
        ruleId: 'RULE-NSFDC-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000.',
        weight: 30
      },
      {
        ruleId: 'RULE-NSFDC-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 5000000,
        explanation: 'Project cost should be within permissible ceiling of ₹50,00,000.',
        weight: 20
      },
      {
        ruleId: 'RULE-NSFDC-AGE',
        field: 'age',
        condition: 'gte',
        expectedValue: 18,
        explanation: 'Applicant must be at least 18 years of age.',
        weight: 15
      }
    ],
    officialPortalUrl: 'https://nsfdc.nic.in'
  },
  {
    id: 'nsfdc-msy',
    code: 'NSFDC-MSY-02',
    name: 'Mahila Samriddhi Yojana (MSY - SC)',
    hindiName: 'महिला समृद्धि योजना (अनुसूचित जाति)',
    agency: 'NSFDC',
    agencyFullName: 'National Scheduled Castes Finance & Development Corporation',
    targetCommunity: ['SC'],
    tagline: 'Exclusive micro-credit up to ₹1.40 Lakh for SC women entrepreneurs at 4-5% concessional interest.',
    description: 'A dedicated micro-finance scheme specifically designed to empower rural and semi-urban Scheduled Caste women for starting petty trades, tailoring, handicrafts, and cottage businesses.',
    hindiDescription: 'ग्रामीण और अर्ध-शहरी अनुसूचित जाति की महिलाओं को सिलाई, हस्तशिल्प और लघु व्यवसाय शुरू करने हेतु ₹1.40 लाख तक का रियायती ऋण (4-5% ब्याज)।',
    maxProjectCost: 150000,
    maxLoanAmount: 140000,
    subsidyPercentage: 25,
    maxSubsidyAmount: 25000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 140000, ratePercent: 4.0, description: 'Flat 4% concessional interest p.a. for SC women' }
    ],
    maxTenureYears: 3,
    moratoriumMonths: 3,
    incomeCeiling: 300000,
    genderRestriction: 'FEMALE_ONLY',
    eligiblePurposes: ['WOMEN_MICROCREDIT', 'SMALL_BUSINESS', 'AGRICULTURE'],
    keyBenefits: [
      'Subsidized low interest rate of 4% per annum',
      'No collateral requirement for micro-credit',
      'Quick processing through State Channelizing Agencies & SHGs'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Caste Certificate (SC)',
      'Income Certificate issued by Competent Authority',
      'Self-Declaration for intended micro-enterprise',
      'Bank Account Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-MSY-GENDER',
        field: 'gender',
        condition: 'equals',
        expectedValue: 'FEMALE',
        explanation: 'Exclusive scheme for female beneficiaries.',
        weight: 35
      },
      {
        ruleId: 'RULE-MSY-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC'],
        explanation: 'Beneficiary must belong to Scheduled Caste (SC).',
        weight: 30
      },
      {
        ruleId: 'RULE-MSY-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000.',
        weight: 20
      },
      {
        ruleId: 'RULE-MSY-AMT',
        field: 'loanAmountRequested',
        condition: 'lte',
        expectedValue: 140000,
        explanation: 'Maximum loan amount limit is ₹1,40,000.',
        weight: 15
      }
    ],
    officialPortalUrl: 'https://nsfdc.nic.in'
  },
  {
    id: 'nsfdc-mky',
    code: 'NSFDC-MKY-03',
    name: 'Mahila Kisan Yojana (MKY)',
    hindiName: 'महिला किसान योजना (एमकेवाई)',
    agency: 'NSFDC',
    agencyFullName: 'National Scheduled Castes Finance & Development Corporation',
    targetCommunity: ['SC'],
    tagline: 'Term loan up to ₹2.00 Lakh for SC women engaged in agriculture, dairy, and allied farm activities.',
    description: 'Promotes livelihood security for SC women farmers by providing term loans for dairy animals, poultry, farm tools, organic manure units, and seed processing.',
    hindiDescription: 'अनुसूचित जाति की महिला किसानों को डेयरी, पशुपालन, कृषि उपकरण और जैविक खाद इकाइयों हेतु ₹2.00 लाख तक का टर्म लोन।',
    maxProjectCost: 250000,
    maxLoanAmount: 200000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 200000, ratePercent: 5.0, description: 'Concessional 5% p.a. interest' }
    ],
    maxTenureYears: 4,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'FEMALE_ONLY',
    eligiblePurposes: ['AGRICULTURE', 'WOMEN_MICROCREDIT'],
    keyBenefits: [
      'Low 5% p.a. interest rate',
      '6-month moratorium tailored for agricultural crop/dairy cycles',
      'Simple documentation through local Agriculture Extension & SCAs'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'SC Caste Certificate',
      'Proof of landholding / lease or Gram Panchayat certificate of farming',
      'Income Certificate issued by Competent Authority',
      'Bank Account Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-MKY-GENDER',
        field: 'gender',
        condition: 'equals',
        expectedValue: 'FEMALE',
        explanation: 'Applicant must be an SC woman farmer.',
        weight: 35
      },
      {
        ruleId: 'RULE-MKY-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC'],
        explanation: 'Applicant must belong to Scheduled Caste (SC).',
        weight: 30
      },
      {
        ruleId: 'RULE-MKY-PURPOSE',
        field: 'purpose',
        condition: 'equals',
        expectedValue: 'AGRICULTURE',
        explanation: 'Purpose must be agriculture, animal husbandry or allied activities.',
        weight: 20
      },
      {
        ruleId: 'RULE-MKY-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must be ≤ ₹3,00,000.',
        weight: 15
      }
    ],
    officialPortalUrl: 'https://nsfdc.nic.in'
  },
  {
    id: 'nsfdc-green',
    code: 'NSFDC-GBS-04',
    name: 'Green Business Scheme',
    hindiName: 'हरित व्यापार योजना (ग्रीन बिजनेस स्कीम)',
    agency: 'NSFDC',
    agencyFullName: 'National Scheduled Castes Finance & Development Corporation',
    targetCommunity: ['SC', 'SAFAI_KARAMCHARI'],
    tagline: 'Credit up to ₹27 Lakh for eco-friendly businesses: e-rickshaws, solar units, and waste recycling.',
    description: 'Supports green livelihood initiatives that combat climate change, including battery-operated electric vehicles (e-rickshaws, e-autos), solar rooftop installation businesses, and vermicomposting units.',
    hindiDescription: 'जलवायु अनुकूल उद्यमों जैसे ई-रिक्शा, सौर ऊर्जा प्रतिष्ठान और कचरा पुनर्चक्रण इकाइयों हेतु ₹27 लाख तक का ऋण।',
    maxProjectCost: 3000000,
    maxLoanAmount: 2700000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 500000, ratePercent: 6.0, description: 'Up to ₹5L: 6.0% p.a.' },
      { minAmount: 500001, maxAmount: 2700000, ratePercent: 7.0, description: '₹5L to ₹27L: 7.0% p.a.' }
    ],
    maxTenureYears: 8,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['GREEN_BUSINESS', 'TRANSPORT_VEHICLE', 'SMALL_BUSINESS'],
    keyBenefits: [
      'Up to 90% loan assistance for eco-friendly green assets',
      'Subsidy support under relevant national clean energy missions',
      'Open to both SC beneficiaries and Safai Karamchari dependents'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Category Proof (SC or Safai Karamchari Certificate)',
      'Income Certificate issued by Competent Authority',
      'Authorized dealer quotation for EV / Solar / Equipment',
      'Valid Commercial Driving License (if applying for e-rickshaw/e-vehicle)'
    ],
    rules: [
      {
        ruleId: 'RULE-GBS-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC', 'SAFAI_KARAMCHARI'],
        explanation: 'Beneficiary must be from SC or Safai Karamchari community.',
        weight: 35
      },
      {
        ruleId: 'RULE-GBS-PURPOSE',
        field: 'purpose',
        condition: 'in',
        expectedValue: ['GREEN_BUSINESS', 'TRANSPORT_VEHICLE'],
        explanation: 'Project must involve green/clean tech, electric mobility, or eco-enterprises.',
        weight: 25
      },
      {
        ruleId: 'RULE-GBS-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000.',
        weight: 25
      },
      {
        ruleId: 'RULE-GBS-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 3000000,
        explanation: 'Project cost limit is ₹30,00,000.',
        weight: 15
      }
    ],
    officialPortalUrl: 'https://nsfdc.nic.in'
  },
  {
    id: 'nsfdc-udyam',
    code: 'NSFDC-UNY-05',
    name: 'Udyam Nidhi Yojana',
    hindiName: 'उद्यम निधि योजना',
    agency: 'NSFDC',
    agencyFullName: 'National Scheduled Castes Finance & Development Corporation',
    targetCommunity: ['SC'],
    tagline: 'Micro-enterprise financing up to ₹5 Lakh for quick-start urban and rural ventures.',
    description: 'A hassle-free credit facility for SC youths and first-generation entrepreneurs to launch retail shops, repair workshops, mobile kiosks, or digital service centers.',
    hindiDescription: 'अनुसूचित जाति के युवाओं हेतु रिटेल शॉप, रिपेयर वर्कशॉप या डिजिटल सेवा केंद्र शुरू करने हेतु ₹5 लाख तक की त्वरित ऋण सुविधा।',
    maxProjectCost: 550000,
    maxLoanAmount: 500000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 500000, ratePercent: 6.0, description: 'Flat 6.0% p.a.' }
    ],
    maxTenureYears: 5,
    moratoriumMonths: 4,
    incomeCeiling: 300000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SMALL_BUSINESS', 'TRANSPORT_VEHICLE', 'SKILL_TRAINING'],
    keyBenefits: [
      'Simplified one-page loan appraisal',
      'Affordable 6% flat interest slab',
      'Prompt sanction within 14 working days via partner SCAs'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'SC Certificate',
      'Income Certificate issued by Competent Authority',
      'Rent Agreement / Proof of business premises',
      'Quotation for equipment / stock'
    ],
    rules: [
      {
        ruleId: 'RULE-UNY-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC'],
        explanation: 'Open to Scheduled Caste (SC) applicants.',
        weight: 40
      },
      {
        ruleId: 'RULE-UNY-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000.',
        weight: 30
      },
      {
        ruleId: 'RULE-UNY-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 550000,
        explanation: 'Project cost must be within ₹5,50,000.',
        weight: 30
      }
    ],
    officialPortalUrl: 'https://nsfdc.nic.in'
  },
  {
    id: 'nsfdc-skill',
    code: 'NSFDC-SDTP-06',
    name: 'Skill Development Training Programme (SDTP)',
    hindiName: 'कौशल विकास प्रशिक्षण कार्यक्रम',
    agency: 'NSFDC',
    agencyFullName: 'National Scheduled Castes Finance & Development Corporation',
    targetCommunity: ['SC'],
    tagline: '100% Free NSQF-aligned certified skill training with monthly stipend of ₹1,500; no income ceiling.',
    description: 'Non-credit skill enhancement programme offering placement-linked vocational training in IT-ITeS, Apparel, Automotive, Healthcare, and Solar PV Installation.',
    hindiDescription: 'पूर्णतः निःशुल्क प्रमाणन प्रशिक्षण, प्रतिमाह ₹1,500 वजीफा, कोई आय सीमा नहीं। रोजगार एवं स्व-रोजगार उन्मुख।',
    maxProjectCost: 50000,
    maxLoanAmount: 0, // Non-credit / fully sponsored grant
    interestSlabs: [
      { minAmount: 0, maxAmount: 0, ratePercent: 0, description: '100% Free Grant & Training (Zero interest)' }
    ],
    maxTenureYears: 1,
    moratoriumMonths: 0,
    incomeCeiling: 10000000, // No income cap
    genderRestriction: 'ALL',
    eligiblePurposes: ['SKILL_TRAINING', 'EDUCATION'],
    keyBenefits: [
      'Zero cost — 100% course fee sponsored by MoSJE / NSFDC',
      'Monthly stipend of ₹1,500 directly into beneficiary account',
      'NSQF recognized certification and guaranteed placement assistance'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'SC Certificate',
      'Educational Qualification Marksheet (10th/12th/ITI)',
      'Bank Account Passbook for stipend'
    ],
    rules: [
      {
        ruleId: 'RULE-SDTP-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC'],
        explanation: 'Applicant must belong to Scheduled Caste (SC).',
        weight: 45
      },
      {
        ruleId: 'RULE-SDTP-PURPOSE',
        field: 'purpose',
        condition: 'in',
        expectedValue: ['SKILL_TRAINING', 'EDUCATION'],
        explanation: 'Applicant seeking vocational training and certification.',
        weight: 35
      },
      {
        ruleId: 'RULE-SDTP-AGE',
        field: 'age',
        condition: 'in',
        expectedValue: [18, 45],
        explanation: 'Age must be between 18 and 45 years.',
        weight: 20
      }
    ],
    officialPortalUrl: 'https://nsfdc.nic.in'
  },

  // --- NBCFDC SCHEMES (Other Backward Classes) ---
  {
    id: 'nbcfdc-gls',
    code: 'NBCFDC-GLS-01',
    name: 'NBCFDC General Loan Scheme (GLS)',
    hindiName: 'एनबीसीएफडीसी सामान्य ऋण योजना (जीएलएस)',
    agency: 'NBCFDC',
    agencyFullName: 'National Backward Classes Finance & Development Corporation',
    targetCommunity: ['OBC'],
    tagline: 'Term loan up to ₹15 Lakh with tiered slab interest (6% / 7% / 8%) and 8-year repayment.',
    description: 'Provides credit assistance to backward class individuals to engage in viable business ventures, agriculture modernizations, small manufacturing, or retail trade.',
    hindiDescription: 'अन्य पिछड़ा वर्ग (OBC) के व्यक्तियों को व्यवसाय, कृषि आधुनिकीकरण या विनिर्माण हेतु 6% से 8% ब्याज दर पर ₹15 लाख तक का ऋण।',
    maxProjectCost: 1600000,
    maxLoanAmount: 1500000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 500000, ratePercent: 6.0, description: 'Up to ₹5 Lakh: 6.0% p.a.' },
      { minAmount: 500001, maxAmount: 1000000, ratePercent: 7.0, description: '₹5L to ₹10L: 7.0% p.a.' },
      { minAmount: 1000001, maxAmount: 1500000, ratePercent: 8.0, description: '₹10L to ₹15L: 8.0% p.a.' }
    ],
    maxTenureYears: 8,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SMALL_BUSINESS', 'AGRICULTURE', 'TRANSPORT_VEHICLE', 'GREEN_BUSINESS'],
    keyBenefits: [
      'Low tiered interest rates directly linked to loan size',
      '8-year repayment tenure with 6-month moratorium',
      'Loan covers up to 85% of total project cost'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'OBC Certificate (Non-Creamy Layer) issued by Revenue Authority',
      'Income Certificate issued by Competent Authority',
      'Project Profile / Estimation Quotation',
      'Bank Account Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-NBCFDC-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['OBC'],
        explanation: 'Beneficiary must belong to Other Backward Classes (OBC).',
        weight: 35
      },
      {
        ruleId: 'RULE-NBCFDC-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000 (Non-creamy layer).',
        weight: 30
      },
      {
        ruleId: 'RULE-NBCFDC-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 1600000,
        explanation: 'Project cost should be within ₹16,00,000.',
        weight: 20
      },
      {
        ruleId: 'RULE-NBCFDC-AGE',
        field: 'age',
        condition: 'gte',
        expectedValue: 18,
        explanation: 'Applicant must be at least 18 years old.',
        weight: 15
      }
    ],
    officialPortalUrl: 'https://nbcfdc.gov.in'
  },
  {
    id: 'nbcfdc-swarnima',
    code: 'NBCFDC-NSS-02',
    name: 'New Swarnima Scheme for OBC Women',
    hindiName: 'नई स्वर्णिमा योजना (ओबीसी महिलाएं)',
    agency: 'NBCFDC',
    agencyFullName: 'National Backward Classes Finance & Development Corporation',
    targetCommunity: ['OBC'],
    tagline: 'Concessional term loan up to ₹2.00 Lakh at 5% interest exclusively for OBC women.',
    description: 'Aims to inculcate the spirit of self-reliance among women belonging to backward classes by financing micro-enterprises like beauty parlours, garment boutiques, bakeries, or kirana stores.',
    hindiDescription: 'पिछड़ा वर्ग की महिलाओं के स्वावलंबन हेतु 5% रियायती ब्याज दर पर ₹2.00 लाख तक का टर्म लोन।',
    maxProjectCost: 220000,
    maxLoanAmount: 200000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 200000, ratePercent: 5.0, description: 'Concessional 5% p.a. for women' }
    ],
    maxTenureYears: 8,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'FEMALE_ONLY',
    eligiblePurposes: ['WOMEN_MICROCREDIT', 'SMALL_BUSINESS', 'AGRICULTURE'],
    keyBenefits: [
      'Beneficiary does not require personal financial contribution',
      'Highly subsidized 5% per annum interest rate',
      'Flexible 8-year repayment schedule with 6-month moratorium'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'OBC Certificate (Non-Creamy Layer)',
      'Income Certificate issued by Competent Authority',
      'Activity Plan / Equipment quotation',
      'Bank Account Details'
    ],
    rules: [
      {
        ruleId: 'RULE-SWARNIMA-GENDER',
        field: 'gender',
        condition: 'equals',
        expectedValue: 'FEMALE',
        explanation: 'Exclusive scheme for female OBC applicants.',
        weight: 35
      },
      {
        ruleId: 'RULE-SWARNIMA-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['OBC'],
        explanation: 'Beneficiary must belong to Other Backward Classes (OBC).',
        weight: 30
      },
      {
        ruleId: 'RULE-SWARNIMA-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000.',
        weight: 20
      },
      {
        ruleId: 'RULE-SWARNIMA-AMT',
        field: 'loanAmountRequested',
        condition: 'lte',
        expectedValue: 200000,
        explanation: 'Maximum loan amount limit is ₹2,00,000.',
        weight: 15
      }
    ],
    officialPortalUrl: 'https://nbcfdc.gov.in'
  },
  {
    id: 'nbcfdc-msy',
    code: 'NBCFDC-MSY-03',
    name: 'Mahila Samriddhi Yojana (NBCFDC)',
    hindiName: 'महिला समृद्धि योजना (एनबीसीएफडीसी)',
    agency: 'NBCFDC',
    agencyFullName: 'National Backward Classes Finance & Development Corporation',
    targetCommunity: ['OBC'],
    tagline: 'Micro-finance up to ₹1.25 Lakh per beneficiary via SHGs/SCAs at ultra-low 4% interest.',
    description: 'Supports Self-Help Groups (SHGs) and individual women belonging to backward classes for tiny income-generating activities in rural and peri-urban hubs.',
    hindiDescription: 'स्वयं सहायता समूहों और व्यक्तिगत ओबीसी महिलाओं हेतु 4% ब्याज दर पर ₹1.25 लाख तक का सूक्ष्म वित्त।',
    maxProjectCost: 140000,
    maxLoanAmount: 125000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 125000, ratePercent: 4.0, description: 'Ultra-low 4.0% p.a. through SHGs/SCAs' }
    ],
    maxTenureYears: 4,
    moratoriumMonths: 3,
    incomeCeiling: 300000,
    genderRestriction: 'FEMALE_ONLY',
    eligiblePurposes: ['WOMEN_MICROCREDIT', 'SMALL_BUSINESS'],
    keyBenefits: [
      'Ultra-concessional 4% interest rate',
      'Delivered through trusted SHGs and district channel partners',
      'No processing fees or complex mortgages'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'OBC Certificate',
      'Income Certificate issued by Competent Authority',
      'SHG Membership proof / Individual application',
      'Bank Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-NBCFDC-MSY-GENDER',
        field: 'gender',
        condition: 'equals',
        expectedValue: 'FEMALE',
        explanation: 'Must be a female applicant from OBC community.',
        weight: 35
      },
      {
        ruleId: 'RULE-NBCFDC-MSY-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['OBC'],
        explanation: 'Category must be Other Backward Classes (OBC).',
        weight: 30
      },
      {
        ruleId: 'RULE-NBCFDC-MSY-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Family income must not exceed ₹3,00,000.',
        weight: 20
      },
      {
        ruleId: 'RULE-NBCFDC-MSY-AMT',
        field: 'loanAmountRequested',
        condition: 'lte',
        expectedValue: 125000,
        explanation: 'Loan amount requested cannot exceed ₹1,25,000.',
        weight: 15
      }
    ],
    officialPortalUrl: 'https://nbcfdc.gov.in'
  },

  // --- NSKFDC SCHEMES (Safai Karamcharis & Dependents) ---
  {
    id: 'nskfdc-term',
    code: 'NSKFDC-TL-01',
    name: 'NSKFDC General Term Loan & Livelihood Rehabilitation',
    hindiName: 'सफाई कर्मचारी पुनर्वास एवं मियादी ऋण योजना',
    agency: 'NSKFDC',
    agencyFullName: 'National Safai Karamcharis Finance & Development Corporation',
    targetCommunity: ['SAFAI_KARAMCHARI'],
    tagline: 'Credit assistance up to ₹15 Lakh at 4% to 6% interest for dignified alternate livelihoods.',
    description: 'Designed specifically for the socioeconomic rehabilitation of manual scavengers, safai karamcharis, and their identified dependents into dignified alternate vocations like transport, trading, and services.',
    hindiDescription: 'सफाई कर्मचारियों और उनके आश्रितों को गरिमापूर्ण वैकल्पिक आजीविका (वाहन, व्यापार, सेवा) हेतु 4-6% ब्याज पर ₹15 लाख तक का ऋण।',
    maxProjectCost: 1500000,
    maxLoanAmount: 1350000, // 90%
    interestSlabs: [
      { minAmount: 0, maxAmount: 200000, ratePercent: 4.0, description: 'Up to ₹2L: 4.0% p.a.' },
      { minAmount: 200001, maxAmount: 500000, ratePercent: 5.0, description: '₹2L to ₹5L: 5.0% p.a.' },
      { minAmount: 500001, maxAmount: 1500000, ratePercent: 6.0, description: '₹5L to ₹15L: 6.0% p.a.' }
    ],
    maxTenureYears: 10,
    moratoriumMonths: 6,
    incomeCeiling: 350000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SANITATION_REHAB', 'SMALL_BUSINESS', 'TRANSPORT_VEHICLE', 'GREEN_BUSINESS'],
    keyBenefits: [
      'Concessional interest starting at 4% p.a.',
      '10-year generous repayment schedule with 6-month moratorium',
      'Capital subsidy support from ministry for identified manual scavengers'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Safai Karamchari / Manual Scavenger Identification Certificate (or Dependent Proof)',
      'Income Certificate / Self-Declaration',
      'Project Cost Quotation',
      'Bank Account Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-NSKFDC-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SAFAI_KARAMCHARI'],
        explanation: 'Beneficiary must be a Safai Karamchari, manual scavenger, or certified dependent.',
        weight: 45
      },
      {
        ruleId: 'RULE-NSKFDC-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 1500000,
        explanation: 'Project cost must be within ₹15,00,000.',
        weight: 30
      },
      {
        ruleId: 'RULE-NSKFDC-AGE',
        field: 'age',
        condition: 'gte',
        expectedValue: 18,
        explanation: 'Applicant must be at least 18 years old.',
        weight: 25
      }
    ],
    officialPortalUrl: 'https://nskfdc.nic.in'
  },
  {
    id: 'nskfdc-sanrakshan',
    code: 'NSKFDC-SSY-02',
    name: 'Sanrakshan Yojana (Sanitation Modernization & Safety)',
    hindiName: 'संरक्षण योजना (स्वच्छता आधुनिकीकरण एवं यंत्रीकरण)',
    agency: 'NSKFDC',
    agencyFullName: 'National Safai Karamcharis Finance & Development Corporation',
    targetCommunity: ['SAFAI_KARAMCHARI', 'SC'],
    tagline: 'Financing up to ₹50 Lakh with capital subsidy up to ₹3.75 Lakh for mechanized cleaning equipment.',
    description: 'Promotes zero hazardous manual cleaning by empowering sanitation workers to purchase mechanized sewer-cleaning trucks, suction machines, and safety robotics as independent enterprise contractors.',
    hindiDescription: 'सीवर और सेप्टिक टैंक की खतरनाक सफाई खत्म करने हेतु सक्शन मशीनों व सफाई वाहनों के लिए ₹50 लाख तक का ऋण व ₹3.75 लाख तक अनुदान।',
    maxProjectCost: 5000000,
    maxLoanAmount: 4500000,
    subsidyPercentage: 25,
    maxSubsidyAmount: 375000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 5000000, ratePercent: 5.0, description: 'Flat 5.0% subsidized interest for sanitation mechanization' }
    ],
    maxTenureYears: 7,
    moratoriumMonths: 6,
    incomeCeiling: 400000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SANITATION_REHAB', 'TRANSPORT_VEHICLE', 'SMALL_BUSINESS'],
    keyBenefits: [
      'Substantial capital subsidy up to ₹3,75,000 from MoSJE',
      'Transforms sanitation workers into municipal equipment contractors',
      'Comprehensive safety gear and mechanization training included'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Safai Karamchari ID card / Municipal certificate or SC Certificate',
      'Quotation for mechanized sewer cleaning / suction machine vehicle',
      'Valid Commercial Driver/Equipment Operator License',
      'Bank Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-SANRAKSHAN-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SAFAI_KARAMCHARI', 'SC'],
        explanation: 'Targeted at sanitation workers, manual scavengers, and SC entrepreneurs.',
        weight: 40
      },
      {
        ruleId: 'RULE-SANRAKSHAN-PURPOSE',
        field: 'purpose',
        condition: 'in',
        expectedValue: ['SANITATION_REHAB', 'TRANSPORT_VEHICLE'],
        explanation: 'Purpose must be sanitation mechanization or specialized utility transport.',
        weight: 30
      },
      {
        ruleId: 'RULE-SANRAKSHAN-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 5000000,
        explanation: 'Project cost ceiling is ₹50,00,000.',
        weight: 30
      }
    ],
    officialPortalUrl: 'https://nskfdc.nic.in'
  }
,
  // --- ADDITIONAL OFFICIALLY VERIFIED MYSCHEME.GOV.IN SCHEMES (SIH26092 AUDIT) ---
  {
    id: 'vcf-sc',
    code: 'MoSJE-VCF-01',
    name: 'Venture Capital Fund for Scheduled Castes (VCF-SC)',
    hindiName: 'अनुसूचित जातियों के लिए वेंचर कैपिटल फंड',
    agency: 'NSFDC',
    agencyFullName: 'Ministry of Social Justice & Empowerment / NSFDC',
    targetCommunity: ['SC'],
    tagline: 'Concessional equity and debt funding from ₹10 Lakh to ₹15 Crore for SC-led innovative enterprises.',
    description: 'A dedicated fund under the Ministry of Social Justice and Empowerment to promote entrepreneurship among Scheduled Castes by providing concessional finance (equity or debt up to ₹15 Crore) to viable commercial enterprises.',
    hindiDescription: 'अनुसूचित जाति के उद्यमियों को व्यावसायिक उद्यमों की स्थापना और विस्तार हेतु ₹10 लाख से ₹15 करोड़ तक की रियायती इक्विटी और ऋण सहायता प्रदान करता है।',
    maxProjectCost: 150000000,
    maxLoanAmount: 150000000,
    interestSlabs: [
      { minAmount: 1000000, maxAmount: 150000000, ratePercent: 4.0, description: '4.0% p.a. for SC women/differently abled, 8.0% p.a. for general SC entrepreneurs' }
    ],
    maxTenureYears: 8,
    moratoriumMonths: 12,
    incomeCeiling: 1200000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SMALL_BUSINESS', 'GREEN_BUSINESS', 'TRANSPORT_VEHICLE'],
    keyBenefits: [
      'Substantial growth capital ranging from ₹10 Lakh to ₹15 Crore',
      'Flexible blend of equity investment and concessional long-term debt',
      'Mentorship and governance support via IFCI Venture Capital'
    ],
    requiredDocuments: [
      'Certificate of Incorporation (Pvt Ltd / One Person Company)',
      'SC Community Certificate of Promoters (>51% SC equity)',
      'Detailed Project Report (DPR) with financial feasibility model',
      'Audited Financial Statements or Net Worth Certificate',
      'PAN & GST Registration'
    ],
    rules: [
      {
        ruleId: 'RULE-VCF-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC'],
        explanation: 'Promoter/beneficiary must belong to Scheduled Caste (SC) community.',
        weight: 40
      },
      {
        ruleId: 'RULE-VCF-PURPOSE',
        field: 'purpose',
        condition: 'in',
        expectedValue: ['SMALL_BUSINESS', 'GREEN_BUSINESS', 'TRANSPORT_VEHICLE'],
        explanation: 'Venture must be a commercial enterprise, industrial unit, or green project.',
        weight: 30
      },
      {
        ruleId: 'RULE-VCF-COST',
        field: 'projectCost',
        condition: 'gte',
        expectedValue: 1000000,
        explanation: 'Minimum project cost threshold for venture funding is ₹10,00,000.',
        weight: 30
      }
    ],
    officialPortalUrl: 'https://vcfsc.in'
  },
  {
    id: 'mosje-visvas',
    code: 'MoSJE-VISVAS-01',
    name: 'VISVAS Yojana (Direct 5% Interest Subvention for OBC & SC)',
    hindiName: 'विश्वास योजना (वंचित इकाई समूह और वर्गों की आर्थिक सहायता)',
    agency: 'NBCFDC',
    agencyFullName: 'National Backward Classes Finance & Development Corporation',
    targetCommunity: ['OBC', 'SC', 'SAFAI_KARAMCHARI'],
    tagline: 'Direct 5% interest subvention on bank/SCA loans up to ₹4.0 Lakh for micro-entrepreneurs and SHGs.',
    description: 'Vanchit Ikai Samooh aur Vargon ki Aarthik Sahayata Yojana (VISVAS) provides a direct 5% per annum interest subvention to OBC, SC, and Safai Karamchari entrepreneurs on standard bank loans.',
    hindiDescription: 'ओबीसी, एससी और सफाई कर्मचारियों को बैंक/निगम ऋण पर सीधे 5% वार्षिक ब्याज छूट प्रदान कर उनकी किस्तों को अत्यधिक किफायती बनाता है।',
    maxProjectCost: 400000,
    maxLoanAmount: 400000,
    subsidyPercentage: 5,
    interestSlabs: [
      { minAmount: 0, maxAmount: 400000, ratePercent: 3.5, description: 'Net effective interest 3.5% p.a. after 5% direct MoSJE interest subvention' }
    ],
    maxTenureYears: 5,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SMALL_BUSINESS', 'AGRICULTURE', 'WOMEN_MICROCREDIT'],
    keyBenefits: [
      'Direct 5% interest relief credited directly into beneficiary bank account',
      'Applicable on standard micro-loans up to ₹4 Lakh per individual',
      'Reduces EMI burden significantly for marginalized micro-enterprises'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'OBC / SC / Safai Karamchari Proof Certificate',
      'Sanction Letter of loan from Bank / State Channelizing Agency',
      'Income Certificate issued by Competent Authority',
      'Standard Bank Account Details'
    ],
    rules: [
      {
        ruleId: 'RULE-VISVAS-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['OBC', 'SC', 'SAFAI_KARAMCHARI'],
        explanation: 'Beneficiary must belong to OBC, SC, or Safai Karamchari category.',
        weight: 35
      },
      {
        ruleId: 'RULE-VISVAS-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000.',
        weight: 35
      },
      {
        ruleId: 'RULE-VISVAS-AMT',
        field: 'loanAmountRequested',
        condition: 'lte',
        expectedValue: 400000,
        explanation: 'Maximum eligible loan amount under VISVAS subvention is ₹4,00,000.',
        weight: 30
      }
    ],
    officialPortalUrl: 'https://visvas.dosje.gov.in'
  },
  {
    id: 'nskfdc-srms',
    code: 'MoSJE-SRMS-01',
    name: 'SRMS (Self Employment Scheme for Rehabilitation of Manual Scavengers)',
    hindiName: 'हाथ से मैला उठाने वालों के पुनर्वास हेतु स्वरोजगार योजना',
    agency: 'NSKFDC',
    agencyFullName: 'National Safai Karamcharis Finance & Development Corporation',
    targetCommunity: ['SAFAI_KARAMCHARI'],
    tagline: 'Comprehensive rehabilitation: ₹40,000 one-time grant, capital subsidy up to ₹3.25 Lakh, and concessional loans.',
    description: 'Statutory rehabilitation program providing immediate ₹40,000 one-time cash assistance, up to ₹3,25,000 capital subsidy, and concessional credit up to ₹15 Lakh for sanitation workers to transition into dignified alternative trades.',
    hindiDescription: 'सफाई कर्मचारियों और मैला ढोने के काम से मुक्त श्रमिकों को ₹40,000 एकमुश्त सहायता, ₹3.25 लाख तक पूंजीगत अनुदान और ₹15 लाख तक रियायती स्वरोजगार ऋण प्रदान करता है।',
    maxProjectCost: 1500000,
    maxLoanAmount: 1500000,
    subsidyPercentage: 50,
    maxSubsidyAmount: 325000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 1500000, ratePercent: 5.0, description: 'Flat 5.0% concessional interest p.a. with full subsidy deduction' }
    ],
    maxTenureYears: 5,
    moratoriumMonths: 6,
    incomeCeiling: 350000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SANITATION_REHAB', 'SMALL_BUSINESS', 'TRANSPORT_VEHICLE'],
    keyBenefits: [
      '₹40,000 immediate one-time cash assistance (OTCA) upon identification',
      'Maximum capital subsidy up to ₹3,25,000 upfront',
      'Concessional interest rate of 5% with 6 months grace moratorium'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Manual Scavenger / Sanitation Identification Certificate issued by Local Body',
      'Bank Account Passbook (DBT-enabled)',
      'Proposal for alternate trade/venture quotation'
    ],
    rules: [
      {
        ruleId: 'RULE-SRMS-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SAFAI_KARAMCHARI'],
        explanation: 'Applicant must be an identified sanitation worker or certified dependent.',
        weight: 50
      },
      {
        ruleId: 'RULE-SRMS-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 1500000,
        explanation: 'Maximum project ceiling under SRMS is ₹15,00,000.',
        weight: 30
      },
      {
        ruleId: 'RULE-SRMS-AGE',
        field: 'age',
        condition: 'gte',
        expectedValue: 18,
        explanation: 'Applicant must be at least 18 years old.',
        weight: 20
      }
    ],
    officialPortalUrl: 'https://nskfdc.nic.in'
  },
  {
    id: 'nskfdc-suy',
    code: 'NSKFDC-SUY-03',
    name: 'Swachhta Udyami Yojana (SUY - Mechanized Sanitation Enterprise)',
    hindiName: 'स्वच्छता उद्यमी योजना (स्वच्छता से संपन्नता की ओर)',
    agency: 'NSKFDC',
    agencyFullName: 'National Safai Karamcharis Finance & Development Corporation',
    targetCommunity: ['SAFAI_KARAMCHARI', 'SC'],
    tagline: 'Finance up to ₹50 Lakh with capital subsidy for mechanized sewer cleaning equipment and sanitation vehicles.',
    description: 'Promotes modern mechanized cleaning and eradicates manual scavenging by helping Safai Karamcharis procure vacuum suction loaders, jetting units, and municipal utility vehicles.',
    hindiDescription: 'सीवर और सेप्टिक टैंक की मशीनीकृत सफाई हेतु सक्शन व जेटिंग वाहनों की खरीद के लिए ₹50 लाख तक का ऋण और ₹3.75 लाख तक का सरकारी अनुदान।',
    maxProjectCost: 5000000,
    maxLoanAmount: 4500000,
    subsidyPercentage: 25,
    maxSubsidyAmount: 375000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 5000000, ratePercent: 4.0, description: 'Concessional 4.0% p.a. for women, 5.0% for male beneficiaries' }
    ],
    maxTenureYears: 7,
    moratoriumMonths: 6,
    incomeCeiling: 400000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SANITATION_REHAB', 'TRANSPORT_VEHICLE', 'SMALL_BUSINESS'],
    keyBenefits: [
      'Up to ₹3.75 Lakh capital subsidy from Ministry of Social Justice',
      'Enables sanitation workers to become municipal mechanized service contractors',
      'Transforms hazard into high-income mechanization business'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Safai Karamchari ID or Municipal Certificate',
      'Vehicle & equipment quotation (Suction unit / desilting truck)',
      'Commercial Driving License (for vehicle operations)',
      'Bank Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-SUY-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SAFAI_KARAMCHARI', 'SC'],
        explanation: 'Must belong to Safai Karamchari or SC sanitation workforce community.',
        weight: 40
      },
      {
        ruleId: 'RULE-SUY-PURPOSE',
        field: 'purpose',
        condition: 'in',
        expectedValue: ['SANITATION_REHAB', 'TRANSPORT_VEHICLE'],
        explanation: 'Purpose must be modern sanitation mechanization or utility transport.',
        weight: 35
      },
      {
        ruleId: 'RULE-SUY-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 5000000,
        explanation: 'Project cost ceiling is ₹50,00,000.',
        weight: 25
      }
    ],
    officialPortalUrl: 'https://nskfdc.nic.in'
  },
  {
    id: 'nsfdc-asiim',
    code: 'MoSJE-ASIIM-01',
    name: 'Ambedkar Social Innovation and Incubation Mission (ASIIM)',
    hindiName: 'अम्बेडकर सोशल इनोवेशन एंड इनक्यूबेशन मिशन',
    agency: 'NSFDC',
    agencyFullName: 'Ministry of Social Justice & Empowerment / NSFDC',
    targetCommunity: ['SC'],
    tagline: 'Seed equity funding up to ₹30 Lakh over 3 years for SC student and youth technology startups.',
    description: 'Supports SC youth with innovative tech ideas incubated at Technology Business Incubators (TBIs) with ₹30 Lakh equity funding and mentorship over a 3-year commercialization period.',
    hindiDescription: 'अनुसूचित जाति के युवाओं और दिव्यांग छात्रों के नवोन्मेषी तकनीकी स्टार्टअप्स को ₹30 लाख तक की प्रारंभिक इक्विटी फंडिंग और इन्क्यूबेशन सहायता।',
    maxProjectCost: 3000000,
    maxLoanAmount: 3000000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 3000000, ratePercent: 0.0, description: '0% interest - Equity capital investment via Venture Capital Fund' }
    ],
    maxTenureYears: 7,
    moratoriumMonths: 24,
    incomeCeiling: 600000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SMALL_BUSINESS', 'SKILL_TRAINING'],
    keyBenefits: [
      'Up to ₹30 Lakh equity funding disbursed in 3 tranches',
      'Incubation support in recognized higher education TBIs',
      'No collateral requirement; equity participation model'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Caste Certificate (SC)',
      'Incubation Recommendation from DST/MoE recognized TBI',
      'Startup Pitch Deck and Proof of Concept (PoC)',
      'Educational Degree / Student ID'
    ],
    rules: [
      {
        ruleId: 'RULE-ASIIM-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC'],
        explanation: 'Promoter must belong to Scheduled Caste (SC) community.',
        weight: 45
      },
      {
        ruleId: 'RULE-ASIIM-AGE',
        field: 'age',
        condition: 'gte',
        expectedValue: 18,
        explanation: 'Applicant must be at least 18 years of age.',
        weight: 25
      },
      {
        ruleId: 'RULE-ASIIM-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 3000000,
        explanation: 'Eligible incubation grant/equity cap is ₹30,00,000.',
        weight: 30
      }
    ],
    officialPortalUrl: 'https://vcfsc.in/asiim'
  },
  {
    id: 'mosje-pmdaksh',
    code: 'MoSJE-DAKSH-01',
    name: 'PM-DAKSH (Skill Training & Wage/Self-Employment Linkage)',
    hindiName: 'पीएम-दक्ष योजना (कौशल प्रशिक्षण एवं स्वरोजगार)',
    agency: 'NSFDC',
    agencyFullName: 'Ministry of Social Justice & Empowerment',
    targetCommunity: ['SC', 'OBC', 'SAFAI_KARAMCHARI'],
    tagline: '100% free high-quality vocational skill training with ₹1,500/month stipend and direct loan linkage.',
    description: 'Flagship national skill empowerment program for SC, OBC, and Safai Karamchari youth. Covers up-skilling, short-term and entrepreneurial development courses with certified placement and seamless SCA credit linkage.',
    hindiDescription: 'एससी, ओबीसी और सफाई कर्मचारियों के लिए 100% निःशुल्क आधुनिक कौशल प्रशिक्षण, ₹1,500 मासिक वजीफा और प्रशिक्षण उपरांत स्वरोजगार हेतु आसान ऋण सहायता।',
    maxProjectCost: 200000,
    maxLoanAmount: 150000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 200000, ratePercent: 4.0, description: '4.0% p.a. concessional credit upon course completion for self-employment toolkit' }
    ],
    maxTenureYears: 3,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SKILL_TRAINING', 'SMALL_BUSINESS'],
    keyBenefits: [
      '100% free government-certified training in modern trades',
      '₹1,500 per month stipend during course duration',
      'Direct fast-track loan routing to SCAs for setting up business upon graduation'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Caste Certificate (SC / OBC / Safai Karamchari proof)',
      'Income Certificate issued by Competent Authority',
      '10th/12th Marksheet or Self-Declaration',
      'Bank Account Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-DAKSH-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SC', 'OBC', 'SAFAI_KARAMCHARI'],
        explanation: 'Must belong to SC, OBC, or Safai Karamchari community.',
        weight: 35
      },
      {
        ruleId: 'RULE-DAKSH-AGE',
        field: 'age',
        condition: 'gte',
        expectedValue: 18,
        explanation: 'Beneficiary must be between 18 and 45 years of age.',
        weight: 35
      },
      {
        ruleId: 'RULE-DAKSH-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Family income must not exceed ₹3,00,000.',
        weight: 30
      }
    ],
    officialPortalUrl: 'https://pmdaksh.dosje.gov.in'
  },
  {
    id: 'nbcfdc-dras',
    code: 'MoSJE-DRAS-01',
    name: 'Dr. Ambedkar Overseas Educational Loan Interest Subsidy Scheme',
    hindiName: 'डॉ. अम्बेडकर विदेश अध्ययन शैक्षिक ऋण ब्याज अनुदान योजना',
    agency: 'NBCFDC',
    agencyFullName: 'Ministry of Social Justice & Empowerment / NBCFDC',
    targetCommunity: ['OBC'],
    tagline: '100% interest subsidy on bank education loans for OBC & EBC students pursuing Masters and PhD abroad.',
    description: 'Reimburses 100% of interest payable during course and moratorium period on education loans taken from scheduled commercial banks for approved higher study courses abroad.',
    hindiDescription: 'विदेश में मास्टर्स और पीएचडी की पढ़ाई करने वाले ओबीसी और ईबीसी छात्रों को बैंक शिक्षा ऋण पर पाठ्यक्रम और मोराटोरियम अवधि का 100% ब्याज अनुदान।',
    maxProjectCost: 2000000,
    maxLoanAmount: 2000000,
    subsidyPercentage: 100,
    interestSlabs: [
      { minAmount: 0, maxAmount: 2000000, ratePercent: 0.0, description: '100% interest subvention paid by MoSJE during study and moratorium period' }
    ],
    maxTenureYears: 10,
    moratoriumMonths: 12,
    incomeCeiling: 800000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['EDUCATION'],
    keyBenefits: [
      'Full 100% government reimbursement of education loan interest',
      'Covers entire course duration plus 1 year moratorium',
      'Enables affordable access to top international universities'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'OBC / EBC Certificate (Non-Creamy Layer)',
      'Admission Offer Letter from recognized foreign university',
      'Education Loan Sanction Letter from Scheduled Bank',
      'Income Certificate issued by Competent Authority'
    ],
    rules: [
      {
        ruleId: 'RULE-DRAS-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['OBC'],
        explanation: 'Candidate must belong to Other Backward Classes (OBC non-creamy layer) or EBC.',
        weight: 40
      },
      {
        ruleId: 'RULE-DRAS-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 800000,
        explanation: 'Annual family income must not exceed ₹8,00,000.',
        weight: 30
      },
      {
        ruleId: 'RULE-DRAS-PURPOSE',
        field: 'purpose',
        condition: 'in',
        expectedValue: ['EDUCATION'],
        explanation: 'Scheme specifically applies to higher education abroad.',
        weight: 30
      }
    ],
    officialPortalUrl: 'https://nbcfdc.gov.in'
  },
  {
    id: 'nskfdc-sms',
    code: 'NSKFDC-SMS-04',
    name: 'Sanitary Marts Scheme for Sanitation Workers',
    hindiName: 'स्वच्छता सामग्री विक्रय केंद्र (सैनिटरी मार्ट) योजना',
    agency: 'NSKFDC',
    agencyFullName: 'National Safai Karamcharis Finance & Development Corporation',
    targetCommunity: ['SAFAI_KARAMCHARI'],
    tagline: 'Credit support up to ₹15 Lakh for establishing sanitary wholesale stores and servicing kiosks.',
    description: 'Financial assistance to Safai Karamcharis and their families to set up sanitary and hygiene supply centers, providing equipment, materials, and maintenance services to households and local institutions.',
    hindiDescription: 'सफाई कर्मचारियों को स्वच्छता उपकरण और सैनिटरी उत्पादों की दुकान व सर्विस सेंटर स्थापित करने हेतु ₹15 लाख तक का रियायती ऋण।',
    maxProjectCost: 1500000,
    maxLoanAmount: 1350000,
    interestSlabs: [
      { minAmount: 0, maxAmount: 1500000, ratePercent: 4.0, description: '4.0% p.a. for women, 5.0% p.a. for men' }
    ],
    maxTenureYears: 7,
    moratoriumMonths: 6,
    incomeCeiling: 300000,
    genderRestriction: 'ALL',
    eligiblePurposes: ['SMALL_BUSINESS', 'SANITATION_REHAB'],
    keyBenefits: [
      'Concessional credit up to 90% of unit cost',
      'Provides steady commercial retail income from sanitation products',
      'Special 1% interest rebate for female entrepreneurs'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Safai Karamchari Certificate / Dependent Proof',
      'Business Proposal & Equipment Quotation for Sanitary Mart',
      'Income Certificate issued by Competent Authority',
      'Bank Account Passbook'
    ],
    rules: [
      {
        ruleId: 'RULE-SMS-CAT',
        field: 'category',
        condition: 'in',
        expectedValue: ['SAFAI_KARAMCHARI'],
        explanation: 'Applicant must be a verified Safai Karamchari, manual scavenger, or dependent.',
        weight: 45
      },
      {
        ruleId: 'RULE-SMS-COST',
        field: 'projectCost',
        condition: 'lte',
        expectedValue: 1500000,
        explanation: 'Project cost must not exceed ₹15,00,000.',
        weight: 30
      },
      {
        ruleId: 'RULE-SMS-INC',
        field: 'annualFamilyIncome',
        condition: 'lte',
        expectedValue: 300000,
        explanation: 'Annual family income must not exceed ₹3,00,000.',
        weight: 25
      }
    ],
    officialPortalUrl: 'https://nskfdc.nic.in'
  }
];
