import { Router, Request, Response } from 'express';
import { REAL_MOSJE_SCHEMES } from '../../src/data/schemesData';
import { MinistryAgency, BeneficiaryCategory } from '../../src/types/scheme';

export const schemesRouter = Router();

// In-memory store for custom channel provider schemes added at runtime
const customSchemes: any[] = [];

/**
 * GET /api/schemes
 * Query params: agency (NSFDC|NBCFDC|NSKFDC), category (SC|OBC|SAFAI_KARAMCHARI)
 */
schemesRouter.get('/', (req: Request, res: Response) => {
  const { agency, category } = req.query;

  let schemes = [...customSchemes, ...REAL_MOSJE_SCHEMES];

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
      source: 'MoSJE Public Guidelines (NSFDC / NBCFDC / NSKFDC) & SCA/Bank Channel Registry',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * GET /api/schemes/:id
 */
schemesRouter.get('/:id', (req: Request, res: Response) => {
  const allSchemes = [...customSchemes, ...REAL_MOSJE_SCHEMES];
  const scheme = allSchemes.find(s => s.id === req.params.id || s.code === req.params.id);

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

/**
 * POST /api/schemes
 * Add a new scheme from an SCA or Bank Channel Provider
 */
schemesRouter.post('/', (req: Request, res: Response) => {
  const newScheme = req.body;

  if (!newScheme || !newScheme.name || !newScheme.agency) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Scheme name and agency are mandatory fields.'
    });
  }

  // Ensure unique ID and code
  const id = newScheme.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const code = newScheme.code || `SCA-${Date.now().toString().slice(-4)}`;

  const createdScheme = {
    ...newScheme,
    id,
    code,
    isCustomChannelScheme: true,
    createdAt: new Date().toISOString()
  };

  const existingIndex = customSchemes.findIndex(s => s.id === id || s.code === code);
  if (existingIndex >= 0) {
    customSchemes[existingIndex] = createdScheme;
  } else {
    customSchemes.unshift(createdScheme);
  }

  res.status(201).json({
    status: 'SUCCESS',
    message: 'New scheme successfully deployed by Channel Provider.',
    data: createdScheme
  });
});

/**
 * DELETE /api/schemes/:id
 */
schemesRouter.delete('/:id', (req: Request, res: Response) => {
  const targetId = req.params.id;
  const index = customSchemes.findIndex(s => s.id === targetId || s.code === targetId);

  if (index === -1) {
    return res.status(404).json({
      status: 'NOT_FOUND',
      message: `Custom scheme '${targetId}' not found or cannot delete default MoSJE Apex schemes.`
    });
  }

  const deleted = customSchemes.splice(index, 1)[0];
  res.json({
    status: 'SUCCESS',
    message: 'Scheme removed from channel registry.',
    data: deleted
  });
});
