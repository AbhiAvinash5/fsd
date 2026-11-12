import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  History, 
  Search, 
  Trash2, 
  GitCompare, 
  ExternalLink, 
  ChevronRight, 
  Download, 
  Calendar, 
  Scan,
  AlertCircle
} from 'lucide-react';
import { auditApi } from '../services/api';
import { generateAuditPdf } from '../services/pdfReportGenerator';

export default function AuditHistory() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAudits();
  }, [search]);

  async function loadAudits() {
    try {
      setLoading(true);
      setError(null);
      const res = await auditApi.getAll(search);
      if (res.data.success) {
        setAudits(res.data.audits || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load audits.');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this audit report from history?')) return;
    try {
      await auditApi.delete(id);
      setAudits(audits.filter(a => a._id !== id));
      setSelectedForCompare(selectedForCompare.filter(selId => selId !== id));
    } catch (err) {
      alert('Failed to delete audit: ' + (err.message || 'Server error'));
    }
  };

  const handleSelectCompare = (id, e) => {
    e.stopPropagation();
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(i => i !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        // replace the oldest selection
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const launchComparison = () => {
    if (selectedForCompare.length === 2) {
      navigate(`/compare?audit1=${selectedForCompare[0]}&audit2=${selectedForCompare[1]}`);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            <span>Audit History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and inspect previous website audits, download reports, or compare changes across versions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length === 2 ? (
            <button
              onClick={launchComparison}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 transition-all animate-pulse"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Selected (2)</span>
            </button>
          ) : selectedForCompare.length === 1 ? (
            <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg font-medium">
              Select 1 more audit to compare
            </span>
          ) : null}

          <Link
            to="/scan"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audits by URL or website title..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span>Tip: Check the boxes on any two audits to run a side-by-side regression comparison.</span>
        </div>
      </div>

      {/* Audits Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Retrieving audit history...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
            <span>{error}</span>
          </div>
        ) : audits.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Audits Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Run your first accessibility audit to populate this history.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
            >
              Start Scan
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">Compare</th>
                  <th className="py-3.5 px-4">Website & Page</th>
                  <th className="py-3.5 px-4">AccessAudit Score</th>
                  <th className="py-3.5 px-4">Violations</th>
                  <th className="py-3.5 px-4">Severities</th>
                  <th className="py-3.5 px-4">Scan Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {audits.map((audit) => {
                  const counts = audit.severityCounts || {};
                  const isChecked = selectedForCompare.includes(audit._id);

                  return (
                    <tr
                      key={audit._id}
                      onClick={() => navigate(`/audits/${audit._id}`)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isChecked ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox for Compare */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectCompare(audit._id, e)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Title & URL */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                          {audit.pageTitle || 'Untitled Page'}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] truncate max-w-xs sm:max-w-md">
                          {audit.websiteUrl}
                        </div>
                      </td>

                      {/* Score Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold border text-xs ${getScoreBadge(audit.score)}`}>
                          {audit.score} / 100
                        </span>
                      </td>

                      {/* Total Issues */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{audit.totalIssues}</span>
                        <span className="text-slate-400 ml-1">issues</span>
                      </td>

                      {/* Severity Breakdown Pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          {counts.critical > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200" title="Critical">
                              C:{counts.critical}
                            </span>
                          )}
                          {counts.serious > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200" title="Serious">
                              S:{counts.serious}
                            </span>
                          )}
                          {counts.moderate > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200" title="Moderate">
                              M:{counts.moderate}
                            </span>
                          )}
                          {counts.minor > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200" title="Minor">
                              m:{counts.minor}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(audit.scanDate).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => generateAuditPdf(audit)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Download PDF Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(audit._id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Audit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/audits/${audit._id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

