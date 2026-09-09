import { Router, Request, Response } from 'express';
import { EligibilityEngine } from '../../src/services/eligibilityEngine';
import { CitizenProfile } from '../../src/types/user';

export const eligibilityRouter = Router();

/**
 * POST /api/eligibility/evaluate
 * Body: CitizenProfile
 * Returns: EvaluationOutcome (Eligible schemes + Gap-to-Eligibility Near Misses + Rule Traces)
 */
eligibilityRouter.post('/evaluate', (req: Request, res: Response) => {
  const profile: CitizenProfile = req.body;

  if (!profile || !profile.category || profile.annualFamilyIncome === undefined) {
    return res.status(400).json({
      status: 'BAD_REQUEST',
      message: 'Invalid profile payload. category, annualFamilyIncome, and purpose are required.'
    });
  }

  // Run the deterministic rule engine (PRD §7, §16)
  const evaluationOutcome = EligibilityEngine.evaluateAllSchemes(profile);

  res.json({
    status: 'SUCCESS',
    data: evaluationOutcome,
    meta: {
      engineVersion: '2.4.0-deterministic',
      dpdpAudit: (req as any).dpdpAudit
    }
  });
});
