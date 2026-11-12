import Audit from '../models/Audit.js';
import Issue from '../models/Issue.js';
import { runAccessibilityScan } from '../services/scannerService.js';
import { getAiRemediation } from '../services/aiService.js';
import { calculatePrincipleScores } from '../services/scoringService.js';

/**
 * Start a new accessibility audit
 */
export async function startScan(req, res) {
  try {
    const { url, multiPage, maxPages } = req.body;
    const userId = req.user._id;

    if (!url) {
      return res.status(400).json({ success: false, message: 'Please provide a website URL.' });
    }

    console.log(`[Scan Controller] Starting audit for ${url} by user ${userId}...`);

    // Run the scan with Playwright & Axe-core
    const scanResult = await runAccessibilityScan({
      url,
      multiPage: Boolean(multiPage),
      maxPages: Number(maxPages) || 3
    });

    // Save Audit document
    const audit = await Audit.create({
      userId,
      websiteUrl: scanResult.websiteUrl,
      pageTitle: scanResult.pageTitle || 'Untitled Page',
      score: scanResult.score,
      status: 'completed',
      totalIssues: scanResult.totalIssues,
      severityCounts: scanResult.severityCounts,
      pagesScanned: scanResult.pagesScanned,
      scanDurationMs: scanResult.scanDurationMs,
      scanDate: new Date()
    });

    // Attach auditId to issues and bulk insert
    const issuesWithAuditId = scanResult.issues.map(iss => ({
      ...iss,
      auditId: audit._id
    }));

    let savedIssues = [];
    if (issuesWithAuditId.length > 0) {
      savedIssues = await Issue.insertMany(issuesWithAuditId);
    }

    res.status(201).json({
      success: true,
      message: 'Website accessibility scan completed.',
      audit: {
        ...audit,
        grade: scanResult.grade,
        ratingLabel: scanResult.ratingLabel,
        principleScores: scanResult.principleScores,
        issues: savedIssues
      }
    });

  } catch (error) {
    console.error('[Scan Controller Error]:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'An error occurred during the accessibility scan.'
    });
  }
}

/**
 * Get user audit history
 */
export async function getAudits(req, res) {
  try {
    const userId = req.user._id;
    const { search, limit = 50 } = req.query;

    const audits = await Audit.find({ userId }).sort({ scanDate: -1 }).limit(Number(limit));

    let filtered = audits;
    if (search) {
      const q = search.toLowerCase();
      filtered = audits.filter(a => 
        (a.websiteUrl && a.websiteUrl.toLowerCase().includes(q)) ||
        (a.pageTitle && a.pageTitle.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      audits: filtered
    });
  } catch (error) {
    console.error('[Get Audits Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve audits.' });
  }
}

/**
 * Get a single audit report with issues
 */
export async function getAuditById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const audit = await Audit.findById(id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit report not found.' });
    }

    const issues = await Issue.find({ auditId: id });
    const principleScores = calculatePrincipleScores(issues);

    res.json({
      success: true,
      audit: {
        ...audit,
        issues,
        principleScores
      }
    });
  } catch (error) {
    console.error('[Get Audit Detail Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve audit report.' });
  }
}

/**
 * Delete an audit and associated issues
 */
export async function deleteAudit(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const audit = await Audit.findById(id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found.' });
    }

    await Audit.findByIdAndDelete(id);
    await Issue.deleteMany({ auditId: id });

    res.json({
      success: true,
      message: 'Audit report deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Audit Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to delete audit.' });
  }
}

/**
 * Compare two audits (Before vs After)
 */
