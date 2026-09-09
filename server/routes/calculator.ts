import { Router, Request, Response } from 'express';
import { LoanCalculatorService } from '../../src/services/loanCalculator';
import { REAL_MOSJE_SCHEMES } from '../../src/data/schemesData';

export const calculatorRouter = Router();

/**
 * POST /api/calculator/amortize
 * Body: { requestedAmount: number, tenureYears: number, moratoriumMonths: number, schemeId?: string }
 */
calculatorRouter.post('/amortize', (req: Request, res: Response) => {
  const { requestedAmount, tenureYears, moratoriumMonths, schemeId } = req.body;

  if (!requestedAmount || !tenureYears) {
    return res.status(400).json({
      status: 'BAD_REQUEST',
      message: 'requestedAmount and tenureYears are required numbers.'
    });
  }

  const scheme = schemeId ? REAL_MOSJE_SCHEMES.find(s => s.id === schemeId || s.code === schemeId) : undefined;

  const result = LoanCalculatorService.calculate(
    Number(requestedAmount),
    Number(tenureYears),
    Number(moratoriumMonths || 0),
    scheme
  );

  res.json({
    status: 'SUCCESS',
    data: result
  });
});
