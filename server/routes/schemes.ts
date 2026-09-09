import { Router, Request, Response } from 'express';
import { REAL_MOSJE_SCHEMES } from '../../src/data/schemesData';
import { MinistryAgency, BeneficiaryCategory } from '../../src/types/scheme';

export const schemesRouter = Router();

/**
 * GET /api/schemes
 * Query params: agency (NSFDC|NBCFDC|NSKFDC), category (SC|OBC|SAFAI_KARAMCHARI)
 */
schemesRouter.get('/', (req: Request, res: Response) => {
  const { agency, category } = req.query;

  let schemes = [...REAL_MOSJE_SCHEMES];

  if (agency) {
    schemes = schemes.filter(s => s.agency.toUpperCase() === (agency as string).toUpperCase());
  }

  if (category) {
    schemes = schemes.filter(s => s.targetCommunity.includes(category as BeneficiaryCategory));
  }

  res.json({
    status: 'SUCCESS',
    count: schemes.length,
    data: schemes,
    metadata: {
      source: 'MoSJE Public Guidelines (NSFDC / NBCFDC / NSKFDC)',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * GET /api/schemes/:id
 */
schemesRouter.get('/:id', (req: Request, res: Response) => {
  const scheme = REAL_MOSJE_SCHEMES.find(s => s.id === req.params.id || s.code === req.params.id);

  if (!scheme) {
    return res.status(404).json({
      status: 'NOT_FOUND',
      message: `Scheme with ID or Code '${req.params.id}' not found.`
    });
  }

  res.json({
    status: 'SUCCESS',
    data: scheme
  });
});
