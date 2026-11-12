import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, ExternalLink, Lightbulb, ShieldCheck } from 'lucide-react';
import { auditApi } from '../services/api';

export default function AiRemediationModal({ issue, onClose }) {
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAdvice() {
      if (!issue || !issue._id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await auditApi.getAiAdvice(issue._id);
        if (res.data.success) {
          setAdvice(res.data.advice);
        } else {
          setError(res.data.message || 'Unable to generate remediation.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch AI advice.');
      } finally {
        setLoading(false);
      }
    }
    fetchAdvice();
  }, [issue]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">AI Accessibility Remediation</h2>
              <p className="text-xs text-indigo-200">Rule: {issue.ruleId} • {issue.severity.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Synthesizing WCAG 2.2 Fix...</p>
              <p className="text-xs text-slate-400">Analyzing DOM structure and accessibility semantics</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <p className="font-semibold mb-1">Failed to generate AI advice:</p>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* WCAG & Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-slate-900 text-sm">
                  {advice?.title || issue.description}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {advice?.wcag || 'WCAG 2.2'}
                </span>
              </div>

              {/* Disability Impact Explanation */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Impact on Assistive Technology Users
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {advice?.explanation}
                </p>
              </div>

              {/* Corrected HTML Code Snippet */}
              {advice?.suggestedFixHtml && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Corrected HTML Implementation
                    </span>
                    <button
                      onClick={() => copyCode(advice.suggestedFixHtml)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied to clipboard' : 'Copy Corrected Code'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-3.5 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                    <pre><code>{advice.suggestedFixHtml}</code></pre>
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {advice?.keyTakeaways && advice.keyTakeaways.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Key Implementation Takeaways
                  </h4>
                  <ul className="space-y-1.5">
                    {advice.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Engine Source Notice */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Remediation Engine: {advice?.source || 'AccessAudit Knowledge Base'}</span>
                <span>WCAG 2.2 Level AA Standard</span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

