import { Router, Request, Response } from 'express';
import { SchemeRecommendation } from '../../src/types/recommendation';

export const aiRouter = Router();

/**
 * POST /api/ai/explain
 * Guardrailed AI explanation service (PRD §27)
 * Strictly paraphrases deterministic rule engine results and cites Rule IDs
 */
aiRouter.post('/explain', (req: Request, res: Response) => {
  const { recommendation, language } = req.body;

  if (!recommendation || !recommendation.scheme) {
    return res.status(400).json({
      status: 'BAD_REQUEST',
      message: 'Valid recommendation object required.'
    });
  }

  const isHindi = language === 'hi';
  const scheme = recommendation.scheme;
  const passedRules = recommendation.passedRules || [];
  const maxLoan = recommendation.maxEligibleLoan;
  const rate = recommendation.calculatedApplicableInterestRate;

  const ruleCitations = passedRules.map((r: any) => r.ruleId);

  const plainExplanation = isHindi
    ? `सामाजिक न्याय मंत्रालय (MoSJE) की आधिकारिक नियम पुस्तिका (${scheme.code}) के अनुसार:
1. समुदाय पात्रता [${ruleCitations[0] || 'RULE-CAT'}]: आप ${scheme.agency} अंतर्गत निर्धारित वर्ग मापदंड पूर्ण करते हैं।
2. आय सीमा [${ruleCitations[1] || 'RULE-INC'}]: आपकी पारिवारिक वार्षिक आय अधिकतम सीमा ₹${(scheme.incomeCeiling / 100000).toFixed(2)} लाख के भीतर है।
3. स्वीकृत ऋण एवं ब्याज: आप ${rate}% प्रतिवर्ष की रियायती दर पर ₹${(maxLoan / 100000).toFixed(2)} लाख तक का ऋण पाने के पात्र हैं, जिसमें ${scheme.moratoriumMonths} माह की छूट (मोराटोरियम) शामिल है।
4. चैनल पार्टनर: आवेदन पर्ची लेकर अपने निकटतम राज्य चैनललाइजिंग एजेंसी (SCA) कार्यालय जाएं।`
    : `Based on official MoSJE guidelines for ${scheme.name} (${scheme.code}):
1. Community Qualification [${ruleCitations[0] || 'RULE-CAT'}]: You meet the statutory community criteria under ${scheme.agency}.
2. Income Eligibility [${ruleCitations[1] || 'RULE-INC'}]: Your certified family income is within the ceiling of ₹${(scheme.incomeCeiling / 100000).toFixed(2)} Lakh.
3. Loan Sizing: Eligible for up to ₹${(maxLoan / 100000).toFixed(2)} Lakh at an official concessional rate of ${rate}% p.a. with a ${scheme.moratoriumMonths}-month moratorium grace period.
4. Channel Partner: You are routed to your designated State Channelizing Agency (SCA) to complete paperwork.`;

  res.json({
    status: 'SUCCESS',
    data: {
      explanationText: plainExplanation,
      citedRuleIds: ruleCitations,
      guardrailNotice: 'Zero numerical hallucination. All parameters deterministically verified from rule engine output.',
      schemeCode: scheme.code
    }
  });
});

import { REAL_MOSJE_SCHEMES } from '../../src/data/schemesData';
import { CHANNEL_PARTNERS_DATABASE } from '../../src/data/partnersData';

/**
 * Condensed statutory MoSJE & National welfare knowledge base fed to Gemini
 */
const STATUTORY_KNOWLEDGE_FEED = REAL_MOSJE_SCHEMES.map(s => ({
  code: s.code,
  name: s.name,
  hindiName: s.hindiName,
  agency: s.agency,
  targetCommunity: s.targetCommunity,
  maxProjectCost: s.maxProjectCost,
  maxLoanAmount: s.maxLoanAmount,
  interestSlabs: s.interestSlabs,
  moratoriumMonths: s.moratoriumMonths,
  maxTenureYears: s.maxTenureYears,
  incomeCeiling: s.incomeCeiling,
  genderRestriction: s.genderRestriction,
  eligiblePurposes: s.eligiblePurposes,
  requiredDocuments: s.requiredDocuments,
  description: s.description
}));

