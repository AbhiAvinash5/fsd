import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  GitCompare, 
  Trash2, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Info,
  Calendar,
  Share2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ScoreGauge from '../components/ScoreGauge';
import IssueCard from '../components/IssueCard';
import AiRemediationModal from '../components/AiRemediationModal';
import { auditApi } from '../services/api';
import { generateAuditPdf } from '../services/pdfReportGenerator';

export default function AuditDetail() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIssueForAi, setActiveIssueForAi] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAudit();
  }, [id]);

  async function loadAudit() {
    try {
      setLoading(true);
      setError(null);
      const res = await auditApi.getById(id);
      if (res.data.success && res.data.audit) {
        setAudit(res.data.audit);
        // Trigger celebratory confetti if score is exceptional!
        if (res.data.audit.score >= 90) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      } else {
        setError('Audit report not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load audit report.');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this accessibility audit report?')) return;
    try {
      setDeleting(true);
      await auditApi.delete(id);
      navigate('/history');
    } catch (err) {
      alert('Failed to delete audit: ' + (err.message || 'Server error'));
      setDeleting(false);
    }
  };

  const handleExportPdf = () => {
    if (!audit) return;
    generateAuditPdf(audit);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Loading Accessibility Report...</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          <p className="font-bold">Error loading audit</p>
          <p>{error || 'Report not found'}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const issues = audit.issues || [];
  const counts = audit.severityCounts || { critical: 0, serious: 0, moderate: 0, minor: 0 };

  // Filter issues
  const filteredIssues = issues.filter((iss) => {
    if (selectedSeverity !== 'all' && iss.severity !== selectedSeverity) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = iss.description?.toLowerCase().includes(q);
      const matchRule = iss.ruleId?.toLowerCase().includes(q);
      const matchSel = iss.selector?.toLowerCase().includes(q);
      const matchTag = iss.wcagTags?.some(t => t.toLowerCase().includes(q));
      if (!matchDesc && !matchRule && !matchSel && !matchTag) return false;
    }
    return true;
  });

  const principles = audit.principleScores || {
    perceivable: 85,
    operable: 80,
    understandable: 90,
    robust: 75
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-subtle"
            title="Back to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Audit Report
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="truncate max-w-md">{audit.pageTitle || 'Audit Overview'}</span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
            title="Download executive PDF report"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <Link
            to={`/compare?audit1=${audit._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all shadow-subtle"
            title="Compare with another audit"
          >
            <GitCompare className="w-4 h-4 text-indigo-600" />
            <span>Compare</span>
          </Link>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-subtle"
            title="Copy Report Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-subtle"
            title="Delete this audit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Website Metadata Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>URL:</span>
            <a
              href={audit.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-white hover:underline flex items-center gap-1 truncate max-w-lg"
            >
              {audit.websiteUrl}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm">
            Audited <span className="font-semibold text-white">{(audit.pagesScanned || [audit.websiteUrl]).length} page(s)</span> in {(audit.scanDurationMs / 1000).toFixed(2)}s.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{new Date(audit.scanDate).toLocaleDateString()} at {new Date(audit.scanDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Score Overview & Principle Scores Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col items-center justify-center text-center">
          <ScoreGauge score={audit.score} size={180} />
          
          <div className="mt-4 pt-4 border-t border-slate-100 w-full grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Issues</span>
              <span className="text-base font-bold text-slate-900">{audit.totalIssues}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Critical</span>
              <span className="text-base font-bold text-rose-600">{counts.critical}</span>
            </div>
          </div>
        </div>

        {/* WCAG Principles Progress Bars (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                WCAG 2.2 Core Principles Conformance
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                A / AA Criteria
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Evaluation mapped to the four foundational pillars of digital accessibility.
            </p>

            <div className="space-y-4">
              {/* Perceivable */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">1. Perceivable (Alt text, contrast, captions, audio)</span>
                  <span className="font-mono text-indigo-700">{principles.perceivable}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${principles.perceivable}%` }}
                  />
                </div>
              </div>

              {/* Operable */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">2. Operable (Keyboard control, accessible buttons/links, timing)</span>
                  <span className="font-mono text-indigo-700">{principles.operable}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${principles.operable}%` }}
                  />
                </div>
              </div>

              {/* Understandable */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">3. Understandable (Language, predictable navigation, form labels)</span>
                  <span className="font-mono text-indigo-700">{principles.understandable}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${principles.understandable}%` }}
                  />
                </div>
              </div>

              {/* Robust */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">4. Robust (ARIA semantics, valid markup, parsing)</span>
                  <span className="font-mono text-indigo-700">{principles.robust}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${principles.robust}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Weighted algorithm based on severity impact across {audit.totalIssues} detected node violations.
          </div>
        </div>
      </div>

      {/* Issues Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Severity Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedSeverity === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setSelectedSeverity('critical')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'critical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Critical ({counts.critical})</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('serious')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'serious'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Serious ({counts.serious})</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('moderate')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'moderate'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Moderate ({counts.moderate})</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('minor')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'minor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Minor ({counts.minor})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rule, selector, or tag..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing {filteredIssues.length} of {issues.length} detected violation(s)</span>
          <span>Click "AI Remediation" on any issue for smart code fixes</span>
        </div>

        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onAskAi={(iss) => setActiveIssueForAi(iss)}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No violations match this filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting "All" or adjusting your search term.
            </p>
          </div>
        )}
      </div>

      {/* AI Remediation Modal */}
      {activeIssueForAi && (
        <AiRemediationModal
          issue={activeIssueForAi}
          onClose={() => setActiveIssueForAi(null)}
        />
      )}
    </div>
  );
}

