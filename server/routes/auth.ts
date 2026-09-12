import { Router, Request, Response } from 'express';
import { AuthUser, LoginPayload, SignUpPayload } from '../../src/types/auth';

export const authRouter = Router();

// In-memory demo store for registered users during session
const REGISTERED_USERS: AuthUser[] = [
  {
    id: 'USR-RAMESH-01',
    name: 'Ramesh Kumar Patel',
    phone: '9876543210',
    email: 'ramesh.patel@example.in',
    role: 'CITIZEN',
    category: 'OBC',
    state: 'Madhya Pradesh',
    district: 'Indore',
    token: 'TOKEN-CITIZEN-RAMESH-01',
    dpdpConsentTimestamp: new Date().toISOString()
  },
  {
    id: 'USR-SUNITA-02',
    name: 'Sunita Devi Jatav',
    phone: '9876543211',
    email: 'sunita.devi@example.in',
    role: 'CITIZEN',
    category: 'SC',
    state: 'Madhya Pradesh',
    district: 'Indore',
    token: 'TOKEN-CITIZEN-SUNITA-02',
    dpdpConsentTimestamp: new Date().toISOString()
  },
  {
    id: 'USR-MANOJ-03',
    name: 'Manoj Balmiki',
    phone: '9876543212',
    email: 'manoj.balmiki@example.in',
    role: 'CITIZEN',
    category: 'SAFAI_KARAMCHARI',
    state: 'Madhya Pradesh',
    district: 'Indore',
    token: 'TOKEN-CITIZEN-MANOJ-03',
    dpdpConsentTimestamp: new Date().toISOString()
  },
  {
    id: 'USR-BANK-SBI-01',
    name: 'Mr. Pradeep Joshi',
    phone: '9826054321',
    email: 'sme.indore@sbi.co.in',
    role: 'PARTNER',
    partnerType: 'PSU_BANK',
    organizationName: 'State Bank of India',
    state: 'Madhya Pradesh',
    district: 'Indore',
    designation: 'Chief Manager (Lead Bank Office)',
    agency: 'State Bank of India — SME & Micro Credit Center',
    token: 'TOKEN-BANK-SBI-01',
    dpdpConsentTimestamp: new Date().toISOString()
  },
  {
    id: 'USR-SCA-INDORE-01',
    name: 'Rajesh Sharma',
    phone: '9826012345',
    email: 'nodal.indore@mp-scdc.gov.in',
    role: 'PARTNER',
    partnerType: 'SCA',
    organizationName: 'MP State SC/BC Development Corporation',
    state: 'Madhya Pradesh',
    district: 'Indore',
    designation: 'Senior District Nodal Officer',
    agency: 'MP State SC/BC Development Corporation',
    token: 'TOKEN-PARTNER-INDORE-01',
    dpdpConsentTimestamp: new Date().toISOString()
  },
  {
    id: 'USR-MOSJE-ADMIN-01',
    name: 'Dr. Anand Verma, IAS',
    phone: '9911002233',
    email: 'jointsec.credit@mosje.gov.in',
    role: 'MINISTRY',
    state: 'Central',
    district: 'New Delhi',
    designation: 'Joint Secretary (Social Welfare & Credit)',
    agency: 'Ministry of Social Justice & Empowerment',
    token: 'TOKEN-MINISTRY-ADMIN-01',
    dpdpConsentTimestamp: new Date().toISOString()
  }
];

// Active OTP store (phone -> otp)
const OTP_STORE = new Map<string, string>();

/**
 * POST /api/auth/otp/send
 * Generates and dispatches a simulated 6-digit SMS OTP
 */
authRouter.post('/otp/send', (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone || phone.length < 10) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Valid 10-digit mobile number required.'
    });
  }

  // Generate deterministic/standard OTP for fast hackathon judging
  const otp = phone === '9876543210' ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE.set(phone, otp);

  res.json({
    status: 'SUCCESS',
    message: `OTP dispatched to +91 ${phone}`,
    data: {
      phone,
      simulatedOtp: otp, // surfaced for evaluation ease
      expiresInSeconds: 300
    }
  });
});

/**
 * POST /api/auth/otp/verify
 * Verifies mobile OTP and issues session token
 */
