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
import { whatsappRouter } from './routes/whatsappWebhook';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token', 'X-MoSJE-Purpose', 'X-Gemini-API-Key', 'x-gemini-api-key']
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
app.use('/api/whatsapp', whatsappRouter);

// Direct alias for /api/chat forwarding to aiRouter
app.post('/api/chat', (req, res, next) => {
  req.url = '/chat';
  aiRouter(req, res, next);
});

// Standalone embeddable JavaScript widget endpoint
app.get('/api/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  const hostUrl = `${req.protocol}://${req.get('host')}`.replace(':5000', ':3000');

  const widgetScript = `
(function() {
  if (window.SahayakBotLoaded) return;
  window.SahayakBotLoaded = true;

  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const position = currentScript.getAttribute('data-position') || 'bottom-right';
  const primaryColor = currentScript.getAttribute('data-primary') || '#ea580c';
  const botTitle = currentScript.getAttribute('data-title') || 'SAHAYAK AI';
  const defaultLang = currentScript.getAttribute('data-lang') || 'hi';
  const host = '${hostUrl}';

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = \`
    .sahayak-widget-btn {
      position: fixed;
      \${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ea580c, #f59e0b);
      color: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999998;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 2px solid rgba(255, 255, 255, 0.6);
      outline: none;
    }
    .sahayak-widget-btn:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 14px 28px -4px rgba(234, 88, 12, 0.5);
    }
    .sahayak-widget-btn svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }
    .sahayak-widget-frame-container {
      position: fixed;
      \${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 92px;
      width: min(460px, calc(100vw - 32px));
      height: min(650px, calc(100vh - 120px));
      border-radius: 24px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      z-index: 999999;
      display: none;
      background: #ffffff;
      transition: opacity 0.25s ease, transform 0.25s ease;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
    }
    .sahayak-widget-frame-container.open {
      display: block;
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .sahayak-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  \`;
  document.head.appendChild(style);

  // Create Button
  const btn = document.createElement('button');
  btn.className = 'sahayak-widget-btn';
  btn.setAttribute('aria-label', 'Open SAHAYAK AI Welfare Assistant');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.22-1.31C8.63 21.49 10.27 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>';

  // Create Container & Iframe
  const container = document.createElement('div');
  container.className = 'sahayak-widget-frame-container';

  const iframe = document.createElement('iframe');
  iframe.className = 'sahayak-widget-iframe';
  iframe.src = host + '/?embed=true&lang=' + encodeURIComponent(defaultLang) + '&primary=' + encodeURIComponent(primaryColor) + '&title=' + encodeURIComponent(botTitle);
  iframe.allow = 'microphone';

  container.appendChild(iframe);
  document.body.appendChild(container);
  document.body.appendChild(btn);

  let isOpen = false;
  btn.addEventListener('click', function() {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add('open');
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    } else {
      container.classList.remove('open');
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.22-1.31C8.63 21.49 10.27 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>';
    }
  });
})();
`;
  res.send(widgetScript);
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏛️  SAHAYAK Backend API Server (MoSJE · SIH26092)`);
  console.log(`🚀 Running at: http://127.0.0.1:${PORT}`);
  console.log(`🛡️  DPDP Act 2023 Statutory Middleware: ACTIVE`);
  console.log(`📋 Health Check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`====================================================`);
});
