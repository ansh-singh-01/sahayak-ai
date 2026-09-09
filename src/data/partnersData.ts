import { ChannelPartner } from '../types/partner';

export const CHANNEL_PARTNERS_DATABASE: ChannelPartner[] = [
  // --- MADHYA PRADESH (INDORE REGION - Highlighted in PRD Demo Script) ---
  {
    id: 'mp-sca-indore',
    name: 'MP State Cooperative Scheduled Castes Finance & Dev Corp (SCA)',
    hindiName: 'म.प्र. राज्य सहकारी अनुसूचित जाति वित्त एवं विकास निगम (इंदौर शाखा)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency (Primary MoSJE Nodal)',
    supportedAgencies: ['NSFDC', 'NBCFDC', 'NSKFDC'],
    state: 'Madhya Pradesh',
    district: 'Indore',
    address: 'Vikas Bhawan, Near Old Collectorate, Moti Tabela, Indore',
    pinCode: '452004',
    lat: 22.7150,
    lng: 75.8577,
    contactPerson: 'Shri Arvind Verma',
    designation: 'District Manager & Nodal Officer',
    phone: '+91 731 243 8921',
    email: 'dm-indore@mpscfdc.gov.in',
    workingHours: '10:00 AM – 5:30 PM (Mon-Sat)',
    reliability: {
      averageResponseTimeDays: 4.2, // Very fast turnaround
      allocatedFundUtilizationPercent: 64, // 36% quota available!
      grievanceResolutionRate: 97,
      activeApplicationQuota: 145,
      lastAuditDate: '2026-08-15'
    },
    acceptingNewApplications: true
  },
  {
    id: 'mp-obc-indore',
    name: 'MP Backward Classes & Minorities Finance & Dev Corp (NBCFDC Nodal)',
    hindiName: 'म.प्र. पिछड़ा वर्ग एवं अल्पसंख्यक वित्त एवं विकास निगम',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency (OBC Nodal)',
    supportedAgencies: ['NBCFDC'],
    state: 'Madhya Pradesh',
    district: 'Indore',
    address: 'Room 12, Samaj Kalyan Parisar, Collectorate Compound, Indore',
    pinCode: '452007',
    lat: 22.7196,
    lng: 75.8677,
    contactPerson: 'Smt. Rajeshwari Patel',
    designation: 'Joint Director (OBC Welfare)',
    phone: '+91 731 254 1109',
    email: 'indore-obc@mpbcfdc.gov.in',
    workingHours: '10:00 AM – 5:00 PM (Mon-Fri)',
    reliability: {
      averageResponseTimeDays: 5.0,
      allocatedFundUtilizationPercent: 71,
      grievanceResolutionRate: 94,
      activeApplicationQuota: 110,
      lastAuditDate: '2026-08-20'
    },
    acceptingNewApplications: true
  },
  {
    id: 'sbi-sme-indore',
    name: 'State Bank of India — SME & Micro Credit Center',
    hindiName: 'भारतीय स्टेट बैंक — सूक्ष्म एवं लघु उद्योग शाखा (इंदौर)',
    type: 'PSU_BANK',
    typeLabel: 'Public Sector Bank (MoSJE Channel Partner)',
    supportedAgencies: ['NSFDC', 'NBCFDC'],
    state: 'Madhya Pradesh',
    district: 'Indore',
    address: 'Plot 4, PU-4, Behind C21 Mall, AB Road, Indore',
    pinCode: '452010',
    lat: 22.7533,
    lng: 75.8937,
    contactPerson: 'Mr. Pradeep Joshi',
    designation: 'Chief Manager (Lead Bank Office)',
    phone: '+91 731 405 2200',
    email: 'sme.indore@sbi.co.in',
    workingHours: '10:00 AM – 4:00 PM (Mon-Sat, 2nd/4th Sat Off)',
    reliability: {
      averageResponseTimeDays: 14.8, // Slower bank turnaround
      allocatedFundUtilizationPercent: 91, // Nearing capacity
      grievanceResolutionRate: 88,
      activeApplicationQuota: 28,
      lastAuditDate: '2026-08-01'
    },
    acceptingNewApplications: true
  },
  {
    id: 'mp-gramin-indore',
    name: 'Madhya Pradesh Gramin Bank — Regional Credit Office',
    hindiName: 'मध्य प्रदेश ग्रामीण बैंक — क्षेत्रीय ऋण कार्यालय',
    type: 'RRB',
    typeLabel: 'Regional Rural Bank (Last-Mile Partner)',
    supportedAgencies: ['NSFDC', 'NBCFDC', 'NSKFDC'],
    state: 'Madhya Pradesh',
    district: 'Indore',
    address: 'C-29, Vidyapati Nagar, Dhar Road, Indore',
    pinCode: '452002',
    lat: 22.7088,
    lng: 75.8344,
    contactPerson: 'Shri Hemant Rathore',
    designation: 'Senior Manager (Priority Sector Lending)',
    phone: '+91 731 278 9430',
    email: 'psl.indore@mpgb.co.in',
    workingHours: '10:00 AM – 4:30 PM (Mon-Sat)',
    reliability: {
      averageResponseTimeDays: 7.5,
      allocatedFundUtilizationPercent: 55, // Healthy fund availability
      grievanceResolutionRate: 92,
      activeApplicationQuota: 95,
      lastAuditDate: '2026-08-10'
    },
    acceptingNewApplications: true
  },
  {
    id: 'pnb-chimanbagh-indore',
    name: 'Punjab National Bank — Agricultural & MSME Hub',
    hindiName: 'पंजाब नेशनल बैंक — कृषि एवं एमएसएमई हब',
    type: 'PSU_BANK',
    typeLabel: 'Public Sector Bank',
    supportedAgencies: ['NSFDC', 'NBCFDC'],
    state: 'Madhya Pradesh',
    district: 'Indore',
    address: 'Chiman Bagh, Near Regal Square, MG Road, Indore',
    pinCode: '452001',
    lat: 22.7210,
    lng: 75.8710,
    contactPerson: 'Mr. Sunil Sharma',
    designation: 'Assistant General Manager',
    phone: '+91 731 251 3344',
    email: 'bo0214@pnb.co.in',
    workingHours: '10:00 AM – 4:00 PM (Mon-Sat)',
    reliability: {
      averageResponseTimeDays: 18.2, // High queue latency
      allocatedFundUtilizationPercent: 96, // Fund allocation almost exhausted!
      grievanceResolutionRate: 82,
      activeApplicationQuota: 8,
      lastAuditDate: '2026-07-28'
    },
    acceptingNewApplications: false // Temporary pause due to quota exhaustion!
  },

  // --- BHOPAL (CAPITAL HQ) ---
  {
    id: 'mp-sca-bhopal-hq',
    name: 'MP State Scheduled Castes Commission & Finance Corp HQ',
    hindiName: 'म.प्र. अनुसूचित जाति वित्त निगम राज्य मुख्यालय (भोपाल)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency Apex Office',
    supportedAgencies: ['NSFDC', 'NBCFDC', 'NSKFDC'],
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    address: 'Rajiv Gandhi Bhawan, 35 Shyamla Hills, Bhopal',
    pinCode: '462002',
    lat: 23.2435,
    lng: 77.3910,
    contactPerson: 'Dr. Surendra Mohan (IAS)',
    designation: 'Managing Director',
    phone: '+91 755 266 1234',
    email: 'md@mpscfdc.mp.gov.in',
    workingHours: '10:00 AM – 5:30 PM',
    reliability: {
      averageResponseTimeDays: 3.8,
      allocatedFundUtilizationPercent: 58,
      grievanceResolutionRate: 98,
      activeApplicationQuota: 300,
      lastAuditDate: '2026-08-25'
    },
    acceptingNewApplications: true
  },

  // --- UTTAR PRADESH (LUCKNOW) ---
  {
    id: 'up-sdc-lucknow',
    name: 'UP Scheduled Castes Finance & Development Corp (UPSDFDC)',
    hindiName: 'उ.प्र. अनुसूचित जाति वित्त एवं विकास निगम (लखनऊ)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    supportedAgencies: ['NSFDC', 'NSKFDC'],
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    address: 'B-Block, 4th Floor, Indira Bhawan, Ashok Marg, Lucknow',
    pinCode: '226001',
    lat: 26.8500,
    lng: 80.9499,
    contactPerson: 'Shri R. K. Chaudhary',
    designation: 'Chief Development Officer',
    phone: '+91 522 228 8910',
    email: 'info@upsdfdc.up.gov.in',
    workingHours: '9:30 AM – 5:30 PM',
    reliability: {
      averageResponseTimeDays: 5.4,
      allocatedFundUtilizationPercent: 72,
      grievanceResolutionRate: 93,
      activeApplicationQuota: 220,
      lastAuditDate: '2026-08-18'
    },
    acceptingNewApplications: true
  },

  // --- MAHARASHTRA (NAGPUR) ---
  {
    id: 'mh-lokshahir-nagpur',
    name: 'Lokshahir Annabhau Sathe Development Corporation',
    hindiName: 'लोकशाहीर अण्णाभाऊ साठे विकास महामंडळ (नागपूर)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency (MoSJE Channel)',
    supportedAgencies: ['NSFDC'],
    state: 'Maharashtra',
    district: 'Nagpur',
    address: 'Administrative Building No. 2, Civil Lines, Nagpur',
    pinCode: '440001',
    lat: 21.1458,
    lng: 79.0882,
    contactPerson: 'Smt. Kavita Meshram',
    designation: 'Regional Manager',
    phone: '+91 712 256 0981',
    email: 'nagpur@lasdcmh.gov.in',
    workingHours: '10:00 AM – 5:45 PM',
    reliability: {
      averageResponseTimeDays: 4.8,
      allocatedFundUtilizationPercent: 68,
      grievanceResolutionRate: 95,
      activeApplicationQuota: 175,
      lastAuditDate: '2026-08-12'
    },
    acceptingNewApplications: true
  },

  // --- NEW DELHI ---
  {
    id: 'delhi-dsfsc-delhi',
    name: 'Delhi SC/ST/OBC/Minorities and Handicapped Finance & Dev Corp (DSFSC)',
    hindiName: 'दिल्ली अनुसूचित जाति/जनजाति/अन्य पिछड़ा वर्ग वित्त एवं विकास निगम',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    supportedAgencies: ['NSFDC', 'NBCFDC', 'NSKFDC'],
    state: 'Delhi',
    district: 'New Delhi',
    address: '2nd Floor, Ambedkar Bhawan, Sector 16, Rohini, New Delhi',
    pinCode: '110089',
    lat: 28.7290,
    lng: 77.1200,
    contactPerson: 'Shri Vinod Kashyap',
    designation: 'General Manager',
    phone: '+91 11 2788 3400',
    email: 'dsfsc-delhi@nic.in',
    workingHours: '9:30 AM – 6:00 PM',
    reliability: {
      averageResponseTimeDays: 3.5,
      allocatedFundUtilizationPercent: 60,
      grievanceResolutionRate: 98,
      activeApplicationQuota: 280,
      lastAuditDate: '2026-08-22'
    },
    acceptingNewApplications: true
  }
];
