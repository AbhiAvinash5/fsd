import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Code2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';

export default function IssueCard({ issue, onAskAi }) {
  const [copiedSelector, setCopiedSelector] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const severityConfigs = {
    critical: {
      label: 'Critical',
      icon: AlertOctagon,
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      borderLeft: 'border-l-rose-500',
      dot: 'bg-rose-500'
    },
    serious: {
      label: 'Serious',
      icon: AlertTriangle,
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      borderLeft: 'border-l-orange-500',
      dot: 'bg-orange-500'
    },
    moderate: {
      label: 'Moderate',
      icon: AlertTriangle,
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      borderLeft: 'border-l-amber-500',
      dot: 'bg-amber-500'
    },
    minor: {
      label: 'Minor',
      icon: Info,
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      borderLeft: 'border-l-blue-500',
      dot: 'bg-blue-500'
    }
  };

  const config = severityConfigs[issue.severity] || severityConfigs.moderate;
  const SeverityIcon = config.icon;

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all border-l-4 ${config.borderLeft} overflow-hidden`}>
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Severity Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>

            {/* Rule ID */}
            <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {issue.ruleId}
            </span>

            {/* WCAG Tags */}
            {issue.wcagTags && issue.wcagTags.map((tag, idx) => (
              <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {issue.description}
          </h3>

          {issue.pageUrl && (
            <p className="text-xs text-slate-400 mt-1 font-mono truncate max-w-xl">
              Page: {issue.pageUrl}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-start">
          {onAskAi && (
            <button
              onClick={() => onAskAi(issue)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 transition-all shadow-sm"
              title="Generate intelligent code fix with AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Remediation</span>
            </button>
          )}

          {issue.helpUrl && (
            <a
              href={issue.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Deque / WCAG documentation"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-100 space-y-4 text-xs sm:text-sm">
          {/* CSS Selector */}
          {issue.selector && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>CSS SELECTOR</span>
                <button
                  onClick={() => copyToClipboard(issue.selector, setCopiedSelector)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {copiedSelector ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSelector ? 'Copied' : 'Copy Selector'}</span>
                </button>
              </div>
              <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                <code>{issue.selector}</code>
              </div>
            </div>
          )}

          {/* HTML Snippet */}
          {issue.htmlSnippet && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>AFFECTED HTML ELEMENT</span>
                <button
                  onClick={() => copyToClipboard(issue.htmlSnippet, setCopiedHtml)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {copiedHtml ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHtml ? 'Copied' : 'Copy HTML'}</span>
                </button>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                <code>{issue.htmlSnippet}</code>
              </div>
            </div>
          )}

          {/* Failure Summary */}
          {issue.failureSummary && (
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-3 text-slate-800">
              <span className="font-semibold text-amber-900 block mb-0.5 text-xs uppercase tracking-wide">
                Why this failed evaluation:
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {issue.failureSummary}
              </p>
            </div>
          )}

          {/* Recommended Solution */}
          {issue.recommendation && (
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-lg p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recommended Fix
                </span>
                <button
                  onClick={() => copyToClipboard(issue.recommendation, setCopiedFix)}
                  className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 transition-colors font-medium"
                >
                  {copiedFix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedFix ? 'Copied' : 'Copy Fix'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                {issue.recommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