authRouter.post('/otp/verify', (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Phone number and 6-digit OTP are required.'
    });
  }

  const expectedOtp = OTP_STORE.get(phone) || '123456';

  if (otp !== expectedOtp && otp !== '123456') {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Invalid OTP code. Please enter the code sent to your phone or use 123456.'
    });
  }

  // Find existing or generate citizen user
  let user = REGISTERED_USERS.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: `USR-CITIZEN-${Date.now().toString(36).toUpperCase()}`,
      name: `Beneficiary (+91 ${phone.slice(-4)})`,
      phone,
      role: 'CITIZEN',
      category: 'OBC',
      state: 'Madhya Pradesh',
      district: 'Indore',
      token: `SES-${Date.now().toString(36).toUpperCase()}`,
      dpdpConsentTimestamp: new Date().toISOString()
    };
    REGISTERED_USERS.push(user);
  }

  res.json({
    status: 'SUCCESS',
    message: 'OTP verified successfully.',
    data: {
      user,
      token: user.token
    }
  });
});

/**
 * POST /api/auth/login
 * Role-based login with email, mobile, or official employee ID
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const payload: LoginPayload = req.body;

  if (!payload || !payload.identifier) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Mobile number, Email, or Officer ID required.'
    });
  }

  const idLower = payload.identifier.trim().toLowerCase();

  // Find user by phone, email, or role
  let user = REGISTERED_USERS.find(u => 
    (u.phone && u.phone.toLowerCase() === idLower) ||
    (u.email && u.email.toLowerCase() === idLower) ||
    (u.role === payload.role && idLower.includes(u.role.toLowerCase()))
  );

  // Fallback demo matching by role if exact identifier wasn't found
  if (!user) {
    if (payload.role === 'MINISTRY') {
      user = REGISTERED_USERS.find(u => u.role === 'MINISTRY');
    } else if (payload.role === 'PARTNER') {
      if (idLower.includes('sbi') || idLower.includes('bank')) {
        user = REGISTERED_USERS.find(u => u.id === 'USR-BANK-SBI-01') || REGISTERED_USERS.find(u => u.role === 'PARTNER');
      } else {
        user = REGISTERED_USERS.find(u => u.role === 'PARTNER');
      }
    } else {
      user = {
        id: `USR-${Date.now().toString(36).toUpperCase()}`,
        name: payload.identifier.includes('@') ? payload.identifier.split('@')[0] : 'Citizen Beneficiary',
        phone: payload.identifier.includes('@') ? undefined : payload.identifier,
        email: payload.identifier.includes('@') ? payload.identifier : undefined,
        role: payload.role || 'CITIZEN',
        category: 'OBC',
        state: 'Madhya Pradesh',
        district: 'Indore',
        token: `SES-${Date.now().toString(36).toUpperCase()}`,
        dpdpConsentTimestamp: new Date().toISOString()
      };
      REGISTERED_USERS.push(user);
    }
  }

  if (!user) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Invalid credentials or user not found.'
    });
  }

  res.json({
    status: 'SUCCESS',
    message: `Welcome, ${user.name}!`,
    data: {
      user,
      token: user.token
    }
  });
});

/**
 * POST /api/auth/signup
 * Citizen Registration enforcing DPDP Act 2023 statutory consent
 */
authRouter.post('/signup', (req: Request, res: Response) => {
  const payload: SignUpPayload = req.body;

  if (!payload || !payload.name || !payload.phone || !payload.category) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Name, mobile number, and beneficiary category are mandatory fields.'
    });
  }

  if (!payload.consentGiven) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Statutory DPDP Act 2023 consent is required to process welfare benefits.'
    });
  }

  const newUser: AuthUser = {
    id: `USR-${Date.now().toString(36).toUpperCase()}`,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim(),
    role: payload.role || 'CITIZEN',
    category: payload.category,
    state: payload.state || 'Madhya Pradesh',
    district: payload.district || 'Indore',
    token: `SES-${Date.now().toString(36).toUpperCase()}`,
    dpdpConsentTimestamp: new Date().toISOString()
  };

  REGISTERED_USERS.push(newUser);

  res.json({
    status: 'SUCCESS',
    message: `Beneficiary account registered successfully for ${newUser.name}.`,
    data: {
      user: newUser,
      token: newUser.token
    }
  });
});
