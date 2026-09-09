const baseEn = {
  appName: 'SAHAYAK',
  appSubtitle: 'AI-Driven Scheme Matching & Channel Partner Routing Platform',
  ministryHeader: 'Ministry of Social Justice & Empowerment (MoSJE) · Govt. of India',
  problemStatementBadge: 'SIH26092 · Smart Automation',
  dpdpBadge: 'DPDP Act 2023 Compliant',
  homeNav: 'Home',
  signInNav: 'Sign In',
  signUpNav: 'Sign Up',
  signOut: 'Log Out',
  citizenMode: 'Citizen Mode',
  adminMode: 'Ministry Admin',
  findMyScheme: 'Find My Scheme',
  calculatorNav: 'EMI Calculator',
  partnersNav: 'Channel Partners',
  checklistNav: 'Document Checklist',
  preferToSpeak: 'Prefer to Speak',
  voiceModalTitle: 'Voice-Guided Scheme Assistant',
  voiceInstructions: 'Tap the mic or select the cards to answer in your own voice (Hindi or English).',
  step1Title: 'Who are you?',
  step1Subtitle: 'Select your community category and demographic details',
  step2Title: 'What is your venture / need?',
  step2Subtitle: 'Tell us about your business purpose and estimated project cost',
  step3Title: 'Your Location & Verification',
  step3Subtitle: 'Find exact district channelizing agencies near you',
  categoryLabel: 'Beneficiary Category',
  genderLabel: 'Gender',
  ageLabel: 'Age (Years)',
  incomeLabel: 'Annual Family Income (₹)',
  purposeLabel: 'Purpose / Enterprise Type',
  projectCostLabel: 'Estimated Project Cost (₹)',
  loanRequestedLabel: 'Loan Amount Required (₹)',
  stateLabel: 'State',
  districtLabel: 'District / City',
  checkEligibilityBtn: 'Run Rule Engine & Check Eligibility',
  demoPersonaLabel: '⚡ Quick Demo Persona (SIH Judging Demo):',
  eligibleSchemesHeading: 'Recommended MoSJE Schemes',
  eligibleSubtitle: 'Deterministic rule engine match based on your income, community category & project scope',
  nearMissHeading: 'Gap-to-Eligibility ("Near Miss") Report',
  nearMissSubtitle: 'Honest, auditable feedback on schemes you currently miss, with clear qualifying roadmaps',
  matchScore: 'Match Score',
  viewAuditTrail: 'View Rule Audit Trace',
  calculateEmi: 'Calculate Loan EMI',
  routeToPartner: 'Route to Channel Partner',
  whyYouQualify: 'Why You Qualify',
  whyNotEligible: 'Why Not Currently Eligible',
  howToQualify: 'How to Qualify / Next Steps',
  noEligibleFound: 'No eligible schemes found for this profile. Review the Near Miss report below for alternate options.',
  // Calculator
  calculatorTitle: 'Interactive Moratorium-Aware Loan Modeler',
  calculatorSubtitle: 'Simulates monthly installments with official MoSJE interest slabs, moratorium periods, and subsidies',
  principalAmount: 'Principal Loan Amount',
  interestRate: 'Applicable Interest Rate',
  tenure: 'Repayment Tenure',
  moratorium: 'Moratorium Period',
  moratoriumExplain: 'Deferred principal period during initial business setup. Only simple interest is serviced.',
  monthlyEmi: 'Regular Monthly EMI',
  moratoriumEmi: 'Moratorium Monthly Interest',
  totalInterest: 'Total Interest Payable',
  totalPayable: 'Total Amount Payable',
  capitalSubsidy: 'Govt. Capital Subsidy',
  amortizationTable: 'Amortization Schedule',
  ceilingWarning: 'Scheme Limit Advisory',
  // Partners
  partnersTitle: 'Ranked Channel Partner & SCA Locator',
  partnersSubtitle: 'Intelligent load-balanced routing: We rank partners based on active fund quota and turnaround speed, not just proximity',
  routing: 'Office Routing',
  reliabilitySignal: 'Partner Reliability Index',
  averageTat: 'Avg. Turnaround Time',
  fundQuota: 'Available Fund Quota',
  grievanceRate: 'Grievance Resolution',
  nodalOfficer: 'Nodal Officer',
  getDirections: 'Get Directions & Contact',
  // Ministry
  ministryTitle: 'MoSJE Equity & Inclusion Analytics Dashboard',
  ministrySubtitle: 'Real-time visibility into beneficiary outreach, funnel conversion, and district SCA load-balancing',
  totalCitizenRoutings: 'Citizen Inquiries Routed',
  scBeneficiaries: 'SC Beneficiaries Served',
  obcBeneficiaries: 'OBC Beneficiaries Served',
  safaiBeneficiaries: 'Safai Karamchari Dependents',
  womenShare: 'Women Entrepreneur Share',
  avgSanctionTat: 'Average SCA Turnaround',
  dpdpLogTitle: 'DPDP Act 2023 Statutory Privacy Log',
  // Landing Page
  heroBadge: 'Ministry of Social Justice & Empowerment · SIH26092',
  heroTitlePrefix: 'Empowering Margin to Mainstream with',
  heroTitleHighlight: 'Statutory Scheme Discovery',
  heroTitleSuffix: '& Load-Balanced Partner Routing',
  heroDesc: 'From "I need financial support" to "Exact Scheme, Concessional EMI, and Vetted Channel Partner Office" in under 5 minutes. 100% grounded in official NSFDC, NBCFDC, and NSKFDC mandates with zero AI hallucination.',
  checkEligibilityNow: 'Check Eligibility',
  exploreSchemes: 'Explore Scheme Catalog',
  statMaxLoan: 'Max Project Finance',
  statInterest: 'Concessional Rates',
  statSchemes: 'Central Scheme Families',
  statCorporations: 'Apex Corporations',
  statTatReduction: 'Average TAT Reduction',
  howItWorksHeading: 'The 3-Step Beneficiary Pathway',
  howItWorksSub: 'Bridging administrative opacity into an actionable, dignified, and auditable citizen experience.',
  step1Name: '1. Tell Your Story (Text or Voice)',
  step1Desc: 'Enter your category, income, and business venture scope, or speak naturally via the low-literacy voice assistant in Hindi or English.',
  step2Name: '2. Explainable Match & Gap Report',
  step2Desc: 'Deterministic rule engine evaluates all criteria. For missed schemes, view transparent gap differences and concrete roadmaps to qualify.',
  step3Name: '3. Moratorium Modeler & Office Routing',
  step3Desc: 'Simulate repayment schedules with 3–6 month setup grace periods. Route to an active SCA with quota and an official QR routing slip.',
  corporationsHeading: 'Direct Mandates from 3 National Apex Corporations',
  corporationsSub: 'Grounded in statutory guidelines from NSFDC (SC), NBCFDC (OBC), and NSKFDC (Safai Karamcharis).',
  comparisonHeading: 'Why SAHAYAK Outperforms Generic Portals',
  comparisonSub: 'Solving the real-world operational friction of government credit schemes (myScheme / Jan Samarth).',
  personaHeading: '⚡ Live Jury Demo: 1-Click Beneficiary Personas',
  Demo: 'Demo',
  personaSub: 'Experience instant rule evaluation and gap analysis across diverse communities with a single click.',
  // Auth Portal
  authTitle: 'National Social Justice Identity Portal',
  authSubtitle: 'Single Sign-On for Beneficiaries, Channel Partner SCAs, and Ministry Officials',
  signInTab: 'Sign In',
  signUpTab: 'Register Beneficiary',
  roleCitizen: 'Citizen Beneficiary',
  rolePartner: 'SCA / Bank Channel Partner',
  roleMinistry: 'Ministry Executive (MoSJE)',
  mobileOrEmail: 'Mobile Number or Official Email',
  mobileNumber: '10-Digit Mobile Number',
  password: 'Password',
  enterOtp: 'Enter 6-Digit SMS OTP',
  sendOtp: 'Send OTP',
  otpSentNotice: 'OTP sent to',
  verifyAndLogin: 'Verify OTP & Enter',
  loginButton: 'Sign In to Portal',
  registerButton: 'Create Beneficiary Account',
  usePasswordLogin: 'Sign in with Password instead',
  useOtpLogin: 'Sign in with Mobile OTP instead',
  quickDemoLogin: '⚡ 1-Click Judging Fast-Track Logins:',
  Logins: 'Logins',
  dpdpConsentStatement: 'I confirm my details and grant statutory consent under the DPDP Act 2023 for welfare scheme eligibility processing and partner routing.'
};

