import React, { useState } from 'react';
import { BookOpen, Search, CheckCircle2, XCircle, Code, ShieldCheck, ExternalLink } from 'lucide-react';

const WCAG_RULES = [
  {
    id: '1.1.1',
    name: 'Non-text Content',
    level: 'Level A',
    principle: 'Perceivable',
    axeRule: 'image-alt',
    summary: 'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
    badCode: '<img src="/banner.png">',
    goodCode: '<img src="/banner.png" alt="Annual Summer Tech Summit 2026 Keynote Schedule">',
    tip: 'Purely decorative images must use alt="" or aria-hidden="true" so screen readers skip them.'
  },
  {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    level: 'Level AA',
    principle: 'Perceivable',
    axeRule: 'color-contrast',
    summary: 'The visual presentation of text has a contrast ratio of at least 4.5:1 (or 3:1 for large text 18pt+ / 14pt bold).',
    badCode: '/* Low contrast ratio: ~2.4:1 */\ncolor: #94a3b8; /* Light gray */\nbackground: #ffffff;',
    goodCode: '/* Compliant contrast ratio: ~8.6:1 */\ncolor: #1e293b; /* Dark slate */\nbackground: #ffffff;',
    tip: 'Avoid light grays for small body text. Test interactive button states and placeholder text contrast.'
  },
  {
    id: '1.3.1',
    name: 'Info and Relationships',
    level: 'Level A',
    principle: 'Perceivable',
    axeRule: 'heading-order, label',
    summary: 'Information, structure, and relationships conveyed through presentation can be programmatically determined.',
    badCode: '<!-- Skipped heading levels -->\n<h1>Page Title</h1>\n<h4>Subsection Title</h4>',
    goodCode: '<!-- Correct hierarchy -->\n<h1>Page Title</h1>\n<h2>Section Title</h2>\n<h3>Subsection Title</h3>',
    tip: 'Do not choose heading tags for styling size; use CSS classes for font size and semantic tags for structure.'
  },
  {
    id: '2.4.4',
    name: 'Link Purpose (In Context)',
    level: 'Level A',
    principle: 'Operable',
    axeRule: 'link-name',
    summary: 'The purpose of each link can be determined from the link text alone or from the link text together with its context.',
    badCode: '<a href="/pricing">Click here</a>\n<a href="/docs"><svg>...</svg></a>',
    goodCode: '<a href="/pricing">View Enterprise Pricing Plans</a>\n<a href="/docs" aria-label="Documentation"><svg ...></svg></a>',
    tip: 'Screen reader users often generate a list of all links on a page. Generic phrases like "Read More" become completely ambiguous out of context.'
  },
  {
    id: '3.1.1',
    name: 'Language of Page',
    level: 'Level A',
    principle: 'Understandable',
    axeRule: 'html-has-lang',
    summary: 'The default human language of each Web page can be programmatically determined.',
    badCode: '<html>\n  <head>...',
    goodCode: '<!DOCTYPE html>\n<html lang="en">\n  <head>...',
    tip: 'Specifying the language enables screen reading software to apply correct pronunciation rules and phonetic synthesis.'
  },
  {
    id: '4.1.2',
    name: 'Name, Role, Value',
    level: 'Level A',
    principle: 'Robust',
    axeRule: 'button-name, aria-valid-attr',
    summary: 'For all UI components, the name and role can be programmatically determined, and states/properties can be set.',
    badCode: '<button class="btn"><i class="fa fa-close"></i></button>',
    goodCode: '<button class="btn" aria-label="Close dialog">\n  <i class="fa fa-close" aria-hidden="true"></i>\n</button>',
    tip: 'Icon buttons must have either an aria-label or an inner <span class="sr-only">Close</span> element.'
  }
];

export default function WcagReference() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filteredRules = WCAG_RULES.filter(rule => {
    if (selectedLevel !== 'all' && !rule.level.toLowerCase().includes(selectedLevel)) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        rule.id.includes(q) ||
        rule.name.toLowerCase().includes(q) ||
        rule.summary.toLowerCase().includes(q) ||
        rule.axeRule.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <span>WCAG 2.2 Guidelines Reference & Code Samples</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quick developer reference for Web Content Accessibility Guidelines evaluated by AccessAudit.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guidelines (e.g. 1.4.3, contrast, alt, button)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedLevel === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedLevel('level a')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedLevel === 'level a' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Level A
          </button>
          <button
            onClick={() => setSelectedLevel('level aa')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedLevel === 'level aa' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Level AA
          </button>
        </div>
      </div>

      {/* Rules Cards List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  WCAG {rule.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {rule.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {rule.level}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                  {rule.principle}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {rule.summary}
            </p>

            {/* Code Examples Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Bad Implementation */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Failing Pattern (Violation)</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-rose-300 font-mono text-xs overflow-x-auto">
                  <pre><code>{rule.badCode}</code></pre>
                </div>
              </div>

              {/* Good Implementation */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Compliant Pattern (Passes)</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-emerald-400 font-mono text-xs overflow-x-auto">
                  <pre><code>{rule.goodCode}</code></pre>
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">Best Practice: </strong>{rule.tip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

