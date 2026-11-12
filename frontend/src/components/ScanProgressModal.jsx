import React, { useState, useEffect } from 'react';
import { Shield, Globe, Cpu, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';

export default function ScanProgressModal({ isOpen, targetUrl, isMultiPage }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Security & SSRF Inspection', desc: 'Validating hostname, DNS records, and private IP blocks', icon: Shield },
    { title: 'Browser Engine Initialization', desc: 'Launching headless Chromium in isolated sandbox', icon: Globe },
    { title: 'Axe-Core WCAG Evaluation', desc: `Scanning DOM across WCAG 2.2 criteria ${isMultiPage ? '(multi-page crawl)' : '(single page)'}`, icon: Cpu },
    { title: 'Scoring Engine & Breakdown', desc: 'Synthesizing AccessAudit score and remediation guidance', icon: BarChart3 }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const timer1 = setTimeout(() => setCurrentStep(1), 800);
    const timer2 = setTimeout(() => setCurrentStep(2), 2200);
    const timer3 = setTimeout(() => setCurrentStep(3), 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-slate-200/80 w-full max-w-md overflow-hidden p-6 text-center">
        {/* Animated Scanner Radar */}
        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 mb-4 animate-scan-glow relative">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Auditing Accessibility...
        </h3>
        <p className="text-xs text-slate-500 font-mono mt-1 truncate max-w-sm mx-auto">
          {targetUrl}
        </p>

        {/* Progress Stages */}
        <div className="mt-6 space-y-3 text-left">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-50/60 border-indigo-200 shadow-sm'
                    : isDone
                    ? 'bg-slate-50 border-slate-200/60 opacity-80'
                    : 'border-transparent opacity-40'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-full ${
                  isDone
                    ? 'text-emerald-600 bg-emerald-100'
                    : isCurrent
                    ? 'text-indigo-600 bg-indigo-100 animate-pulse'
                    : 'text-slate-400 bg-slate-100'
                }`}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>

                <div className="flex-1">
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] text-slate-400">
          This usually takes 2–5 seconds depending on page weight.
        </p>
      </div>
    </div>
  );
}

