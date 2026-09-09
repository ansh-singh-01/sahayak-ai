import { Scheme } from '../types/scheme';
import { RankedPartner } from '../types/partner';
import { CitizenProfile } from '../types/user';
import { BeneficiaryApplicationItem } from '../types/beneficiary';
import { REAL_MOSJE_SCHEMES } from '../data/schemesData';
import { CHANNEL_PARTNERS_DATABASE } from '../data/partnersData';
import { Language } from './i18nService';
import { LoanCalculatorService } from './loanCalculator';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionTab?: 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'dashboard' | 'auth';
  actionLabel?: string;
  citedSchemeCode?: string;
  citedRuleId?: string;
  quickReplies?: string[];
}

export interface ChatContext {
  profile: CitizenProfile;
  selectedScheme: Scheme | null;
  selectedPartner: RankedPartner | null;
  activeApplication?: BeneficiaryApplicationItem | null;
  language: Language;
}

export class ChatbotService {
  /**
   * Main conversational reasoning engine with grounded MoSJE knowledge retrieval
   */
  public static async processMessage(
    userMessage: string,
    history: ChatMessage[],
    context: ChatContext
  ): Promise<ChatMessage> {
    const text = userMessage.trim().toLowerCase();
    const { language, profile, selectedScheme, selectedPartner, activeApplication } = context;
    const isHindi = language === 'hi';

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const replyId = `msg-${Date.now()}`;

    // 1. GREETING INTENT
    if (/^(hi|hello|hey|namaste|नमस्ते|प्रणाम|salut|kem cho|vanakkam|namaskaram)/i.test(text)) {
      const greeting = isHindi
        ? `नमस्ते ${profile.name || 'नागरिक'}! मैं सहायक (SAHAYAK) एआई सलाहकार हूँ। मैं सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) की योजनाओं, ऋण ईएमआई, आवश्यक दस्तावेज़ों, और निकटतम चैनल पार्टनर कार्यालय की सटीक जानकारी में आपकी सहायता कर सकता हूँ। आप क्या जानना चाहते हैं?`
        : `Namaste ${profile.name || 'Citizen'}! I am Sahayak AI, your official MoSJE welfare assistant. I can guide you through central scheme eligibility, concessional loan EMIs, mandatory document checklists, and district channel partner offices. How may I assist you today?`;

      return {
        id: replyId,
        sender: 'bot',
        text: greeting,
        timestamp,
        quickReplies: isHindi
          ? ['मेरी पात्रता जांचें', 'दस्तावेज़ चेकलिस्ट', 'ईएमआई कैलकुलेटर', 'निकटतम पार्टनर कार्यालय']
          : ['Check My Eligibility', 'Document Checklist', 'Calculate Loan EMI', 'Locate Nearest Partner']
      };
    }

    // 2. APPLICATION STATUS INTENT
    if (text.includes('status') || text.includes('स्थिति') || text.includes('application') || text.includes('आवेदन') || text.includes('track') || text.includes('कहाँ पहुँचा')) {
      if (activeApplication) {
        const statusText = isHindi
          ? `आपके सक्रिय आवेदन (${activeApplication.referenceNumber}) की वर्तमान स्थिति:
📌 योजना: ${activeApplication.schemeName} (${activeApplication.agency})
📌 वर्तमान चरण: ${activeApplication.stage}
📌 तैयार दस्तावेज़: ${activeApplication.documentsReady} में से ${activeApplication.documentsTotal}
📌 नामित कार्यालय: ${activeApplication.partnerName || 'मध्य प्रदेश पिछड़ा वर्ग विकास निगम'}
अंतिम अद्यतन: ${activeApplication.lastUpdated}। आप अपने डैशबोर्ड पर संपूर्ण टाइमलाइन और क्यूआर पर्ची देख सकते हैं।`
          : `Here is the live status for your application (${activeApplication.referenceNumber}):
📌 Scheme: ${activeApplication.schemeName} (${activeApplication.agency})
📌 Current Stage: ${activeApplication.stage}
📌 Document Readiness: ${activeApplication.documentsReady} of ${activeApplication.documentsTotal} verified
📌 Designated Desk: ${activeApplication.partnerName || 'Designated SCA Office'}
Last updated: ${activeApplication.lastUpdated}. You can view the full timeline and printable QR pass on your Dashboard.`;

        return {
          id: replyId,
          sender: 'bot',
          text: statusText,
          timestamp,
          actionTab: 'dashboard',
          actionLabel: isHindi ? 'डैशबोर्ड पर आवेदन देखें →' : 'View Application on Dashboard →',
          quickReplies: isHindi ? ['दस्तावेज़ चेकलिस्ट देखें', 'पार्टनर से संपर्क करें'] : ['Check Required Documents', 'Contact Partner Desk']
        };
      } else {
        const noAppText = isHindi
          ? `वर्तमान में आपका कोई सक्रिय आवेदन लंबित नहीं है। आप अपनी पात्रता जांचकर 5 मिनट में नया आवेदन प्रारंभ कर सकते हैं।`
          : `You do not have an active application currently. You can run the deterministic eligibility engine to discover matching schemes in 5 minutes.`;

        return {
          id: replyId,
          sender: 'bot',
          text: noAppText,
          timestamp,
          actionTab: 'wizard',
          actionLabel: isHindi ? 'नई योजना खोजें →' : 'Find My Scheme →'
        };
      }
    }

    // 3. ELIGIBILITY INTENT
    if (text.includes('eligible') || text.includes('पात्र') || text.includes('qualify') || text.includes('scheme') || text.includes('योजना') || text.includes('मिल सकता')) {
      const cat = profile.category;
      const incomeLakh = (profile.annualFamilyIncome / 100000).toFixed(2);
      
      const matchedSchemes = REAL_MOSJE_SCHEMES.filter(s => 
        s.targetCommunity.includes(cat) || s.targetCommunity.includes('ANY') || s.targetCommunity.includes('OPEN')
      );

      const topScheme = matchedSchemes[0] || REAL_MOSJE_SCHEMES[0];

      const eligibilityText = isHindi
        ? `आपकी पंजीकृत श्रेणी **${cat}** और वार्षिक पारिवारिक आय **₹${incomeLakh} लाख** के आधार पर:
1. आप **${topScheme.agency}** की **${topScheme.name}** (${topScheme.code}) के लिए पात्र हैं।
2. अधिकतम ऋण सीमा: **₹${(topScheme.maxLoanAmount / 100000).toFixed(2)} लाख**
3. रियायती ब्याज दर: **4% - 6% प्रतिवर्ष** (बाजार दरों से 50% कम)
4. मोराटोरियम छूट: **${topScheme.moratoriumMonths} महीने** व्यवसाय स्थापना हेतु।
क्या आप इस योजना के लिए ईएमआई की गणना करना चाहते हैं या दस्तावेज़ चेकलिस्ट देखना चाहते हैं?`
        : `Based on your profile category **${cat}** and certified annual family income of **₹${incomeLakh} Lakh**:
1. You qualify for **${topScheme.agency}**'s **${topScheme.name}** (${topScheme.code}).
2. Maximum Financing Ceiling: **₹${(topScheme.maxLoanAmount / 100000).toFixed(2)} Lakh**
3. Concessional Interest: **4% - 6% p.a.** (substantially lower than commercial bank rates)
4. Setup Grace Period: **${topScheme.moratoriumMonths} months moratorium** on principal repayment.
Would you like to model your monthly EMI or inspect the mandatory document checklist?`;

      return {
        id: replyId,
        sender: 'bot',
        text: eligibilityText,
        timestamp,
        citedSchemeCode: topScheme.code,
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'सभी अनुशंसित योजनाएं देखें →' : 'View Recommended Schemes →',
        quickReplies: isHindi 
          ? ['ईएमआई कैलकुलेटर खोलें', 'दस्तावेज़ चेकलिस्ट', 'पार्टनर कार्यालय खोजें']
          : ['Calculate Loan EMI', 'View Document Checklist', 'Find Nearest SCA Desk']
      };
    }

    // 4. DOCUMENT CHECKLIST & DIGILOCKER INTENT
    if (text.includes('document') || text.includes('दस्तावेज़') || text.includes('kagaz') || text.includes('कागज़') || text.includes('certificate') || text.includes('praman') || text.includes('digilocker') || text.includes('डिजिलॉकर')) {
      const scheme = selectedScheme || REAL_MOSJE_SCHEMES[0];
      const docs = scheme.requiredDocuments || [
        'Aadhaar Card (Identity & Address verification)',
        'Caste Certificate (issued by SDM/Tehsildar)',
        'Income Certificate (authorized revenue authority)',
        'Detailed Project Report (DPR) or machinery quotation',
        'Aadhaar-seeded Bank Passbook for DBT'
      ];

      const docText = isHindi
        ? `**${scheme.name}** (${scheme.code}) हेतु आवश्यक अनिवार्य दस्तावेज़:
${docs.map((d, i) => `${i + 1}. **${d}**`).join('\n')}

💡 **डिजिलॉकर टिप**: आधार, जाति और आय प्रमाण पत्र को डिजिलॉकर के माध्यम से डिजिटल रूप से सत्यापित किया जा सकता है, जिससे कागजी लाइन में लगने की आवश्यकता नहीं होती।`
        : `Mandatory documents required for **${scheme.name}** (${scheme.code}):
${docs.map((d, i) => `${i + 1}. **${d}**`).join('\n')}

💡 **DigiLocker Integration**: You can pull authentic digital copies of your Aadhaar, Caste, and Income certificates directly from DigiLocker for instant desk verification without queues.`;

      return {
        id: replyId,
        sender: 'bot',
        text: docText,
        timestamp,
        citedSchemeCode: scheme.code,
        actionTab: 'checklist',
        actionLabel: isHindi ? 'दस्तावेज़ चेकलिस्ट शुरू करें →' : 'Open Document Checklist →',
        quickReplies: isHindi
          ? ['रूटिंग पर्ची प्रिंट करें', 'ईएमआई की गणना करें', 'निकटतम कार्यालय']
          : ['Print Citizen Slip', 'Calculate EMI', 'Locate SCA Branch']
      };
    }

    // 5. LOAN & EMI CALCULATION INTENT
    if (text.includes('emi') || text.includes('loan') || text.includes('ऋण') || text.includes('किस्त') || text.includes('interest') || text.includes('ब्याज') || text.includes('calculate') || text.includes('गणक') || text.includes('moratorium') || text.includes('छूट')) {
      let loanAmount = 250000;
      const numMatch = text.match(/(\d+(\.\d+)?)\s*(lakh|lac|लाख|k|हजार)?/i);
      if (numMatch) {
        const val = parseFloat(numMatch[1]);
        if (numMatch[3] && /lakh|lac|लाख/i.test(numMatch[3])) {
          loanAmount = val * 100000;
        } else if (val > 1000) {
          loanAmount = val;
        } else if (val <= 50) {
          loanAmount = val * 100000;
        }
      }

      const scheme = selectedScheme || REAL_MOSJE_SCHEMES[0];
      const tenure = 5;
      const moratorium = scheme.moratoriumMonths || 6;
      const calcResult = LoanCalculatorService.calculate(loanAmount, tenure, moratorium, scheme);

      const emiText = isHindi
        ? `**मोराटोरियम-युक्त ऋण ईएमआई विवरण (${scheme.agency}):**
💰 मूल ऋण राशि: **₹${(loanAmount / 100000).toFixed(2)} लाख**
📊 रियायती ब्याज दर: **${calcResult.annualInterestRate}% प्रतिवर्ष**
⏳ कुल अवधि: **${tenure} वर्ष** (जिसमें प्रथम **${moratorium} माह मोराटोरियम** शामिल है)
💵 शुरुआती मोराटोरियम ब्याज: **₹${Math.round(calcResult.moratoriumMonthlyInterest)} / माह**
💳 नियमित मासिक ईएमआई: **₹${Math.round(calcResult.regularMonthlyEmi)} / माह**
🎁 सरकारी पूंजीगत सब्सिडी: **₹${Math.round(calcResult.subsidyAmount)}**

*नोट: मोराटोरियम अवधि के दौरान आपको केवल ब्याज देना होता है, मूलधन नहीं।*`
        : `**Moratorium-Aware Loan Repayment Model (${scheme.agency}):**
💰 Principal Loan Amount: **₹${(loanAmount / 100000).toFixed(2)} Lakh**
📊 Concessional Interest Rate: **${calcResult.annualInterestRate}% p.a.**
⏳ Tenure: **${tenure} Years** (including **${moratorium}-month setup moratorium**)
💵 Setup Moratorium Interest: **₹${Math.round(calcResult.moratoriumMonthlyInterest)} / month**
💳 Regular Monthly Installment (EMI): **₹${Math.round(calcResult.regularMonthlyEmi)} / month**
🎁 Estimated Govt Capital Subsidy: **₹${Math.round(calcResult.subsidyAmount)}**

*Note: During the moratorium period, only simple interest is serviced, protecting your initial business cash flows.*`;

      return {
        id: replyId,
        sender: 'bot',
        text: emiText,
        timestamp,
        citedSchemeCode: scheme.code,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'इंटरएक्टिव ईएमआई मॉडलर खोलें →' : 'Open Loan Modeler →',
        quickReplies: isHindi
          ? ['दस्तावेज़ चेकलिस्ट', 'पार्टनर कार्यालय खोजें', 'मेरी योजनाएं']
          : ['Document Audit', 'Locate Partner Desk', 'Check Eligibility']
      };
    }

    // 6. CHANNEL PARTNER & OFFICE LOCATOR INTENT
    if (text.includes('partner') || text.includes('पार्टनर') || text.includes('office') || text.includes('कार्यालय') || text.includes('branch') || text.includes('शाखा') || text.includes('kahan') || text.includes('कहाँ') || text.includes('address') || text.includes('पता') || text.includes('indore') || text.includes('इंदौर') || text.includes('bank') || text.includes('बैंक') || text.includes('locator') || text.includes('locate') || text.includes('desk')) {
      const partner = selectedPartner || CHANNEL_PARTNERS_DATABASE[0];
      const distance = selectedPartner ? selectedPartner.distanceKm : 3.8;

      const partnerText = isHindi
        ? `आपके जिले के लिए नामित राज्य चैनललाइजिंग एजेंसी (SCA) डेस्क:
🏛️ **${partner.name}**
📍 पता: ${partner.address}, पिन कोड: ${partner.pinCode}
👤 नोडल अधिकारी: **${partner.contactPerson}**
📞 हेल्पलाइन: **${partner.phone}**
⏰ कार्य समय: ${partner.workingHours}
📏 दूरी: आपके स्थान से लगभग **${distance} किमी**
⚡ स्थिति: नए आवेदनों हेतु उपलब्ध कोटा सक्रिय है।`
        : `Your designated State Channelizing Agency (SCA) branch:
🏛️ **${partner.name}**
📍 Address: ${partner.address}, PIN: ${partner.pinCode}
👤 Nodal Officer: **${partner.contactPerson}**
📞 Direct Helpline: **${partner.phone}**
⏰ Office Hours: ${partner.workingHours}
📏 Distance: **${distance} km away**
⚡ Reliability: Active quarterly fund quota confirmed.`;

      return {
        id: replyId,
        sender: 'bot',
        text: partnerText,
        timestamp,
        actionTab: 'partners',
        actionLabel: isHindi ? 'गूगल मैप्स व कार्यालय विवरण →' : 'View Office Map & Details →',
        quickReplies: isHindi
          ? ['रूटिंग पर्ची प्रिंट करें', 'दस्तावेज़ चेकलिस्ट', 'ईएमआई कैलकुलेटर']
          : ['Print Routing Pass', 'Required Documents', 'Loan Calculator']
      };
    }

    // 7. HELPLINE & GRIEVANCE INTENT
    if (text.includes('help') || text.includes('सहायता') || text.includes('complaint') || text.includes('शिकायत') || text.includes('toll') || text.includes('number') || text.includes('संपर्क') || text.includes('grievance')) {
      const helpText = isHindi
        ? `**सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) आधिकारिक संपर्क:**
📞 राष्ट्रीय टोल-फ्री हेल्पलाइन: **1800-11-2001** (सुबह 9:00 से शाम 6:00 तक)
📧 शिकायत निवारण ईमेल: **grievance-mosje@gov.in**
🏢 शीर्ष निगम:
- NSFDC (अनुसूचित जाति वित्त निगम): 1800-11-0001
- NBCFDC (पिछड़ा वर्ग वित्त निगम): 1800-11-2002
- NSKFDC (सफाई कर्मचारी वित्त निगम): 1800-11-3003
🛡️ सभी शिकायतें 7 कार्य दिवसों के भीतर निवारित की जाती हैं।`
        : `**Official Ministry of Social Justice & Empowerment (MoSJE) Support:**
📞 National Toll-Free Helpline: **1800-11-2001** (Mon-Sat 09:00 - 18:00 IST)
📧 Citizen Grievance Email: **grievance-mosje@gov.in**
🏢 Apex Corporation Desks:
- NSFDC (SC Finance): 1800-11-0001
- NBCFDC (OBC Finance): 1800-11-2002
- NSKFDC (Safai Karamchari Finance): 1800-11-3003
🛡️ Statutory Grievance Resolution Mandate: Maximum 7 working days.`;

      return {
        id: replyId,
        sender: 'bot',
        text: helpText,
        timestamp,
        quickReplies: isHindi
          ? ['मेरी पात्रता देखें', 'दस्तावेज़ चेकलिस्ट', 'आवेदन स्थिति']
          : ['Check Eligibility', 'Required Documents', 'Track Application']
      };
    }

    // 8. GENERAL / DEFAULT FALLBACK INTENT (Grounded Context)
    const fallbackText = isHindi
      ? `मैं आपके प्रश्न को सामाजिक न्याय मंत्रालय के आधिकारिक डेटाबेस के संदर्भ में समझ रहा हूँ।
आप मुझसे निम्नलिखित के संबंध में सीधे पूछ सकते हैं:
1. **योजना पात्रता**: "मेरी श्रेणी के लिए कौन सी योजना है?"
2. **ऋण व ईएमआई**: "2 लाख के लोन पर 5 साल की ईएमआई कितनी बनेगी?"
3. **दस्तावेज़**: "लोन के लिए क्या कागज़ चाहिए?"
4. **आवेदन स्थिति**: "मेरे आवेदन की स्थिति क्या है?"
5. **निकटतम कार्यालय**: "इंदौर में कौन सा ऑफिस है?"
आप माइक दबाकर सीधे बोल भी सकते हैं!`
      : `I am processing your inquiry against official MoSJE guidelines and statutory scheme catalogs.
You can ask me anything about:
1. **Scheme Eligibility**: "What schemes qualify for OBC or SC?"
2. **Loan & EMI**: "Calculate EMI for ₹2.5 Lakh over 5 years"
3. **Documents**: "What certificates are required for NSFDC?"
4. **Application Tracking**: "What is my current application stage?"
5. **Branch Locator**: "Where is the nearest partner office in my district?"
You can also tap the microphone icon below to speak your query naturally!`;

    return {
      id: replyId,
      sender: 'bot',
      text: fallbackText,
      timestamp,
      quickReplies: isHindi
        ? ['मेरी पात्रता जांचें', 'ईएमआई कैलकुलेटर', 'दस्तावेज़ सूची', 'निकटतम पार्टनर']
        : ['Check Eligibility', 'Loan Calculator', 'Document Checklist', 'Locate Partner']
    };
  }
}
