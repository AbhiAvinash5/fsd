/**
 * AccessAudit Weighted Scoring Engine
 * 
 * Evaluates accessibility violations detected across pages and produces an
 * AccessAudit Accessibility Score out of 100.
 * 
 * DISCLAIMER: This score is a heuristic estimation generated automatically
 * and does not represent an official certification or legal compliance rating
 * from the W3C or WCAG committee.
 */

export function calculateScore(severityCounts, totalPages = 1) {
  const { critical = 0, serious = 0, moderate = 0, minor = 0 } = severityCounts;

  const pages = Math.max(1, totalPages);

  // Per-page normalized issue density
  const critAvg = critical / pages;
  const seriAvg = serious / pages;
  const modAvg = moderate / pages;
  const minAvg = minor / pages;

  // Weighted penalties with non-linear diminishing returns so massive page templates
  // don't drop to 0 from 10 repeated footer link issues
  const critPenalty = Math.min(45, critAvg * 12);
  const seriousPenalty = Math.min(30, seriAvg * 6);
  const moderatePenalty = Math.min(20, modAvg * 2.5);
  const minorPenalty = Math.min(10, minAvg * 0.8);

  const totalDeduction = critPenalty + seriousPenalty + moderatePenalty + minorPenalty;

  const rawScore = 100 - totalDeduction;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade = 'F';
  let ratingLabel = 'Non-Compliant';
  let badgeColor = 'red';

  if (score >= 95) {
    grade = 'A+';
    ratingLabel = 'Excellent Accessibility';
    badgeColor = 'emerald';
  } else if (score >= 85) {
    grade = 'A';
    ratingLabel = 'Good Accessibility';
    badgeColor = 'green';
  } else if (score >= 70) {
    grade = 'B';
    ratingLabel = 'Moderate Accessibility';
    badgeColor = 'indigo';
  } else if (score >= 50) {
    grade = 'C';
    ratingLabel = 'Needs Improvement';
    badgeColor = 'amber';
  } else if (score >= 30) {
    grade = 'D';
    ratingLabel = 'Poor Accessibility';
    badgeColor = 'orange';
  } else {
    grade = 'F';
    ratingLabel = 'Critical Barriers Detected';
    badgeColor = 'red';
  }

  return {
    score,
    grade,
    ratingLabel,
    badgeColor,
    disclaimer: 'AccessAudit Score is an automated heuristic estimation and not an official WCAG certification.',
    deductions: {
      critical: Math.round(critPenalty),
      serious: Math.round(seriousPenalty),
      moderate: Math.round(moderatePenalty),
      minor: Math.round(minorPenalty)
    }
  };
}

/**
 * Categorize issues into WCAG Principles (Perceivable, Operable, Understandable, Robust)
 * @param {Array} issues
 */
export function calculatePrincipleScores(issues) {
  const principles = {
    perceivable: { name: 'Perceivable', total: 0, critical: 0, weight: 30 },
    operable: { name: 'Operable', total: 0, critical: 0, weight: 30 },
    understandable: { name: 'Understandable', total: 0, critical: 0, weight: 20 },
    robust: { name: 'Robust', total: 0, critical: 0, weight: 20 }
  };

  issues.forEach(issue => {
    const tags = issue.wcagTags || [];
    let matched = false;

    // Check tags or rule names
    const rule = (issue.ruleId || '').toLowerCase();
    const isContrast = rule.includes('color') || rule.includes('contrast') || rule.includes('image') || rule.includes('alt');
    const isOperable = rule.includes('keyboard') || rule.includes('focus') || rule.includes('button') || rule.includes('link') || rule.includes('tabindex');
    const isUnderstandable = rule.includes('lang') || rule.includes('label') || rule.includes('form') || rule.includes('title') || rule.includes('heading');
    const isRobust = rule.includes('aria') || rule.includes('role') || rule.includes('valid') || rule.includes('duplicate');

    if (tags.some(t => t.includes('wcag1') || t.includes('111') || t.includes('143')) || isContrast) {
      principles.perceivable.total++;
      if (issue.severity === 'critical') principles.perceivable.critical++;
      matched = true;
    }
    if (tags.some(t => t.includes('wcag2') || t.includes('211') || t.includes('247')) || isOperable) {
      principles.operable.total++;
      if (issue.severity === 'critical') principles.operable.critical++;
      matched = true;
    }
    if (tags.some(t => t.includes('wcag3') || t.includes('311') || t.includes('332')) || isUnderstandable) {
      principles.understandable.total++;
      if (issue.severity === 'critical') principles.understandable.critical++;
      matched = true;
    }
    if (tags.some(t => t.includes('wcag4') || t.includes('412')) || isRobust || !matched) {
      principles.robust.total++;
      if (issue.severity === 'critical') principles.robust.critical++;
    }
  });

  return {
    perceivable: Math.max(10, Math.min(100, 100 - principles.perceivable.total * 6)),
    operable: Math.max(10, Math.min(100, 100 - principles.operable.total * 6)),
    understandable: Math.max(10, Math.min(100, 100 - principles.understandable.total * 6)),
    robust: Math.max(10, Math.min(100, 100 - principles.robust.total * 6))
  };
}