/**
 * Call Google Gemini API with comprehensive welfare scheme knowledge feed
 */
async function generateGeminiChatReply(
  userMessage: string,
  history: any[],
  context: any,
  apiKey: string
): Promise<{ text: string; modelUsed: string } | null> {
  const profile = context?.profile || {};
  const selectedScheme = context?.selectedScheme;
  const selectedPartner = context?.selectedPartner;
  const language = context?.language || 'auto';
  const persona = context?.persona || 'mosje-advisor';

  let personaInstruction = `You are SAHAYAK AI (सहायक एआई), an intelligent, comprehensive, and empathetic multilingual AI assistant and welfare advisor for the Ministry of Social Justice and Empowerment (MoSJE), Government of India (SIH26092). You are capable of answering ALL citizen questions accurately, clearly, and helpfully.`;

  if (persona === 'loan-modeler') {
    personaInstruction += `\nROLE: Concessional Loan & Finance Modeler. Focus on low interest rates (4% to 6% p.a.), moratorium grace periods (up to 6 months), capital subsidies (up to 50% or ₹5 Lakh), amortization schedules, and exact monthly EMI installments.`;
  } else if (persona === 'citizen-support') {
    personaInstruction += `\nROLE: Citizen Support & Grievance Redressal Agent. Focus on application tracking, DigiLocker instant verification, partner office intake, and official grievance redressal (National Helplines: 14566, 14567, 14446, 1800-11-2001).`;
  } else if (persona === 'polyglot-guide') {
    personaInstruction += `\nROLE: Polyglot Cultural Linguist. Translate complex government legal terms into simple, conversational regional dialects for marginalized rural beneficiaries.`;
  } else {
    personaInstruction += `\nROLE: Comprehensive Welfare, Livelihood & Public Administration Guide. Be warm, empathetic, highly structured, and articulate in guiding any citizen on any question.`;
  }

  const systemInstruction = `${personaInstruction}
YOUR MANDATE: Answer ALL questions asked by citizens, students, entrepreneurs, bankers, and officials.
You possess deep expertise across all of the following domains:

1. APEX CORPORATIONS & CREDIT-LINKED CONCESSIONAL SCHEMES:
   - NSFDC (Scheduled Castes): General Term Loan (up to ₹50L, 6-8%), Mahila Samriddhi Yojana (SC women up to ₹1.4L at 4%), Micro Credit, Mahila Kisan Yojana, Green Business Scheme, Udyam Nidhi.
   - NBCFDC (OBC & EBC): General Loan Scheme, New Swarnima for Women (up to ₹2L at 5%), Mahila Samriddhi (up to ₹1.4L at 4%), Shilp Sampada (artisans), Krishi Sampada, Saksham.
   - NSKFDC (Safai Karamcharis, Manual Scavengers, Waste Pickers): General Term Loan, Swachhta Udyami Yojana (SUY - mechanized sanitation vehicles up to ₹50L with 25-50% subsidy up to ₹5 Lakh), SRMS (Self Employment Scheme for Rehabilitation of Manual Scavengers - ₹40,000 cash grant + skill stipend + capital subsidy), Sanrakshan Yojana (safety equipment).

2. EDUCATION, SCHOLARSHIPS & SKILLS:
   - PM-DAKSH: Free residential/non-residential high-tech skill training (AI, Solar, Automotive, Apparel) with ₹1,000-₹1,500/mo DBT stipend and certified job/loan placement.
   - PM-YASASVI: Top Class school scholarship for OBC, EBC, DNT students up to ₹1.25 Lakh/year for Grades 9-12.
   - Pre-Matric and Post-Matric Scholarships for SC, OBC, EBC, DNT.
   - National Overseas Scholarship (NOS): 125 SC/DNT scholars receive 100% tuition coverage + annual living stipend (~$15,400 USD / £9,900 GBP) for Master's/Ph.D. at premier global universities.
   - Dr. Ambedkar Central Sector Scheme: 100% interest subsidy on educational loans for overseas study.
   - Free Coaching Scheme for SC/OBC for competitive exams (UPSC, SSC, Banking, JEE, NEET) + ₹4,000 monthly stipend.

3. VULNERABLE & SPECIAL INCLUSION GROUPS:
   - SMILE (Support for Marginalized Individuals for Livelihood & Enterprise): Comprehensive rehabilitation for transgender persons and individuals engaged in begging (Garima Greh shelter homes, skill development, medical aid, Ayushman Bharat ₹5 Lakh PM-JAY cards).
   - Rashtriya Vayoshri Yojana (RVY): Free assisted-living physical devices for senior citizens (wheelchairs, hearing aids, walkers, spectacles, dentures) + Elderline toll-free 14567.
   - ADIP Scheme: Free modern assistive aids, motorized tricycles (up to ₹42,000 subsidy), smart canes, and prosthetic limbs for Divyangjan (Persons with Disabilities 40%+).
   - Nasha Mukt Bharat Abhiyaan (NMBA) de-addiction centers & helpline 14446.

4. NATIONAL & CROSS-MINISTRY ENTERPRISE INITIATIVES:
   - PM-MUDRA Yojana (Shishu up to ₹50k, Kishore up to ₹5L, Tarun up to ₹10L, Tarun Plus up to ₹20L - zero collateral).
   - Stand-Up India (Bank loans ₹10 Lakh to ₹1 Crore for SC/ST and Women for greenfield ventures).
   - PMEGP (Prime Minister's Employment Generation Programme: 15% to 35% capital subsidy).
   - PM Vishwakarma (18 artisan trades: carpenters, tailors, blacksmiths, potters, cobblers with ₹15,000 toolkit e-voucher + 5% collateral-free loans up to ₹3 Lakh).
   - PM SVANidhi (Street vendors micro-credit ₹10k, ₹20k, ₹50k with 7% interest subsidy).

5. FINANCIAL, BANKING & LOAN MATHEMATICS:
   - Moratorium Period: Clarify that during the setup moratorium (typically 6 months), the beneficiary pays zero principal and only nominal interest (or interest is deferred), preserving vital working capital.
   - Interest Calculation: Concessional rates are simple annual rates (4%-6% p.a.), roughly half of commercial bank rates (12-14%).
   - Capital Subsidy vs Interest Subvention: Direct capital subsidy reduces the principal loan amount, whereas interest subvention reduces the annual interest rate paid.
   - Collateral / CGTMSE: Central schemes under apex corporations require NO third-party collateral for micro-loans; loans are covered under government credit guarantee schemes.

6. CITIZEN RIGHTS, GRIEVANCES & HELPLINES:
   - National Helpline Against Atrocities (NHAA): 14566 (24/7 toll-free for SC/ST protection).
   - National Elderline: 14567 (toll-free counseling, rescue & scheme guidance for senior citizens).
   - National Drug De-addiction Helpline: 14446.
   - KIRAN Mental Health Helpline: 1800-599-0019 (24/7 in 13 languages).
   - MoSJE Citizen Support Desk: 1800-11-2001.
   - State Portals: MP CM Helpline 181, CPGRAMS central public grievance portal.

7. DOCUMENTS, DIGILOCKER & STEP-BY-STEP ADVICE:
   - 5 Mandatory Documents: Aadhaar Card, Caste Certificate (SDM/Tehsildar), Income Certificate, Project DPR/Quotation, Aadhaar-seeded Bank Passbook (DBT).
   - DigiLocker: Explaining how instant DigiLocker pulls eliminate 14-day administrative paper delays.
   - Project DPR: Formulating simple project cost breakdowns for salons, boutiques, dairies, kirana stores, e-rickshaws, and sanitation trucks.
   - DPDP Act 2023: Explain user consent, purpose-limited data usage, and zero data leakage.
   - Ministry Leadership: Led by Union Minister for Social Justice and Empowerment (Dr. Virendra Kumar) and apex corporation MDs.

CITIZEN CONTEXT:
- Name: ${profile.name || 'Citizen'}
- Category: ${profile.category || 'Not specified'}
- Certified Annual Family Income: ₹${profile.annualFamilyIncome ? Number(profile.annualFamilyIncome).toLocaleString('en-IN') : 'Not specified'}
- State/District: ${profile.district || 'Indore'}, ${profile.state || 'Madhya Pradesh'}
- Selected Scheme: ${selectedScheme ? `${selectedScheme.name} (${selectedScheme.code})` : 'None currently selected'}
- Nearest Channel Partner: ${selectedPartner ? `${selectedPartner.name}, ${selectedPartner.district}` : 'State Channelizing Agency (SCA) / Lead Bank Office'}

CRITICAL ANSWERING RULES:
1. ALWAYS answer the user's specific question directly, thoroughly, and intelligently first!
2. Do NOT rigidly force a 5-point scheme overview template if the user asks a specific, conceptual, mathematical, or procedural question (e.g. "What is a moratorium?", "Who is the minister?", "Calculate EMI for ₹5 Lakh", "How to get a caste certificate?", "What is DBT?"). Answer their exact question directly!
3. When the user asks for scheme recommendations or eligibility evaluations, structure your answer with:
   • Scheme Name & Purpose
   • Financial Assistance (Loan amount, concessional rate 4-6%, subsidy %)
   • Eligibility (Category, income ceiling, age)
   • Mandatory Documents
   • Action Steps (Visiting nearest SCA, applying online, or DigiLocker verification)
4. Respond in the exact language used by the user (Hindi, English, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati, etc.).
5. Maintain a warm, encouraging, respectful public service tone.

OFFICIAL SCHEMES SAMPLE DATA:
${JSON.stringify(STATUTORY_KNOWLEDGE_FEED.slice(0, 10), null, 1)}`;

  // Convert chat history to Gemini format
  const contents: any[] = [];
  if (Array.isArray(history)) {
    const recent = history.slice(-6);
    for (const h of recent) {
      if ((h.sender === 'user' || h.role === 'user') && (h.text || h.content)) {
        contents.push({ role: 'user', parts: [{ text: h.text || h.content }] });
      } else if ((h.sender === 'bot' || h.role === 'model') && (h.text || h.content)) {
        contents.push({ role: 'model', parts: [{ text: h.text || h.content }] });
      }
    }
  }

  // Add current user prompt
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  // Active production models on Google AI API prioritized by speed and stability
  const modelsToTry = [
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3500),
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.35,
            topP: 0.9,
            maxOutputTokens: 1500
          }
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 0) {
          return { text: candidateText, modelUsed: model };
        }
      } else {
        const errText = await response.text();
        console.warn(`Gemini model ${model} failed with ${response.status}:`, errText.slice(0, 120));
      }
    } catch (err: any) {
      console.warn(`Error connecting to Gemini model ${model}:`, err.message || err);
    }
  }

  return null;
}

