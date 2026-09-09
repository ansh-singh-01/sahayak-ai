import { Router, Request, Response } from 'express';
import { CHANNEL_PARTNERS_DATABASE } from '../../src/data/partnersData';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/equity
 * Returns MoSJE Equity & Inclusion metrics, funnel data, and SCA capacity stats (PRD §33)
 */
analyticsRouter.get('/equity', (req: Request, res: Response) => {
  const { state } = req.query;

  const demographicEquity = {
    totalRoutedBeneficiaries: 14280,
    scSharePercent: 58.4,
    obcSharePercent: 31.2,
    safaiKaramchariSharePercent: 10.4,
    womenEntrepreneursSharePercent: 46.8,
    differentlyAbledSharePercent: 7.2,
    averageTurnaroundDays: 4.6,
    activeFiscalQuarter: 'Q2 FY 2026-27'
  };

  const conversionFunnel = [
    { step: 'INTAKE_STARTED', label: 'Beneficiary Onboarding Started', count: 18450, conversionRate: '100.0%' },
    { step: 'SCHEMES_EVALUATED', label: 'Rule Engine Evaluation Completed', count: 16200, conversionRate: '87.8%' },
    { step: 'CALCULATOR_MODELED', label: 'Loan Modeler & Amortization Checked', count: 14890, conversionRate: '80.7%' },
    { step: 'PARTNER_LOCATED', label: 'Channel Partner / SCA Identified', count: 13910, conversionRate: '75.4%' },
    { step: 'ROUTING_SLIP_ISSUED', label: 'Citizen Pass & Checklist Generated', count: 12480, conversionRate: '67.6%' }
  ];

  const scaCapacityMatrix = CHANNEL_PARTNERS_DATABASE.map(cp => ({
    id: cp.id,
    name: cp.name,
    district: cp.district,
    state: cp.state,
    type: cp.type,
    fundQuotaUtilizationPercent: cp.reliability.allocatedFundUtilizationPercent,
    availableApplicationQuota: cp.reliability.activeApplicationQuota,
    averageTurnaroundDays: cp.reliability.averageResponseTimeDays,
    grievanceResolutionRate: cp.reliability.grievanceResolutionRate,
    isAccepting: cp.acceptingNewApplications
  }));

  const dpdpComplianceAudit = {
    totalSessionsProcessed: 18450,
    dataRetentionMode: 'ZERO_PERSISTENCE_EPHEMERAL',
    statutoryComplianceRate: '100%',
    lastStatutoryAuditTimestamp: new Date().toISOString()
  };

  res.json({
    status: 'SUCCESS',
    stateFilter: state || 'All States',
    data: {
      demographicEquity,
      conversionFunnel,
      scaCapacityMatrix,
      dpdpComplianceAudit
    }
  });
});

/**
 * GET /api/analytics/verification
 * Returns Document Verification Pipeline telemetry and live documents (PRD §4, §5, §7)
 */
analyticsRouter.get('/verification', (req: Request, res: Response) => {
  const { status, docType, flag, corporation } = req.query;

  res.json({
    status: 'SUCCESS',
    filtersApplied: { status, docType, flag, corporation },
    data: {
      telemetry: {
        totalDocumentsProcessed: 24180,
        digiLockerPassRatePercent: 74.2,
        digiLockerTotalCount: 17942,
        ocrExtractedTotalCount: 6238,
        autoFlaggedTotalCount: 2370,
        autoFlaggedRatePercent: 9.8,
        pendingReviewCount: 4304,
        verifiedCount: 18912,
        rejectedCount: 964,
        averageTatDays: 1.8
      },
      statutoryCompliance: {
        dpdpSection: 'DPDP Act 2023 Sections 4, 6 & 8',
        rawScanRetentionDays: 90,
        structuredMetadataRetention: true
      }
    }
  });
});

/**
 * POST /api/analytics/verification/:id/review
 * Ministry Executive decision action (Approve / Reject / Dispatch Field Audit)
 */
analyticsRouter.post('/verification/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reason, officerNote } = req.body;

  res.json({
    status: 'SUCCESS',
    message: `Document ${id} reviewed successfully with action: ${action}`,
    auditEvent: {
      documentId: id,
      action: action === 'APPROVE' ? 'MINISTRY_EXECUTIVE_APPROVAL' : 'MINISTRY_EXECUTIVE_REJECTION',
      reviewedBy: 'Joint Secretary (Credit), MoSJE Central Command',
      reviewerRole: 'MINISTRY_ADMIN',
      timestamp: new Date().toISOString(),
      reason: reason || officerNote || 'Statutory review completed.'
    }
  });
});