export async function compareAudits(req, res) {
  try {
    const { audit1: id1, audit2: id2 } = req.query;

    if (!id1 || !id2) {
      return res.status(400).json({
        success: false,
        message: 'Both audit1 and audit2 query parameters are required for comparison.'
      });
    }

    const [audit1, audit2] = await Promise.all([
      Audit.findById(id1),
      Audit.findById(id2)
    ]);

    if (!audit1 || !audit2) {
      return res.status(404).json({ success: false, message: 'One or both audits were not found.' });
    }

    const [issues1, issues2] = await Promise.all([
      Issue.find({ auditId: id1 }),
      Issue.find({ auditId: id2 })
    ]);

    // Unique issue signature helper: ruleId + selector
    const getSig = (iss) => `${iss.ruleId}___${iss.selector}`;
    const sigSet1 = new Set(issues1.map(getSig));
    const sigSet2 = new Set(issues2.map(getSig));

    // Resolved: In audit1, but absent in audit2
    const resolvedIssues = issues1.filter(iss => !sigSet2.has(getSig(iss)));

    // Newly detected: In audit2, but absent in audit1
    const newIssues = issues2.filter(iss => !sigSet1.has(getSig(iss)));

    // Persistent: Present in both audits
    const persistentIssues = issues2.filter(iss => sigSet1.has(getSig(iss)));

    const scoreDiff = audit2.score - audit1.score;

    res.json({
      success: true,
      comparison: {
        audit1: {
          id: audit1._id,
          websiteUrl: audit1.websiteUrl,
          score: audit1.score,
          scanDate: audit1.scanDate,
          totalIssues: audit1.totalIssues,
          severityCounts: audit1.severityCounts
        },
        audit2: {
          id: audit2._id,
          websiteUrl: audit2.websiteUrl,
          score: audit2.score,
          scanDate: audit2.scanDate,
          totalIssues: audit2.totalIssues,
          severityCounts: audit2.severityCounts
        },
        scoreDiff,
        isImprovement: scoreDiff > 0,
        resolvedCount: resolvedIssues.length,
        newCount: newIssues.length,
        persistentCount: persistentIssues.length,
        resolvedIssues,
        newIssues,
        persistentIssues
      }
    });

  } catch (error) {
    console.error('[Compare Audits Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to compare audits.' });
  }
}

/**
 * Get AI recommendation for an issue
 */
export async function getIssueAiAdvice(req, res) {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    const advice = await getAiRemediation(issue);

    res.json({
      success: true,
      advice
    });
  } catch (error) {
    console.error('[AI Advice Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI advice.' });
  }
}

/**
 * Dashboard stats overview
 */
export async function getDashboardStats(req, res) {
  try {
    const userId = req.user._id;
    const audits = await Audit.find({ userId }).sort({ scanDate: -1 });

    const totalScans = audits.length;
    let avgScore = 0;
    let totalIssues = 0;
    let criticalIssues = 0;
    let seriousIssues = 0;
    let moderateIssues = 0;
    let minorIssues = 0;

    if (totalScans > 0) {
      const sumScore = audits.reduce((acc, a) => acc + (a.score || 0), 0);
      avgScore = Math.round(sumScore / totalScans);

      audits.forEach(a => {
        totalIssues += (a.totalIssues || 0);
        if (a.severityCounts) {
          criticalIssues += (a.severityCounts.critical || 0);
          seriousIssues += (a.severityCounts.serious || 0);
          moderateIssues += (a.severityCounts.moderate || 0);
          minorIssues += (a.severityCounts.minor || 0);
        }
      });
    }

    // Score trend (oldest to newest, max 10)
    const trendAudits = [...audits].reverse().slice(-10);
    const scoreTrend = trendAudits.map((a, idx) => ({
      name: a.pageTitle ? a.pageTitle.slice(0, 15) : `Scan #${idx + 1}`,
      url: a.websiteUrl,
      score: a.score,
      date: new Date(a.scanDate).toLocaleDateString()
    }));

    // Severity breakdown chart data
    const severityData = [
      { name: 'Critical', count: criticalIssues, color: '#ef4444' },
      { name: 'Serious', count: seriousIssues, color: '#f97316' },
      { name: 'Moderate', count: moderateIssues, color: '#f59e0b' },
      { name: 'Minor', count: minorIssues, color: '#3b82f6' }
    ];

    res.json({
      success: true,
      stats: {
        totalScans,
        avgScore,
        totalIssues,
        criticalIssues,
        seriousIssues,
        moderateIssues,
        minorIssues,
        scoreTrend,
        severityData,
        recentAudits: audits.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('[Dashboard Stats Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard statistics.' });
  }
}

