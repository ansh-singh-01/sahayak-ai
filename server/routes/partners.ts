import { Router, Request, Response } from 'express';
import { PartnerRouterService } from '../../src/services/partnerRouter';
import { MinistryAgency } from '../../src/types/scheme';
import { CHANNEL_PARTNERS_DATABASE } from '../../src/data/partnersData';

export const partnersRouter = Router();

/**
 * GET /api/partners/ranked
 * Query: lat, lng, agency, district
 */
partnersRouter.get('/ranked', (req: Request, res: Response) => {
  const { lat, lng, agency, district } = req.query;

  const userLat = lat ? Number(lat) : 22.7196; // default Indore
  const userLng = lng ? Number(lng) : 75.8577;
  const agencyFilter = agency ? (agency as MinistryAgency) : undefined;
  const districtFilter = district ? (district as string) : undefined;

  const ranked = PartnerRouterService.rankPartners(
    userLat,
    userLng,
    agencyFilter,
    districtFilter
  );

  res.json({
    status: 'SUCCESS',
    count: ranked.length,
    data: ranked,
    meta: {
      loadBalancingAlgorithm: 'Composite Reliability Index (TAT 35%, Quota 25%, Proximity 20%, Grievance 20%)',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * GET /api/partners/:id
 */
partnersRouter.get('/:id', (req: Request, res: Response) => {
  const partner = CHANNEL_PARTNERS_DATABASE.find(p => p.id === req.params.id);

  if (!partner) {
    return res.status(404).json({
      status: 'NOT_FOUND',
      message: `Channel partner with ID '${req.params.id}' not found.`
    });
  }

  res.json({
    status: 'SUCCESS',
    data: partner
  });
});
