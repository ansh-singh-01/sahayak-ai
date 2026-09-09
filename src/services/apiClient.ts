import { CitizenProfile } from '../types/user';
import { Scheme, MinistryAgency } from '../types/scheme';
import { RankedPartner } from '../types/partner';
import { EvaluationOutcome, SchemeRecommendation } from '../types/recommendation';
import { LoanCalculationResult } from './loanCalculator';
import { AuthResponse, LoginPayload, SignUpPayload } from '../types/auth';

import { EligibilityEngine } from './eligibilityEngine';
import { LoanCalculatorService } from './loanCalculator';
import { PartnerRouterService } from './partnerRouter';
import { REAL_MOSJE_SCHEMES } from '../data/schemesData';

const API_BASE_URL = typeof window !== 'undefined' ? (window.location.origin.includes(':3000') ? 'http://127.0.0.1:5000/api' : '/api') : 'http://127.0.0.1:5000/api';

export class ApiClient {
  /**
   * Evaluates citizen profile via Backend REST API with local fallback
   */
  public static async evaluateEligibility(profile: CitizenProfile): Promise<EvaluationOutcome> {
    try {
      const res = await fetch(`${API_BASE_URL}/eligibility/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MoSJE-Purpose': 'SocialWelfareSchemeEvaluation'
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('API call failed, using deterministic local engine fallback:', e);
    }
    return EligibilityEngine.evaluateAllSchemes(profile);
  }

  /**
   * Calculates loan amortization via Backend REST API with local fallback
   */
  public static async calculateAmortization(
    amount: number,
    tenureYears: number,
    moratoriumMonths: number,
    scheme?: Scheme
  ): Promise<LoanCalculationResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/calculator/amortize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestedAmount: amount,
          tenureYears,
          moratoriumMonths,
          schemeId: scheme?.id
        })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('API call failed, using local loan calculator fallback:', e);
    }
    return LoanCalculatorService.calculate(amount, tenureYears, moratoriumMonths, scheme);
  }

  /**
   * Retrieves ranked partners via Backend REST API with local fallback
   */
  public static async getRankedPartners(
    lat: number,
    lng: number,
    agency?: MinistryAgency,
    district?: string
  ): Promise<RankedPartner[]> {
    try {
      const query = new URLSearchParams();
      query.set('lat', String(lat));
      query.set('lng', String(lng));
      if (agency) query.set('agency', agency);
      if (district) query.set('district', district);

      const res = await fetch(`${API_BASE_URL}/partners/ranked?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('API call failed, using local partner router fallback:', e);
    }
    return PartnerRouterService.rankPartners(lat, lng, agency, district);
  }

  /**
   * Generates official citizen slip token via Backend REST API
   */
  public static async generateSlipToken(profile: CitizenProfile, schemeId?: string, partnerId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/citizen/slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, schemeId, partnerId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API slip generation error:', e);
    }
    return null;
  }

  /**
   * User Authentication: Login via phone/email and password/OTP
   */
  public static async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      return { status: 'ERROR', message: err.message || 'Login failed' };
    } catch (e) {
      console.warn('API login error, using fallback:', e);
      return {
        status: 'SUCCESS',
        message: 'Logged in successfully (local mode)',
        data: {
          user: {
            id: `USR-${Date.now().toString(36).toUpperCase()}`,
            name: payload.identifier.includes('@') ? payload.identifier.split('@')[0] : 'Citizen Beneficiary',
            role: payload.role || 'CITIZEN',
            category: 'OBC',
            state: 'Madhya Pradesh',
            district: 'Indore',
            token: `LOCAL-TOKEN-${Date.now().toString(36).toUpperCase()}`,
            dpdpConsentTimestamp: new Date().toISOString()
          },
          token: `LOCAL-TOKEN-${Date.now().toString(36).toUpperCase()}`
        }
      };
    }
  }

  /**
   * User Authentication: Sign Up with DPDP Act 2023 statutory consent
   */
  public static async signup(payload: SignUpPayload): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      return { status: 'ERROR', message: err.message || 'Registration failed' };
    } catch (e) {
      console.warn('API signup error, using fallback:', e);
      const newUser = {
        id: `USR-${Date.now().toString(36).toUpperCase()}`,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        role: payload.role || 'CITIZEN',
        category: payload.category,
        state: payload.state,
        district: payload.district,
        token: `LOCAL-TOKEN-${Date.now().toString(36).toUpperCase()}`,
        dpdpConsentTimestamp: new Date().toISOString()
      };
      try {
        if (typeof window !== 'undefined') {
          const storedUsers = JSON.parse(localStorage.getItem('sahayak_registered_users') || '{}');
          storedUsers[payload.phone] = newUser;
          localStorage.setItem('sahayak_registered_users', JSON.stringify(storedUsers));
        }
      } catch (err) {}
      return {
        status: 'SUCCESS',
        message: 'Account created successfully (local mode)',
        data: {
          user: newUser,
          token: newUser.token
        }
      };
    }
  }

  /**
   * Dispatches simulated 6-digit SMS OTP
   */
  public static async sendOtp(phone: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API sendOtp error:', e);
    }
    return { status: 'SUCCESS', data: { simulatedOtp: '123456' } };
  }

  /**
   * Verifies 6-digit SMS OTP
   */
  public static async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      return { status: 'ERROR', message: err.message || 'OTP verification failed' };
    } catch (e) {
      console.warn('API verifyOtp error:', e);
      // Check if user was previously registered in local storage
      let restoredUser = null;
      try {
        if (typeof window !== 'undefined') {
          const storedUsers = JSON.parse(localStorage.getItem('sahayak_registered_users') || '{}');
          if (storedUsers[phone]) {
            restoredUser = storedUsers[phone];
          }
        }
      } catch (err) {}

      const user = restoredUser || {
        id: `USR-${Date.now().toString(36).toUpperCase()}`,
        name: `Beneficiary (+91 ${phone.slice(-4)})`,
        phone,
        role: 'CITIZEN' as const,
        category: 'OBC' as const,
        state: 'Madhya Pradesh',
        district: 'Indore',
        token: `LOCAL-TOKEN-${Date.now().toString(36).toUpperCase()}`,
        dpdpConsentTimestamp: new Date().toISOString()
      };

      return {
        status: 'SUCCESS',
        message: 'OTP verified (local mode)',
        data: {
          user,
          token: user.token
        }
      };
    }
  }

  /**
   * Multilingual Conversational AI Chat with local fallback
   */
  public static async sendChatMessage(message: string, history: any[], context: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, context })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend chat endpoint unreachable, using local deterministic ChatbotService:', e);
    }
    const { ChatbotService } = await import('./chatbotService');
    return ChatbotService.processMessage(message, history, context);
  }
}