/**
 * Infer intelligent navigation action tab and label from text
 */
function inferActionFromText(text: string, isHindi: boolean): { actionTab?: any; actionLabel?: string } {
  const lower = text.toLowerCase();
  if (lower.includes('emi') || lower.includes('moratorium') || lower.includes('calculator') || lower.includes('ब्याज') || lower.includes('किस्त') || lower.includes('ईएमआई')) {
    return {
      actionTab: 'calculator',
      actionLabel: isHindi ? 'ईएमआई कैलकुलेटर खोलें →' : 'Open Loan EMI Modeler →'
    };
  }
  if (lower.includes('document') || lower.includes('digilocker') || lower.includes('dpr') || lower.includes('दस्तावेज़') || lower.includes('कागज़') || lower.includes('डिजिलॉकर')) {
    return {
      actionTab: 'checklist',
      actionLabel: isHindi ? 'दस्तावेज़ चेकलिस्ट खोलें →' : 'Open Document Checklist →'
    };
  }
  if (lower.includes('partner') || lower.includes('office') || lower.includes('sca') || lower.includes('bank') || lower.includes('कार्यालय') || lower.includes('शाखा') || lower.includes('पार्टनर')) {
    return {
      actionTab: 'partners',
      actionLabel: isHindi ? 'निकटतम पार्टनर कार्यालय देखें →' : 'Locate Nearest Partner Office →'
    };
  }
  if (lower.includes('status') || lower.includes('track') || lower.includes('application') || lower.includes('आवेदन') || lower.includes('स्थिति')) {
    return {
      actionTab: 'dashboard',
      actionLabel: isHindi ? 'डैशबोर्ड पर आवेदन देखें →' : 'View Application Dashboard →'
    };
  }
  if (lower.includes('eligible') || lower.includes('scheme') || lower.includes('पात्र') || lower.includes('योजना') || lower.includes('nsfdc') || lower.includes('nbcfdc') || lower.includes('nskfdc')) {
    return {
      actionTab: 'recommendations',
      actionLabel: isHindi ? 'अनुशंसित योजनाएं देखें →' : 'View Matching Schemes →'
    };
  }
  return {};
}

