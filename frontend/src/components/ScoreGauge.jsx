import React from 'react';

export default function ScoreGauge({ score = 0, size = 180, showGrade = true }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let color = '#ef4444'; // Red
  let grade = 'F';
  let label = 'Critical Issues';
  let bgFill = 'text-red-500';

  if (safeScore >= 95) {
    color = '#10b981'; // Emerald
    grade = 'A+';
    label = 'Exceptional';
    bgFill = 'text-emerald-500';
  } else if (safeScore >= 85) {
    color = '#22c55e'; // Green
    grade = 'A';
    label = 'Good Accessibility';
    bgFill = 'text-green-500';
  } else if (safeScore >= 70) {
    color = '#6366f1'; // Indigo
    grade = 'B';
    label = 'Moderate';
    bgFill = 'text-indigo-500';
  } else if (safeScore >= 50) {
    color = '#f59e0b'; // Amber
    grade = 'C';
    label = 'Needs Work';
    bgFill = 'text-amber-500';
  } else if (safeScore >= 30) {
    color = '#f97316'; // Orange
    grade = 'D';
    label = 'Poor';
    bgFill = 'text-orange-500';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900">
            {safeScore}
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            / 100
          </span>
          {showGrade && (
            <span
              className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                safeScore >= 85
                  ? 'bg-emerald-100 text-emerald-800'
                  : safeScore >= 70
                  ? 'bg-indigo-100 text-indigo-800'
                  : safeScore >= 50
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              Grade {grade}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-[11px] text-slate-400 max-w-[200px] leading-tight mt-0.5">
          AccessAudit Heuristic Score (Not an official WCAG rating)
        </p>
      </div>
    </div>
  );
}

