import { ChatMessage, ChatContext } from './chatbotService';
import { REAL_MOSJE_SCHEMES } from '../data/schemesData';

// Default project key from environment configuration (empty by default, loaded from env or user input)
const DEFAULT_KEY = '';
const STORAGE_KEY = 'sahayak_gemini_api_key';

// Active high-speed Gemini production models prioritized by speed and stability
const MODELS = ['gemini-flash-latest', 'gemini-pro-latest'];

export class GeminiClientService {
  /**
   * Get active Gemini API key (user-entered in localStorage, Vite env, or default project key)
   */
  public static getApiKey(): string {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored.trim().length > 8) {
          return stored.trim();
        }
      }
    } catch {}

    const envKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 8) {
      return envKey.trim();
    }

    return DEFAULT_KEY;
  }

  /**
   * Store user's custom API key
   */
  public static setApiKey(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        if (key && key.trim().length > 0) {
          localStorage.setItem(STORAGE_KEY, key.trim());
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {}
  }

  /**
   * Check if an active API key is available
   */
  public static hasApiKey(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 8);
  }

  /**
   * Test API key connectivity by issuing a tiny prompt
   */
  public static async testApiKey(key: string): Promise<{ success: boolean; model?: string; error?: string }> {
    const cleanKey = key.trim();
    if (!cleanKey) {
      return { success: false, error: 'API key is empty' };
    }

    for (const model of MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3500),
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
          })
        });

        if (res.ok) {
          return { success: true, model };
        }
      } catch (e: any) {
        // continue to next model
      }
    }

    return { success: false, error: 'Could not connect to Gemini API with this key. Check key permissions or network.' };
  }

  /**
   * Direct browser-side generation with Google Gemini API
   */
  public static async generateChatReply(
    userMessage: string,
    history: ChatMessage[],
    context: ChatContext
  ): Promise<ChatMessage> {
    const apiKey = this.getApiKey();
    const { profile, selectedScheme, selectedPartner, language } = context;
    const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(userMessage);

    const persona = (context as any)?.persona || 'mosje-advisor';
    let personaTitle = 'SAHAYAK AI (सहायक एआई) - MoSJE Official Welfare Advisor';
    if (persona === 'loan-modeler') {
      personaTitle += ' (Loan & EMI Specialist)';
    } else if (persona === 'citizen-support') {
      personaTitle += ' (Citizen Grievance & Application Officer)';
    }

    // Condensed scheme knowledge
    const schemeCatalog = REAL_MOSJE_SCHEMES.map(s => ({
      code: s.code,
      name: s.name,
      agency: s.agency,
      targetCommunity: s.targetCommunity,
      maxLoanAmount: s.maxLoanAmount,
      interestRate: s.interestSlabs?.[0]?.ratePercent ? `${s.interestSlabs[0].ratePercent}% p.a.` : '4-6%',
      moratoriumMonths: s.moratoriumMonths,
      maxTenureYears: s.maxTenureYears,
      incomeCeiling: s.incomeCeiling,
      gender: s.genderRestriction,
      requiredDocs: s.requiredDocuments?.slice(0, 4)
    }));

    const systemPrompt = `You are ${personaTitle}, an intelligent, deeply knowledgeable multilingual voice AI welfare assistant for the Ministry of Social Justice and Empowerment (MoSJE), Government of India (SIH26092).

YOUR MISSION:
Answer ALL questions asked by citizens, students, entrepreneurs, bankers, and officials with complete accuracy, warmth, and clarity.

KNOWLEDGE DOMAINS COVERED:
1. APEX CORPORATIONS:
   - NSFDC (SC): General Term Loan (up to ₹50L, 6-8%), Mahila Samriddhi Yojana (SC women ₹1.4L at 4%), Micro Credit, Mahila Kisan Yojana, Green Business Scheme, Udyam Nidhi.
   - NBCFDC (OBC/EBC): General Loan Scheme, New Swarnima for Women (₹2L at 5%), Mahila Samriddhi (₹1.4L at 4%), Shilp Sampada (artisans), Krishi Sampada.
   - NSKFDC (Sanitation & Safai Karamcharis): General Term Loan, Swachhta Udyami Yojana (SUY - mechanized sanitation vehicles up to ₹50L with 25-50% subsidy up to ₹5L), SRMS (rehabilitation grant ₹40,000 + stipend + ₹5L capital subsidy), Sanrakshan Yojana (safety gear).
2. EDUCATION & SKILLING:
   - PM-DAKSH: Free certified high-tech skill courses + ₹1,000-₹1,500/mo DBT stipend + wage/self-employment placement.
   - PM-YASASVI: Top Class school scholarship up to ₹1.25L/yr for OBC/EBC/DNT (Grades 9-12).
   - National Overseas Scholarship (NOS): 100% tuition + annual living stipend (~$15,400 USD / £9,900 GBP) for 125 SC/DNT scholars for Master's/Ph.D. abroad.
   - Free Coaching Scheme for SC/OBC (UPSC, SSC, Banking, JEE, NEET) + ₹4,000/mo stipend.
3. VULNERABLE & SPECIAL GROUPS:
   - SMILE: Transgender welfare (Garima Greh shelter homes, skill development, medical support, ₹5L Ayushman PM-JAY cards) & Beggary rehabilitation.
   - Rashtriya Vayoshri Yojana (RVY): Free assisted living physical devices (wheelchairs, hearing aids, walkers, spectacles, dentures) for senior citizens.
   - ADIP Scheme: Free motorized tricycles (up to ₹42,000 subsidy), smart canes, hearing aids, prosthetic limbs for Persons with Disabilities (Divyangjan 40%+).
   - Helplines: NHAA 14566 (Atrocities), Elderline 14567, Drug De-addiction 14446, Kiran 1800-599-0019, MoSJE 1800-11-2001.
4. ENTERPRISE & CREDIT:
   - PM-MUDRA Yojana (Shishu ₹50k, Kishore ₹5L, Tarun ₹10L, Tarun Plus ₹20L collateral-free).
   - Stand-Up India (Bank loans ₹10L to ₹1Cr for SC/ST and Women for greenfield enterprise).
   - PMEGP (up to 35% capital subsidy).
   - PM Vishwakarma (18 artisan trades: toolkits ₹15,000 e-voucher + 5% collateral-free loans up to ₹3L).
   - PM SVANidhi (Street vendors micro-credit ₹10k, ₹20k, ₹50k with 7% interest subsidy).
5. FINANCIAL, BANKING & PROCESS ADVICE:
   - Moratorium explanation: Beneficiary pays zero principal during first 6 months, only nominal interest or deferred, protecting initial working capital.
   - Interest & EMI calculation, capital subsidies vs interest subvention, collateral-free credit under CGTMSE.
   - Step-by-step document procurement (Aadhaar, Caste, Income certificates via Tehsildar/e-District), DigiLocker instant verification, DPR drafting.
   - Ministry leadership: Union Minister Dr. Virendra Kumar, DPDP Act 2023 privacy rights.

CITIZEN PROFILE CONTEXT:
- Name: ${profile.name || 'Citizen'}
- Category: ${profile.category || 'General/OBC/SC'}
- Certified Family Annual Income: ₹${profile.annualFamilyIncome ? Number(profile.annualFamilyIncome).toLocaleString('en-IN') : '2,40,000'}
- State/District: ${profile.district || 'Indore'}, ${profile.state || 'Madhya Pradesh'}
- Selected Scheme: ${selectedScheme ? `${selectedScheme.name} (${selectedScheme.code})` : 'Not yet selected'}
- Channel Partner: ${selectedPartner ? `${selectedPartner.name}` : 'State Channelizing Agency (SCA)'}

CRITICAL ANSWERING RULES:
1. ALWAYS answer the user's specific question directly, thoroughly, and intelligently first!
2. Do NOT rigidly force a 5-point scheme overview template if the user asks a specific, conceptual, mathematical, or procedural question (e.g. "What is a moratorium?", "Who is the minister?", "Calculate EMI for ₹5 Lakh", "How to get a caste certificate?", "What is DBT?"). Answer their exact question directly!
3. When the user asks for scheme recommendations or eligibility evaluations, structure your answer with:
   • Scheme Name & Purpose
   • Financial Assistance (Loan amount, concessional rate 4-6%, subsidy %)
   • Eligibility (Category, income ceiling, age)
   • Mandatory Documents
   • Action Steps (Visiting nearest SCA, applying online, or DigiLocker verification)
4. Respond in native fluency matching the user's inquiry language (Hindi, English, Hinglish, Marathi, Tamil, Telugu, Gujarati, Bengali, etc.).
5. Maintain a warm, encouraging, respectful public service tone.

OFFICIAL SCHEMES DATA:
${JSON.stringify(schemeCatalog, null, 1)}`;

    // Build contents payload
    const contents: any[] = [];
    const recent = history.slice(-6);
    for (const h of recent) {
      if (h.sender === 'user' && h.text) {
        contents.push({ role: 'user', parts: [{ text: h.text }] });
      } else if (h.sender === 'bot' && h.text) {
        contents.push({ role: 'model', parts: [{ text: h.text }] });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    let generatedText = '';
    let usedModel = '';

    for (const model of MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3500),
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.35,
              topP: 0.9,
              maxOutputTokens: 1200
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 0) {
            generatedText = candidateText.trim();
            usedModel = model;
            break;
          }
        }
      } catch (err) {
        console.warn(`Gemini client model ${model} error:`, err);
      }
    }

    if (!generatedText) {
      throw new Error('All Gemini models failed to generate response');
    }

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Infer action tab
    const lower = (userMessage + ' ' + generatedText).toLowerCase();
    let actionTab: ChatMessage['actionTab'] = undefined;
    let actionLabel: string | undefined = undefined;

    if (lower.includes('emi') || lower.includes('moratorium') || lower.includes('calculator') || lower.includes('ब्याज') || lower.includes('किस्त') || lower.includes('ईएमआई')) {
      actionTab = 'calculator';
      actionLabel = isHindi ? 'ईएमआई कैलकुलेटर खोलें →' : 'Open Loan EMI Modeler →';
    } else if (lower.includes('document') || lower.includes('digilocker') || lower.includes('dpr') || lower.includes('दस्तावेज़') || lower.includes('कागज़') || lower.includes('डिजिलॉकर')) {
      actionTab = 'checklist';
      actionLabel = isHindi ? 'दस्तावेज़ चेकलिस्ट खोलें →' : 'Open Document Checklist →';
    } else if (lower.includes('partner') || lower.includes('office') || lower.includes('sca') || lower.includes('bank') || lower.includes('कार्यालय') || lower.includes('शाखा') || lower.includes('पार्टनर')) {
      actionTab = 'partners';
      actionLabel = isHindi ? 'निकटतम पार्टनर कार्यालय देखें →' : 'Locate Nearest Partner Office →';
    } else if (lower.includes('status') || lower.includes('track') || lower.includes('application') || lower.includes('आवेदन') || lower.includes('स्थिति')) {
      actionTab = 'dashboard';
      actionLabel = isHindi ? 'डैशबोर्ड पर आवेदन देखें →' : 'View Application Dashboard →';
    } else if (lower.includes('eligible') || lower.includes('scheme') || lower.includes('पात्र') || lower.includes('योजना') || lower.includes('nsfdc') || lower.includes('nbcfdc') || lower.includes('nskfdc')) {
      actionTab = 'recommendations';
      actionLabel = isHindi ? 'अनुशंसित योजनाएं देखें →' : 'View Matching Schemes →';
    }

    return {
      id: `msg-gemini-${Date.now()}`,
      sender: 'bot',
      text: generatedText,
      timestamp,
      actionTab,
      actionLabel,
      quickReplies: isHindi
        ? ['मेरी पात्रता जांचें', 'दस्तावेज़ चेकलिस्ट', 'ईएमआई कैलकुलेटर', 'निकटतम पार्टनर कार्यालय']
        : ['Check My Eligibility', 'Document Checklist', 'Calculate Loan EMI', 'Locate Partner Desk']
    };
  }
}
