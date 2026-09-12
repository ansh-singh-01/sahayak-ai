const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function main() {
  const refId = 'SHK-SCA-2026-964210';
  const scanUrl = `http://localhost:3000/?scanPass=${refId}&ref=${refId}`;

  const payload = JSON.stringify({
    v: '1.0',
    type: 'MOSJE_ROUTING_PASS',
    ref: refId,
    url: scanUrl,
    citizen: {
      name: 'Sunita Devi Jatav',
      category: 'Scheduled Caste / Scheduled Tribe (SC/ST)',
      income: 160000,
      district: 'Indore',
      state: 'Madhya Pradesh',
      phone: '9826012345'
    },
    scheme: {
      code: 'NSFDC-MSY-01',
      name: 'NSFDC Mahila Samriddhi Yojana (SC/ST Women)',
      agency: 'NSFDC',
      loan: 140000,
      rate: 4.0,
      moratorium: 6
    },
    partner: {
      name: 'Madhya Pradesh State Scheduled Castes Dev Corp (Indore SCA)',
      contact: 'Shri R. K. Verma',
      phone: '0731-2543210'
    },
    authHash: 'MOSJE-AUTH-SUNITA-964210'
  });

  // Ensure public folder exists
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outPathPublic = path.join(publicDir, 'demo_beneficiary_qr.png');

  // We encode the scanUrl (with ref fallback embedded) so that:
  // 1. Any camera phone scanning the QR opens the direct scan link
  // 2. Barcode / jsQR scanners read the scanUrl or ref directly!
  const qrOptions = {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    width: 600,
    color: {
      dark: '#0f172a', // Deep slate navy for high contrast
      light: '#ffffff'
    }
  };

  await QRCode.toFile(outPathPublic, scanUrl, qrOptions);
  console.log(`Saved demo QR to: ${outPathPublic}`);
}

main().catch(console.error);