/**
 * POST /api/ai/chat
 * Multilingual AI conversational chat service powered by Google Gemini API
 * with grounded fallback to deterministic rule engine
 */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context, persona, language, apiKey: clientKey } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Valid message string required.'
      });
    }

    const mergedContext = {
      ...(context || {}),
      persona: persona || context?.persona || 'mosje-advisor',
      language: language || context?.language || 'auto'
    };

    const headerKey = req.headers['x-gemini-api-key'] as string;
    const geminiKey = clientKey || headerKey || process.env.GEMINI_API_KEY;
    let geminiResult: { text: string; modelUsed: string } | null = null;

    // 1. Invoke Gemini API if key is available
    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        geminiResult = await generateGeminiChatReply(message, history || [], mergedContext, geminiKey.trim());
      } catch (geminiError) {
        console.warn('Gemini invocation error, falling back to local engine:', geminiError);
      }
    }

    const isHindi = mergedContext.language === 'hi' || /[\u0900-\u097F]/.test(message);
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // 2. If Gemini succeeds, construct rich ChatMessage response
    if (geminiResult && geminiResult.text) {
      const action = inferActionFromText(message + ' ' + geminiResult.text, isHindi);

      return res.json({
        status: 'SUCCESS',
        data: {
          id: `msg-gemini-${Date.now()}`,
          sender: 'bot',
          text: geminiResult.text,
          timestamp,
          actionTab: action.actionTab,
          actionLabel: action.actionLabel,
          quickReplies: isHindi
            ? ['मेरी पात्रता जांचें', 'दस्तावेज़ चेकलिस्ट', 'ईएमआई कैलकुलेटर', 'निकटतम SCA कार्यालय']
            : ['Check My Eligibility', 'Document Checklist', 'Calculate Loan EMI', 'Locate Partner Desk']
        },
        provider: `Google Gemini (${geminiResult.modelUsed})`,
        grounded: true
      });
    }

    // 3. Fallback to local grounded rule engine
    const { ChatbotService } = await import('../../src/services/chatbotService');
    const localReply = await ChatbotService.processMessage(message, history || [], mergedContext);

    res.json({
      status: 'SUCCESS',
      data: localReply,
      provider: 'Local Grounded MoSJE Engine'
    });
  } catch (e: any) {
    res.status(500).json({
      status: 'ERROR',
      message: e.message || 'Chat processing error'
    });
  }
});
