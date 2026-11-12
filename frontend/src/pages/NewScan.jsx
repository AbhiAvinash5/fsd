import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Scan, 
  Globe, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  FileCode, 
  Settings2,
  ExternalLink
} from 'lucide-react';
import { auditApi } from '../services/api';
import ScanProgressModal from '../components/ScanProgressModal';

export default function NewScan() {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState('');
  const [multiPage, setMultiPage] = useState(false);
  const [maxPages, setMaxPages] = useState(3);
  const [wcagStandard, setWcagStandard] = useState('wcag22aa');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const queryUrl = searchParams.get('url');
    if (queryUrl) {
      setUrl(queryUrl);
    }
  }, [searchParams]);

  const handleStartScan = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL.');
      return;
    }

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
      setUrl(target);
    }

    try {
      setError(null);
      setScanning(true);

      const res = await auditApi.scan(target, multiPage, maxPages);
      if (res.data.success && res.data.audit) {
        // Navigate to the newly generated report
        navigate(`/audits/${res.data.audit._id}`);
      } else {
        setError(res.data.message || 'Audit failed to complete.');
      }
    } catch (err) {
      console.error('[Scan Error]:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete accessibility scan.');
    } finally {
      setScanning(false);
    }
  };

  const sampleTargets = [
    {
      name: 'Flawed Apparel Store (Demo)',
      url: 'https://ecommerce-store-sample.com',
      badge: 'Intentional Violations',
      color: 'border-rose-200 bg-rose-50/50 text-rose-700',
      desc: 'Contains missing alt text, 2.5:1 low contrast, unlabelled inputs, and invalid headings.'
    },
    {
      name: 'Remediated Store (Demo)',
      url: 'https://demo-accessible-store.com',
      badge: 'High Conformance',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
      desc: 'WCAG 2.2 compliant with descriptive labels, 8:1 contrast, and semantic markup.'
    },
    {
      name: 'SaaS Cloud Dashboard',
      url: 'https://cloudanalytics-platform.io',
      badge: 'Multi-Page Test',
      color: 'border-indigo-200 bg-indigo-50/50 text-indigo-700',
      desc: 'Complex dashboard with custom ARIA components and interactive modals.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Scan className="w-6 h-6 text-indigo-600" />
          <span>New Accessibility Audit</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Perform automated WCAG 2.2 Level A, AA & AAA accessibility analysis using Playwright and Axe-Core.
        </p>
      </div>

      {/* Main Scan Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 sm:p-8 space-y-6">
        <form onSubmit={handleStartScan} className="space-y-6">
          {/* URL Input Bar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Target Website URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 font-mono transition-all"
                disabled={scanning}
              />
              <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSRF-guarded: Private and internal loopback addresses are blocked.</span>
            </p>
          </div>

          {/* Scan Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Multi-page Crawl */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Multi-Page Crawling
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Follow internal links on the same domain up to {maxPages} pages.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3 mt-1">
                <input
                  type="checkbox"
                  checked={multiPage}
                  onChange={(e) => setMultiPage(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            {/* WCAG Standard Selection */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-indigo-600" />
                  Conformance Target
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Rules evaluated during headless browser audit.
                </p>
              </div>
              <select
                value={wcagStandard}
                onChange={(e) => setWcagStandard(e.target.value)}
                className="mt-2 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
              >
                <option value="wcag22aa">WCAG 2.2 Level AA (Recommended)</option>
                <option value="wcag21aa">WCAG 2.1 Level AA</option>
                <option value="wcag2a">WCAG 2.0 / 2.1 Level A</option>
                <option value="all">WCAG 2.2 Full (A, AA, AAA + Best Practice)</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Scan Error: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={scanning}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2 transition-all ${
                scanning ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>{scanning ? 'Auditing in Progress...' : 'Start Accessibility Audit'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Test Samples */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Or audit one of these demo websites:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleTargets.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => {
                setUrl(sample.url);
              }}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-subtle hover:border-indigo-300 hover:shadow-card cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {sample.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sample.color}`}>
                    {sample.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {sample.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">
                  {sample.url}
                </span>
                <span>Load URL</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Modal */}
      <ScanProgressModal
        isOpen={scanning}
        targetUrl={url}
        isMultiPage={multiPage}
      />
    </div>
  );
}

