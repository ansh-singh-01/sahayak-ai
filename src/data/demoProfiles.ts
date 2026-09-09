import { DemoProfile } from '../types/user';

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'demo-ramesh-obc',
    label: 'Ramesh Kumar (OBC, Indore)',
    hindiLabel: 'रमेश कुमार (अन्य पिछड़ा वर्ग, इंदौर)',
    tagline: 'PRD Script Test: Retail shop project ₹4L, Income ₹2.8L. Matches NBCFDC GLS (91%).',
    profile: {
      name: 'Ramesh Kumar Patel',
      category: 'OBC',
      gender: 'MALE',
      age: 32,
      annualFamilyIncome: 280000,
      state: 'Madhya Pradesh',
      district: 'Indore',
      isDifferentlyAbled: false,
      purpose: 'SMALL_BUSINESS',
      projectCost: 400000,
      loanAmountRequested: 350000,
      preferredTenureYears: 5,
      consentGiven: true
    }
  },
  {
    id: 'demo-sunita-sc-women',
    label: 'Sunita Devi (SC Woman, Indore)',
    hindiLabel: 'सुनीता देवी (अनुसूचित जाति महिला, इंदौर)',
    tagline: 'SC Woman Micro-credit: Tailoring unit ₹1.5L, Income ₹1.6L. Matches NSFDC Mahila Samriddhi (96%).',
    profile: {
      name: 'Sunita Devi Jatav',
      category: 'SC',
      gender: 'FEMALE',
      age: 29,
      annualFamilyIncome: 160000,
      state: 'Madhya Pradesh',
      district: 'Indore',
      isDifferentlyAbled: false,
      purpose: 'WOMEN_MICROCREDIT',
      projectCost: 150000,
      loanAmountRequested: 140000,
      preferredTenureYears: 3,
      consentGiven: true
    }
  },
  {
    id: 'demo-manoj-safai',
    label: 'Manoj Balmiki (Safai Karamchari)',
    hindiLabel: 'मनोज बाल्मीकि (सफाई कर्मचारी आश्रित)',
    tagline: 'Sanitation Rehabilitation: Utility vehicle ₹12L, Income ₹2.2L. Matches NSKFDC Term Loan & Sanrakshan.',
    profile: {
      name: 'Manoj Balmiki',
      category: 'SAFAI_KARAMCHARI',
      gender: 'MALE',
      age: 36,
      annualFamilyIncome: 220000,
      state: 'Madhya Pradesh',
      district: 'Indore',
      isDifferentlyAbled: false,
      purpose: 'SANITATION_REHAB',
      projectCost: 1200000,
      loanAmountRequested: 1000000,
      preferredTenureYears: 7,
      consentGiven: true
    }
  },
  {
    id: 'demo-vikram-near-miss',
    label: 'Vikram Singh (Near-Miss Case: Income ₹3.4L)',
    hindiLabel: 'विक्रम सिंह (निकटतम चूक: आय ₹3.4 लाख)',
    tagline: 'Shows Gap-to-Eligibility: Exceeds ₹3.0L ceiling by ₹40,000. Honest gap report displayed.',
    profile: {
      name: 'Vikram Singh Lodhi',
      category: 'OBC',
      gender: 'MALE',
      age: 38,
      annualFamilyIncome: 340000,
      state: 'Madhya Pradesh',
      district: 'Indore',
      isDifferentlyAbled: false,
      purpose: 'SMALL_BUSINESS',
      projectCost: 500000,
      loanAmountRequested: 400000,
      preferredTenureYears: 5,
      consentGiven: true
    }
  }
];
