import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an executive PDF report for an AccessAudit scan
 * @param {object} audit
 */
export function generateAuditPdf(audit) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Header Brand Banner
  doc.setFillColor(15, 23, 42); // Navy #0f172a
  doc.rect(0, 0, pageWidth, 80, 'F');

  // Accent Line
  doc.setFillColor(99, 102, 241); // Indigo #6366f1
  doc.rect(0, 80, pageWidth, 4, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AccessAudit', margin, 42);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Automated Website Accessibility & WCAG 2.2 Audit Report', margin, 62);

  const reportDate = new Date(audit.scanDate || Date.now()).toLocaleString();
  doc.setFontSize(9);
  doc.text(`Generated: ${reportDate}`, pageWidth - margin, 62, { align: 'right' });

  let y = 110;

  // Metadata Card
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 85, 6, 6, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Target Website:', margin + 15, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(audit.websiteUrl || 'N/A', margin + 105, y + 22);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Page Title:', margin + 15, y + 42);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const truncatedTitle = (audit.pageTitle || 'Untitled').length > 55 ? audit.pageTitle.slice(0, 52) + '...' : audit.pageTitle;
  doc.text(truncatedTitle, margin + 85, y + 42);

  doc.setFont('helvetica', 'bold');
  doc.text('Pages Audited:', margin + 15, y + 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`${(audit.pagesScanned || [audit.websiteUrl]).length} page(s)`, margin + 100, y + 62);

  // Score Badge in Card
  const score = audit.score || 0;
  let scoreColor = [239, 68, 68]; // Red
  if (score >= 85) scoreColor = [16, 185, 129]; // Emerald
  else if (score >= 70) scoreColor = [79, 70, 229]; // Indigo
  else if (score >= 50) scoreColor = [245, 158, 11]; // Amber

  doc.setFillColor(...scoreColor);
  doc.roundedRect(pageWidth - margin - 120, y + 12, 105, 60, 6, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}`, pageWidth - margin - 68, y + 44, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('ACCESSAUDIT SCORE', pageWidth - margin - 68, y + 60, { align: 'center' });

  y += 105;

  // Disclaimer Box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 26, 4, 4, 'FD');
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'LEGAL NOTICE: This AccessAudit score is an automated heuristic estimation and not an official WCAG rating or W3C certification.',
    margin + 12,
    y + 17
  );

  y += 40;

  // Severity Breakdown Table
  const counts = audit.severityCounts || { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const total = audit.totalIssues || 0;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Issue Severity Summary', margin, y);

  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Severity Level', 'Violations Detected', 'Impact on Assistive Users', 'Priority Action']],
    body: [
      ['Critical', `${counts.critical || 0}`, 'Completely blocks keyboard / screen reader interaction', 'Immediate fix required'],
      ['Serious', `${counts.serious || 0}`, 'Significantly degrades navigation and comprehension', 'High priority'],
      ['Moderate', `${counts.moderate || 0}`, 'Impairs usability or causes confusion', 'Medium priority'],
      ['Minor', `${counts.minor || 0}`, 'Minor inconvenience or aesthetic discrepancy', 'Low priority / Polish'],
      ['Total Violations', `${total}`, 'Combined accessibility violations', 'Continuous monitoring']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  y = doc.lastAutoTable.finalY + 30;

  // Issues Breakdown Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Violations & Recommended Fixes', margin, y);

  const issues = audit.issues || [];

  if (issues.length === 0) {
    y += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text('No accessibility violations were detected for this web page.', margin, y);
  } else {
    const tableRows = issues.map((iss, index) => {
      const wcag = (iss.wcagTags && iss.wcagTags.length > 0) ? iss.wcagTags.join(', ') : 'WCAG 2.2';
      const selector = iss.selector ? iss.selector.slice(0, 45) : 'N/A';
      const recommendation = iss.recommendation || 'Remediate element to conform to WCAG guidelines.';
      
      return [
        `#${index + 1} [${(iss.severity || 'moderate').toUpperCase()}]`,
        `${iss.ruleId}\n(${wcag})`,
        `${iss.description}\nSelector: ${selector}`,
        recommendation
      ];
    });

    autoTable(doc, {
      startY: y + 10,
      margin: { left: margin, right: margin },
      head: [['# & Severity', 'Rule & WCAG', 'Description & Element', 'Recommended Fix']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229], // Indigo 600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [15, 23, 42],
        valign: 'top',
        cellPadding: 6
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { cellWidth: 95 },
        2: { cellWidth: 160 },
        3: { cellWidth: 190 }
      }
    });
  }

  // Footer for each page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
    doc.text('AccessAudit SaaS – Automated Accessibility Testing Platform', margin, pageHeight - 18);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  }

  // Generate filename and save
  const domain = (audit.websiteUrl ? new URL(audit.websiteUrl).hostname : 'website').replace(/[^a-z0-9]/gi, '-');
  doc.save(`AccessAudit-Report-${domain}-${Date.now()}.pdf`);
}

