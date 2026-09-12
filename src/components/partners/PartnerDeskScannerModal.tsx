import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Building2, 
  Sparkles, 
  Printer, 
  Send, 
  X, 
  Check, 
  AlertCircle, 
  Search, 
  FileCheck2, 
  Clock, 
  QrCode,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Upload,
  RefreshCw
} from 'lucide-react';
import jsQR from 'jsqr';
import { RoutingSlipService, RoutingSlipData } from '../../services/routingSlipService';
import { Language } from '../../services/i18nService';
import { AuthUser } from '../../types/auth';

interface PartnerDeskScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  authUser?: AuthUser | null;
  initialRefId?: string | null;
  onSanctionSuccess?: (slip: RoutingSlipData) => void;
}

export const PartnerDeskScannerModal: React.FC<PartnerDeskScannerModalProps> = ({
  isOpen,
  onClose,
  language,
  authUser,
  initialRefId,
  onSanctionSuccess
}) => {
  const isHindi = language === 'hi';
  const [activeMode, setActiveMode] = useState<'scan' | 'manual'>('scan');
  const [manualInput, setManualInput] = useState<string>(initialRefId || '');
  const [scannedSlip, setScannedSlip] = useState<RoutingSlipData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [sanctionSuccessData, setSanctionSuccessData] = useState<{ sanctionId: string; amount: number } | null>(null);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Refs for media stream & canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio beep feedback upon QR detection
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {}
  };



  // Reset scanner whenever modal closes or authUser changes (e.g. on logout)
  useEffect(() => {
    if (!isOpen || !authUser) {
      setScannedSlip(null);
      setSanctionSuccessData(null);
      setManualInput('');
      setScanError(null);
      setActiveMode('scan');
      stopCamera();
    }
  }, [isOpen, authUser]);

  // When modal opens: if initialRefId is explicitly provided, load that slip; otherwise start a 100% fresh scan
  useEffect(() => {
    if (isOpen) {
      if (initialRefId) {
        setManualInput(initialRefId);
        const slip = RoutingSlipService.getSlipByRefId(initialRefId);
        if (slip) {
          setScannedSlip(slip);
          setSanctionSuccessData(null);
        }
      } else {
        // Fresh scan session: wipe previous details and ensure camera scanner asks for a new QR scan
        setScannedSlip(null);
        setSanctionSuccessData(null);
        setManualInput('');
        setScanError(null);
        setActiveMode('scan');
      }
    }
  }, [isOpen, initialRefId]);

  // Handle successful QR detection and loading
  const handleProcessScannedCode = (decodedString: string) => {
    playBeep();
    setScanError(null);
    const { refId } = RoutingSlipService.parseQrInput(decodedString);
    const slip = RoutingSlipService.getSlipByRefId(refId);

    if (slip) {
      setScannedSlip(slip);
      setSanctionSuccessData(null);
    } else {
      setScanError(
        isHindi 
          ? `QR कोड "${refId}" के लिए कोई रिकॉर्ड नहीं मिला।` 
          : `No citizen routing record found for reference "${refId}".`
      );
    }
  };

  // Stop camera stream safely
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  // Start real camera stream
  const startCamera = async (overrideFacing?: 'environment' | 'user') => {
    setCameraError(null);
    const targetFacing = overrideFacing || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        isHindi 
          ? 'इस ब्राउज़र में कैमरा API समर्थित नहीं है। कृपया फ़ाइल अपलोड या टोकन खोज का उपयोग करें।' 
          : 'Camera API is not supported in this browser. Please use file upload or token search.'
      );
      return;
    }

    try {
      stopCamera();

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (e) {
        // Fallback for laptops/desktops without specific facingMode
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setIsScanning(true);

      // Start the jsQR continuous frame scanning loop
      const scanTick = () => {
        if (!isOpen) {
          stopCamera();
          return;
        }

        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert'
              });

              if (code && code.data && code.data.trim().length > 0) {
                // QR code successfully captured!
                stopCamera();
                handleProcessScannedCode(code.data);
                return;
              }
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(scanTick);
      };

      animFrameRef.current = requestAnimationFrame(scanTick);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setIsScanning(false);
      const isPermissionDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraError(
        isPermissionDenied
          ? (isHindi 
              ? 'कैमरा अनुमति अस्वीकार कर दी गई। कृपया ब्राउज़र में कैमरा एक्सेस की अनुमति दें, अथवा फ़ाइल अपलोड / डेमो टोकन का उपयोग करें।' 
              : 'Camera permission denied. Please allow camera access in browser settings, or use the Demo QR below.')
          : (isHindi 
              ? 'कैमरा कनेक्ट नहीं हो सका (या अन्य ऐप द्वारा उपयोग में है)। कृपया नीचे दिए गए डेमो QR कोड का उपयोग करें।' 
              : 'Could not connect to camera hardware. You can upload an image or scan the Demo QR Code directly below.')
      );
    }
  };

  // Flip camera between front and back
  const handleToggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Upload an image file (e.g. screenshot of QR code) to scan
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data) {
            handleProcessScannedCode(code.data);
          } else {
            setScanError(
              isHindi 
                ? 'अपलोड की गई छवि में कोई वैध QR कोड नहीं मिला।' 
                : 'No valid QR code detected in the uploaded image.'
            );
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Auto start camera when modal opens in scan mode and no slip is loaded
  useEffect(() => {
    if (isOpen && activeMode === 'scan' && !scannedSlip) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, scannedSlip]);

  // Handle manual input search
  const handleLookup = (tokenToLookup?: string) => {
    const query = (tokenToLookup || manualInput).trim();
    if (!query) {
      setScanError(isHindi ? 'कृपया मान्य रूटिंग टोकन दर्ज करें' : 'Please enter a valid routing token');
      return;
    }

    setScanError(null);
    const { refId } = RoutingSlipService.parseQrInput(query);
    const slip = RoutingSlipService.getSlipByRefId(refId);

    if (slip) {
      setScannedSlip(slip);
      setSanctionSuccessData(null);
    } else {
      setScanError(isHindi 
        ? `टोकन "${refId}" के लिए कोई रिकॉर्ड नहीं मिला। कृपया पुनः जांचें।` 
        : `No citizen routing record found for reference "${refId}".`);
    }
  };

  // Instant Desk Sanction Clearance without taking information
  const handleApproveSanction = () => {
    if (!scannedSlip) return;
    const officerName = authUser?.name || 'Shri R. K. Verma (Lead Desk Officer)';
    const partnerName = authUser?.name || scannedSlip.partner.name || 'Madhya Pradesh SCA / Lead Bank';
    const amount = scannedSlip.scheme.loanAmountRequested;

    const updated = RoutingSlipService.approveDeskSanction(
      scannedSlip.slipRefId,
      officerName,
      partnerName,
      amount,
      'DigiLocker documents and beneficiary QR pass authenticated. Instant provisional fast-track sanction approved.'
    );

    if (updated) {
      setScannedSlip(updated);
      setSanctionSuccessData({
        sanctionId: updated.deskSanctionId || 'SCA-SANC-2026-0911',
        amount
      });
      if (onSanctionSuccess) {
        onSanctionSuccess(updated);
      }
    }
  };

  const handlePrintCounterfoil = () => {
    window.print();
  };

  const handleResetForNext = () => {
    setScannedSlip(null);
    setSanctionSuccessData(null);
    setManualInput('');
    setScanError(null);
    if (activeMode === 'scan') {
      setTimeout(() => startCamera(), 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Canvas for QR Analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="hidden" 
        />

        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-inner">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isHindi ? 'त्वरित सहायता डेस्क' : 'Fast-Track Desk Assistance'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SCA & Bank Partner Scanner
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                {isHindi ? 'नागरिक QR कोड स्कैनर एवं त्वरित स्वीकृति डेस्क' : 'Beneficiary QR Code Scanner & Instant Intake Desk'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              setScannedSlip(null);
              setSanctionSuccessData(null);
              setManualInput('');
              setScanError(null);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin">
          
          {/* STEP 1: SCAN OR INPUT IF NO SLIP IS LOADED */}
          {!scannedSlip ? (
            <div className="space-y-6">
              
              {/* Informational Guidance */}
              <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-emerald-950 text-sm">
                    {isHindi ? 'शून्य कागजी कार्रवाई (Zero Paperwork Citizen Hand-off):' : 'Zero Paperwork Citizen Hand-off:'}
                  </p>
                  <p className="text-emerald-800 leading-relaxed text-xs">
                    {isHindi 
                      ? 'जब कोई नागरिक अपनी SAHAYAK QR पर्ची लेकर पहुंचे, तो कैमरा सामने रखें या QR कोड स्कैन करें। 5-बिंदु डिजीलॉकर सत्यापन, ऋण राशि और रियायती ब्याज दरें तुरंत स्क्रीन पर आ जाएंगी।'
                      : 'When a citizen arrives at your branch counter or SCA desk with their SAHAYAK QR Pass, scan their code below. Verified demographics, DigiLocker certificates, and concessional loan parameters will load automatically without asking them for physical forms!'}
                  </p>
                </div>
              </div>

              {/* Mode Toggle Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 max-w-xl mx-auto">
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('scan');
                      startCamera();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                      activeMode === 'scan' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'लाइव कैमरा स्कैनर' : 'Live Camera Scan'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('manual');
                      stopCamera();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                      activeMode === 'manual' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'टोकन खोज' : 'Token Search'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                  title="Upload image or screenshot of QR code"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isHindi ? 'QR छवि अपलोड' : 'Upload QR Image'}</span>
                </button>
              </div>

              {/* LIVE CAMERA SCANNER MODE */}
              {activeMode === 'scan' && (
                <div className="max-w-md mx-auto space-y-4 text-center">
                  
                  {/* Video Viewfinder Container */}
                  <div className="relative w-full aspect-square max-w-xs mx-auto rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-900 flex items-center justify-center shadow-2xl">
                    
                    {/* Live Camera Video Feed */}
                    <video
                      ref={videoRef}
                      playsInline
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Laser Scanner Viewfinder Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                      <div className="w-full h-full border-2 border-emerald-400/90 rounded-2xl relative flex items-center justify-center">
                        
                        {/* Animated Laser Scanning Line */}
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute shadow-lg shadow-emerald-400 animate-pulse animate-bounce"></div>
                        
                        {/* Reticle Corner Brackets */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>

                        <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-md shadow-sm">
                          {isScanning ? (isHindi ? 'QR कोड संरेखित करें' : 'Align Citizen QR Pass') : 'Camera Initializing'}
                        </span>
                      </div>
                    </div>

                    {/* Camera Control Badges */}
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleToggleCameraFacing}
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur border border-white/20 text-xs transition cursor-pointer"
                        title="Flip Camera (Front/Back)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 text-[11px] text-emerald-300 font-bold px-4 py-1.5 bg-slate-950/80 backdrop-blur rounded-full border border-emerald-500/30 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>{isHindi ? 'कैमरा सक्रिय · स्कैनिंग चालू' : 'Active Scanner · Ready'}</span>
                    </div>
                  </div>

                  {/* Camera Error Message */}
                  {cameraError && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2 text-left">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">
                            {isHindi ? 'कैमरा सूचना' : 'Camera Status'}
                          </strong>
                          <span className="text-amber-800 leading-relaxed text-[11px] block">
                            {cameraError}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          {isHindi ? 'पुनः प्रयास करें' : 'Retry Camera'}
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100 transition cursor-pointer"
                        >
                          {isHindi ? 'छवि से स्कैन करें' : 'Upload Image'}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    {isHindi 
                      ? 'नागरिक के फोन की स्क्रीन अथवा प्रिंटेड पर्ची पर उपस्थित QR कोड को कैमरे के सामने लाएं।' 
                      : 'Hold beneficiary phone screen or printed routing pass in front of camera.'}
                  </p>
                </div>
              )}

              {/* MANUAL / TOKEN SEARCH MODE */}
              {activeMode === 'manual' && (
                <div className="max-w-xl mx-auto space-y-4 text-center">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block text-left">
                      {isHindi ? 'नागरिक रूटिंग पर्ची टोकन दर्ज करें' : 'Enter Citizen Routing Slip Token'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                          placeholder="e.g. SHK-SCA-2026-964210"
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-2xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLookup()}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <Search className="w-4 h-4" />
                        <span>{isHindi ? 'विवरण देखें' : 'Get Details'}</span>
                      </button>
                    </div>
                  </div>

                  {scanError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-semibold flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>{scanError}</span>
                    </div>
                  )}
                </div>
              )}



            </div>
          ) : (
            /* STEP 2: SCANNED BENEFICIARY DOSSIER & INSTANT ASSISTANCE */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* SUCCESS NOTICE / BANNER */}
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-md shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                        Authenticated Citizen Pass
                      </span>
                      <span className="font-mono text-xs text-emerald-200 font-bold">
                        {scannedSlip.slipRefId}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-white mt-0.5">
                      {scannedSlip.citizen.name} · Verified for Fast-Track Assistance
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetForNext}
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center space-x-1 self-end sm:self-center cursor-pointer"
                >
                  <span>Scan Another Citizen</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SANCTION COMPLETED ALERT (IF APPROVED) */}
              {sanctionSuccessData && (
                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 text-emerald-950 space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-black text-emerald-950 text-base">
                      Instant Provisional Sanction Granted!
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Sanction Reference Number: <strong className="font-mono text-emerald-950">{sanctionSuccessData.sanctionId}</strong> for ₹{sanctionSuccessData.amount.toLocaleString('en-IN')}.
                    DigiLocker certificates have been archived into the lead bank loan ledger. Zero paper submission needed from the citizen.
                  </p>
                </div>
              )}

              {/* DOSSIER SECTION: DEMOGRAPHICS + DIGILOCKER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Citizen Profile */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-orange-600" />
                    <span>Beneficiary Identification & Category</span>
                  </h5>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
                      <strong className="text-slate-900 text-sm">{scannedSlip.citizen.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                      <strong className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block font-black">
                        {scannedSlip.citizen.category}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Certified Annual Income</span>
                      <strong className="text-slate-900">₹{scannedSlip.citizen.annualFamilyIncome.toLocaleString('en-IN')}/yr</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                      <strong className="text-slate-900">{scannedSlip.citizen.district}, {scannedSlip.citizen.state}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Aadhaar (UIDAI Masked)</span>
                      <strong className="font-mono text-slate-800">{scannedSlip.citizen.aadhaarDigits}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Registered</span>
                      <strong className="font-mono text-slate-800">{scannedSlip.citizen.phone}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Scheme & Sanction Terms */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Concessional Credit Mandate</span>
                  </h5>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Scheme</span>
                      <strong className="text-slate-900 text-sm font-bold block">
                        {scannedSlip.scheme.name}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Loan</span>
                        <strong className="text-base font-black text-emerald-700">
                          ₹{scannedSlip.scheme.loanAmountRequested.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Interest Rate</span>
                        <strong className="text-base font-black text-blue-700">
                          {scannedSlip.scheme.interestRatePercent}% p.a.
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Moratorium Period</span>
                        <strong className="text-slate-900 font-bold">
                          {scannedSlip.scheme.moratoriumMonths} Months Grace
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Repayment Tenure</span>
                        <strong className="text-slate-900 font-bold">
                          {scannedSlip.scheme.repaymentTenureYears} Years
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 5-POINT STATUTORY DIGILOCKER VERIFICATION LIST */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      5-Point Statutory DigiLocker Documents (No Physical Documents Required)
                    </h5>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                    100% Pre-Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {scannedSlip.documents.map((doc, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-start space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold text-slate-800 block">{doc.name}</span>
                        <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                          via {doc.verifiedVia}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION FOOTER: INSTANT ASSISTANCE BUTTONS */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                    Zero Paper Intake · Action Clearance
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-md">
                    {sanctionSuccessData 
                      ? 'Provisional sanction recorded. Issue counterfoil to citizen and initiate direct DBT fund release.'
                      : 'Approve instant in-principle clearance without taking physical paper forms or asking for applicant details.'}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrintCounterfoil}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Counterfoil</span>
                  </button>

                  {!sanctionSuccessData ? (
                    <button
                      type="button"
                      onClick={handleApproveSanction}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 cursor-pointer transform hover:scale-[1.02] active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Approve Fast-Track Sanction</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetForNext}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Next Beneficiary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
