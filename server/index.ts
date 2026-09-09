import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { dpdpComplianceMiddleware } from './middleware/dpdpMiddleware';
import { schemesRouter } from './routes/schemes';
import { eligibilityRouter } from './routes/eligibility';
import { calculatorRouter } from './routes/calculator';
import { partnersRouter } from './routes/partners';
import { analyticsRouter } from './routes/analytics';
import { aiRouter } from './routes/ai';
import { citizenRouter } from './routes/citizen';
import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token', 'X-MoSJE-Purpose']
}));
app.use(express.json());

// DPDP Act 2023 Statutory Logging Middleware
app.use(dpdpComplianceMiddleware);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'SAHAYAK-MoSJE-Backend-API',
    version: '2.4.0',
    statutoryCompliance: 'DPDP Act 2023 Enforced',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/schemes',
      'GET /api/schemes/:id',
      'POST /api/eligibility/evaluate',
      'POST /api/calculator/amortize',
      'GET /api/partners/ranked',
      'GET /api/analytics/equity',
      'POST /api/ai/explain',
      'POST /api/citizen/slip',
      'POST /api/auth/login',
      'POST /api/auth/signup',
      'POST /api/auth/otp/send',
      'POST /api/auth/otp/verify'
    ]
  });
});

// Mount Routes
app.use('/api/schemes', schemesRouter);
app.use('/api/eligibility', eligibilityRouter);
app.use('/api/calculator', calculatorRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/citizen', citizenRouter);
app.use('/api/auth', authRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏛️  SAHAYAK Backend API Server (MoSJE · SIH26092)`);
  console.log(`🚀 Running at: http://127.0.0.1:${PORT}`);
  console.log(`🛡️  DPDP Act 2023 Statutory Middleware: ACTIVE`);
  console.log(`📋 Health Check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`====================================================`);
});
