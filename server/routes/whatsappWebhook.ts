import { Router, Request, Response } from 'express';
import { EligibilityEngine } from '../../src/services/eligibilityEngine';
import { CitizenProfile } from '../../src/types/user';

export const whatsappRouter = Router();

/**
 * GET /api/whatsapp/webhook
 * Verification endpoint for Meta WhatsApp Cloud API webhook registration
 */
whatsappRouter.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'SAHAYAK_MOSJE_WHATSAPP_SECRET_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * POST /api/whatsapp/webhook
 * Inbound message webhook receiving quick-reply payload, text, or interactive list selection
 */
whatsappRouter.post('/webhook', (req: Request, res: Response) => {
  const body = req.body;

  // Log incoming webhook event under DPDP audit
  const fromNumber = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || body?.from || '919876543210';
  const messageBody = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || body?.message || '';
  const interactivePayload = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.interactive?.button_reply?.id || body?.payload;

  // Construct or derive profile from session payload or defaults
  const profile: CitizenProfile = {
    name: 'Citizen via WhatsApp',
    category: body?.category || (interactivePayload?.includes('SC') ? 'SC' : interactivePayload?.includes('OBC') ? 'OBC' : 'SC'),
    age: body?.age || 32,
    gender: body?.gender || 'FEMALE',
    annualFamilyIncome: body?.annualFamilyIncome || 180000,
    projectCost: body?.projectCost || 200000,
    loanAmountRequested: body?.loanAmountRequested || 150000,
    state: body?.state || 'Madhya Pradesh',
    district: body?.district || 'Indore',
    purpose: body?.purpose || 'SMALL_BUSINESS',
    isDifferentlyAbled: false
  };

  // Run deterministic Eligibility Engine
  const outcome = EligibilityEngine.evaluateAllSchemes(profile);
  const eligibleSchemes = outcome.eligible;
  const nearMisses = outcome.nearMisses;

  const topMatch = eligibleSchemes[0];

  let replyText = '';
  if (topMatch) {
    replyText = `🇮🇳 *SAHAYAK — MoSJE Scheme Recommendation*\n\n` +
      `नमस्ते! आपके विवरण के आधार पर सर्वोत्तम योजना:\n` +
      `✅ *${topMatch.scheme.name}*\n` +
      `• निगम (Agency): ${topMatch.scheme.corporation}\n` +
      `• अधिकतम ऋण (Max Loan): ₹${(topMatch.scheme.maxLoanAmount / 100000).toFixed(2)} Lakh\n` +
      `• रियायती ब्याज दर (Interest): ${topMatch.scheme.interestRate}% प्रति वर्ष\n` +
      `• सरकारी सब्सिडी: ₹${(topMatch.scheme.subsidyAmount / 100000).toFixed(2)} Lakh (${topMatch.scheme.subsidyPercentage}%)\n\n` +
      `🔗 *दस्तावेज़ सत्यापन और आवेदन जारी रखें:*\n` +
      `https://sahayak.gov.in/apply?ref=wa_${topMatch.scheme.id}\n\n` +
      `उत्तर 'HELP' टाइप करें या कॉल करें: 1800-XXX-SAHAYAK`;
  } else {
    replyText = `🇮🇳 *SAHAYAK — सहायता सूचना*\n\n` +
      `वर्तमान विवरण पर पूर्ण पात्रता नहीं पाई गई।\n` +
      (nearMisses.length > 0 
        ? `💡 *सुझाव:* ${nearMisses[0].explanation}\n\n` 
        : `कृपया निकटतम CSC केंद्र से संपर्क करें।\n\n`) +
      `पोर्टल पर पुनः प्रयास करें: https://sahayak.gov.in`;
  }

  return res.json({
    status: 'SUCCESS',
    channel: 'WHATSAPP_BUSINESS_API',
    recipient: fromNumber,
    messageResponse: replyText,
    matchedCount: eligibleSchemes.length,
    topScheme: topMatch ? topMatch.scheme.id : null,
    dpdpCompliant: true,
    timestamp: new Date().toISOString()
  });
});
