import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CitizenWizard } from './components/onboarding/CitizenWizard';
import { VoiceAssistant } from './components/onboarding/VoiceAssistant';
import { ConsentModal } from './components/onboarding/ConsentModal';
import { RecommendationList } from './components/recommendations/RecommendationList';
import { LoanCalculator } from './components/calculator/LoanCalculator';
import { PartnerLocator } from './components/partners/PartnerLocator';
import { DocumentChecklist } from './components/checklist/DocumentChecklist';
import { MinistryDashboard } from './components/analytics/MinistryDashboard';
import { GroundedExplainer } from './components/ai/GroundedExplainer';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { BeneficiaryDashboard } from './components/beneficiary/BeneficiaryDashboard';
import { SahayakChatbot } from './components/ai/SahayakChatbot';

import { CitizenProfile } from './types/user';
import { AuthUser } from './types/auth';
import { Scheme, BeneficiaryCategory } from './types/scheme';
import { RankedPartner } from './types/partner';
import { EvaluationOutcome, SchemeRecommendation } from './types/recommendation';
import { EligibilityEngine } from './services/eligibilityEngine';
import { PartnerRouterService } from './services/partnerRouter';
import { ApiClient } from './services/apiClient';
import { DEMO_PROFILES } from './data/demoProfiles';
import { Language } from './services/i18nService';
import './i18n';

