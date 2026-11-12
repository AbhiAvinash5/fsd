import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  GitCompare, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Minus,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { auditApi } from '../services/api';
import IssueCard from '../components/IssueCard';
import AiRemediationModal from '../components/AiRemediationModal';

export default function Comparison() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auditsList, setAuditsList] = useState([]);
  const [audit1Id, setAudit1Id] = useState(searchParams.get('audit1') || '');
  const [audit2Id, setAudit2Id] = useState(searchParams.get('audit2') || '');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resolved');
  const [activeIssueForAi, setActiveIssueForAi] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAuditsList();
  }, []);

  useEffect(() => {
    if (audit1Id && audit2Id) {
      runComparison(audit1Id, audit2Id);
    }
  }, [audit1Id, audit2Id]);

  async function loadAuditsList() {
    try {
      const res = await auditApi.getAll('', 100);
      if (res.data.success) {
        setAuditsList(res.data.audits || []);
        // If query params were missing, pick first two for instant display
        if (!audit1Id && !audit2Id && res.data.audits?.length >= 2) {
          setAudit1Id(res.data.audits[1]._id); // Older
          setAudit2Id(res.data.audits[0]._id); // Newer
        }
      }
    } catch (err) {
      console.error('Failed to load audits list for compare:', err);
    }
  }

  async function runComparison(id1, id2) {
    if (!id1 || !id2) return;
    try {
      setLoading(true);
      setError(null);
      const res = await auditApi.compare(id1, id2);
      if (res.data.success) {
        setComparison(res.data.comparison);
        if (res.data.comparison.scoreDiff > 0) {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 }
          });
        }
      } else {
        setError(res.data.message || 'Comparison failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  }

  const handleAudit1Change = (e) => {
    const val = e.target.value;
    setAudit1Id(val);
    setSearchParams({ audit1: val, audit2: audit2Id });
  };

  const handleAudit2Change = (e) => {
    const val = e.target.value;
    setAudit2Id(val);
    setSearchParams({ audit1: audit1Id, audit2: val });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-indigo-600" />
          <span>Before-and-After Accessibility Comparison</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Measure verified progress, catch regressions, and track resolved accessibility barriers.
        </p>
      </div>

      {/* Selectors Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-subtle">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Audit 1: Baseline */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Baseline Scan (Before)
            </label>
            <select
              value={audit1Id}
              onChange={handleAudit1Change}
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Baseline Audit...</option>
              {auditsList.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.pageTitle || a.websiteUrl} — Score {a.score} ({new Date(a.scanDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Audit 2: Comparison */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Scan (After)
            </label>
            <select
              value={audit2Id}
              onChange={handleAudit2Change}
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Comparison Audit...</option>
              {auditsList.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.pageTitle || a.websiteUrl} — Score {a.score} ({new Date(a.scanDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Synthesizing visual regression comparison...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs text-center">
          {error}
        </div>
      ) : comparison ? (
        <div className="space-y-6">
          {/* Comparison Delta Hero */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Score Evolution Display */}
            <div className="flex items-center gap-6">
              {/* Before Score */}
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Before</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-300">
                  {comparison.audit1.score}
                </span>
                <span className="text-xs text-slate-400 block">/ 100</span>
              </div>

              <ArrowRight className="w-6 h-6 text-indigo-400 flex-shrink-0" />

              {/* After Score */}
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">After</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {comparison.audit2.score}
                </span>
                <span className="text-xs text-slate-400 block">/ 100</span>
              </div>

              {/* Delta Badge */}
              <div className="ml-2 pl-4 border-l border-slate-800">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${
                  comparison.scoreDiff > 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                    : comparison.scoreDiff < 0
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {comparison.scoreDiff > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : comparison.scoreDiff < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                  <span>
                    {comparison.scoreDiff > 0 ? `+${comparison.scoreDiff}` : comparison.scoreDiff} Points
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {comparison.scoreDiff > 0
                    ? 'Accessibility improved!'
                    : comparison.scoreDiff < 0
                    ? 'Accessibility regressed.'
                    : 'No change in score.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[90px]">
                <span className="text-emerald-400 font-extrabold text-xl block">
                  {comparison.resolvedCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Fixed
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[90px]">
                <span className="text-rose-400 font-extrabold text-xl block">
                  {comparison.newCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  New
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[90px]">
                <span className="text-amber-400 font-extrabold text-xl block">
                  {comparison.persistentCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Remaining
                </span>
              </div>
            </div>
          </div>

          {/* Issue Categories Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolved Issues ({comparison.resolvedCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'new'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Newly Introduced ({comparison.newCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('persistent')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'persistent'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Persistent Remaining ({comparison.persistentCount})</span>
              </button>
            </div>
          </div>

          {/* Tab Content List */}
          <div className="space-y-4">
            {activeTab === 'resolved' && (
              <div>
                {comparison.resolvedIssues.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>These {comparison.resolvedIssues.length} issue(s) were present in the baseline scan and have been verified as resolved!</span>
                    </div>
                    {comparison.resolvedIssues.map((issue) => (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        onAskAi={(iss) => setActiveIssueForAi(iss)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500 text-xs">
                    No resolved issues detected between these two scans.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'new' && (
              <div>
                {comparison.newIssues.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>Regression warning: These {comparison.newIssues.length} violation(s) were not present in the baseline scan.</span>
                    </div>
                    {comparison.newIssues.map((issue) => (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        onAskAi={(iss) => setActiveIssueForAi(iss)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-emerald-700 text-xs flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <span className="font-bold">Zero Regressions Detected!</span>
                    <span className="text-slate-400">No new accessibility violations were introduced in this scan.</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'persistent' && (
              <div>
                {comparison.persistentIssues.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>These {comparison.persistentIssues.length} violation(s) remain unresolved across both scans.</span>
                    </div>
                    {comparison.persistentIssues.map((issue) => (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        onAskAi={(iss) => setActiveIssueForAi(iss)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500 text-xs">
                    No persistent issues remain!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
          <GitCompare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Select Two Audits to Compare</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose a baseline audit and a more recent audit from the dropdown menus above to inspect progress.
          </p>
        </div>
      )}

      {/* AI Modal */}
      {activeIssueForAi && (
        <AiRemediationModal
          issue={activeIssueForAi}
          onClose={() => setActiveIssueForAi(null)}
        />
      )}
    </div>
  );
}

