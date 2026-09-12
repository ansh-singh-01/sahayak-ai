import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Globe, 
  Layout, 
  Palette, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { WidgetConfig, LANGUAGES } from '../../data/languages';

interface WidgetEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WidgetConfig;
  onUpdateConfig: (newConfig: WidgetConfig) => void;
}

export const WidgetEmbedModal: React.FC<WidgetEmbedModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'iframe' | 'react' | 'platforms'>('script');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const scriptTagCode = `<script 
  src="${currentHost}/api/widget.js" 
  data-position="${config.position}" 
  data-primary="${config.primaryColor}" 
  data-title="${config.title}" 
  data-lang="${config.defaultLanguage}"
  async>
</script>`;

  const iframeCode = `<iframe 
  src="${currentHost}/?embed=true&lang=${config.defaultLanguage}&primary=${encodeURIComponent(config.primaryColor)}&title=${encodeURIComponent(config.title)}" 
  width="420" 
  height="640" 
  style="border: none; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);" 
  allow="microphone">
</iframe>`;

  const reactComponentCode = `import React from 'react';

export function SahayakAIWidget() {
  return (
    <iframe
      src="${currentHost}/?embed=true&lang=${config.defaultLanguage}&primary=${encodeURIComponent(config.primaryColor)}"
      title="${config.title}"
      width="100%"
      height="650px"
      className="rounded-3xl border border-slate-200 shadow-xl"
      allow="microphone"
    />
  );
}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Embed SAHAYAK on Any Government or Bank Portal
              </h3>
              <p className="text-xs text-slate-400">
                1-line script tag compatible with NIC portals, State Portals, WordPress & React
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Customizer Panel */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Widget Customizer
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bot Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Widget Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => onUpdateConfig({ ...config, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Default Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Default Language</label>
                <select
                  value={config.defaultLanguage}
                  onChange={(e) => onUpdateConfig({ ...config, defaultLanguage: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Screen Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ ...config, position: 'bottom-right' })}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      config.position === 'bottom-right'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Bottom Right
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ ...config, position: 'bottom-left' })}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      config.position === 'bottom-left'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Bottom Left
                  </button>
                </div>
              </div>

              {/* Primary Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Theme Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => onUpdateConfig({ ...config, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => onUpdateConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('script')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'script'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1-Line &lt;script&gt; Embed
              </button>
              <button
                onClick={() => setActiveTab('iframe')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'iframe'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Iframe Snippet
              </button>
              <button
                onClick={() => setActiveTab('react')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'react'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                React / Next.js
              </button>
              <button
                onClick={() => setActiveTab('platforms')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'platforms'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Government Integration
              </button>
            </div>

            {/* Script Tab */}
            {activeTab === 'script' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Paste this 1-line script tag before the closing <code className="text-orange-600 bg-orange-50 px-1 rounded">&lt;/body&gt;</code> tag of any state welfare or banking website:
                </p>
                <div className="relative rounded-2xl bg-slate-950 p-4 text-slate-200 font-mono text-xs overflow-x-auto">
                  <pre>{scriptTagCode}</pre>
                  <button
                    onClick={() => handleCopy(scriptTagCode, 'script')}
                    className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition-colors"
                  >
                    {copiedType === 'script' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Iframe Tab */}
            {activeTab === 'iframe' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Embed directly inside an existing citizen portal container or modal:
                </p>
                <div className="relative rounded-2xl bg-slate-950 p-4 text-slate-200 font-mono text-xs overflow-x-auto">
                  <pre>{iframeCode}</pre>
                  <button
                    onClick={() => handleCopy(iframeCode, 'iframe')}
                    className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition-colors"
                  >
                    {copiedType === 'iframe' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* React Tab */}
            {activeTab === 'react' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Reusable React/Next.js component for frontend portals:
                </p>
                <div className="relative rounded-2xl bg-slate-950 p-4 text-slate-200 font-mono text-xs overflow-x-auto">
                  <pre>{reactComponentCode}</pre>
                  <button
                    onClick={() => handleCopy(reactComponentCode, 'react')}
                    className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition-colors"
                  >
                    {copiedType === 'react' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Platforms Tab */}
            {activeTab === 'platforms' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">NIC State Portals</p>
                  <p className="text-slate-600">
                    Include the script tag in the master portal template. Enables district-specific channel partner routing and multilingual citizen assistance.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Lead District Banks (SLBC)</p>
                  <p className="text-slate-600">
                    Embed on State Level Bankers' Committee portals to assist applicants in understanding concessional credit rates (4%-6%) and required documents.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Common Service Centers (CSC)</p>
                  <p className="text-slate-600">
                    VLE operators can run the widget on rural kiosks to deliver voice-first guidance in 12+ Indian languages.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">WordPress / Drupal</p>
                  <p className="text-slate-600">
                    Paste script in header/footer inject plugin. Microphone permissions are automatically requested for voice typing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CORS enabled for all authorized government domains</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
