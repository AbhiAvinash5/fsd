import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Award, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowUpRight, 
  Scan, 
  History, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { auditApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickScanUrl, setQuickScanUrl] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      setLoading(true);
      const res = await auditApi.getStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleHeroScan = (e) => {
    e.preventDefault();
    if (!quickScanUrl.trim()) return;
    navigate(`/scan?url=${encodeURIComponent(quickScanUrl.trim())}`);
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>WCAG 2.2 Automated Compliance Auditor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Developer'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Audit websites instantly using headless Playwright & Axe-Core. Identify color contrast, missing alt text, keyboard navigation traps, and receive actionable code fixes.
          </p>

          {/* Direct Scan Trigger */}
          <form onSubmit={handleHeroScan} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickScanUrl}
                onChange={(e) => setQuickScanUrl(e.target.value)}
                placeholder="Enter website URL (e.g. https://your-site.com)..."
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white/10 text-white placeholder-slate-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Scan className="w-4 h-4" />
              <span>Run Audit</span>
            </button>
          </form>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Scans"
          value={stats?.totalScans ?? '...'}
          subtitle="Audited web properties"
          icon={Globe}
          color="indigo"
        />
        <StatsCard
          title="Average Score"
          value={stats ? `${stats.avgScore} / 100` : '...'}
          subtitle={stats?.avgScore >= 80 ? 'Grade A - High Conformance' : 'Grade C - Remediations needed'}
          icon={Award}
          color={stats?.avgScore >= 70 ? 'emerald' : 'amber'}
        />
        <StatsCard
          title="Total Violations"
          value={stats?.totalIssues ?? '...'}
          subtitle="Identified across all scans"
          icon={Layers}
          color="purple"
        />
        <StatsCard
          title="Critical Barriers"
          value={stats?.criticalIssues ?? '...'}
          subtitle="Blocking assistive technologies"
          icon={AlertOctagon}
          color="red"
          trend={stats?.criticalIssues > 0 ? { type: 'negative', text: 'Action Required' } : { type: 'positive', text: 'All Clear' }}
        />
      </div>

      {/* Charts Section: Score Trend & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Accessibility Score Trend
              </h3>
              <p className="text-xs text-slate-500">Heuristic score progression over recent scans</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Recent Audits
            </span>
          </div>

          <div className="h-64 w-full">
            {stats?.scoreTrend && stats.scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [`${val} / 100`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Clock className="w-6 h-6 mb-2 text-slate-300" />
                <span>No audit history available yet. Run a scan to see your progress chart!</span>
              </div>
            )}
          </div>
        </div>

        {/* Violations by Severity (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Severity Breakdown
              </h3>
              <span className="text-xs text-slate-400">WCAG Impact</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Distribution of detected violations</p>

            <div className="h-48 w-full flex items-center justify-center">
              {stats?.severityData && stats.totalIssues > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.severityData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {stats.severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400 text-center">No violations detected</p>
              )}
            </div>
          </div>

          {/* Severity Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            {stats?.severityData?.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Accessibility Audits
            </h3>
            <p className="text-xs text-slate-500">Review results and launch before-and-after comparisons</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>View all audits</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Target Website</th>
                <th className="py-3 px-5">Score</th>
                <th className="py-3 px-5">Violations</th>
                <th className="py-3 px-5">Severities</th>
                <th className="py-3 px-5">Audited On</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.recentAudits && stats.recentAudits.length > 0 ? (
                stats.recentAudits.map((audit) => {
                  const counts = audit.severityCounts || {};
                  return (
                    <tr key={audit._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-xs">
                          {audit.pageTitle || 'Untitled'}
                        </div>
                        <a
                          href={audit.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] font-mono truncate max-w-xs"
                        >
                          {audit.websiteUrl}
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold border text-xs ${getScoreBadge(audit.score)}`}>
                          {audit.score} / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-900">
                          {audit.totalIssues}
                        </span>
                        <span className="text-slate-400 ml-1">issues</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
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
                      <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                        {new Date(audit.scanDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Link
                          to={`/audits/${audit._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          <span>View Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No audits found. Click "New Audit" to test your first website!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