export const en = {
  ...baseEn,
  // Beneficiary Dashboard
  dashboardNav: 'My Dashboard',
  dashboardSubtitle: 'Citizen Welfare Action Center & Application Tracker',
  namaste: 'Namaste',
  activeAppSingle: 'You have 1 active application',
  completeProfileMsg: 'Complete your profile to see your matches',
  noActiveApps: 'No active applications — start when you\'re ready',
  applicationTracker: 'Application Status Tracker',
  stageRecommended: 'Recommended',
  stageDocsPending: 'Documents Pending',
  stageSubmitted: 'Submitted',
  stageUnderReview: 'Under Review',
  stageApproved: 'Approved',
  stageRejected: 'Rejected',
  viewDetails: 'View Details',
  recommendedSchemesHeading: 'Your Recommended Scheme',
  viewFullRecommendation: 'View Full Recommendation',
  findMySchemeCta: 'Find My Scheme',
  documentsReadyRatio: 'Documents Ready',
  continueChecklist: 'Continue Checklist',
  designatedPartnerHeading: 'Your Designated Channel Partner',
  contactPartner: 'Contact Partner',
  quickActionsTitle: 'Quick Actions',
  recalculateLoan: 'Recalculate Loan',
  compareOtherSchemes: 'Compare Other Schemes',
  askSahayak: 'Ask Sahayak',
  startNewApp: 'Start New Application',
  recentUpdatesTitle: 'Recent Updates & Notifications',
  profileAndSettings: 'Profile & Privacy Controls',
  helpSupportTitle: 'MoSJE Helpline & Citizen Grievance',
  tollFreeHelpline: 'Toll-Free Helpline: 1800-11-2001 (MoSJE)'
};

export interface DashboardTranslationKeys {
  dashboardNav?: string;
  dashboardSubtitle?: string;
  namaste?: string;
  activeAppSingle?: string;
  completeProfileMsg?: string;
  noActiveApps?: string;
  applicationTracker?: string;
  stageRecommended?: string;
  stageDocsPending?: string;
  stageSubmitted?: string;
  stageUnderReview?: string;
  stageApproved?: string;
  stageRejected?: string;
  viewDetails?: string;
  recommendedSchemesHeading?: string;
  viewFullRecommendation?: string;
  findMySchemeCta?: string;
  documentsReadyRatio?: string;
  continueChecklist?: string;
  designatedPartnerHeading?: string;
  contactPartner?: string;
  quickActionsTitle?: string;
  recalculateLoan?: string;
  compareOtherSchemes?: string;
  askSahayak?: string;
  startNewApp?: string;
  recentUpdatesTitle?: string;
  profileAndSettings?: string;
  helpSupportTitle?: string;
  tollFreeHelpline?: string;
}

export type TranslationKeys = typeof baseEn & DashboardTranslationKeys;
export type FullTranslationKeys = typeof en;
