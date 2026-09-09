import { Router, Request, Response } from 'express';
import { REAL_MOSJE_SCHEMES } from '../../src/data/schemesData';
import { CHANNEL_PARTNERS_DATABASE } from '../../src/data/partnersData';

export const citizenRouter = Router();

/**
 * POST /api/citizen/slip
 * Generates an official routing pass with cryptographic reference code
 */
citizenRouter.post('/slip', (req: Request, res: Response) => {
  const { profile, schemeId, partnerId } = req.body;

  if (!profile) {
    return res.status(400).json({
      status: 'BAD_REQUEST',
      message: 'Citizen profile required.'
    });
  }

  const scheme = REAL_MOSJE_SCHEMES.find(s => s.id === schemeId || s.code === schemeId);
  const partner = CHANNEL_PARTNERS_DATABASE.find(p => p.id === partnerId);

  const referenceCode = `SHK-${Math.floor(100000 + Math.random() * 900000)}`;
  const verificationHash = Buffer.from(`${referenceCode}:${profile.category}:${Date.now()}`).toString('base64');

  res.json({
    status: 'SUCCESS',
    data: {
      referenceCode,
      verificationHash,
      issuedAt: new Date().toISOString(),
      applicantName: profile.name,
      category: profile.category,
      scheme: scheme ? { id: scheme.id, code: scheme.code, name: scheme.name } : null,
      designatedPartner: partner ? { id: partner.id, name: partner.name, address: partner.address } : null,
      verificationUrl: `https://sahayak.mosje.gov.in/verify/${referenceCode}`
    }
  });
});
