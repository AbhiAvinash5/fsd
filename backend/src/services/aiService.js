/**
 * AI & Rule-based Accessibility Remediation Service
 * Provides actionable HTML corrections and WCAG 2.2 explanations.
 */

export const RULE_FIX_KNOWLEDGE_BASE = {
  'image-alt': {
    title: 'Missing or Non-Descriptive Image Alternative Text',
    wcag: 'WCAG 2.2 - 1.1.1 Non-text Content (Level A)',
    explanation: 'All non-decorative <img> elements must have an `alt` attribute describing their purpose or content to screen readers. If the image is purely decorative, specify `alt=""` or `aria-hidden="true"`.',
    generateFix: (snippet) => {
      if (!snippet) return '<img src="..." alt="Descriptive text of the image content" />';
      if (snippet.includes('alt=')) {
        return snippet.replace(/alt=(['"])[^'"]*\1/, 'alt="Descriptive summary of the image"');
      }
      return snippet.replace(/<img\b([^>]*)>/i, '<img$1 alt="Meaningful description of the image" />');
    }
  },
  'color-contrast': {
    title: 'Insufficient Color Contrast Ratio',
    wcag: 'WCAG 2.2 - 1.4.3 Contrast (Minimum) (Level AA)',
    explanation: 'Visual presentation of text and images of text must have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold).',
    generateFix: (snippet) => {
      return `/* Ensure foreground and background meet at least 4.5:1 ratio */\n/* Before: text-slate-400 on white (approx 2.4:1 - FAILS) */\n/* After:  text-slate-800 on white (approx 8.6:1 - PASSES) */\ncolor: #1e293b; /* Dark Slate Navy */\nbackground-color: #ffffff;`;
    }
  },
  'label': {
    title: 'Form Element Missing Associated Label',
    wcag: 'WCAG 2.2 - 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value (Level A)',
    explanation: 'Interactive form inputs (<input>, <textarea>, <select>) must have an associated programmatic label using a <label for="id">, aria-label, or aria-labelledby.',
    generateFix: (snippet) => {
      return `<!-- Option 1: Explicit <label> with matching 'for' and 'id' -->\n<label for="user-field" class="block text-sm font-medium text-slate-700">Field Label</label>\n<input id="user-field" name="user-field" type="text" class="..." />\n\n<!-- Option 2: aria-label attribute for standalone inputs -->\n<input aria-label="Search items" type="search" placeholder="Search..." />`;
    }
  },
  'button-name': {
    title: 'Button Without Accessible Text Name',
    wcag: 'WCAG 2.2 - 4.1.2 Name, Role, Value (Level A)',
    explanation: 'Buttons must have discernible text so assistive technologies can announce their action. Icon buttons must include an `aria-label` or visually hidden text.',
    generateFix: (snippet) => {
      if (snippet && snippet.includes('<button') && snippet.includes('</button>')) {
        return snippet.replace('<button', '<button aria-label="Close dialog"');
      }
      return `<!-- Accessible icon button with aria-label -->\n<button type="button" aria-label="Submit search query" class="btn">\n  <svg ...></svg>\n</button>`;
    }
  },
  'link-name': {
    title: 'Link Missing Discernible Text Name',
    wcag: 'WCAG 2.2 - 2.4.4 Link Purpose (In Context) (Level A)',
    explanation: 'Hyperlinks (<a href="...">) must contain meaningful text that clarifies their destination or purpose, avoiding blank links or vague labels like "click here".',
    generateFix: (snippet) => {
      return `<!-- Replace empty or generic links with descriptive destination labels -->\n<a href="/pricing" aria-label="View pricing plans and tiers">\n  View Pricing Plans\n</a>`;
    }
  },
  'html-has-lang': {
    title: 'Document Root Missing Language Identifier',
    wcag: 'WCAG 2.2 - 3.1.1 Language of Page (Level A)',
    explanation: 'The <html> element must have a valid `lang` attribute (e.g. `lang="en"`) so screen readers pronounce content with the correct accent and dialect.',
    generateFix: (snippet) => {
      return `<!DOCTYPE html>\n<html lang="en">\n  <head>...`;
    }
  },
  'heading-order': {
    title: 'Heading Hierarchy Levels Skipped or Out of Order',
    wcag: 'WCAG 2.2 - 1.3.1 Info and Relationships (Level A / Best Practice)',
    explanation: 'Headings provide structure for screen reader navigation and should follow an unbroken hierarchical progression (e.g., <h1> followed by <h2>, not skipping to <h4>).',
    generateFix: (snippet) => {
      return `<!-- Correct sequential heading structure -->\n<h1>Main Page Title</h1>\n  <h2>Section Heading</h2>\n    <h3>Subsection Heading</h3>\n  <h2>Second Section Heading</h2>`;
    }
  },
  'document-title': {
    title: 'Missing or Empty Page Title Element',
    wcag: 'WCAG 2.2 - 2.4.2 Page Titled (Level A)',
    explanation: 'Every HTML document must contain a non-empty <title> inside <head> explaining the page purpose and distinguishing it from other pages in browser tabs and bookmarks.',
    generateFix: (snippet) => {
      return `<head>\n  <title>Dashboard Overview – AccessAudit</title>\n</head>`;
    }
  },
  'aria-valid-attr': {
    title: 'Invalid or Misspelled ARIA Attribute',
    wcag: 'WCAG 2.2 - 4.1.2 Name, Role, Value (Level A)',
    explanation: 'ARIA attributes must conform to the WAI-ARIA 1.2 specification. Unknown, misspelled, or obsolete attributes are ignored by browsers.',
    generateFix: (snippet) => {
      return `<!-- Correct ARIA spelling and usage -->\n<div role="status" aria-live="polite">\n  Status updated\n</div>`;
    }
  },
  'aria-roles': {
    title: 'Invalid or Unsupported ARIA Role',
    wcag: 'WCAG 2.2 - 4.1.2 Name, Role, Value (Level A)',
    explanation: 'The role attribute must contain a valid W3C WAI-ARIA role appropriate for the element semantics.',
    generateFix: (snippet) => {
      return `<!-- Use valid roles e.g., role="dialog", "alert", "navigation", "main" -->\n<nav role="navigation" aria-label="Main Navigation">`;
    }
  }
};

/**
 * Returns rule-based recommendation
 */
export function getRuleBasedRecommendation(ruleId, htmlSnippet = '', failureSummary = '') {
  const ruleKnowledge = RULE_FIX_KNOWLEDGE_BASE[ruleId];
  if (ruleKnowledge) {
    return {
      ruleId,
      title: ruleKnowledge.title,
      wcag: ruleKnowledge.wcag,
      explanation: ruleKnowledge.explanation,
      suggestedFixHtml: ruleKnowledge.generateFix(htmlSnippet),
      source: 'rule-engine'
    };
  }

  // Generic fallback for any other axe-core rule
  return {
    ruleId,
    title: `Remediate ${ruleId} Violation`,
    wcag: 'WCAG 2.2 Guidelines',
    explanation: failureSummary || 'Ensure the element conforms to WCAG accessibility criteria by providing accessible name, correct semantic tags, and valid ARIA roles.',
    suggestedFixHtml: `<!-- Inspect and update element to satisfy rule ${ruleId} -->\n${htmlSnippet || '<div>...</div>'}`,
    source: 'rule-engine'
  };
}

/**
 * Generates AI-assisted remediation using Gemini API (if GEMINI_API_KEY is configured)
 * or falls back to rule-based engine.
 */
export async function getAiRemediation(issue) {
  const apiKey = process.env.GEMINI_API_KEY;
  const ruleAdvice = getRuleBasedRecommendation(issue.ruleId, issue.htmlSnippet, issue.failureSummary);

  if (!apiKey) {
    return {
      ...ruleAdvice,
      source: 'rule-engine',
      notes: 'Built-in expert rule engine used. (To enable live Gemini AI remediation, configure GEMINI_API_KEY in backend/.env).'
    };
  }

  try {
    const prompt = `You are an expert web accessibility engineer specializing in WCAG 2.2.
Analyze this accessibility issue and provide:
1. A concise explanation of why it harms users with disabilities (2-3 sentences).
2. The exact corrected HTML code snippet.
3. WCAG criterion reference.

Issue Details:
Rule: ${issue.ruleId}
Severity: ${issue.severity}
Description: ${issue.description}
HTML Snippet: ${issue.htmlSnippet}
Selector: ${issue.selector}
Failure Summary: ${issue.failureSummary}

Reply in JSON format:
{
  "explanation": "...",
  "suggestedFixHtml": "...",
  "wcag": "...",
  "keyTakeaways": ["point 1", "point 2"]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      return {
        ruleId: issue.ruleId,
        title: issue.description,
        wcag: parsed.wcag || ruleAdvice.wcag,
        explanation: parsed.explanation || ruleAdvice.explanation,
        suggestedFixHtml: parsed.suggestedFixHtml || ruleAdvice.suggestedFixHtml,
        keyTakeaways: parsed.keyTakeaways || [],
        source: 'gemini-ai'
      };
    }
  } catch (err) {
    console.warn(`[AI Service] AI request failed (${err.message}). Falling back to rule engine.`);
  }

  return {
    ...ruleAdvice,
    source: 'rule-engine-fallback'
  };
}

