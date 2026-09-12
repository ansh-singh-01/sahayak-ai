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
   * Conversational reasoning engine covering all central & state welfare scheme types
   */
  public static async processMessage(
    userMessage: string,
    history: ChatMessage[],
    context: ChatContext
  ): Promise<ChatMessage> {
    const text = userMessage.trim().toLowerCase();
    const { language, profile, selectedScheme, selectedPartner, activeApplication } = context;
    const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(userMessage);

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const replyId = `msg-${Date.now()}`;

    // 1. GREETING INTENT
    if (/^(hi|hello|hey|namaste|नमस्ते|प्रणाम|salut|kem cho|vanakkam|namaskaram)/i.test(text)) {
      const greeting = isHindi
        ? `नमस्ते ${profile.name || 'नागरिक'}! मैं **सहायक (SAHAYAK) AI** हूँ—सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) का आधिकारिक डिजिटल सलाहकार।\n\nमैं भारत सरकार की सभी कल्याणकारी योजनाओं, रियायती ऋण (4%-6%), महिलाओं व सफाई कर्मचारियों की विशेष योजनाओं, छात्रवृत्ति (PM-DAKSH, PM-YASASVI), दस्तावेज़ सत्यापन, और निकटतम राज्य चैनललाइजिंग एजेंसी (SCA) कार्यालय की सटीक जानकारी दे सकता हूँ।\n\nआप माइक दबाकर सीधे बोल सकते हैं या नीचे दिए गए विकल्पों में से चुन सकते हैं!`
        : `Namaste ${profile.name || 'Citizen'}! I am **SAHAYAK AI**, your official digital welfare assistant for the Ministry of Social Justice and Empowerment (MoSJE).\n\nI provide complete, certified guidance on all central & state schemes: concessional business loans (4-6% p.a.), women empowerment schemes, sanitation worker modernization (SUY), scholarships (PM-DAKSH, PM-YASASVI), DigiLocker document checks, and district partner offices.\n\nYou can type your query, speak via voice, or select a quick option below!`;

      return {
        id: replyId,
        sender: 'bot',
        text: greeting,
        timestamp,
        quickReplies: isHindi
          ? ['महिला योजनाएं', 'सफाई कर्मचारी योजना (SUY)', 'कम ब्याज पर बिजनेस लोन', 'छात्रवृत्ति व ट्रेनिंग (PM-DAKSH)', 'ईएमआई कैलकुलेटर']
          : ['Women Schemes', 'Sanitation Modernization (SUY)', 'Concessional Business Loans', 'Scholarships & Skilling', 'Loan EMI Modeler']
      };
    }

    // 2. NATIONAL HELPLINES & GRIEVANCES INTENT
    if (text.includes('helpline') || text.includes('help line') || text.includes('हेल्पलाइन') || text.includes('शिकायत') || text.includes('grievance') || text.includes('complaint') || text.includes('contact') || text.includes('toll free') || text.includes('टोल फ्री') || text.includes('elderline') || text.includes('14567') || text.includes('14566') || (text.includes('number') && (text.includes('help') || text.includes('call') || text.includes('phone')))) {
      const helplineText = isHindi
        ? `### 📞 सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) राष्ट्रीय हेल्पलाइन डायरेक्टरी:

1. **अत्याचार निवारण राष्ट्रीय हेल्पलाइन (NHAA)**:
   - 📞 **टोल-फ्री नंबर**: **\`14566\`** (24x7 निःशुल्क सेवा)
   - 🛡️ **उद्देश्य**: अनुसूचित जाति (SC) एवं जनजाति (ST) के विरुद्ध भेदभाव, उत्पीड़न अथवा अत्याचार की त्वरित शिकायत व कानूनी सहायता।

2. **एल्डरलाइन (Elderline - वरिष्ठ नागरिक हेल्पलाइन)**:
   - 📞 **टोल-फ्री नंबर**: **\`14567\`** (सुबह 8 बजे से रात 8 बजे तक)
   - 👴 **उद्देश्य**: बुजुर्गों को सरकारी योजनाओं, कानूनी परामर्श, पेंशन व भावनात्मक सहायता प्रदान करना।

3. **नशा मुक्त भारत राष्ट्रीय हेल्पलाइन**:
   - 📞 **टोल-फ्री नंबर**: **\`14446\`**
   - 🌿 **उद्देश्य**: नशा मुक्ति परामर्श, निकटतम सरकारी नशा मुक्ति केंद्र (IRCA) की जानकारी।

4. **किरण (KIRAN) मानसिक स्वास्थ्य पुनर्वास हेल्पलाइन**:
   - 📞 **टोल-फ्री नंबर**: **\`1800-599-0019\`** (24x7, 13 भाषाओं में उपलब्ध)।

5. **MoSJE नागरिक कल्याण डेस्क**:
   - 📞 **हेल्पलाइन**: **\`1800-11-2001\`**
   - 🌐 **ऑनलाइन शिकायत**: [CPGRAMS Portal (pgportal.gov.in)](https://pgportal.gov.in) अथवा राज्य CM हेल्पलाइन (181).`
        : `### 📞 MoSJE National Helplines & Citizen Grievance Redressal Directory:

1. **National Helpline Against Atrocities (NHAA)**:
   - 📞 **Toll-Free**: **\`14566\`** (24/7 dedicated service)
   - 🛡️ **Mandate**: Instant assistance and FIR coordination against discrimination or harassment targeting SC/ST citizens under the PoA Act.

2. **National Elderline (Senior Citizen Support)**:
   - 📞 **Toll-Free**: **\`14567\`** (8:00 AM – 8:00 PM, all days)
   - 👴 **Mandate**: Welfare scheme guidance, pension counseling, legal aid, and rescue coordination for seniors.

3. **National Drug De-Addiction Helpline**:
   - 📞 **Toll-Free**: **\`14446\`** (Nasha Mukt Bharat Abhiyaan counseling & clinic finder).

4. **KIRAN Mental Health & Rehabilitation Helpline**:
   - 📞 **Toll-Free**: **\`1800-599-0019\`** (24/7 psychological support in 13 Indian languages).

5. **MoSJE Central Citizen Desk**:
   - 📞 **Toll-Free**: **\`1800-11-2001\`**
   - 🌐 **Online Grievance**: [CPGRAMS (pgportal.gov.in)](https://pgportal.gov.in) or State CM Helpline (e.g. 181).`;

      return {
        id: replyId,
        sender: 'bot',
        text: helplineText,
        timestamp,
        quickReplies: isHindi
          ? ['निकटतम SCA कार्यालय', 'आवेदन की स्थिति', 'पात्रता जांचें']
          : ['Locate SCA Office', 'Application Status', 'Check Eligibility']
      };
    }

    // 3. MORATORIUM PERIOD INTENT (Exact conceptual explanation)
    if ((text.includes('moratorium') || text.includes('मोराटोरियम') || text.includes('grace period') || text.includes('छूट अवधि')) && !text.includes('calculate') && !text.includes('गणना')) {
      const moraText = isHindi
        ? `### 🛡️ मोराटोरियम अवधि (Moratorium Period) क्या है?

**मोराटोरियम** (पुनर्भुगतान छूट अवधि) ऋण वितरण के बाद मिलने वाला वह शुरुआती समय है जिसमें लाभार्थी को **मूलधन (Principal EMI) नहीं चुकाना होता है**।

1. **MoSJE योजनाओं में नियम**:
   - अधिकांश योजनाओं (NSFDC, NBCFDC, NSKFDC) में **6 माह का मोराटोरियम** अनिवार्य रूप से दिया जाता है।
   - भारी मशीनरी या वाहन आधारित परियोजनाओं (जैसे स्वच्छता उद्यमी योजना) में इसे **12 माह तक** बढ़ाया जा सकता है।

2. **मोराटोरियम के दौरान क्या देना होता है?**:
   - आपको कोई मूलधन (Principal) नहीं देना होता।
   - केवल साधारण रियायती ब्याज (4%-6% प्रतिवर्ष) देना होता है, जो अत्यंत कम होता है।

3. **उदाहरण (₹3.00 लाख ऋण पर)**:
   - **प्रथम 6 माह**: केवल ~₹1,500/माह ब्याज (व्यवसाय सेटअप का समय)।
   - **7वें माह से**: नियमित पूर्ण ईएमआई (मूलधन + ब्याज) शुरू होती है।

4. **व्यावहारिक लाभ**:
   - नया व्यवसाय शुरू करते समय दुकान की सजावट, कच्चा माल खरीदने और ग्राहक बनाने में समय लगता है। मोराटोरियम से आपकी शुरुआती पूंजी सुरक्षित रहती है और ऋण चुकाने का तनाव नहीं होता।`
        : `### 🛡️ What is a Moratorium Period (Grace Period)?

A **Moratorium Period** is a structured repayment holiday granted immediately after loan disbursement during which the borrower is **NOT required to pay regular principal monthly installments (EMIs)**.

1. **MoSJE Scheme Guidelines**:
   - Statutory schemes under NSFDC, NBCFDC, and NSKFDC provide a standard **6-month setup moratorium**.
   - For capital-intensive enterprises (e.g., mechanized sewer suction trucks under Swachhta Udyami Yojana), this can extend up to **12 months**.

2. **What Do You Pay During Moratorium?**:
   - **Zero Principal**: No repayment of the sanctioned loan principal.
   - **Nominal Concessional Interest**: Only simple subsidized interest (4.0% to 6.0% p.a.) is charged, preserving your operational cash flow.

3. **Concrete Calculation (₹3.00 Lakh Loan)**:
   - **Months 1 to 6 (Moratorium)**: Only ~₹1,500/month nominal interest while you procure machinery and establish cash flow.
   - **Month 7 onward**: Regular full EMI (~₹5,800/month) commences.

4. **Key Advantage**:
   - Eliminates early-stage default risk for marginalized entrepreneurs by allowing ventures to become self-sustaining before debt obligations begin.`;

      return {
        id: replyId,
        sender: 'bot',
        text: moraText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'ईएमआई कैलकुलेटर में मोराटोरियम देखें →' : 'Simulate Moratorium in Calculator →',
        quickReplies: isHindi
          ? ['ईएमआई कैलकुलेटर खोलें', 'दस्तावेज़ चेकलिस्ट', 'कम ब्याज वाले ऋण']
          : ['Open Loan Calculator', 'Document Checklist', 'Low Interest Loans']
      };
    }

    // 4. DIRECT BENEFIT TRANSFER (DBT) INTENT
    if (text.includes('dbt') || text.includes('डीबीटी') || text.includes('direct benefit transfer') || text.includes('प्रत्यक्ष लाभ')) {
      const dbtText = isHindi
        ? `### 💳 डायरेक्ट बेनिफिट ट्रांसफर (DBT - प्रत्यक्ष लाभ हस्तांतरण) क्या है?

**DBT** भारत सरकार की वह आधुनिक पारदर्शी प्रणाली है जिसके तहत कल्याणकारी योजनाओं की सब्सिडी, छात्रवृत्ति और प्रशिक्षण स्टाइपेंड **सीधे लाभार्थी के बैंक खाते में** इलेक्ट्रॉनिक रूप से भेजी जाती है।

1. **MoSJE में DBT के मुख्य लाभ**:
   - 🚫 **बिचौलियों की समाप्ति**: कोई दलाल या तीसरा व्यक्ति आपके पैसे को रोक या काट नहीं सकता।
   - ⚡ **त्वरित भुगतान**: राशि PFMS (Public Financial Management System) के माध्यम से बिना किसी देरी के सीधे ट्रांसफर होती है।
   - 💰 **100% पूर्ण राशि**: छात्रवृत्ति (PM-DAKSH, PM-YASASVI, NOS) और ऋण सब्सिडी (SUY, महिला समृद्धि) बिना किसी कटौती के मिलती है।

2. **DBT प्राप्त करने के लिए 3 आवश्यक शर्तें**:
   - 🔹 बैंक खाता आपके **आधार कार्ड से लिंक (Seeded)** होना चाहिए।
   - 🔹 बैंक खाते में **NPCI मैपर (Aadhaar Payment Bridge)** सक्रिय होना चाहिए।
   - 🔹 आपका मोबाइल नंबर आधार और बैंक दोनों में एक समान होना चाहिए।

💡 *सुझाव*: अपने बैंक शाखा जाकर कहें—*"मेरा खाता DBT / NPCI से लिंक कर दें"* या SAHAYAK के दस्तावेज़ चेकलिस्ट से जांचें।`
        : `### 💳 What is Direct Benefit Transfer (DBT)?

**Direct Benefit Transfer (DBT)** is the Government of India's flagship electronic mechanism to transfer welfare subsidies, educational scholarships, and skill stipends **directly into the verified bank account of the beneficiary**.

1. **Key Advantages in MoSJE Schemes**:
   - 🚫 **Zero Intermediary Leakage**: Eliminates middlemen, agents, and cash handoffs completely.
   - ⚡ **Instant Electronic Settlement**: Executed via the Public Financial Management System (PFMS) directly from Ministry treasuries.
   - 💰 **100% Grant Protection**: Applicable across PM-DAKSH stipends, PM-YASASVI scholarships, and capital subsidies (SUY, Mahila Samriddhi).

2. **Mandatory Checklist for DBT Compliance**:
   - 🔹 Bank account must be seeded with **Aadhaar**.
   - 🔹 **NPCI Aadhaar Payment Bridge (APB) mapper** must be active.
   - 🔹 Active mobile number linked to Aadhaar for OTP verification.

💡 *Pro Tip*: Verify DBT status by visiting your home bank branch or checking your passbook inside SAHAYAK's Document Checklist.`;

      return {
        id: replyId,
        sender: 'bot',
        text: dbtText,
        timestamp,
        actionTab: 'checklist',
        actionLabel: isHindi ? 'दस्तावेज़ चेकलिस्ट देखें →' : 'Check Bank Seeding in Checklist →',
        quickReplies: isHindi
          ? ['दस्तावेज़ चेकलिस्ट', 'पात्रता जांचें', 'ईएमआई कैलकुलेटर']
          : ['Document Checklist', 'Check Eligibility', 'Loan Calculator']
      };
    }

    // 5. COLLATERAL & GUARANTEE INTENT (Can I get a loan without collateral?)
    if (text.includes('collateral') || text.includes('guarantee') || text.includes('संपार्श्विक') || text.includes('बिना गारंटी') || text.includes('जमानत') || text.includes('without collateral') || text.includes('security') || text.includes('cgtmse')) {
      const colText = isHindi
        ? `### 🛡️ क्या बिना गारंटी (Collateral-Free) ऋण मिल सकता है?

**हाँ, बिल्कुल!** सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) एवं भारत सरकार की अधिकांश स्वरोजगार योजनाओं में **पुश्तैनी ज़मीन, मकान या तीसरे व्यक्ति की गारंटी की आवश्यकता नहीं होती है**।

1. **MoSJE शीर्ष निगमों (NSFDC / NBCFDC / NSKFDC) के नियम**:
   - **₹1.40 लाख तक (महिला समृद्धि / माइक्रो क्रेडिट)**: केवल व्यक्तिगत स्व-घोषणा एवं आधार सत्यापन पर संपार्श्विक-मुक्त (No Third-Party Collateral)।
   - **₹1.50 लाख से ₹50 लाख तक (मियादी ऋण)**: ऋण से खरीदे जाने वाले वाहन, मशीनरी या दुकान के स्टॉक का **दृष्टिबंधन (Hypothecation)** ही प्राथमिक प्रतिभूति माना जाता है। आपको अपनी व्यक्तिगत संपत्ति बंधक नहीं रखनी होती।

2. **सरकारी क्रेडिट गारंटी योजनाएं (CGTMSE / CGFMU)**:
   - भारत सरकार का राष्ट्रीय क्रेडिट गारंटी ट्रस्ट बैंकों को डिफ़ॉल्ट पर 75% से 85% तक की गारंटी देता है।
   - **पीएम मुद्रा योजना** (₹10 लाख तक) और **पीएम विश्वकर्मा** (₹3 लाख तक) 100% संपार्श्विक-मुक्त हैं।

3. **लाभार्थी अंशदान (मार्जिन मनी)**:
   - कुल लागत का केवल **5% से 10%** स्वयं लगाना होता है; शेष 90% से 95% राशि सरकारी निगम व बैंक द्वारा स्वीकृत की जाती है।`
        : `### 🛡️ Can I Get a Concessional Loan Without Collateral?

**YES, absolutely!** Under MoSJE apex corporations and central welfare frameworks, marginalized beneficiaries **do NOT need to pledge ancestral property, residential land, or provide third-party guarantors**.

1. **MoSJE Apex Corporation Norms (NSFDC, NBCFDC, NSKFDC)**:
   - **Micro-Loans up to ₹1.40 Lakh (e.g. Mahila Samriddhi)**: 100% collateral-free, sanctioned on personal undertaking and verified KYC credentials.
   - **Medium & Term Loans up to ₹50 Lakh**: The primary security is simply the **hypothecation of assets created** (machinery, vehicles, livestock, or inventory purchased from the loan). Your private home/land is NEVER mortgaged.

2. **National Credit Guarantee Support (CGTMSE / CGFMU)**:
   - Government of India credit guarantee trusts cover between 75% and 85% of risk directly with lending banks.
   - **PM-MUDRA** (up to ₹10 Lakh) and **PM Vishwakarma** (up to ₹3 Lakh) are statutory collateral-free loans.

3. **Low Promoter Margin**:
   - Beneficiaries only contribute **5% to 10% own margin money**; the remaining 90% to 95% is financed at concessional rates (4%–6% p.a.).`;

      return {
        id: replyId,
        sender: 'bot',
        text: colText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'ऋण ईएमआई की गणना करें →' : 'Calculate Loan EMI →',
        quickReplies: isHindi
          ? ['मेरी पात्रता जांचें', 'दस्तावेज़ चेकलिस्ट', 'निकटतम SCA कार्यालय']
          : ['Check My Eligibility', 'Document Checklist', 'Locate SCA Branch']
      };
    }

    // 6. CAPITAL SUBSIDY VS INTEREST SUBVENTION INTENT
    if ((text.includes('subsidy') || text.includes('सब्सिडी')) && (text.includes('subvention') || text.includes('छूट') || text.includes('ब्याज अनुदान') || text.includes('difference') || text.includes('अंतर')) || text.includes('capital subsidy') || text.includes('interest subvention')) {
      const subText = isHindi
        ? `### 💰 पूंजीगत सब्सिडी (Capital Subsidy) और ब्याज अनुदान (Interest Subvention) में अंतर:

| मापदंड | **पूंजीगत सब्सिडी (Capital Subsidy)** | **ब्याज अनुदान (Interest Subvention)** |
| :--- | :--- | :--- |
| **क्या है?** | सरकार द्वारा दिया जाने वाला एकमुश्त नकद अनुदान जो सीधे मूलधन (Principal) को कम करता है। | वार्षिक ब्याज दर में मिलने वाली छूट, जिसका भुगतान सरकार बैंक को करती है। |
| **लाभ कैसे मिलता है?** | यदि परियोजना ₹10 लाख की है और 50% सब्सिडी (₹5 लाख) है, तो आपको केवल ₹5 लाख का ऋण चुकाना होता है। | बैंक की सामान्य ब्याज दर 12% है, तो 7% सरकार भरती है और आपको मात्र 5% देना पड़ता है। |
| **MoSJE उदाहरण** | **स्वच्छता उद्यमी योजना (SUY)**: 50% तक (अधिकतम ₹5 लाख) पूंजीगत सब्सिडी; **महिला समृद्धि**: 25% तक सब्सिडी। | **MoSJE रियायती ऋण**: मात्र **4% से 6% प्रतिवर्ष**; डॉ. अंबेडकर विदेश अध्ययन योजना में 100% ब्याज छूट। |
| **भुगतान का तरीका** | DBT के माध्यम से ऋण खाते में सीधे क्रेडिट होकर मूलधन घटाता है। | मासिक ईएमआई में ब्याज की गणना कम दर पर होती है। |`
        : `### 💰 Difference Between Capital Subsidy and Interest Subvention:

| Feature | **Capital Subsidy** | **Interest Subvention** |
| :--- | :--- | :--- |
| **Definition** | A direct, upfront government cash grant that permanently reduces your loan principal balance. | An ongoing government subsidy that pays a portion of your annual loan interest to the bank. |
| **How It Works** | If your project cost is ₹10 Lakh and has a 50% subsidy (₹5 Lakh), your net repayable principal becomes only ₹5 Lakh! | If standard commercial bank interest is 12% p.a., the govt absorbs 7%, so you pay only 5.0% p.a.! |
| **MoSJE Examples**| **Swachhta Udyami Yojana (SUY)**: Up to 50% capital subsidy (up to ₹5 Lakh); **Mahila Samriddhi**: Up to 25% subsidy. | **MoSJE Term Loans**: Subsidized simple rate of **4.0% to 6.0% p.a.**; Dr. Ambedkar Scheme: 100% interest subvention for study abroad. |
| **Crediting Method**| Directly credited to the loan account via DBT, reducing monthly EMI burden from day one. | Billed directly to lending financial institutions, ensuring low monthly EMI. |`;

      return {
        id: replyId,
        sender: 'bot',
        text: subText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'ईएमआई कैलकुलेटर में सब्सिडी देखें →' : 'Calculate Net Loan with Subsidy →',
        quickReplies: isHindi
          ? ['ईएमआई कैलकुलेटर', 'पात्रता जांचें', 'दस्तावेज़ चेकलिस्ट']
          : ['Loan Calculator', 'Check Eligibility', 'Document Checklist']
      };
    }

    // 7. APEX CORPORATIONS DISTINCTION (NSFDC vs NBCFDC vs NSKFDC)
    if ((text.includes('nsfdc') && text.includes('nbcfdc')) || text.includes('तीनों निगम') || (text.includes('difference') && (text.includes('corporation') || text.includes('निगम') || text.includes('apex')))) {
      const diffText = isHindi
        ? `### 🏢 सामाजिक न्याय मंत्रालय (MoSJE) के तीनों शीर्ष निगमों में अंतर:

| मापदंड | **NSFDC** | **NBCFDC** | **NSKFDC** |
| :--- | :--- | :--- | :--- |
| **पूर्ण नाम** | राष्ट्रीय अनुसूचित जाति वित्त एवं विकास निगम | राष्ट्रीय पिछड़ा वर्ग वित्त एवं विकास निगम | राष्ट्रीय सफाई कर्मचारी वित्त एवं विकास निगम |
| **लक्षित वर्ग** | अनुसूचित जाति (SC) समुदाय | अन्य पिछड़ा वर्ग (OBC) व आर्थिक पिछड़ा वर्ग (EBC) | सफाई कर्मचारी, मुक्त मैनुअल स्कैवेंजर्स व उनके आश्रित |
| **आय सीमा** | ग्रामीण ₹3.0L / शहरी ₹3.0L (DVO ऋणों में ₹3L+) | परिवार की वार्षिक आय ₹3.00 लाख से कम (NCL) | **कोई आय सीमा नहीं (Universal Eligibility)** |
| **प्रमुख योजनाएं** | महिला समृद्धि (4%), मियादी ऋण (6%), ग्रीन बिजनेस | नई स्वर्णिमा (5%), महिला समृद्धि (4%), शिल्प संपदा | स्वच्छता उद्यमी योजना (SUY - 50% सब्सिडी), SRMS |
| **सब्सिडी लाभ** | ₹10,000 से ₹50,000 पूंजीगत सब्सिडी | शिल्प संपदा व महिला योजनाओं में रियायत | **₹5,00,000 तक पूंजीगत सब्सिडी** + ₹40,000 नकद अनुदान |`
        : `### 🏢 Distinction Between the 3 Apex National Welfare Corporations:

| Feature | **NSFDC** | **NBCFDC** | **NSKFDC** |
| :--- | :--- | :--- | :--- |
| **Full Entity** | National Scheduled Castes Finance & Dev Corp | National Backward Classes Finance & Dev Corp | National Safai Karamcharis Finance & Dev Corp |
| **Target Group** | Scheduled Castes (SC) | OBC & Economically Backward Classes (EBC) | Safai Karamcharis, Manual Scavengers & Dependents |
| **Income Ceiling** | Certified family income < ₹3.00 Lakh/year | Certified Non-Creamy Layer (NCL) < ₹3.00 Lakh | **Zero Income Ceiling (Universal Eligibility)** |
| **Flagship Schemes**| Mahila Samriddhi (4%), Term Loan (6%), Green Biz | New Swarnima (5%), Shilp Sampada (Artisans) | Swachhta Udyami Yojana (SUY - 50% subsidy), SRMS |
| **Max Capital Grant**| ₹10,000 to ₹50,000 capital subsidy | Concessional interest subvention (4%-5%) | **Up to ₹5,00,000 capital subsidy** + ₹40k cash grant |`;

      return {
        id: replyId,
        sender: 'bot',
        text: diffText,
        timestamp,
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'सभी योजनाएं देखें →' : 'View All Scheme Details →',
        quickReplies: isHindi
          ? ['मेरी पात्रता जांचें', 'ऋण कैलकुलेटर', 'दस्तावेज़ चेकलिस्ट']
          : ['Check Eligibility', 'Loan Calculator', 'Document Checklist']
      };
    }

    // 8. STATUTORY CERTIFICATES (CASTE, INCOME, DOMICILE) INTENT
    if (text.includes('how to get') || text.includes('kaise banaye') || text.includes('कैसे बनवाएं') || text.includes('कहाँ बनता') || text.includes('kahan banta') || (text.includes('certificate') && (text.includes('apply') || text.includes('make') || text.includes('banwana') || text.includes('procure') || text.includes('caste') || text.includes('income') || text.includes('domicile') || text.includes('जाति') || text.includes('आय') || text.includes('निवास')))) {
      const certText = isHindi
        ? `### 📜 प्रमाण पत्र बनवाने की आधिकारिक प्रक्रिया (तहसीलदार / e-District पोर्टल):

1. **जाति प्रमाण पत्र (Caste Certificate)**:
   - **अधिकृत अधिकारी**: अनुविभागीय अधिकारी (SDM) / तहसीलदार।
   - **आवश्यक कागज़ात**: परिवार का 1950/1984 का मूल निवास प्रमाण, पिता या रक्त संबंधी का जाति प्रमाण पत्र, राशन कार्ड, आधार कार्ड।
   - **प्रक्रिया**: अपने राज्य के ई-डिस्ट्रिक्ट पोर्टल (जैसे MP e-District) पर ऑनलाइन आवेदन करें अथवा लोक सेवा केंद्र (CSC/MPOnline) जाएं। समय सीमा: 15-30 कार्यदिवस।

2. **पारिवारिक आय प्रमाण पत्र (Income Certificate)**:
   - **अधिकृत अधिकारी**: तहसीलदार / नायब तहसीलदार।
   - **कागज़ात**: स्व-घोषणा शपथ पत्र (Self-Declaration), वेतन पर्ची या कृषि खसरा, बिजली बिल, आधार कार्ड।
   - **प्रक्रिया**: सीएससी अथवा तहसील कार्यालय में आवेदन जमा करें। समय सीमा: 3 से 7 दिन।

3. **मूल निवास प्रमाण पत्र (Domicile / Resident Certificate)**:
   - 10-15 वर्ष से राज्य में निवास का प्रमाण, वोटर आईडी, स्कूल मार्कशीट व आधार कार्ड।

⚡ **SAHAYAK लाभ**: प्रमाण पत्र जारी होते ही आप इसे सीधे **डिजिलॉकर (DigiLocker)** से SAHAYAK पोर्टल में 1-क्लिक से जोड़ सकते हैं!`
        : `### 📜 Official Procedure for Obtaining Statutory Certificates (e-District / Revenue Dept):

1. **Caste / Community Certificate**:
   - **Issuing Authority**: Sub-Divisional Magistrate (SDM) / Tehsildar.
   - **Documents**: Ancestral domicile record (pre-1950/1984), father's/blood relative's caste certificate, Ration Card, Aadhaar Card.
   - **Process**: Apply via your State e-District portal (e.g. MP e-District) or Common Service Center (CSC). Standard SLA: 15–30 working days.

2. **Annual Family Income Certificate**:
   - **Issuing Authority**: Revenue Officer / Tehsildar.
   - **Documents**: Self-attested income affidavit, bank statements/ITR/salary slip (or agricultural land Khasra), utility bill, Aadhaar.
   - **SLA**: 3 to 7 working days.

3. **Domicile / Local Resident Certificate**:
   - Proof of continuous stay for 10-15 years, electricity bill, school leaving certificate, Voter ID.

⚡ **DigiLocker Integration**: Once generated, your certificates can be pulled directly into SAHAYAK with 1 click for instant zero-paperwork approval!`;

      return {
        id: replyId,
        sender: 'bot',
        text: certText,
        timestamp,
        actionTab: 'checklist',
        actionLabel: isHindi ? 'डिजिलॉकर चेकलिस्ट देखें →' : 'Open DigiLocker Checklist →',
        quickReplies: isHindi
          ? ['डिजिलॉकर सत्यापन', 'योजनाओं की पात्रता', 'निकटतम SCA कार्यालय']
          : ['Verify with DigiLocker', 'Check Scheme Eligibility', 'Locate SCA Branch']
      };
    }

    // 9. DETAILED PROJECT REPORT (DPR) & BUSINESS PLAN INTENT
    if (text.includes('dpr') || text.includes('project report') || text.includes('business plan') || text.includes('प्रोजेक्ट रिपोर्ट') || text.includes('बिजनेस प्लान') || text.includes('कोटेशन') || text.includes('quotation') || text.includes('डीपीआर')) {
      const dprText = isHindi
        ? `### 📊 विस्तृत परियोजना रिपोर्ट (DPR / Project Report) तैयार करने की मार्गदर्शिका:

बैंक और राज्य चैनललाइजिंग एजेंसियां (SCA) ऋण स्वीकृति हेतु एक सरल 1-2 पृष्ठ की DPR मांगती हैं:

1. **व्यवसाय का परिचय (Executive Summary)**:
   - उद्यम का नाम (उदा: "लक्ष्मी बुटीक एवं सिलाई केंद्र", "इंदौर मॉडर्न डेयरी फार्म")
   - स्वामी का नाम, श्रेणी (SC/OBC/Safai Karamchari) और पता।

2. **पूंजीगत लागत (Capital Expenditure - CapEx)**:
   - मशीन/उपकरण की दर सूची (उदा: 2 सिलाई मशीन ₹35,000 + ओवरलॉक मशीन ₹15,000 + कच्चा माल ₹30,000 = ₹80,000)।
   - अधिकृत विक्रेता से प्राप्त औपचारिक **कोटेशन (Performa Invoice)** संलग्न करें।

3. **वित्तीय संरचना (Financing Pattern)**:
   - कुल परियोजना लागत: 100%
   - MoSJE निगम ऋण (NSFDC/NBCFDC/NSKFDC): 85% से 90%
   - सरकारी पूंजीगत सब्सिडी: 20% से 50%
   - प्रमोटर अंशदान (मार्जिन मनी): मात्र 5% से 10%.

4. **मासिक अनुमानित आय व पुनर्भुगतान**:
   - अनुमानित मासिक बिक्री: ₹25,000
   - कच्चा माल व खर्च: ₹12,000
   - शुद्ध बचत: ₹13,000 (जिसमें से ₹2,500 ईएमआई आसानी से भरी जा सकती है)।

💡 *सुझाव*: हमारे **ऋण ईएमआई कैलकुलेटर** से अपनी शुद्ध ईएमआई तुरंत निकालें और अपनी DPR में जोड़ें!`
        : `### 📊 Detailed Project Report (DPR) Formulation Guide for Bank Approval:

State Channelizing Agencies (SCAs) and banks require a simple 2-page project profile for loan sanctions:

1. **Enterprise Overview**:
   - Proposed venture name (e.g., "Lakshmi Boutique & Tailoring Kiosk", "Indore Dairy Unit").
   - Beneficiary details, category (SC/OBC/Safai Karamchari), and target locality.

2. **Project Cost Breakdown (CapEx & Working Capital)**:
   - Machinery / Equipment with formal vendor quotations (e.g. 2 Industrial Stitching Units ₹45,000 + Fabric stock ₹35,000 + Interior setup ₹20,000 = ₹1,00,000).

3. **Financing Means**:
   - Apex Corporation Loan (NSFDC / NBCFDC / NSKFDC): 85%–90%
   - Capital Subsidy: 20%–50% (as applicable)
   - Beneficiary Margin Contribution: Only 5%–10%.

4. **Cash Flow & Viability**:
   - Projected gross monthly revenue minus operating overheads, verifying comfortable coverage for monthly concessional EMI.

💡 *Pro Tip*: Use our interactive **Loan Calculator** to generate the exact amortization schedule for your DPR!`;

      return {
        id: replyId,
        sender: 'bot',
        text: dprText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'ईएमआई कैलकुलेटर से गणना करें →' : 'Calculate EMI for DPR →',
        quickReplies: isHindi
          ? ['ईएमआई मॉडलर खोलें', 'दस्तावेज़ चेकलिस्ट', 'पार्टनर कार्यालय']
          : ['Open EMI Modeler', 'Document Checklist', 'Find Partner Office']
      };
    }

    // 10. MINISTERIAL LEADERSHIP & MoSJE IDENTITY INTENT
    if (text.includes('minister') || text.includes('मंत्री') || text.includes('virendra') || text.includes('वीरेन्द्र') || text.includes('shastri bhawan') || text.includes('mosje') || text.includes('sahayak kya hai') || text.includes('what is sahayak')) {
      const minText = isHindi
        ? `### 🏛️ सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) एवं SAHAYAK परिचय:

- 🎖️ **केंद्रीय मंत्री**: **डॉ. वीरेन्द्र कुमार** (Union Minister for Social Justice & Empowerment, Govt of India).
- 📍 **मुख्यालय**: शास्त्री भवन, डॉ. राजेंद्र प्रसाद रोड, नई दिल्ली - 110001.
- 🎯 **मंत्रालय का मुख्य उद्देश्य**: समाज के वंचित वर्गों—अनुसूचित जातियों (SC), अन्य पिछड़ा वर्ग (OBC), विमुक्त जनजातियों (DNT), सफाई कर्मचारियों, दिव्यांगजन, वरिष्ठ नागरिकों और ट्रांसजेंडर समुदाय का समग्र आर्थिक व सामाजिक सशक्तिकरण।
- 🤖 **SAHAYAK (सहायक) क्या है?**:
  - स्मार्ट इंडिया हैकथॉन (SIH26092) के तहत विकसित एक **AI-संचालित डिजिटल कल्याणकारी प्लेटफॉर्म**।
  - यह बिचौलियों (middlemen) को समाप्त कर पात्र नागरिकों को सीधे 4%-6% की रियायती ब्याज दर वाले ऋण, पूंजीगत सब्सिडी और निकटतम राज्य चैनललाइजिंग एजेंसी (SCA) डेस्क से जोड़ता है।
  - 100% शून्य संख्यात्मक त्रुटि (Zero Hallucination) और DPDP अधिनियम 2023 के तहत डिजिटल गोपनीयता का पालन करता है।`
        : `### 🏛️ Ministry of Social Justice & Empowerment (MoSJE) & SAHAYAK:

- 🎖️ **Hon'ble Union Minister**: **Dr. Virendra Kumar**, Union Cabinet Minister for Social Justice and Empowerment.
- 📍 **Headquarters**: Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001.
- 🎯 **Statutory Mission**: Comprehensive educational, social, and economic empowerment of marginalized Indian communities—Scheduled Castes (SC), OBC, EBC, DNT, Sanitation Workers, Persons with Disabilities (Divyangjan), Senior Citizens, and Transgender individuals.
- 🤖 **What is SAHAYAK?**:
  - Official SIH AI welfare enablement portal eliminating predatory middlemen.
  - Connects citizens directly to concessional credit (4%–6% p.a.), government capital subsidies (up to 50%), and 1-click DigiLocker document verification.
  - Fully compliant with India's **DPDP Act 2023** with cryptographic routing slips.`;

      return {
        id: replyId,
        sender: 'bot',
        text: minText,
        timestamp,
        quickReplies: isHindi
          ? ['मेरी पात्रता जांचें', 'कम ब्याज वाले ऋण', 'निकटतम SCA कार्यालय']
          : ['Check My Eligibility', 'Low Interest Loans', 'Locate SCA Office']
      };
    }

    // 11. PM SVANIDHI INTENT (Street Vendors)
    if (text.includes('svanidhi') || text.includes('स्वनिधि') || text.includes('street vendor') || text.includes('रेहड़ी') || text.includes('पटरी') || text.includes('ठेला') || text.includes('vendor')) {
      const svaText = isHindi
        ? `### 🛒 पीएम स्वनिधि योजना (PM SVANidhi - स्ट्रीट वेंडर्स आत्मनिर्भर निधि):

रेहड़ी-पटरी, ठेले व सड़क किनारे फल-सब्जी, चाय-नाश्ता आदि बेचने वाले छोटे विक्रेताओं हेतु विशेष सूक्ष्म-ऋण योजना:

1. **ऋण की किश्तें (Tranches)**:
   - **प्रथम किश्त**: **₹10,000** (1 वर्ष की अवधि)।
   - **द्वितीय किश्त**: समय पर चुकाने पर **₹20,000**।
   - **तृतीय किश्त**: **₹50,000** तक का संपार्श्विक-मुक्त ऋण।

2. **ब्याज सब्सिडी लाभ**:
   - समय पर डिजिटल पुनर्भुगतान करने पर **7.0% प्रतिवर्ष की ब्याज सब्सिडी** सीधे आपके बैंक खाते में DBT द्वारा जमा होती है।
   - डिजिटल लेन-देन (QR Code) पर ₹1,200/वर्ष तक का अतिरिक्त कैशबैक।

3. **गारंटी**: 100% संपार्श्विक-मुक्त (Zero Collateral). केवल वेंडिंग सर्टिफिकेट (CoV) या पहचान पत्र आवश्यक।`
        : `### 🛒 PM SVANidhi Scheme (Street Vendors Micro-Credit):

Dedicated working capital credit initiative for street vendors, roadside hawkers, and micro-traders:

1. **Credit Tranches**:
   - **1st Tranche**: **₹10,000** (1-year repayment tenure).
   - **2nd Tranche**: Up to **₹20,000** upon timely clearance of 1st loan.
   - **3rd Tranche**: Up to **₹50,000** for enterprise expansion.

2. **Interest Subsidy & Cashback**:
   - Direct **7.0% per annum interest subsidy** credited to your bank account via DBT upon on-time repayments.
   - Monthly cashbacks up to ₹100/month (₹1,200/year) on digital transactions via UPI QR codes.

3. **Collateral**: 100% collateral-free, backed by CGTMSE credit guarantee.`;

      return {
        id: replyId,
        sender: 'bot',
        text: svaText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'ईएमआई कैलकुलेटर देखें →' : 'View Repayment Schedule →',
        quickReplies: isHindi
          ? ['दस्तावेज़ क्या चाहिए?', 'मेरी पात्रता जांचें', 'मुद्रा लोन विवरण']
          : ['Required Documents', 'Check Eligibility', 'PM MUDRA Details']
      };
    }

    // 12. STAND-UP INDIA INTENT
    if (text.includes('stand up') || text.includes('stand-up') || text.includes('स्टैंड अप') || text.includes('standup')) {
      const suText = isHindi
        ? `### 🚀 स्टैंड-अप इंडिया योजना (Stand-Up India Scheme):

अनुसूचित जाति (SC), अनुसूचित जनजाति (ST) एवं **महिला उद्यमियों** द्वारा नए उद्यम (Greenfield Ventures) स्थापित करने हेतु प्रमुख राष्ट्रीय योजना:

1. **ऋण राशि**:
   - **₹10,00,000 से ₹1,00,00,000 (1 करोड़)** तक का बैंक ऋण।
   - देश की प्रत्येक वाणिज्यिक बैंक शाखा द्वारा कम से कम एक SC/ST और एक महिला उद्यमी को ऋण देना अनिवार्य।

2. **योग्य क्षेत्र**:
   - विनिर्माण (Manufacturing), सेवा क्षेत्र (Services), कृषि-संबद्ध गतिविधियां, अथवा व्यापार।

3. **पुनर्भुगतान एवं मार्जिन**:
   - पुनर्भुगतान अवधि: **7 वर्ष** तक, जिसमें अधिकतम **18 माह का मोराटोरियम** शामिल है।
   - लाभार्थी मार्जिन मनी: 10% से 15% (राज्य सब्सिडी के साथ संयोजित किया जा सकता है)।`
        : `### 🚀 Stand-Up India Scheme:

Flagship central bank initiative promoting entrepreneurship among **Scheduled Caste (SC), Scheduled Tribe (ST), and Women entrepreneurs**:

1. **Loan Sizing**:
   - Concessional bank credit between **₹10 Lakh and ₹1 Crore**.
   - Mandatory quota: At least one SC/ST borrower and at least one woman borrower per bank branch nationwide.

2. **Eligible Sectors**:
   - Greenfield enterprises in manufacturing, services, agri-allied activities, or trading.

3. **Tenure & Moratorium**:
   - Repayment tenure up to **7 years** with up to **18 months moratorium**.
   - Margin money requirement: 10% to 15% (can be blended with central/state capital subsidies).`;

      return {
        id: replyId,
        sender: 'bot',
        text: suText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? '₹10 लाख ऋण की ईएमआई निकालें →' : 'Calculate ₹10 Lakh EMI →',
        quickReplies: isHindi
          ? ['महिला योजनाएं', 'दस्तावेज़ चेकलिस्ट', 'पात्रता जांचें']
          : ['Women Schemes', 'Document Checklist', 'Check Eligibility']
      };
    }

    // 13. PM-MUDRA YOJANA INTENT
    if (text.includes('mudra') || text.includes('मुद्रा') || text.includes('shishu') || text.includes('kishore') || text.includes('tarun') || text.includes('शिशु') || text.includes('किशोर') || text.includes('तरुण')) {
      const mudraText = isHindi
        ? `### 💼 प्रधानमंत्री मुद्रा योजना (PMMY - PM MUDRA Yojana):

गैर-कॉर्पोरेट, गैर-कृषि लघु एवं सूक्ष्म उद्यमों हेतु संपार्श्विक-मुक्त (बिना गारंटी) ऋण:

1. **मुद्रा की 3 श्रेणियां**:
   - 🟢 **शिशु (Shishu)**: **₹50,000 तक** (नए सूक्ष्म व्यवसाय, सिलाई, चाय की दुकान, रेहड़ी)।
   - 🟡 **किशोर (Kishore)**: **₹50,000 से ₹5,00,000** (दुकान विस्तार, मशीनरी, उपकरण)।
   - 🔴 **तरुण (Tarun / Tarun Plus)**: **₹5,00,000 से ₹10,00,000** (और स्थापित इकाइयों हेतु ₹20 लाख तक)।

2. **मुख्य विशेषताएं**:
   - 🛡️ **बिना किसी ज़मानत के (Zero Collateral)**।
   - 💳 कार्यशील पूंजी हेतु **मुद्रा रुपे कार्ड (MUDRA RuPay Card)** जारी किया जाता है।
   - 🚫 शिशु ऋण पर कोई प्रोसेसिंग शुल्क नहीं।`
        : `### 💼 Pradhan Mantri MUDRA Yojana (PMMY):

Universal collateral-free financing for non-corporate, non-farm micro and small enterprises:

1. **The 3 Loan Categories**:
   - 🟢 **Shishu**: Loans up to **₹50,000** (ideal for seed ventures, food kiosks, tailoring).
   - 🟡 **Kishore**: Loans from **₹50,000 to ₹5,00,000** (inventory stocking, machinery purchase).
   - 🔴 **Tarun & Tarun Plus**: Loans from **₹5,00,000 to ₹10,00,000** (and up to ₹20 Lakh under Tarun Plus).

2. **Salient Highlights**:
   - 🛡️ **Zero Collateral**: Backed by Credit Guarantee Fund for Micro Units (CGFMU).
   - 💳 **MUDRA RuPay Debit Card** issued for flexible working capital withdrawals.
   - 🚫 Nil processing fee on Shishu category.`;

      return {
        id: replyId,
        sender: 'bot',
        text: mudraText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'मुद्रा ऋण ईएमआई निकालें →' : 'Calculate MUDRA EMI →',
        quickReplies: isHindi
          ? ['पीएम विश्वकर्मा योजना', 'दस्तावेज़ चेकलिस्ट', 'पात्रता जांचें']
          : ['PM Vishwakarma Scheme', 'Document Checklist', 'Check Eligibility']
      };
    }

    // 14. PM VISHWAKARMA INTENT
    if (text.includes('vishwakarma') || text.includes('विश्वकर्मा') || text.includes('artisan') || text.includes('कारीगर') || text.includes('craftsman') || text.includes('शिल्पकार')) {
      const vishText = isHindi
        ? `### 🛠️ पीएम विश्वकर्मा योजना (PM Vishwakarma Scheme):

हाथ और औजारों से काम करने वाले **18 पारंपरिक व्यवसायों के शिल्पकारों व कारीगरों** हेतु व्यापक कल्याण योजना:

1. **18 पात्र व्यवसाय**:
   - बढ़ई, नाव निर्माता, लोहार, हथौड़ा/टूलकिट निर्माता, ताला बनाने वाले, मूर्तिकार, मोची/जूता कारीगर, राजमिस्त्री, टोकरी/झाड़ू निर्माता, गुड़िया/खिलौना निर्माता, नाई (हजाम), मालाकार (माली), धोबी, दर्जी, मछली पकड़ने का जाल बनाने वाले।

2. **प्रमुख वित्तीय लाभ**:
   - 🆔 **पहचान**: पीएम विश्वकर्मा प्रमाण पत्र और डिजिटल आईडी कार्ड।
   - 🧰 **टूलकिट अनुदान**: आधुनिक औजार खरीदने हेतु **₹15,000 का ई-वाउचर** अनुदान।
   - 🎓 **कौशल व स्टाइपेंड**: 5-7 दिन का बुनियादी प्रशिक्षण + ₹500/दिन वजीफा।
   - 💰 **रियायती ऋण**:
     - पहली किश्त: **₹1,00,000** (18 माह) मात्र **5% रियायती ब्याज दर** पर (बिना गारंटी)।
     - दूसरी किश्त: **₹2,00,000** (30 माह) 5% ब्याज पर।`
        : `### 🛠️ PM Vishwakarma Scheme:

Holistic institutional support for traditional artisans and craftspersons across **18 specialized trades**:

1. **18 Covered Trades**:
   - Carpenters, boat makers, blacksmiths, armorers, locksmiths, sculptors, cobblers, masons, basket/mat/broom makers, doll/toy makers, barbers, garland makers, washermen, tailors, fishing net makers.

2. **Core Benefits**:
   - 🆔 **Official Identity**: PM Vishwakarma Certificate & Digital ID.
   - 🧰 **Toolkit Incentive**: **₹15,000 grant** via digital e-voucher for modern toolkits.
   - 🎓 **Skill Upgradation**: 5-7 days basic skilling with a **₹500/day daily stipend**.
   - 💰 **Collateral-Free Concessional Credit**:
     - 1st Tranche: **₹1,00,000** (18-month tenure) at a fixed **5.0% interest rate**.
     - 2nd Tranche: Up to **₹2,00,000** (30-month tenure) at 5.0% rate.`;

      return {
        id: replyId,
        sender: 'bot',
        text: vishText,
        timestamp,
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'विश्वकर्मा योजना देखें →' : 'View PM Vishwakarma Details →',
        quickReplies: isHindi
          ? ['दस्तावेज़ चेकलिस्ट', 'ईएमआई कैलकुलेटर', 'निकटतम SCA कार्यालय']
          : ['Document Checklist', 'Loan Calculator', 'Locate SCA Branch']
      };
    }

    // 15. PMEGP INTENT
    if (text.includes('pmegp') || text.includes('kvic') || text.includes('खादी')) {
      const pmegpText = isHindi
        ? `### 🏭 प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP - KVIC):

नए विनिर्माण एवं सेवा उद्यम स्थापित करने हेतु भारी पूंजीगत सब्सिडी वाली केंद्र सरकार की प्रमुख ऋण योजना:

1. **अधिकतम परियोजना लागत**:
   - विनिर्माण क्षेत्र (Manufacturing): **₹50,00,000 तक**।
   - सेवा क्षेत्र (Services / Business): **₹20,00,000 तक**।

2. **सरकारी सब्सिडी (मार्जिन मनी अनुदान)**:
   - **शहरी क्षेत्र**: सामान्य वर्ग को 15%, जबकि SC/ST/OBC/महिला/दिव्यांग को **25% सब्सिडी**।
   - **ग्रामीण क्षेत्र**: सामान्य वर्ग को 25%, जबकि SC/ST/OBC/महिला/दिव्यांग को **35% सब्सिडी**!

3. **स्वयं का अंशदान (Own Contribution)**:
   - विशेष वर्ग (SC/ST/OBC/महिला/दिव्यांग) हेतु मात्र **5%**, सामान्य वर्ग हेतु 10%.`
        : `### 🏭 Prime Minister's Employment Generation Programme (PMEGP):

Credit-linked capital subsidy initiative by Ministry of MSME & KVIC for setting up micro-enterprises:

1. **Project Ceilings**:
   - Manufacturing Sector: Up to **₹50,00,000**.
   - Service / Business Sector: Up to **₹20,00,000**.

2. **Capital Subsidy Rates**:
   - **Urban Areas**: 15% for General category, **25% subsidy** for SC/ST/OBC/Women/PwD/Ex-Servicemen.
   - **Rural Areas**: 25% for General category, **35% subsidy** for SC/ST/OBC/Women/PwD!

3. **Beneficiary Contribution**:
   - Only **5% own margin** for special categories (SC/ST/OBC/Women); 10% for general.`;

      return {
        id: replyId,
        sender: 'bot',
        text: pmegpText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'ईएमआई व सब्सिडी निकालें →' : 'Calculate PMEGP Subsidy & EMI →',
        quickReplies: isHindi
          ? ['दस्तावेज़ चेकलिस्ट', 'पात्रता जांचें', 'मुद्रा लोन विवरण']
          : ['Document Checklist', 'Check Eligibility', 'PM MUDRA Details']
      };
    }

    // 16. SMILE SCHEME INTENT (Transgender & Begging Rehabilitation)
    if (text.includes('smile') || text.includes('स्माइल') || text.includes('transgender') || text.includes('ट्रांसजेंडर') || text.includes('begging') || text.includes('भिक्षावृत्ति') || text.includes('garima greh') || text.includes('गरिमा गृह')) {
      const smileText = isHindi
        ? `### 🤝 स्माइल योजना (SMILE - Support for Marginalized Individuals for Livelihood & Enterprise):

सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) की व्यापक कल्याण एवं पुनर्वास योजना:

1. **दो प्रमुख उप-योजनाएं**:
   - 🏳️‍⚧️ **ट्रांसजेंडर व्यक्तियों का समग्र पुनर्वास**:
     - **गरिमा गृह (Garima Greh)**: आश्रय, भोजन, चिकित्सा देखभाल व मनोरंजन सुविधा।
     - **पहचान व स्वास्थ्य**: राष्ट्रीय ट्रांसजेंडर पोर्टल पर डिजिटल प्रमाण पत्र + **₹5 लाख का आयुष्मान भारत PM-JAY स्वास्थ्य कार्ड** (जिसमें लिंग पुनर्गठन सर्जरी भी शामिल है)।
     - **कौशल व ऋण**: PM-DAKSH के तहत नि:शुल्क व्यावसायिक प्रशिक्षण एवं रियायती स्वरोजगार ऋण।
   - 🤲 **भिक्षावृत्ति में संलग्न व्यक्तियों का पुनर्वास**:
     - सर्वेक्षण, पहचान, अस्थायी आश्रय, नशा मुक्ति और स्वरोजगार पुनर्वास।`
        : `### 🤝 SMILE Scheme (Support for Marginalized Individuals for Livelihood & Enterprise):

Ministry of Social Justice & Empowerment (MoSJE) flagship inclusion and rehabilitation initiative:

1. **Two Core Sub-Schemes**:
   - 🏳️‍⚧️ **Comprehensive Rehabilitation for Welfare of Transgender Persons**:
     - **Garima Greh**: Safe residential shelter homes with food, healthcare, and recreational facilities.
     - **Identity & Health**: Official identity certificates via National Transgender Portal + **₹5 Lakh Ayushman Bharat PM-JAY cards** covering gender-affirmative medical care.
     - **Livelihood**: Free certified skill training via PM-DAKSH + concessional micro-credit.
   - 🤲 **Comprehensive Rehabilitation of Persons Engaged in the Act of Begging**:
     - Identification, medical screening, de-addiction, shelter, and vocational rehabilitation.`;

      return {
        id: replyId,
        sender: 'bot',
        text: smileText,
        timestamp,
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'स्माइल योजना विवरण देखें →' : 'View SMILE Program Details →',
        quickReplies: isHindi
          ? ['दस्तावेज़ चेकलिस्ट', 'राष्ट्रीय हेल्पलाइन 14566', 'मेरी पात्रता']
          : ['Document Checklist', 'National Helpline 14566', 'Check Eligibility']
      };
    }

    // 17. ADIP SCHEME INTENT (Divyangjan Assistive Aids & Motorized Tricycles)
    if (text.includes('adip') || text.includes('एडिप') || text.includes('divyang') || text.includes('दिव्यांग') || text.includes('tricycle') || text.includes('ट्राइसाइकिल') || text.includes('hearing aid') || text.includes('prosthetic') || text.includes('wheelchair') || text.includes('हियरिंग एड') || text.includes('कृत्रिम अंग') || text.includes('udid')) {
      const adipText = isHindi
        ? `### ♿ एडीआईपी योजना (ADIP Scheme - दिव्यांगजन उपकरण सहायता):

40% या अधिक प्रमाणित दिव्यांगता वाले व्यक्तियों को आधुनिक सहायक उपकरण **100% नि:शुल्क वितरण**:

1. **उपकरण एवं अनुदान सीमा**:
   - 🛵 **मोटराइज्ड ट्राइसाइकिल**: गंभीर अस्थि दिव्यांगता वाले युवाओं/छात्रों को **₹42,000 तक का पूर्ण अनुदान**।
   - 🦻 **डिजिटल हियरिंग एड**: सुनने की आधुनिक कान की मशीनें।
   - 🦯 **स्मार्ट केन व ब्रेल किट**: दृष्टिबाधित व्यक्तियों हेतु सेंसर युक्त छड़ी व शिक्षा सामग्री।
   - 🦾 **कृत्रिम अंग (Prosthetics & Orthotics)**: ALIMCO द्वारा निर्मित आधुनिक पैर, हाथ व कैलिपर्स।

2. **पात्रता मापदंड**:
   - वैध **UDID कार्ड** अथवा 40%+ दिव्यांगता प्रमाण पत्र।
   - पारिवारिक मासिक आय ₹22,500 तक होने पर उपकरण **100% नि:शुल्क** मिलते हैं।`
        : `### ♿ ADIP Scheme (Assistance to Disabled Persons for Purchase/Fitting of Aids):

100% subsidized distribution of sophisticated, modern aids & appliances for Divyangjan:

1. **Aids & Subsidy Ceilings**:
   - 🛵 **Motorized Tricycles**: Subsidized up to **₹42,000** for eligible locomotor disabled beneficiaries aged 16+.
   - 🦻 **Digital Behind-the-Ear Hearing Aids**: High-clarity digital hearing units.
   - 🦯 **Smart Canes & Braille Kits**: Sensor-guided mobility devices for visually impaired persons.
   - 🦾 **Modern Prosthetics & Orthotics**: Advanced artificial limbs and calipers manufactured by ALIMCO.

2. **Statutory Criteria**:
   - Minimum 40% certified benchmark disability with official **UDID Card**.
   - Monthly family income up to ₹22,500 receives 100% free aids; ₹22,501 to ₹30,000 receives 50% subsidy.`;

      return {
        id: replyId,
        sender: 'bot',
        text: adipText,
        timestamp,
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'एडीआईपी योजना देखें →' : 'View ADIP Scheme Details →',
        quickReplies: isHindi
          ? ['UDID कार्ड कैसे बनवाएं?', 'दस्तावेज़ चेकलिस्ट', 'राष्ट्रीय हेल्पलाइन']
          : ['How to get UDID card?', 'Document Checklist', 'National Helplines']
      };
    }

    // 18. RASHTRIYA VAYOSHRI YOJANA (RVY for Seniors)
    if (text.includes('vayoshri') || text.includes('वयोश्री') || text.includes('senior citizen device') || text.includes('बुजुर्ग उपकरण') || text.includes('denture') || text.includes('walking stick') || text.includes('बत्तीसी') || text.includes('चश्मा')) {
      const rvyText = isHindi
        ? `### 👴 राष्ट्रीय वयोश्री योजना (Rashtriya Vayoshri Yojana - RVY):

गरीबी रेखा (BPL) अथवा अल्प आय वर्ग के **60 वर्ष से अधिक उम्र के वरिष्ठ नागरिकों** को दैनिक जीवन यापन के सहायक उपकरण नि:शुल्क प्रदान करना:

1. **नि:शुल्क उपलब्ध उपकरण**:
   - 🦯 वॉकिंग स्टिक (चलने की छड़ी), एल्बो क्रच, और 4-पैर वाले वॉकर।
   - 🦽 व्हीलचेयर (साधारण व फोल्डिंग)।
   - 🦻 कान की डिजिटल सुनने की मशीनें।
   - 👓 नजर के चश्मे (सटीक जांच उपरांत)।
   - 🦷 कृत्रिम दांत (Complete Dentures / बत्तीसी)।

2. **पात्रता**:
   - आयु: **60 वर्ष या अधिक**।
   - बीपीएल राशन कार्ड अथवा ₹15,000/माह से कम पारिवारिक आय प्रमाण पत्र।
   - 📞 **एल्डरलाइन राष्ट्रीय हेल्पलाइन**: **\`14567\`** (सुबह 8 से रात 8 बजे तक)।`
        : `### 👴 Rashtriya Vayoshri Yojana (RVY for Senior Citizens):

Free distribution of assisted-living physical devices for Senior Citizens aged 60+ from low-income / BPL households:

1. **Free Assistive Devices Distributed**:
   - 🦯 Walking sticks, elbow crutches, and quadruped walkers.
   - 🦽 High-grade folding wheelchairs.
   - 🦻 Digital hearing aids for age-related hearing impairment.
   - 👓 Custom reading/distance spectacles.
   - 🦷 Artificial dental dentures.

2. **Eligibility Criteria**:
   - Age: **60 years or older**.
   - BPL Ration Card or certified monthly income below ₹15,000.
   - 📞 **National Elderline**: **\`14567\`** (8:00 AM to 8:00 PM toll-free counseling and support).`;

      return {
        id: replyId,
        sender: 'bot',
        text: rvyText,
        timestamp,
        quickReplies: isHindi
          ? ['एल्डरलाइन 14567 विवरण', 'दस्तावेज़ चेकलिस्ट', 'मेरी पात्रता']
          : ['Elderline 14567 Info', 'Document Checklist', 'Check Eligibility']
      };
    }

    // 19. NATIONAL OVERSEAS SCHOLARSHIP (NOS) & HIGHER STUDY INTENT
    if (text.includes('overseas') || text.includes('विदेश') || text.includes('nos') || text.includes('study abroad') || text.includes('foreign study') || text.includes('dr ambedkar overseas') || text.includes('अंबेडकर विदेश')) {
      const nosText = isHindi
        ? `### ✈️ राष्ट्रीय प्रवासी छात्रवृत्ति (National Overseas Scholarship - NOS):

अनुसूचित जाति (SC), विमुक्त जनजाति (DNT), और भूमिहीन कृषि मजदूरों के मेधावी विद्यार्थियों को **विदेश के शीर्ष विश्वविद्यालयों में Master's और Ph.D.** करने हेतु MoSJE की 100% वित्तपोषित छात्रवृत्ति:

1. **वित्तीय कवरेज (100% खर्च सरकार द्वारा)**:
   - 🎓 **पूर्ण शिक्षण शुल्क (100% Tuition Fees)** सीधे विदेशी विश्वविद्यालय को भुगतान।
   - 💵 **वार्षिक जीवन-यापन भत्ता (Living Allowance)**: लगभग **$15,400 USD** (अमेरिका व अन्य देश) अथवा **£9,900 GBP** (यूके में)।
   - ✈️ आने-जाने का हवाई किराया, आकस्मिक खर्च, वीजा शुल्क और चिकित्सा बीमा।

2. **सीटें व पात्रता**:
   - कुल **125 वार्षिक सीटें** (SC: 115, DNT: 6, भूमिहीन मजदूर: 4)।
   - अर्हक डिग्री में न्यूनतम 60% अंक।
   - पारिवारिक वार्षिक आय सीमा: **₹8,00,000 से कम**।

3. **डॉ. अंबेडकर केंद्रीय क्षेत्र योजना**:
   - विदेश में उच्च शिक्षा हेतु लिए गए शिक्षा ऋण पर **100% ब्याज सब्सिडी (Interest Subsidy)**।`
        : `### ✈️ National Overseas Scholarship (NOS for SC/DNT Candidates):

Comprehensive 100% government-funded scholarship by MoSJE for meritorious students pursuing **Master's and Ph.D. degrees in top QS-ranked international universities**:

1. **Full Financial Package**:
   - 🎓 **100% Tuition Fees** remitted directly to the foreign university.
   - 💵 **Annual Living Stipend**: **~$15,400 USD** (USA and other countries) or **£9,900 GBP** (United Kingdom).
   - ✈️ Economy class international airfare, visa fees, contingency allowances, and health insurance.

2. **Slots & Criteria**:
   - **125 Total Annual Slots** (SC: 115, DNT: 6, Landless agricultural laborers: 4).
   - Minimum 60% marks in qualifying undergraduate/master's degree.
   - Family annual income ceiling: Below **₹8,00,000 per annum**.

3. **Dr. Ambedkar Central Sector Scheme**:
   - Provides **100% interest subvention** on educational loans availed from commercial banks for overseas studies.`;

      return {
        id: replyId,
        sender: 'bot',
        text: nosText,
        timestamp,
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'छात्रवृत्ति योजनाएं देखें →' : 'View Scholarship Programs →',
        quickReplies: isHindi
          ? ['पीएम-दक्ष योजना', 'दस्तावेज़ चेकलिस्ट', 'मेरी पात्रता']
          : ['PM-DAKSH Skilling', 'Document Checklist', 'Check Eligibility']
      };
    }

    // 20. SKILLS, STUDENTS & SCHOLARSHIPS (PM-DAKSH, PM-YASASVI, FREE COACHING)
    if (text.includes('daksh') || text.includes('दक्ष') || text.includes('yasasvi') || text.includes('यशस्वी') || text.includes('scholarship') || text.includes('छात्रवृत्ति') || text.includes('skill') || text.includes('ट्रेनिंग') || text.includes('coaching') || text.includes('study') || text.includes('पढ़ाई')) {
      const eduText = isHindi
        ? `### 🎓 शिक्षा, कौशल विकास एवं छात्रवृत्ति योजनाएं (MoSJE):

1. **पीएम-दक्ष योजना (PM-DAKSH Yojana)**:
   - **लाभार्थी**: SC, OBC, EBC, DNT, एवं सफाई कर्मचारी युवा (उम्र 18-45 वर्ष)।
   - **सुविधा**: नि:शुल्क आवासीय/गैर-आवासीय तकनीकी प्रशिक्षण (AI, कोडिंग, सोलर, ऑटोमोबाइल, परिधान)।
   - **वजीफा**: प्रशिक्षण अवधि में **₹1,00,0 से ₹1,500 प्रतिमाह स्टाइपेंड** सीधे DBT द्वारा।
   - **प्लेसमेंट**: प्रशिक्षण पूर्ण होने पर सरकारी प्रमाणित प्रमाण पत्र और रोजगार/स्वरोजगार ऋण लिंकेज।

2. **पीएम-यशस्वी (PM-YASASVI Scholarship)**:
   - कक्षा 9 से 12वीं के मेधावी OBC, EBC और DNT विद्यार्थियों को उत्कृष्ट विद्यालयों में पढ़ाई हेतु **₹75,000 से ₹1,25,000 वार्षिक छात्रवृत्ति**।

3. **नि:शुल्क कोचिंग योजना (Free Coaching Scheme)**:
   - UPSC, SSC, Banking, JEE, NEET जैसी प्रतियोगी परीक्षाओं की तैयारी हेतु प्रतिष्ठित कोचिंग संस्थानों में 100% नि:शुल्क कोचिंग + प्रतिमाह ₹4,000 स्टाइपेंड।`
        : `### 🎓 Education, Scholarships & Skilling Initiatives (MoSJE):

1. **PM-DAKSH Yojana (Skill Training Linked to Employment)**:
   - **Target**: SC, OBC, EBC, DNT youth and sanitation workers (Age: 18–45).
   - **Coverage**: 100% free high-tech skilling (IT, AI, Solar tech, Advanced Automotive, CNC Machining).
   - **Stipend**: **₹1,000 to ₹1,500 per month** paid directly via DBT during training.
   - **Outcome**: National Skill Qualification Framework (NSQF) certification + guaranteed wage/loan linkage.

2. **PM-YASASVI Central Scholarship**:
   - Top-class school education scholarship of **₹75,000 to ₹1,25,000 per year** for OBC, EBC, and DNT students in Grades 9–12.

3. **Free Coaching Scheme for SC & OBC Students**:
   - Comprehensive free premier coaching for competitive exams (UPSC, Banking, State PSC, JEE, NEET) + ₹4,000 monthly living stipend.`;

      return {
        id: replyId,
        sender: 'bot',
        text: eduText,
        timestamp,
        citedSchemeCode: 'MOSJE-DAKSH-10',
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'पीएम-दक्ष योजना देखें →' : 'View PM-DAKSH Program →',
        quickReplies: isHindi
          ? ['पीएम-दक्ष में आवेदन कैसे करें?', 'दस्तावेज़ चेकलिस्ट', 'मेरी श्रेणी की छात्रवृत्ति']
          : ['How to apply for PM-DAKSH?', 'Required Documents', 'My Category Scholarships']
      };
    }

    // 21. WOMEN SCHEMES (Mahila Samriddhi, New Swarnima)
    if (text.includes('महिला') || text.includes('woman') || text.includes('women') || text.includes('girl') || text.includes('लड़की') || text.includes('samriddhi') || text.includes('swarnima') || text.includes('समृद्धि') || text.includes('स्वर्णिमा')) {
      const womenText = isHindi
        ? `### 🌸 महिलाओं हेतु विशेष सरकारी कल्याणकारी ऋण योजनाएं:

1. **महिला समृद्धि योजना (Mahila Samriddhi Yojana - MSY)**:
   - **पात्रता**: अनुसूचित जाति (SC) एवं पिछड़ा वर्ग (OBC) की महिलाएं।
   - **ऋण राशि**: ₹1,40,000 तक।
   - **ब्याज दर**: मात्र **4.0% प्रतिवर्ष** (बाजार दरों से बहुत कम)।
   - **सब्सिडी**: परियोजना लागत पर **25% तक सरकारी पूंजीगत अनुदान**।
   - **उद्देश्य**: सिलाई, बुनाई, किराना, ब्यूटी पार्लर, डेयरी, और लघु कुटीर उद्योग।

2. **न्यू स्वर्णिमा योजना (New Swarnima for OBC Women)**:
   - **ऋण राशि**: ₹2,00,000 तक 5% ब्याज दर पर।
   - **सुविधा**: महिलाओं को स्वतंत्र उद्यम शुरू करने हेतु व्यक्तिगत जमानत की सरल शर्तें।

3. **स्टैंड-अप इंडिया (Stand-Up India)**:
   - प्रत्येक बैंक शाखा से महिला उद्यमी को ₹10 लाख से ₹1 करोड़ तक का विनिर्माण/सेवा ऋण।

💡 **डिजिलॉकर लाभ**: आप आधार कार्ड और आय/जाति प्रमाण पत्र को सीधे डिजिलॉकर से जोड़कर बिना लाइन लगे आवेदन कर सकती हैं।`
        : `### 🌸 Dedicated Government Schemes for Women Entrepreneurs:

1. **Mahila Samriddhi Yojana (MSY - NSFDC & NBCFDC)**:
   - **Target**: SC and OBC women self-help groups & individual entrepreneurs.
   - **Financing Limit**: Up to **₹1,40,000**.
   - **Concessional Interest**: Flat **4.0% per annum**.
   - **Capital Subsidy**: Up to **25% capital subsidy** on project cost.
   - **Permitted Trades**: Tailoring, handicrafts, grocery stores, dairy, cottage micro-units.

2. **New Swarnima Scheme (for OBC Women)**:
   - **Ceiling**: Up to **₹2,00,000** at an attractive concessional rate of 5% p.a.
   - **Moratorium**: 6 months grace period on principal repayment.

3. **Stand-Up India Scheme**:
   - Bank financing between **₹10 Lakh and ₹1 Crore** per bank branch for women greenfield ventures.

💡 **DigiLocker Advantage**: Women applicants can instantly verify identity & community certificates digitally without paperwork delays.`;

      return {
        id: replyId,
        sender: 'bot',
        text: womenText,
        timestamp,
        citedSchemeCode: 'NSFDC-MSY-02',
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'महिला समृद्धि योजना देखें →' : 'View Mahila Samriddhi Scheme →',
        quickReplies: isHindi
          ? ['ईएमआई की गणना करें', 'आवश्यक दस्तावेज़ चेकलिस्ट', 'निकटतम SCA कार्यालय']
          : ['Calculate Monthly EMI', 'Document Checklist', 'Locate Nearest SCA Office']
      };
    }

    // 22. SANITATION & SAFAI KARAMCHARI SCHEMES (SUY, SRMS, Sanrakshan)
    if (text.includes('safai') || text.includes('सफाई') || text.includes('karamchari') || text.includes('कर्मचारी') || text.includes('swachhta') || text.includes('udyami') || text.includes('मैनुअल') || text.includes('scavenger') || text.includes('sanitation') || text.includes('sewer') || text.includes('सेप्टिक')) {
      const suyText = isHindi
        ? `### 🛡️ राष्ट्रीय सफाई कर्मचारी वित्त निगम (NSKFDC) की प्रमुख योजनाएं:

1. **स्वच्छता उद्यमी योजना (Swachhta Udyami Yojana - SUY)**:
   - **उद्देश्य**: सफाई कर्मचारियों एवं मुक्त मैनुअल स्कैवेंजर्स को सीवर/सेप्टिक टैंक सफाई के अत्याधुनिक मशीनीकृत वाहन (सक्शन व जेटिंग मशीन, वैक्यूम लोडर) उपलब्ध कराना।
   - **परियोजना लागत**: **₹50,00,000 तक**।
   - **सरकारी पूंजीगत सब्सिडी**: **25% से 50% तक** (अधिकतम ₹5 लाख तक)।
   - **रियायती ब्याज दर**: मात्र **4% से 6% प्रतिवर्ष**।
   - **मोराटोरियम**: 6 माह की शुरुआती किस्तों में छूट।

2. **हाथ से मैला उठाने वाले कर्मियों का पुनर्वास (SRMS)**:
   - चिन्हित सफाई कर्मियों को **₹40,000 की एकमुश्त नकद सहायता (OTCA)**।
   - 2 वर्ष तक प्रतिमाह ₹3,000 का प्रशिक्षण वजीफा।
   - स्वरोजगार हेतु ₹5,00,000 तक की पूंजीगत सब्सिडी।

3. **संरक्षण योजना (Sanrakshan Yojana)**:
   - व्यक्तिगत सुरक्षा किट (PPE), गैस डिटेक्टर और सुरक्षा उपकरण खरीदने हेतु वित्तीय मदद।`
        : `### 🛡️ National Safai Karamcharis Finance & Development Corporation (NSKFDC) Schemes:

1. **Swachhta Udyami Yojana (SUY - Mechanized Sanitation Enterprise)**:
   - **Objective**: Mechanize hazardous sewer and septic tank cleaning by providing specialized vacuum-loader and suction-jetting trucks.
   - **Project Ceiling**: Up to **₹50,00,000**.
   - **Govt Capital Subsidy**: **25% to 50% capital subsidy** (up to ₹5 Lakh direct grant).
   - **Interest Rate**: Highly concessional **4% to 6% p.a.**
   - **Moratorium**: 6-month moratorium grace period.

2. **SRMS (Self Employment Scheme for Rehabilitation of Manual Scavengers)**:
   - Immediate **₹40,000 One-Time Cash Assistance (OTCA)** to identified workers.
   - Monthly skill training stipend of ₹3,000 up to 2 years.
   - Up to ₹5 Lakh capital subsidy on enterprise loans.

3. **Sanrakshan Yojana**:
   - Concessional finance for PPE safety suits, gas detectors, and mechanized cleaning equipment.`;

      return {
        id: replyId,
        sender: 'bot',
        text: suyText,
        timestamp,
        citedSchemeCode: 'NSKFDC-SUY-08',
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'स्वच्छता उद्यमी योजना देखें →' : 'View Swachhta Udyami Scheme →',
        quickReplies: isHindi
          ? ['₹25 लाख के वाहन पर ईएमआई', 'पात्रता व दस्तावेज़', 'निकटतम पार्टनर डेस्क']
          : ['EMI for ₹25 Lakh Truck', 'Eligibility & Documents', 'Locate Partner Desk']
      };
    }

    // 23. GENERAL CATEGORY & EBC ELIGIBILITY INTENT
    if (text.includes('general category') || text.includes('सामान्य वर्ग') || text.includes('open category') || text.includes('unreserved') || text.includes('general wale') || text.includes('general walon') || text.includes('ebc')) {
      const genText = isHindi
        ? `### 🏛️ सामान्य वर्ग (General Category / EBC) के लिए सरकारी योजनाएं:

सामाजिक न्याय मंत्रालय एवं भारत सरकार के अंतर्गत सामान्य वर्ग के नागरिक भी निम्नलिखित योजनाओं में पूरी तरह पात्र हैं:

1. **आर्थिक पिछड़ा वर्ग (EBC) - NBCFDC योजनाएं**:
   - यदि आपकी पारिवारिक वार्षिक आय **₹3.00 लाख से कम** है, तो आप EBC वर्ग के तहत NBCFDC की सभी रियायती ऋण योजनाओं (4%-6% ब्याज) के पात्र हैं।
   - **PM-DAKSH**: EBC युवाओं को 100% नि:शुल्क तकनीकी प्रशिक्षण + ₹1,000-₹1,500/माह स्टाइपेंड।
   - **PM-YASASVI**: EBC स्कूल छात्रों हेतु ₹1.25 लाख/वर्ष तक की छात्रवृत्ति।

2. **दिव्यांगजन एवं वरिष्ठ नागरिक (Universal Eligibility)**:
   - जाति की कोई पाबंदी नहीं। **ADIP योजना** (नि:शुल्क सहायक उपकरण) और **राष्ट्रीय वयोश्री योजना** (बुजुर्गों के उपकरण) में सभी वर्गों के नागरिक पात्र हैं।

3. **केंद्रीय स्वरोजगार योजनाएं (सभी वर्गों हेतु खुली)**:
   - **पीएम मुद्रा योजना**: ₹50,000 से ₹10 लाख तक बिना गारंटी ऋण।
   - **पीएम स्वनिधि**: स्ट्रीट वेंडर्स हेतु ₹50,000 तक 7% ब्याज सब्सिडी ऋण।
   - **पीएम विश्वकर्मा**: 18 शिल्पकार व्यवसायों में ₹3 लाख का ऋण 5% ब्याज पर।
   - **PMEGP**: ग्रामीण क्षेत्रों में नई विनिर्माण/सेवा इकाई पर **25% तक सरकारी पूंजीगत सब्सिडी**।`
        : `### 🏛️ Government Schemes for General Category & EBC Beneficiaries:

General / Open category citizens are eligible across several statutory MoSJE and central welfare initiatives:

1. **Economically Backward Classes (EBC) under NBCFDC**:
   - If your certified family income is **below ₹3.00 Lakh per annum**, you qualify as EBC for concessional 4%–6% loans under NBCFDC.
   - **PM-DAKSH**: 100% free high-tech skilling + monthly DBT stipend for EBC candidates.
   - **PM-YASASVI**: School scholarships up to ₹1.25 Lakh/year for EBC students.

2. **Universal Inclusivity (Zero Caste Restrictions)**:
   - **ADIP Scheme**: Assistive devices & motorized tricycles for Divyangjan (40%+ disability).
   - **Rashtriya Vayoshri Yojana (RVY)**: Free living devices for Senior Citizens aged 60+.

3. **Universal Enterprise Initiatives**:
   - **PM-MUDRA**: Collateral-free loans up to ₹10 Lakh / ₹20 Lakh.
   - **PM SVANidhi**: Street vendor working capital up to ₹50,000 with 7% interest subsidy.
   - **PM Vishwakarma**: 5% interest loans up to ₹3 Lakh for traditional artisans.
   - **PMEGP**: Up to 25% capital subsidy in rural areas for new enterprises.`;

      return {
        id: replyId,
        sender: 'bot',
        text: genText,
        timestamp,
        actionTab: 'recommendations',
        actionLabel: isHindi ? 'पात्र योजनाएं देखें →' : 'View Eligible Schemes →',
        quickReplies: isHindi
          ? ['मेरी पात्रता जांचें', 'ईएमआई कैलकुलेटर', 'दस्तावेज़ चेकलिस्ट']
          : ['Check Eligibility', 'Loan Calculator', 'Document Checklist']
      };
    }

    // 24. BUSINESS IDEAS BY BUDGET (Boutique, Salon, Dairy, Kirana, Vehicle)
    if (text.includes('business idea') || text.includes('दुकान') || text.includes('काम') || text.includes('रोजगार') || text.includes('startup idea') || text.includes('dairy') || text.includes('डेयरी') || text.includes('boutique') || text.includes('सिलाई') || text.includes('salon') || text.includes('पार्लर') || text.includes('kirana') || text.includes('किराना') || text.includes('e-rickshaw') || text.includes('रिक्शा')) {
      const ideaText = isHindi
        ? `### 💡 बजट अनुसार व्यावहारिक स्वरोजगार विचार (4%-6% रियायती ऋण योग्य):

1. **₹50,000 से ₹1,40,000 बजट** *(महिला समृद्धि योजना - 4% ब्याज)*:
   - आधुनिक सिलाई, बुटीक एवं रेडीमेड गारमेंट्स सेंटर।
   - ब्यूटी पार्लर, कॉस्मेटिक व चूड़ी केंद्र।
   - आटा-मसाला चक्की व पापड़/अचार गृह उद्योग।

2. **₹1,50,000 से ₹3,00,000 बजट** *(न्यू स्वर्णिमा / PM विश्वकर्मा)*:
   - किराना/जनरल स्टोर अथवा डेयरी व दुग्ध संकलन केंद्र (2 दुधारू गाय/भैंस)।
   - बढ़ईगीरी, लोहार, मूर्तिकला, अथवा दर्जी स्टूडियो (₹15,000 टूलकिट अनुदान सहित)।
   - डिजिटल ई-सेवा व फोटोकॉपी कियोस्क।

3. **₹5,00,000 से ₹15,00,000 बजट** *(सामान्य मियादी ऋण / ग्रीन बिजनेस)*:
   - ई-रिक्शा, मिनी मालवाहक टेंपो अथवा ट्रैक्टर कृषि सेवा केंद्र।
   - कोल्ड स्टोरेज, बेकरी यूनिट, अथवा ऑटोमोबाइल गैराज।

4. **₹15,00,000 से ₹50,00,000 बजट** *(स्वच्छता उद्यमी योजना - 50% सब्सिडी)*:
   - सीवर व सेप्टिक टैंक सक्शन-जेटिंग ट्रक (नगर निगम अनुबंध आधारित)।`
        : `### 💡 High-Viability Enterprise Ideas Filtered by Concessional Loan Budget:

1. **Micro Bracket (₹50,000 to ₹1,40,000)** *(Mahila Samriddhi - 4% Interest)*:
   - Tailoring, embroidery, and boutique garment studio.
   - Professional beauty parlor & organic cosmetics retail.
   - Home-based food processing, spices, and flour milling.

2. **Small Bracket (₹1,50,000 to ₹3,00,000)** *(New Swarnima / PM Vishwakarma)*:
   - Dairy farming (2 milch cows/buffaloes) with automated milk chillers.
   - Traditional crafts & metalwork with ₹15,000 toolkit e-voucher.
   - CSC Citizen digital kiosk & stationery outlet.

3. **Medium Enterprise (₹5,00,000 to ₹15,00,000)** *(General Term Loan / Green Business)*:
   - Commercial electric auto-rickshaws, cargo tempos, or mini tractors.
   - Bakery plant, commercial cloud kitchen, or hardware showroom.

4. **Sanitation Mechanization (₹15,00,000 to ₹50,00,000)** *(SUY - 50% Subsidy)*:
   - Mechanized sewer vacuum jetting truck with municipal maintenance contracts.`;

      return {
        id: replyId,
        sender: 'bot',
        text: ideaText,
        timestamp,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'व्यवसाय ईएमआई मॉडलर खोलें →' : 'Model Enterprise Loan EMI →',
        quickReplies: isHindi
          ? ['महिला योजनाएं', 'ईएमआई कैलकुलेटर', 'दस्तावेज़ चेकलिस्ट']
          : ['Women Schemes', 'Loan Calculator', 'Document Checklist']
      };
    }

    // 25. LOAN & EMI CALCULATION INTENT (With Dynamic Parameter Extraction)
    if (text.includes('emi') || text.includes('किस्त') || text.includes('interest') || text.includes('ब्याज') || text.includes('loan') || text.includes('ऋण') || text.includes('calculator') || text.includes('calculate') || text.includes('गणना')) {
      let loanAmount = 300000;
      let tenure = 5;
      let customRate: number | null = null;

      // Extract amount
      const lakhMatch = text.match(/(\d+(\.\d+)?)\s*(lakh|lac|लाख)/i);
      const kMatch = text.match(/(\d+(\.\d+)?)\s*(k|thousand|हजार)/i);
      const rawNumMatch = text.match(/₹?\s*(\d{4,8})/);

      if (lakhMatch) {
        loanAmount = parseFloat(lakhMatch[1]) * 100000;
      } else if (kMatch) {
        loanAmount = parseFloat(kMatch[1]) * 1000;
      } else if (rawNumMatch) {
        loanAmount = parseFloat(rawNumMatch[1]);
      } else {
        const anyNum = text.match(/(\d+(\.\d+)?)/);
        if (anyNum) {
          const val = parseFloat(anyNum[1]);
          if (val <= 50) loanAmount = val * 100000;
        }
      }

      // Extract tenure
      const tenureMatch = text.match(/(\d+)\s*(year|yr|साल|वर्ष)/i);
      if (tenureMatch) {
        tenure = parseInt(tenureMatch[1], 10);
      }

      // Extract explicit interest rate
      const rateMatch = text.match(/(\d+(\.\d+)?)\s*(%|percent|प्रतिशत)/i);
      if (rateMatch) {
        customRate = parseFloat(rateMatch[1]);
      }

      const scheme = selectedScheme || REAL_MOSJE_SCHEMES[0];
      const moratorium = scheme.moratoriumMonths || 6;
      const calcResult = LoanCalculatorService.calculate(loanAmount, tenure, moratorium, scheme);

      const effectiveRate = customRate !== null ? customRate : calcResult.annualInterestRate;

      // Recompute if custom rate was specified in user query
      let regularEmi = calcResult.regularMonthlyEmi;
      let moraInterest = calcResult.moratoriumMonthlyInterest;
      if (customRate !== null) {
        const monthlyRate = (customRate / 100) / 12;
        moraInterest = loanAmount * monthlyRate;
        const totalMonths = tenure * 12;
        const activeMonths = totalMonths - Math.min(moratorium, totalMonths - 6);
        if (monthlyRate > 0 && activeMonths > 0) {
          regularEmi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, activeMonths)) / (Math.pow(1 + monthlyRate, activeMonths) - 1);
        }
      }

      const emiText = isHindi
        ? `### 📊 मोराटोरियम-युक्त ऋण ईएमआई वित्तीय मॉडल (${scheme.agency}):

- 💰 **स्वीकृत ऋण राशि**: ₹${(loanAmount / 100000).toFixed(2)} लाख
- 📉 **रियायती ब्याज दर**: **${effectiveRate}% प्रतिवर्ष** (बाजार दरों से आधी)
- ⏳ **कुल ऋण अवधि**: **${tenure} वर्ष** (${tenure * 12} माह)
- 🛡️ **मोराटोरियम छूट**: **प्रथम ${moratorium} माह** (व्यवसाय स्थापना हेतु)
- 💵 **मोराटोरियम अवधि में देय ब्याज**: **₹${Math.round(moraInterest)} / माह**
- 💳 **नियमित मासिक ईएमआई**: **₹${Math.round(regularEmi)} / माह**
- 🎁 **अनुमानित सरकारी सब्सिडी लाभ**: **₹${Math.round(calcResult.subsidyAmount)}**

💡 *मोराटोरियम का लाभ*: पहले ${moratorium} महीने आपको मूलधन नहीं चुकाना होता, जिससे आपके व्यवसाय की शुरुआती पूंजी सुरक्षित रहती है।`
        : `### 📊 Moratorium-Aware Loan Repayment Breakdown (${scheme.agency}):

- 💰 **Sanctioned Loan Amount**: **₹${(loanAmount / 100000).toFixed(2)} Lakh**
- 📉 **Concessional Interest Rate**: **${effectiveRate}% p.a.**
- ⏳ **Tenure**: **${tenure} Years** (${tenure * 12} months total)
- 🛡️ **Setup Grace Period**: **${moratorium} Months Moratorium**
- 💵 **Moratorium Monthly Interest**: **₹${Math.round(moraInterest)} / month**
- 💳 **Regular Monthly Installment (EMI)**: **₹${Math.round(regularEmi)} / month**
- 🎁 **Estimated Govt Capital Subsidy**: **₹${Math.round(calcResult.subsidyAmount)}**

💡 *Moratorium Benefit*: During the first ${moratorium} months, you only service interest, preserving your initial operating cash flow.`;

      return {
        id: replyId,
        sender: 'bot',
        text: emiText,
        timestamp,
        citedSchemeCode: scheme.code,
        actionTab: 'calculator',
        actionLabel: isHindi ? 'इंटरएक्टिव ईएमआई मॉडलर खोलें →' : 'Open Loan Modeler →',
        quickReplies: isHindi
          ? ['दस्तावेज़ चेकलिस्ट देखें', 'पार्टनर कार्यालय खोजें', 'मेरी योजनाएं']
          : ['Document Audit Checklist', 'Locate Partner Desk', 'Check Eligibility']
      };
    }

    // 26. DOCUMENT CHECKLIST & DIGILOCKER INTENT
    if (text.includes('document') || text.includes('दस्तावेज़') || text.includes('kagaz') || text.includes('कागज़') || text.includes('digilocker') || text.includes('डिजिलॉकर')) {
      const scheme = selectedScheme || REAL_MOSJE_SCHEMES[0];
      const docText = isHindi
        ? `### 📋 योजना आवेदन हेतु अनिवार्य 5 दस्तावेज़ (${scheme.name}):

1. **आधार कार्ड**: पहचान एवं पते के प्रमाण हेतु।
2. **जाति प्रमाण पत्र (Caste Certificate)**: अधिकृत सक्षम राजस्व अधिकारी (एसडीएम/तहसीलदार) द्वारा जारी।
3. **पारिवारिक आय प्रमाण पत्र (Income Certificate)**: वार्षिक आय सीमा के भीतर होने का प्रमाण।
4. **परियोजना रिपोर्ट / कोटेशन (DPR)**: खरीदे जाने वाले उपकरण, मशीन या दुकान की दर सूची।
5. **आधार-सीडेड बैंक पासबुक**: प्रत्यक्ष लाभ हस्तांतरण (DBT) और ऋण वितरण हेतु।

⚡ **डिजिलॉकर (DigiLocker) की सुविधा**:
आप अपने आधार, जाति व आय प्रमाण पत्र को डिजिलॉकर के माध्यम से तत्काल डिजिटल रूप से सत्यापित करा सकते हैं, जिससे कागजी जांच का समय 14 दिन से घटकर 2 मिनट हो जाता है!`
        : `### 📋 Mandatory Verification Documents (${scheme.name}):

1. **Aadhaar Card**: Authentic digital identity and domicile proof.
2. **Caste / Community Certificate**: Issued by designated Revenue Officer (SDM/Tehsildar).
3. **Family Income Certificate**: Proving certified annual income is within the scheme ceiling.
4. **Detailed Project Report (DPR) / Cost Quotation**: Machinery or inventory estimates.
5. **Aadhaar-Linked Bank Account Passbook**: For direct credit and DBT subsidy transfer.

⚡ **DigiLocker Express Advantage**:
Directly pull your digitally signed certificates via DigiLocker inside SAHAYAK for zero-paperwork approval in under 2 minutes!`;

      return {
        id: replyId,
        sender: 'bot',
        text: docText,
        timestamp,
        citedSchemeCode: scheme.code,
        actionTab: 'checklist',
        actionLabel: isHindi ? 'दस्तावेज़ चेकलिस्ट खोलें →' : 'Open Document Checklist →',
        quickReplies: isHindi
          ? ['डिजिलॉकर से जोड़ें', 'ईएमआई की गणना करें', 'निकटतम SCA कार्यालय']
          : ['Verify with DigiLocker', 'Calculate Loan EMI', 'Locate SCA Branch']
      };
    }

    // 27. CHANNEL PARTNER & DISTRICT OFFICE LOCATOR
    if (text.includes('partner') || text.includes('पार्टनर') || text.includes('office') || text.includes('कार्यालय') || text.includes('branch') || text.includes('शाखा') || text.includes('kahan') || text.includes('कहाँ') || text.includes('address') || text.includes('पता') || text.includes('indore') || text.includes('इंदौर') || text.includes('bank') || text.includes('बैंक') || text.includes('desk') || text.includes('sca')) {
      const partner = selectedPartner || CHANNEL_PARTNERS_DATABASE[0];
      const distance = selectedPartner ? selectedPartner.distanceKm : 3.8;

      const partnerText = isHindi
        ? `### 🏛️ आपके जिले के लिए नामित राज्य चैनललाइजिंग एजेंसी (SCA) कार्यालय:

- 🏢 **कार्यालय का नाम**: **${partner.name}**
- 📍 **पता**: ${partner.address}, पिन कोड: ${partner.pinCode}
- 👤 **नोडल अधिकारी**: **${partner.contactPerson}**
- 📞 **हेल्पलाइन नंबर**: **${partner.phone}**
- ⏰ **कार्य समय**: ${partner.workingHours}
- 📏 **दूरी**: आपके स्थान से लगभग **${distance} किमी**
- 🛡️ **सेवाएं**: ऑफलाइन फॉर्म जमा करना, भौतिक दस्तावेज़ मिलान, और ऋण स्वीकृति पर्ची।

💡 *सुझाव*: अपने SAHAYAK डैशबोर्ड से **रूटिंग पर्ची (Routing Slip)** का प्रिंटआउट या क्यूआर कोड साथ ले जाएं।`
        : `### 🏛️ Designated State Channelizing Agency (SCA) Branch:

- 🏢 **Office Name**: **${partner.name}**
- 📍 **Address**: ${partner.address}, PIN: ${partner.pinCode}
- 👤 **Nodal Officer**: **${partner.contactPerson}**
- 📞 **Direct Contact**: **${partner.phone}**
- ⏰ **Working Hours**: ${partner.workingHours}
- 📏 **Distance**: **${distance} km from your current location**
- 🛡️ **Available Services**: Instant slip verification, document submission, and fast-track clearance.

💡 *Pro Tip*: Carry your printable SAHAYAK routing QR pass for priority desk clearance.`;

      return {
        id: replyId,
        sender: 'bot',
        text: partnerText,
        timestamp,
        actionTab: 'partners',
        actionLabel: isHindi ? 'गूगल मैप्स व कार्यालय विवरण →' : 'View Office Map & Details →',
        quickReplies: isHindi
          ? ['रूटिंग पर्ची प्रिंट करें', 'दस्तावेज़ चेकलिस्ट', 'ईएमआई कैलकुलेटर']
          : ['Print Routing Slip', 'Required Documents', 'Loan Calculator']
      };
    }

    // 28. APPLICATION STATUS INTENT
    if (text.includes('status') || text.includes('स्थिति') || text.includes('application') || text.includes('आवेदन') || text.includes('track') || text.includes('कहाँ पहुँचा')) {
      if (activeApplication) {
        const statusText = isHindi
          ? `### 📑 आपके सक्रिय आवेदन की ताज़ा स्थिति:

- 🔖 **आवेदन संदर्भ संख्या**: **${activeApplication.referenceNumber}**
- 🏛️ **योजना**: ${activeApplication.schemeName} (${activeApplication.agency})
- ⏳ **वर्तमान चरण**: **${activeApplication.stage}**
- 📄 **दस्तावेज़ सत्यापन**: ${activeApplication.documentsReady} / ${activeApplication.documentsTotal} सत्यापित
- 🏢 **नामित कार्यालय**: ${activeApplication.partnerName || 'मध्य प्रदेश राज्य पिछड़ा वर्ग विकास निगम'}
- ⏰ **अंतिम अद्यतन**: ${activeApplication.lastUpdated}

आप अपने डैशबोर्ड पर संपूर्ण टाइमलाइन और क्यूआर पर्ची देख सकते हैं।`
          : `### 📑 Real-Time Application Tracking:

- 🔖 **Reference ID**: **${activeApplication.referenceNumber}**
- 🏛️ **Scheme**: ${activeApplication.schemeName} (${activeApplication.agency})
- ⏳ **Current Stage**: **${activeApplication.stage}**
- 📄 **Document Readiness**: ${activeApplication.documentsReady} of ${activeApplication.documentsTotal} verified
- 🏢 **Designated Desk**: ${activeApplication.partnerName || 'Designated SCA Office'}
- ⏰ **Last Activity**: ${activeApplication.lastUpdated}

You can view the full timeline and printable QR pass on your Dashboard.`;

        return {
          id: replyId,
          sender: 'bot',
          text: statusText,
          timestamp,
          actionTab: 'dashboard',
          actionLabel: isHindi ? 'डैशबोर्ड पर आवेदन देखें →' : 'View Application on Dashboard →',
          quickReplies: isHindi ? ['दस्तावेज़ चेकलिस्ट देखें', 'पार्टनर से संपर्क करें'] : ['Check Required Documents', 'Contact Partner Desk']
        };
      }
    }

    // 29. DYNAMIC SCHEME KEYWORD & CODE MATCHER (Matches any of the 12 statutory schemes)
    for (const s of REAL_MOSJE_SCHEMES) {
      const codeMatch = text.includes(s.code.toLowerCase());
      const nameMatch = text.includes(s.name.toLowerCase()) || (s.hindiName && text.includes(s.hindiName.toLowerCase()));
      const abbrevMatch = s.code.split('-').some(part => part.length > 2 && text.includes(part.toLowerCase()));

      if (codeMatch || nameMatch || abbrevMatch) {
        const rate = s.interestSlabs?.[0]?.ratePercent ? `${s.interestSlabs[0].ratePercent}% p.a.` : '4.0%–6.0%';
        const dynText = isHindi
          ? `### 🏛️ ${s.hindiName || s.name} (${s.code})

- 🏢 **संचालन निगम**: **${s.agency}** (सामाजिक न्याय एवं अधिकारिता मंत्रालय)
- 💰 **अधिकतम परियोजना लागत / ऋण**: **₹${(s.maxLoanAmount / 100000).toFixed(2)} लाख**
- 📉 **रियायती ब्याज दर**: **${rate}** (बाजार दरों से आधी)
- 🛡️ **मोराटोरियम छूट**: **${s.moratoriumMonths} माह** की किस्तों में छूट
- ⏳ **अधिकतम पुनर्भुगतान अवधि**: **${s.maxTenureYears} वर्ष**
- 🎯 **पात्रता वर्ग**: **${s.targetCommunity}** (पारिवारिक आय सीमा: ${s.incomeCeiling === 0 ? 'कोई सीमा नहीं' : `₹${(s.incomeCeiling / 100000).toFixed(1)} लाख वार्षिक`})
- 📋 **आवश्यक कागज़ात**: ${s.requiredDocuments?.join(', ')}

📝 **उद्देश्य**: ${s.description}`
          : `### 🏛️ ${s.name} (${s.code})

- 🏢 **Apex Agency**: **${s.agency}** (Ministry of Social Justice & Empowerment)
- 💰 **Maximum Concessional Credit**: **₹${(s.maxLoanAmount / 100000).toFixed(2)} Lakh**
- 📉 **Interest Rate**: **${rate}**
- 🛡️ **Setup Moratorium**: **${s.moratoriumMonths} Months** principal grace period
- ⏳ **Repayment Tenure**: Up to **${s.maxTenureYears} Years**
- 🎯 **Target Beneficiaries**: **${s.targetCommunity}** (Income Ceiling: ${s.incomeCeiling === 0 ? 'Zero Ceiling' : `Up to ₹${(s.incomeCeiling / 100000).toFixed(1)} Lakh/year`})
- 📋 **Mandatory Documents**: ${s.requiredDocuments?.join(', ')}

📝 **Scope**: ${s.description}`;

        return {
          id: replyId,
          sender: 'bot',
          text: dynText,
          timestamp,
          citedSchemeCode: s.code,
          actionTab: 'recommendations',
          actionLabel: isHindi ? 'योजना का पूरा विवरण देखें →' : 'View Scheme Details →',
          quickReplies: isHindi
            ? ['ईएमआई की गणना करें', 'दस्तावेज़ चेकलिस्ट', 'निकटतम SCA कार्यालय']
            : ['Calculate Monthly EMI', 'Document Checklist', 'Locate SCA Branch']
        };
      }
    }

    // 30. GENERAL / COMPREHENSIVE INTELLIGENT FALLBACK
    const topScheme = REAL_MOSJE_SCHEMES[0];

    const fallbackText = isHindi
      ? `### 🏛️ सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) - सहायक AI मार्गदर्शन:

आपके प्रश्न के संदर्भ में:

1. **रियायती ऋण व पूंजीगत सहायता**:
   - MoSJE के तीनों निगम (NSFDC, NBCFDC, NSKFDC) स्वरोजगार व व्यवसाय स्थापना हेतु ₹50,00,000 तक का ऋण मात्र **4% से 6% प्रतिवर्ष ब्याज दर** पर 6 माह के मोराटोरियम के साथ प्रदान करते हैं।
2. **सब्सिडी एवं अनुदान**:
   - स्वच्छता उद्यमी योजना (SUY) में 50% तक, महिला समृद्धि योजना में 25% तक, और हाथ से मैला उठाने वालों के पुनर्वास (SRMS) में ₹40,000 नकद व ₹5 लाख तक की सब्सिडी मिलती है।
3. **कौशल व छात्रवृत्ति**:
   - **PM-DAKSH**: युवाओं को नि:शुल्क तकनीकी प्रशिक्षण + ₹1,000-₹1,500/माह वजीफा।
   - **PM-YASASVI**: स्कूल विद्यार्थियों हेतु ₹1.25 लाख/वर्ष तक की छात्रवृत्ति।
4. **कागज़ात व सत्यापन**:
   - आधार, जाति प्रमाण पत्र और आय प्रमाण पत्र को आप **डिजिलॉकर** से सीधे प्रमाणित कर सकते हैं।
5. **सहायता व हेल्पलाइन**:
   - राष्ट्रीय हेल्पलाइन: **\`14566\`** (अत्याचार निवारण), **\`14567\`** (वरिष्ठ नागरिक), **\`1800-11-2001\`** (नागरिक सहायता)।

आप मुझसे किसी भी विशिष्ट योजना, ईएमआई गणना, प्रमाण पत्र बनवाने की विधि, या निकटतम कार्यालय के बारे में पूछ सकते हैं!`
      : `### 🏛️ MoSJE Welfare Guidance & Statutory Advisory:

In reference to your inquiry:

1. **Concessional Credit Support**:
   - Access up to ₹50,00,000 at highly subsidized annual interest rates of **4.0% to 6.0% p.a.** across NSFDC (SC), NBCFDC (OBC/EBC), and NSKFDC (Sanitation Workers) with a 6-month moratorium grace period.
2. **Capital Subsidies & Grants**:
   - Swachhta Udyami Yojana (SUY) provides up to 50% capital grant, Mahila Samriddhi offers 25% subsidy, and SRMS provides ₹40,000 instant cash assistance.
3. **Free Skilling & Scholarships**:
   - **PM-DAKSH**: 100% free certified tech skilling + monthly DBT stipend.
   - **PM-YASASVI & NOS**: Comprehensive domestic and overseas educational scholarships.
4. **Express Verification**:
   - Instant 1-click verification of Aadhaar, Caste, and Income credentials via DigiLocker.
5. **National Helplines**:
   - NHAA (Atrocities): **\`14566\`** | Elderline: **\`14567\`** | Central Desk: **\`1800-11-2001\`**.

Ask me any specific question about scheme eligibility, loan repayment EMI, document processing, or partner branch locations!`;

    return {
      id: replyId,
      sender: 'bot',
      text: fallbackText,
      timestamp,
      citedSchemeCode: topScheme.code,
      actionTab: 'recommendations',
      actionLabel: isHindi ? 'सभी योजनाएं देखें →' : 'View Matching Schemes →',
      quickReplies: isHindi
        ? ['मेरी पात्रता जांचें', 'ईएमआई कैलकुलेटर', 'दस्तावेज़ चेकलिस्ट', 'निकटतम SCA कार्यालय']
        : ['Check My Eligibility', 'Loan EMI Modeler', 'Document Checklist', 'Locate Partner Desk']
    };
  }
}