export const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<
    'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth'
  >('landing');

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('sahayak_auth_user') || localStorage.getItem('mosje_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Localization State (11 Pan-India Languages with persistent storage)
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sahayak_language');
      if (saved && ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'pa', 'ml', 'or'].includes(saved)) {
        return saved as Language;
      }
    }
    return 'en';
  });

  const handleSetLanguage = (newLang: Language) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_language', newLang);
    }
  };

  // Active Citizen Profile (Autofilled from authenticated user or default demo)
  const [profile, setProfile] = useState<CitizenProfile>(() => {
    const base = DEMO_PROFILES[0].profile;
    try {
      const savedAuth = localStorage.getItem('sahayak_auth_user') || localStorage.getItem('mosje_auth_user');
      if (savedAuth) {
        const u = JSON.parse(savedAuth);
        if (u.role === 'CITIZEN') {
          return {
            ...base,
            name: u.name || base.name,
            category: (u.category as BeneficiaryCategory) || base.category,
            state: u.state || base.state,
            district: u.district || base.district,
            consentGiven: true
          };
        }
      }
    } catch (e) {}
    return base;
  });

  // Automatically keep profile in sync whenever authUser logs in or updates
  useEffect(() => {
    if (authUser && authUser.role === 'CITIZEN') {
      setProfile(prev => ({
        ...prev,
        name: authUser.name || prev.name,
        category: (authUser.category as BeneficiaryCategory) || prev.category,
        state: authUser.state || prev.state,
        district: authUser.district || prev.district,
        consentGiven: true
      }));
    }
  }, [authUser]);

  // Evaluation Outcome from Deterministic Rule Engine
  const [evaluation, setEvaluation] = useState<EvaluationOutcome>(() => {
    return EligibilityEngine.evaluateAllSchemes(DEMO_PROFILES[0].profile);
  });

  // Selected Context (Scheme & Channel Partner)
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<RankedPartner | null>(null);

  // Track whether citizen has submitted their specific scheme needs
  const [hasSubmittedNeeds, setHasSubmittedNeeds] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sahayak_needs_submitted') === 'true';
    } catch {
      return false;
    }
  });

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [aiExplainerRec, setAiExplainerRec] = useState<SchemeRecommendation | null>(null);

  // Set default selected scheme from top match upon evaluation ONLY if needs are submitted
  useEffect(() => {
    if (hasSubmittedNeeds && evaluation.eligibleSchemes.length > 0) {
      const topScheme = evaluation.eligibleSchemes[0].scheme;
      setSelectedScheme(topScheme);
      // Auto-select rank 1 partner for that scheme
      const partners = PartnerRouterService.rankPartners(22.7196, 75.8577, topScheme.agency, profile.district);
      if (partners.length > 0) {
        setSelectedPartner(partners[0]);
      }
    } else if (!hasSubmittedNeeds) {
      setSelectedScheme(null);
      setSelectedPartner(null);
    }
  }, [evaluation, hasSubmittedNeeds, profile.district]);

  // Run Rule Engine via Backend REST API
  const handleEvaluate = async () => {
    setHasSubmittedNeeds(true);
    try {
      localStorage.setItem('sahayak_needs_submitted', 'true');
    } catch (e) {}
    const result = await ApiClient.evaluateEligibility(profile);
    setEvaluation(result);
    setCurrentTab('recommendations');

    // Trigger celebration confetti for eligible match
    if (result.eligibleSchemes.length > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
  };

  // Demo Persona Selection (for fast 1-click judging presentations)
  const handleSelectDemoProfile = async (newProfile: CitizenProfile) => {
    setHasSubmittedNeeds(true);
    try {
      localStorage.setItem('sahayak_needs_submitted', 'true');
    } catch (e) {}
    setProfile(newProfile);
    const result = await ApiClient.evaluateEligibility(newProfile);
    setEvaluation(result);
    if (result.eligibleSchemes.length > 0) {
      setSelectedScheme(result.eligibleSchemes[0].scheme);
    } else if (result.nearMissSchemes.length > 0) {
      setSelectedScheme(result.nearMissSchemes[0].scheme);
    }
    setCurrentTab('recommendations');
  };

  // Login Handler: Synchronize profile with authenticated user credentials
  const handleLoginSuccess = (
    user: AuthUser, 
    demoProfile?: CitizenProfile,
    targetTab?: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth'
  ) => {
    setAuthUser(user);
    try {
      localStorage.setItem('sahayak_auth_user', JSON.stringify(user));
    } catch (e) {}

    if (demoProfile) {
      handleSelectDemoProfile(demoProfile);
      setCurrentTab(targetTab || 'dashboard');
      return;
    }

    if (user.role === 'CITIZEN') {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        category: user.category || prev.category,
        state: user.state || prev.state,
        district: user.district || prev.district,
        consentGiven: true
      }));
      if (targetTab && targetTab !== 'auth') {
        setCurrentTab(targetTab);
      } else if (!targetTab) {
        setCurrentTab('dashboard');
      }
      // If targetTab === 'auth', stay on 'auth' for post-login options
    } else if (user.role === 'MINISTRY') {
      setCurrentTab('admin');
    } else if (user.role === 'PARTNER') {
      setCurrentTab('partners');
    } else {
      setCurrentTab('landing');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setAuthUser(null);
    setHasSubmittedNeeds(false);
    try {
      localStorage.removeItem('sahayak_auth_user');
      localStorage.removeItem('mosje_auth_user');
      localStorage.removeItem('sahayak_needs_submitted');
      localStorage.removeItem('sahayak_citizen_applications');
    } catch (e) {}
    // Reset to clean default state without carrying over previous user PII
    setProfile(DEMO_PROFILES[0].profile);
    setEvaluation(EligibilityEngine.evaluateAllSchemes(DEMO_PROFILES[0].profile));
    setSelectedScheme(null);
    setSelectedPartner(null);
    setCurrentTab('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Sticky Main Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={handleSetLanguage}
        onSelectDemoProfile={handleSelectDemoProfile}
        onOpenConsentModal={() => setIsConsentModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenChat={() => setIsChatbotOpen(true)}
        authUser={authUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {currentTab === 'landing' && (
          <LandingPage
            language={language}
            onStartWizard={() => setCurrentTab('wizard')}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onSelectSchemeForCalculator={(sch) => {
              setSelectedScheme(sch);
              setCurrentTab('calculator');
            }}
            onSelectDemoProfile={handleSelectDemoProfile}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'dashboard' && (
          <BeneficiaryDashboard
            profile={profile}
            setProfile={setProfile}
            authUser={authUser}
            evaluation={evaluation}
            selectedScheme={selectedScheme}
            selectedPartner={selectedPartner}
            language={language}
            setLanguage={handleSetLanguage}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenConsentModal={() => setIsConsentModalOpen(true)}
            onOpenChat={() => setIsChatbotOpen(true)}
            onLogout={handleLogout}
            hasSubmittedNeeds={hasSubmittedNeeds}
          />
        )}

        {currentTab === 'wizard' && (
          <CitizenWizard
            profile={profile}
            setProfile={setProfile}
            authUser={authUser}
            onEvaluate={handleEvaluate}
            language={language}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />
        )}

        {currentTab === 'recommendations' && (
          <RecommendationList
            evaluation={evaluation}
            language={language}
            onSelectSchemeForCalculator={(sch) => {
              setSelectedScheme(sch);
              setCurrentTab('calculator');
            }}
            onSelectSchemeForPartners={(sch) => {
              setSelectedScheme(sch);
              setCurrentTab('partners');
            }}
            onSelectSchemeForChecklist={(sch) => {
              setSelectedScheme(sch);
              setCurrentTab('checklist');
            }}
            onOpenAiExplainer={(rec) => setAiExplainerRec(rec)}
          />
        )}

        {currentTab === 'calculator' && (
          <LoanCalculator
            selectedScheme={selectedScheme}
            onSelectScheme={(sch) => setSelectedScheme(sch)}
            language={language}
          />
        )}

        {currentTab === 'partners' && (
          <PartnerLocator
            userDistrict={profile.district}
            selectedScheme={selectedScheme}
            selectedPartner={selectedPartner}
            onSelectPartner={(partner) => {
              setSelectedPartner(partner);
              setCurrentTab('checklist');
            }}
            language={language}
          />
        )}

        {currentTab === 'checklist' && (
          <DocumentChecklist
            profile={profile}
            selectedScheme={selectedScheme}
            selectedPartner={selectedPartner}
            language={language}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'admin' && (
          authUser?.role === 'MINISTRY' ? (
            <MinistryDashboard language={language} />
          ) : (
            <LandingPage
              language={language}
              onStartWizard={() => setCurrentTab('wizard')}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onSelectSchemeForCalculator={(sch) => {
                setSelectedScheme(sch);
                setCurrentTab('calculator');
              }}
              onSelectDemoProfile={handleSelectDemoProfile}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )
        )}

        {currentTab === 'auth' && (
          <AuthPage
            language={language}
            authUser={authUser}
            onLogout={handleLogout}
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => setCurrentTab('landing')}
            onOpenConsentModal={() => setIsConsentModalOpen(true)}
            onSelectDemoProfile={handleSelectDemoProfile}
          />
        )}

      </main>

      {/* Footer */}
      <Footer language={language} />

      {/* DPDP Act 2023 Statutory Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onAccept={() => setProfile({ ...profile, consentGiven: true })}
        hasConsented={profile.consentGiven}
        language={language}
      />

      {/* Voice Assistant Modal ("Prefer to speak?") */}
      <VoiceAssistant
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
        onComplete={() => {
          handleEvaluate();
        }}
        language={language}
      />

      {/* Grounded AI Explainer Modal */}
      <GroundedExplainer
        isOpen={Boolean(aiExplainerRec)}
        onClose={() => setAiExplainerRec(null)}
        recommendation={aiExplainerRec}
        language={language}
      />

      {/* Grounded Multilingual Conversational AI Chatbot with Voice Typing (STT & TTS) */}
      <SahayakChatbot
        isOpen={isChatbotOpen}
        onOpen={() => setIsChatbotOpen(true)}
        onClose={() => setIsChatbotOpen(false)}
        profile={profile}
        selectedScheme={selectedScheme}
        selectedPartner={selectedPartner}
        language={language}
        onSelectLanguage={handleSetLanguage}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

    </div>
  );
};

export default App;
