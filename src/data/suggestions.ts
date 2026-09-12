export interface SuggestionCategory {
  name: string;
  icon: string;
  prompts: {
    title: string;
    description: string;
    prompt: string;
    language?: string;
  }[];
}

export const SUGGESTIONS: SuggestionCategory[] = [
  {
    name: 'Welfare Schemes & Eligibility',
    icon: 'ShieldCheck',
    prompts: [
      {
        title: 'SC Beneficiary Scheme Eligibility',
        description: 'Concessional loans for Scheduled Caste beneficiaries under NSFDC.',
        prompt: 'Which concessional loan and skill schemes are available for Scheduled Caste (SC) applicants under NSFDC?',
        language: 'en',
      },
      {
        title: 'मेरी जाति व आय अनुसार पात्रता',
        description: 'ओबीसी व सफाई कर्मचारी योजनाओं की पात्रता नियम।',
        prompt: 'नमस्ते, मेरी श्रेणी OBC है और वार्षिक आय 2 लाख है। मुझे कौन सी योजना के तहत ऋण मिल सकता है?',
        language: 'hi',
      },
      {
        title: 'Women Entrepreneurship (Mahila Samriddhi)',
        description: 'Special 1% to 2% interest rebates for women micro-entrepreneurs.',
        prompt: 'Tell me about Mahila Samriddhi Yojana and the special interest rebate for female entrepreneurs under NBCFDC/NSFDC.',
        language: 'en',
      },
      {
        title: 'PM-DAKSH Free Skill Training',
        description: '100% free government vocational training with ₹1,500/month stipend.',
        prompt: 'What are the benefits, stipend rules, and eligibility criteria for PM-DAKSH skill training?',
        language: 'en',
      }
    ],
  },
  {
    name: 'Concessional Credit & Loan EMI',
    icon: 'Calculator',
    prompts: [
      {
        title: '₹2 Lakh Loan with Moratorium',
        description: 'Calculate monthly installment with 6-month moratorium grace period.',
        prompt: 'Calculate EMI for a ₹2,00,000 enterprise loan over 5 years at 5% p.a. with 6 months moratorium.',
        language: 'en',
      },
      {
        title: 'मोराटोरियम अवधि में ब्याज नियम',
        description: 'शुरुआती 6 महीनों में कितना भुगतान करना होगा?',
        prompt: 'लोन लेने पर पहले 6 महीने मोराटोरियम में कितना ब्याज और किश्त देनी होगी? कृपया स्पष्ट करें।',
        language: 'hi',
      },
      {
        title: 'Sanitary Mart Scheme Financing',
        description: 'Up to ₹15 Lakh concessional credit for sanitation workers under NSKFDC.',
        prompt: 'How much financing is provided under Sanitary Marts Scheme (NSKFDC) and what is the interest rate?',
        language: 'en',
      }
    ],
  },
  {
    name: 'Mandatory Documents & DigiLocker',
    icon: 'FileCheck2',
    prompts: [
      {
        title: 'Required Certificate Checklist',
        description: 'Aadhaar, Caste Certificate, Income Certificate, and DPR requirements.',
        prompt: 'What certified documents are required to apply for a MoSJE concessional business loan?',
        language: 'en',
      },
      {
        title: 'डिजिलॉकर से डिजिटल सत्यापन',
        description: 'बिना कागज़ और बिना लाइन में लगे प्रमाण पत्र कैसे सत्यापित करें?',
        prompt: 'क्या मैं अपने जाति और आय प्रमाण पत्र को डिजिलॉकर के ज़रिए सीधे सत्यापित करा सकता हूँ?',
        language: 'hi',
      }
    ],
  },
  {
    name: 'Partner Desk & National Helpline',
    icon: 'Building2',
    prompts: [
      {
        title: 'Find District Channelizing Office (SCA)',
        description: 'Locate nearest state corporation nodal desk in your district.',
        prompt: 'Where is the nearest State Channelizing Agency (SCA) office in my district to submit my application pass?',
        language: 'en',
      },
      {
        title: 'MoSJE National Toll-Free Helpline',
        description: 'Direct citizen contact and grievance redressal helpline.',
        prompt: 'What is the national toll-free helpline number for MoSJE social welfare schemes and grievance redressal?',
        language: 'en',
      }
    ],
  },
];
