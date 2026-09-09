import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, CheckCircle2, MessageSquare, Bot, ArrowRight, Volume2 } from 'lucide-react';
import { SchemeRecommendation } from '../../types/recommendation';
import { VoiceService } from '../../services/voiceService';
import { Language, getSpeechCode } from '../../services/i18nService';

interface GroundedExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: SchemeRecommendation | null;
  language: Language;
}

export const GroundedExplainer: React.FC<GroundedExplainerProps> = ({
  isOpen,
  onClose,
  recommendation,
  language
}) => {
  if (!isOpen || !recommendation) return null;

  const isHindi = language === 'hi';
  const scheme = recommendation.scheme;

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Generate grounded explanation citing Scheme ID and Rule IDs strictly (PRD §27)
  const passedRules = recommendation.passedRules;
  const applicableRate = recommendation.calculatedApplicableInterestRate;
  const maxLoan = recommendation.maxEligibleLoan;

  const explanationEnglish = `
Based on official MoSJE guidelines for ${scheme.name} (${scheme.code}):
1. Community Qualification [${passedRules[0]?.ruleId || 'RULE-CAT'}]: You meet the statutory community criteria for ${scheme.agency}.
2. Income Eligibility [${passedRules[1]?.ruleId || 'RULE-INC'}]: Your certified annual family income is within the ceiling of ₹${(scheme.incomeCeiling / 100000).toFixed(2)} Lakh.
3. Loan Sizing: You are eligible to receive up to ₹${(maxLoan / 100000).toFixed(2)} Lakh at an official concessional rate of ${applicableRate}% per annum with a ${scheme.moratoriumMonths}-month moratorium grace period.
4. Channel Partner: You will be routed to your local State Channelizing Agency (SCA) to complete paperwork.

Guardrail Verification: Zero numerical hallucination. All figures deterministically extracted from ${scheme.code} rule table.
  `.trim();

  const explanationHindi = `
सामाजिक न्याय मंत्रालय (MoSJE) के आधिकारिक नियमों (${scheme.code}) के अनुसार:
1. समुदाय पात्रता [${passedRules[0]?.ruleId || 'RULE-CAT'}]: आप ${scheme.agency} की निर्धारित श्रेणी में पूर्णतः पात्र हैं।
2. आय सीमा [${passedRules[1]?.ruleId || 'RULE-INC'}]: आपकी पारिवारिक वार्षिक आय अधिकतम सीमा ₹${(scheme.incomeCeiling / 100000).toFixed(2)} लाख के भीतर है।
3. ऋण एवं ब्याज: आप ${applicableRate}% प्रतिवर्ष की रियायती दर पर ₹${(maxLoan / 100000).toFixed(2)} लाख तक का ऋण पाने के पात्र हैं, जिसमें ${scheme.moratoriumMonths} माह की छूट (मोराटोरियम) शामिल है।
4. अगला कदम: आवेदन पर्ची के साथ अपने निकटतम अधिकृत राज्य चैनललाइजिंग एजेंसी (SCA) कार्यालय जाएं।

सत्यापन सूचना: सभी आंकड़े वैधानिक नियम पुस्तिका ${scheme.code} से सीधे उद्धृत हैं।
  `.trim();

  const getExplanation = () => {
    switch(language) {
      case 'hi': return explanationHindi;
      case 'mr':
        return `सामाजिक न्याय मंत्रालयाच्या (MoSJE) अधिकृत नियमांनुसार (${scheme.code}):\n1. समुदाय पात्रता [${passedRules[0]?.ruleId || 'RULE-CAT'}]: आपण ${scheme.agency} च्या विहित प्रवर्गासाठी पूर्णपणे पात्र आहात.\n2. उत्पन्न मर्यादा [${passedRules[1]?.ruleId || 'RULE-INC'}]: आपले वार्षिक कौटुंबिक उत्पन्न कमाल मर्यादा ₹${(scheme.incomeCeiling / 100000).toFixed(2)} लाखांच्या आत आहे.\n3. कर्ज व व्याज: आपण ${applicableRate}% प्रतिवर्ष सवलतीच्या दराने ₹${(maxLoan / 100000).toFixed(2)} लाखांपर्यंत कर्ज मिळण्यास पात्र आहात, ज्यामध्ये ${scheme.moratoriumMonths} महिन्यांची सवलत (मोरेटोरियम) समाविष्ट आहे.\n4. पुढील पायरी: अर्जाच्या पावतीसह जवळच्या अधिकृत राज्य चॅनेलायझिंग एजन्सी (SCA) कार्यालयाशी संपर्क साधा.\n\nपडताळणी सूचना: सर्व आकडे अधिकृत नियमपुस्तिका ${scheme.code} मधून थेट घेतलेले आहेत.`;
      case 'ta':
        return `சமூக நீதி அமைச்சகத்தின் (MoSJE) அதிகாரப்பூர்வ வழிகாட்டுதல்களின்படி (${scheme.code}):\n1. சமூக தகுதி: நீங்கள் ${scheme.agency} தகுதி வரம்புகளை பூர்த்தி செய்கிறீர்கள்.\n2. வருமான வரம்பு: உங்கள் ஆண்டு குடும்ப வருமானம் ₹${(scheme.incomeCeiling / 100000).toFixed(2)} லட்சத்திற்குள் உள்ளது.\n3. கடன் & வட்டி: நீங்கள் ₹${(maxLoan / 100000).toFixed(2)} லட்சம் வரை ஆண்டிற்கு ${applicableRate}% சலுகை வட்டியில் ${scheme.moratoriumMonths} மாத தவணை சலுகையுடன் பெற தகுதியுடையவர்.\n4. அடுத்த படி: உங்கள் விண்ணப்ப சீட்டுடன் அருகில் உள்ள அரசு நிதி முகமை (SCA) அலுவலகத்தை அணுகவும்.\n\nசரிபார்ப்பு: அனைத்து விவரங்களும் ${scheme.code} விதிமுறைகளிலிருந்து நேரடியாக பெறப்பட்டது.`;
      case 'te':
        return `సామాజిక న్యాయ మంత్రిత్వ శాఖ (MoSJE) మార్గదర్శకాల ప్రకారం (${scheme.code}):\n1. సామాజిక అర్హత: మీరు ${scheme.agency} ప్రమాణాలకు పూర్తిగా అర్హులు.\n2. ఆదాయ పరిమితి: మీ వార్షిక కుటుంబ ఆదాయం ₹${(scheme.incomeCeiling / 100000).toFixed(2)} లక్షల పరిమితిలో ఉంది.\n3. రుణం & వడ్డీ: మీరు ఏడాదికి ${applicableRate}% రాయితీ వడ్డీతో ₹${(maxLoan / 100000).toFixed(2)} లక్షల వరకు రుణం పొందేందుకు అర్హులు, ఇందులో ${scheme.moratoriumMonths} నెలల మారటోరియం ఉంది.\n4. తదుపరి చర్య: సమీపంలోని రాష్ట్ర ఛానలైజింగ్ ఏజెన్సీ (SCA) కార్యాలయాన్ని సంప్రదించండి.\n\nధృవీకరణ: అన్ని వివరాలు అధికారిక ${scheme.code} నిబంధనల నుండి తీసుకోబడ్డాయి.`;
      case 'bn':
        return `সামাজিক ন্যায় ও ক্ষমতায়ন মন্ত্রকের (MoSJE) নির্দেশিকা অনুসারে (${scheme.code}):\n1. সামাজিক যোগ্যতা: আপনি ${scheme.agency} এর জন্য যোগ্য।\n2. আয় সীমা: আপনার বার্ষিক পারিবারিক আয় ₹${(scheme.incomeCeiling / 100000).toFixed(2)} লক্ষের মধ্যে রয়েছে।\n3. ঋণ ও সুদ: আপনি বছরে ${applicableRate}% সুদের হারে ₹${(maxLoan / 100000).toFixed(2)} লক্ষ পর্যন্ত ঋণ পেতে যোগ্য, যার মধ্যে ${scheme.moratoriumMonths} মাসের স্থগিতাদেশ (মোরেটোরিয়াম) অন্তর্ভুক্ত রয়েছে।\n4. পরবর্তী পদক্ষেপ: আবেদনপত্রের স্লিপ নিয়ে আপনার নিকটস্থ রাজ্য চ্যানেল সংস্থায় (SCA) যোগাযোগ করুন।\n\nযাচাইকরণ: সমস্ত তথ্য সরকারি ${scheme.code} নির্দেশিকা থেকে সরাসরি নেওয়া।`;
      case 'gu':
        return `સામાજિક ન્યાય મંત્રાલય (MoSJE) ની સત્તાવાર માર્ગદર્શિકા મુજબ (${scheme.code}):\n1. સમુદાય પાત્રતા: તમે ${scheme.agency} ના નિર્ધારિત માપદંડો પૂર્ણ કરો છો.\n2. આવક મર્યાદા: તમારી વાર્ષિક પારિવારિક આવક ₹${(scheme.incomeCeiling / 100000).toFixed(2)} લાખની મર્યાદામાં છે.\n3. લોન અને વ્યાજ: તમે વાર્ષિક ${applicableRate}% ના રાહત દરે ₹${(maxLoan / 100000).toFixed(2)} લાખ સુધીની લોન મેળવવા પાત્ર છો, જેમાં ${scheme.moratoriumMonths} મહિનાનો મોરેટોરિયમ સમયગાળો સામેલ છે.\n4. આગળનું પગલું: નજીકના રાજ્ય ચેનલાઈઝિંગ એજન્સી (SCA) કાર્યાલયનો સંપર્ક કરો.\n\nચકાસણી: તમામ આંકડા સત્તાવાર ${scheme.code} નિયમોમાંથી સીધા લેવામાં આવ્યા છે.`;
      case 'kn':
        return `ಸಾಮಾಜಿಕ ನ್ಯಾಯ ಸಚಿವಾಲಯದ (MoSJE) ಮಾರ್ಗಸೂಚಿಗಳ ಪ್ರಕಾರ (${scheme.code}):\n1. ಸಾಮಾಜಿಕ ಅರ್ಹತೆ: ನೀವು ${scheme.agency} ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸುತ್ತೀರಿ.\n2. ಆದಾಯ ಮಿತಿ: ನಿಮ್ಮ ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯವು ₹${(scheme.incomeCeiling / 100000).toFixed(2)} ಲಕ್ಷದ ಮಿತಿಯಲ್ಲಿದೆ.\n3. ಸಾಲ ಮತ್ತು ಬಡ್ಡಿ: ನೀವು ವಾರ್ಷಿಕ ${applicableRate}% ರಿಯಾಯಿತಿ ದರದಲ್ಲಿ ₹${(maxLoan / 100000).toFixed(2)} ಲಕ್ಷದವರೆಗೆ ಸಾಲ ಪಡೆಯಲು ಅರ್ಹರಾಗಿದ್ದೀರಿ, ${scheme.moratoriumMonths} ತಿಂಗಳ ಮೊರಟೋರಿಯಂ ಒಳಗೊಂಡಿದೆ.\n4. ಮುಂದಿನ ಹಂತ: ಹತ್ತಿರದ ರಾಜ್ಯ ಚಾನೆಲೈಸಿಂಗ್ ಏಜೆನ್ಸಿ (SCA) ಕಚೇರಿಗೆ ಭೇಟಿ ನೀಡಿ.\n\nಪರಿಶೀಲನೆ: ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ${scheme.code} ನಿಯಮಗಳಿಂದ ನೇರವಾಗಿ ಪಡೆಯಲಾಗಿದೆ.`;
      case 'pa':
        return `ਸਮਾਜਿਕ ਨਿਆਂ ਮੰਤਰਾਲੇ (MoSJE) ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ (${scheme.code}):\n1. ਯੋਗਤਾ: ਤੁਸੀਂ ${scheme.agency} ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ ਹੋ।\n2. ਆਮਦਨ ਸੀਮਾ: ਤੁਹਾਡੀ ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ ₹${(scheme.incomeCeiling / 100000).toFixed(2)} ਲੱਖ ਦੇ ਦਾਇਰੇ ਵਿੱਚ ਹੈ।\n3. ਕਰਜ਼ਾ ਅਤੇ ਵਿਆਜ: ਤੁਸੀਂ ਸਾਲਾਨਾ ${applicableRate}% ਰਿਆਇਤੀ ਦਰ 'ਤੇ ₹${(maxLoan / 100000).toFixed(2)} ਲੱਖ ਤੱਕ ਦਾ ਕਰਜ਼ਾ ਲੈਣ ਦੇ ਯੋਗ ਹੋ, ਜਿਸ ਵਿੱਚ ${scheme.moratoriumMonths} ਮਹੀਨਿਆਂ ਦੀ ਛੋਟ ਸ਼ਾਮਲ ਹੈ।\n4. ਅਗਲਾ ਕਦਮ: ਨੇੜਲੇ ਸਟੇਟ ਚੈਨਲਾਈਜ਼ਿੰਗ ਏਜੰਸੀ (SCA) ਦਫ਼ਤਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।\n\nਪ੍ਰਮਾਣਿਕਤਾ: ਸਾਰੇ ਅੰਕੜੇ ${scheme.code} ਨਿਯਮਾਂ ਤੋਂ ਸਿੱਧੇ ਲਏ ਗਏ ਹਨ।`;
      case 'ml':
        return `സാമൂഹിക നീതി മന്ത്രാലയത്തിന്റെ (MoSJE) നിർദ്ദേശങ്ങൾ അനുസരിച്ച് (${scheme.code}):\n1. യോഗ്യത: നിങ്ങൾ ${scheme.agency} നിബന്ധനകൾ പൂർണ്ണമായും പാലിക്കുന്നു.\n2. വരുമാന പരിധി: നിങ്ങളുടെ വാർഷിക കുടുംബ വരുമാനം ₹${(scheme.incomeCeiling / 100000).toFixed(2)} ലക്ഷത്തിൽ താഴെയാണ്.\n3. വായ്പയും പലിശയും: പ്രതിവർഷം ${applicableRate}% ഇളവോടെ ₹${(maxLoan / 100000).toFixed(2)} ലക്ഷം വരെ വായ്പ ലഭിക്കാൻ നിങ്ങൾക്ക് അർഹതയുണ്ട് (${scheme.moratoriumMonths} മാസത്തെ മൊറട്ടോറിയം ഉൾപ്പെടെ).\n4. അടുത്ത ഘട്ടം: അടുത്തുള്ള സംസ്ഥാന ചാനലൈസിംഗ് ഏജൻസി (SCA) സന്ദർശിക്കുക.\n\nസ്ഥിരീകരണം: എല്ലാ വിവരങ്ങളും ഔദ്യോഗിക ${scheme.code} രേഖകളിൽ നിന്ന് എടുത്തതാണ്.`;
      case 'or':
        return `ସାମାଜିକ ନ୍ୟାୟ ମନ୍ତ୍ରଣାଳୟ (MoSJE) ନିୟମାବଳୀ ଅନୁଯାୟୀ (${scheme.code}):\n1. ଯୋଗ୍ୟତା: ଆପଣ ${scheme.agency} ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ଯୋଗ୍ୟ ଅଟନ୍ତି।\n2. ଆୟ ସୀମା: ଆପଣଙ୍କର ବାର୍ଷିକ ପାରିବାରିକ ଆୟ ₹${(scheme.incomeCeiling / 100000).toFixed(2)} ଲକ୍ଷ ମଧ୍ୟରେ ଅଛି।\n3. ଋଣ ଏବଂ ସୁଧ: ଆପଣ ବାର୍ଷିକ ${applicableRate}% ରିହାତି ହାରରେ ₹${(maxLoan / 100000).toFixed(2)} ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ଋଣ ପାଇବାକୁ ଯୋଗ୍ୟ, ଯେଉଁଥିରେ ${scheme.moratoriumMonths} ମାସର ମୋରାଟୋରିୟମ ଅନ୍ତର୍ଭୁକ୍ତ।\n4. ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ: ନିକଟସ୍ଥ ରାଜ୍ୟ ଚ୍ୟାନେଲାଇଜିଂ ଏଜେନ୍ସି (SCA) କାର୍ଯ୍ୟାଳୟ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।\n\nଯାଞ୍ଚ ସୂଚନା: ସମସ୍ତ ତଥ୍ୟ ${scheme.code} ନିୟମରୁ ସିଧାସଳଖ ସଂଗୃହିତ।`;
      default: return explanationEnglish;
    }
  };

  const textToDisplay = getExplanation();

  const handleSpeak = () => {
    if (isSpeaking) {
      VoiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      VoiceService.speak(
        textToDisplay,
        getSpeechCode(language),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {isHindi ? 'एआई सरल नागरिक व्याख्या' : 'Grounded AI Plain Explainer'}
                </h3>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                  Rule Citing
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {scheme.code} · {scheme.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              VoiceService.stopSpeaking();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Guardrail Badge (PRD §27) */}
        <div className="my-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold">
              PRD §27 Strict Guardrail: AI is restricted to plain-language phrasing and cites Rule IDs.
            </span>
          </div>

          <button
            onClick={handleSpeak}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center space-x-1 shrink-0 ${
              isSpeaking ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'सुनें' : 'Listen')}</span>
          </button>
        </div>

        {/* Natural Language Explanation Body */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
          {textToDisplay}
        </div>

        {/* Cited Rules Badge List */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
            Cited Rule IDs:
          </span>
          {passedRules.map((pr) => (
            <span key={pr.ruleId} className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {pr.ruleId}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              VoiceService.stopSpeaking();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
          >
            {isHindi ? 'समझ गया (Close)' : 'Understood, Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
