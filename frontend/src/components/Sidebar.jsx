import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scan, 
  History, 
  GitCompare, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scan', label: 'New Audit', icon: Scan },
    { to: '/history', label: 'Scan History', icon: History },
    { to: '/compare', label: 'Compare Scans', icon: GitCompare },
    { to: '/wcag-guide', label: 'WCAG 2.2 Guide', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 z-30 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 border border-indigo-100/80">
            <div className="flex items-center gap-2 mb-1.5 text-indigo-800">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold">Axe-Core + Playwright</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Automated heuristics for WCAG 2.0, 2.1 & 2.2 AA compliance standards.
            </p>
            <div className="mt-2.5 pt-2 border-t border-indigo-100/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono">Engine v4.10</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                SSRF Guarded
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

