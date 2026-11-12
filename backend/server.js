import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import Audit from './src/models/Audit.js';
import Issue from './src/models/Issue.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to general API routes
app.use('/api', apiLimiter);

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/audits', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AccessAudit Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if dist exists
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log(`[Static] Serving frontend from ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 404 handler for API
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Seed demo initial audit if collection is empty
async function seedInitialDemoData() {
  try {
    const count = await Audit.countDocuments();
    if (count === 0) {
      console.log('[Seed] Populating initial demo accessibility audits...');
      
      const demoUserId = 'demo-user-777';

      // Seed First Audit (Flawed version)
      const audit1 = await Audit.create({
        userId: demoUserId,
        websiteUrl: 'https://ecommerce-store-sample.com',
        pageTitle: 'Modern Apparel Online Store – Shop Summer Collection',
        score: 62,
        status: 'completed',
        totalIssues: 7,
        severityCounts: { critical: 2, serious: 3, moderate: 1, minor: 1 },
        pagesScanned: ['https://ecommerce-store-sample.com'],
        scanDurationMs: 2450,
        scanDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      });

      const demoIssues1 = [
        {
          auditId: audit1._id,
          ruleId: 'image-alt',
          severity: 'critical',
          description: 'Images must have alternate text',
          help: 'Ensures <img> elements have alternate text or a role of none or presentation',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/image-alt',
          selector: 'section.hero-carousel > div.slide > img.product-img',
          htmlSnippet: '<img src="/images/summer-sale.jpg" class="product-img">',
          wcagTags: ['WCAG 1.1.1', 'WCAG 2.0/2.1 Level A'],
          recommendation: 'Add alt="Summer Sale 50% Off Banner with beach apparel" to convey the promotional banner content.',
          impact: 'critical',
          failureSummary: 'Fix any of the following: Element does not have an alt attribute.',
          pageUrl: 'https://ecommerce-store-sample.com'
        },
        {
          auditId: audit1._id,
          ruleId: 'color-contrast',
          severity: 'serious',
          description: 'Elements must have sufficient color contrast',
          help: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
          selector: 'span.price-discount',
          htmlSnippet: '<span class="price-discount" style="color: #94a3b8; background-color: #f8fafc;">$49.99 (Save 20%)</span>',
          wcagTags: ['WCAG 1.4.3', 'WCAG 2.0/2.1 Level AA'],
          recommendation: 'Change text color to #0f172a or #1e293b to achieve at least 4.5:1 contrast against light background.',
          impact: 'serious',
          failureSummary: 'Element has insufficient color contrast of 2.62:1. Expected at least 4.5:1.',
          pageUrl: 'https://ecommerce-store-sample.com'
        },
        {
          auditId: audit1._id,
          ruleId: 'button-name',
          severity: 'critical',
          description: 'Buttons must have discernible text',
          help: 'Ensures buttons have discernible text',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
          selector: 'header button.cart-drawer-trigger',
          htmlSnippet: '<button class="cart-drawer-trigger"><svg class="cart-icon">...</svg><span class="badge">2</span></button>',
          wcagTags: ['WCAG 4.1.2', 'WCAG 2.0/2.1 Level A'],
          recommendation: 'Add aria-label="Shopping Cart with 2 items" to the button element.',
          impact: 'critical',
          failureSummary: 'Fix any of the following: Element does not have inner text visible to screen readers.',
          pageUrl: 'https://ecommerce-store-sample.com'
        },
        {
          auditId: audit1._id,
          ruleId: 'label',
          severity: 'serious',
          description: 'Form elements must have labels',
          help: 'Ensures every form element has a label',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label',
          selector: 'input#quick-search-input',
          htmlSnippet: '<input id="quick-search-input" type="search" placeholder="Search products...">',
          wcagTags: ['WCAG 1.3.1', 'WCAG 4.1.2', 'WCAG 2.0/2.1 Level A'],
          recommendation: 'Associate an explicit <label for="quick-search-input">Search catalog</label> or provide aria-label="Search catalog".',
          impact: 'serious',
          failureSummary: 'Form element does not have an implicit or explicit label.',
          pageUrl: 'https://ecommerce-store-sample.com'
        },
        {
          auditId: audit1._id,
          ruleId: 'link-name',
          severity: 'serious',
          description: 'Links must have discernible text',
          help: 'Ensures links have discernible text',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/link-name',
          selector: 'footer.site-footer a.instagram-link',
          htmlSnippet: '<a href="https://instagram.com" class="instagram-link"><i class="fab fa-instagram"></i></a>',
          wcagTags: ['WCAG 2.4.4', 'WCAG 2.0/2.1 Level A'],
          recommendation: 'Add aria-label="Visit our Instagram page" to clarify link destination.',
          impact: 'serious',
          failureSummary: 'Element has no discernible text content.',
          pageUrl: 'https://ecommerce-store-sample.com'
        },
        {
          auditId: audit1._id,
          ruleId: 'heading-order',
          severity: 'moderate',
          description: 'Heading levels should increase by one at a time',
          help: 'Ensures the order of headings is semantically correct',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/heading-order',
          selector: 'section.featured-products > h4.section-title',
          htmlSnippet: '<h4 class="section-title">Trending Styles</h4>',
          wcagTags: ['WCAG 1.3.1', 'BEST-PRACTICE'],
          recommendation: 'Change <h4> to <h2> so the heading sequentially follows the <h1> page title.',
          impact: 'moderate',
          failureSummary: 'Heading order skipped level from h1 to h4.',
          pageUrl: 'https://ecommerce-store-sample.com'
        },
        {
          auditId: audit1._id,
          ruleId: 'html-has-lang',
          severity: 'minor',
          description: '<html> element must have a lang attribute',
          help: 'Ensures every HTML document has a lang attribute',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/html-has-lang',
          selector: 'html',
          htmlSnippet: '<html>',
          wcagTags: ['WCAG 3.1.1', 'WCAG 2.0/2.1 Level A'],
          recommendation: 'Add lang="en" to the root <html> tag.',
          impact: 'minor',
          failureSummary: 'Missing lang attribute on html tag.',
          pageUrl: 'https://ecommerce-store-sample.com'
        }
      ];

      await Issue.insertMany(demoIssues1);

      // Seed Second Audit (Remediated version of same site for comparison!)
      const audit2 = await Audit.create({
        userId: demoUserId,
        websiteUrl: 'https://ecommerce-store-sample.com',
        pageTitle: 'Modern Apparel Online Store – Shop Summer Collection (Remediated)',
        score: 93,
        status: 'completed',
        totalIssues: 2,
        severityCounts: { critical: 0, serious: 1, moderate: 0, minor: 1 },
        pagesScanned: ['https://ecommerce-store-sample.com'],
        scanDurationMs: 1980,
        scanDate: new Date() // Today
      });

      const demoIssues2 = [
        {
          auditId: audit2._id,
          ruleId: 'color-contrast',
          severity: 'serious',
          description: 'Elements must have sufficient color contrast',
          help: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
          selector: 'span.price-discount',
          htmlSnippet: '<span class="price-discount" style="color: #64748b; background-color: #f8fafc;">$49.99</span>',
          wcagTags: ['WCAG 1.4.3', 'WCAG 2.0/2.1 Level AA'],
          recommendation: 'Contrast is 3.8:1, increase slightly to 4.5:1 using #334155.',
          impact: 'serious',
          failureSummary: 'Element has color contrast of 3.8:1. Expected 4.5:1.',
          pageUrl: 'https://ecommerce-store-sample.com'
        },
        {
          auditId: audit2._id,
          ruleId: 'heading-order',
          severity: 'minor',
          description: 'Heading levels should increase by one at a time',
          help: 'Ensures the order of headings is semantically correct',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/heading-order',
          selector: 'footer.site-footer > h4.newsletter-heading',
          htmlSnippet: '<h4 class="newsletter-heading">Stay Connected</h4>',
          wcagTags: ['WCAG 1.3.1', 'BEST-PRACTICE'],
          recommendation: 'Change <h4> to <h3> in footer.',
          impact: 'minor',
          failureSummary: 'Heading order skipped level in footer.',
          pageUrl: 'https://ecommerce-store-sample.com'
        }
      ];

      await Issue.insertMany(demoIssues2);

      // Seed Third Audit for SaaS Dashboard
      const audit3 = await Audit.create({
        userId: demoUserId,
        websiteUrl: 'https://cloudanalytics-platform.io',
        pageTitle: 'CloudAnalytics – Realtime Telemetry Dashboard',
        score: 84,
        status: 'completed',
        totalIssues: 4,
        severityCounts: { critical: 1, serious: 1, moderate: 1, minor: 1 },
        pagesScanned: ['https://cloudanalytics-platform.io', 'https://cloudanalytics-platform.io/pricing'],
        scanDurationMs: 3820,
        scanDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      });

      const demoIssues3 = [
        {
          auditId: audit3._id,
          ruleId: 'aria-valid-attr',
          severity: 'critical',
          description: 'ARIA attributes must conform to valid names',
          help: 'Ensures attributes that begin with aria- are valid ARIA attributes',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr',
          selector: 'div.notification-toast',
          htmlSnippet: '<div aria-labeledby="toast-msg" role="status" class="notification-toast">',
          wcagTags: ['WCAG 4.1.2', 'WCAG 2.0/2.1 Level A'],
          recommendation: 'Change aria-labeledby to valid WAI-ARIA attribute aria-labelledby.',
          impact: 'critical',
          failureSummary: 'Invalid ARIA attribute name: aria-labeledby.',
          pageUrl: 'https://cloudanalytics-platform.io'
        },
        {
          auditId: audit3._id,
          ruleId: 'document-title',
          severity: 'serious',
          description: 'Documents must have <title> element to aid in navigation',
          help: 'Ensures each HTML document contains a non-empty <title> element',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/document-title',
          selector: 'head',
          htmlSnippet: '<head><meta charset="utf-8"></head>',
          wcagTags: ['WCAG 2.4.2', 'WCAG 2.0/2.1 Level A'],
          recommendation: 'Add <title>CloudAnalytics Platform</title> inside the document head.',
          impact: 'serious',
          failureSummary: 'Document does not have a non-empty <title> element.',
          pageUrl: 'https://cloudanalytics-platform.io/pricing'
        }
      ];

      await Issue.insertMany(demoIssues3);
      console.log('[Seed] Seeded 3 demo audits with rich issues.');
    }
  } catch (err) {
    console.warn('[Seed Error]:', err.message);
  }
}

// Start Server
async function startServer() {
  await connectDB();
  await seedInitialDemoData();
  
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` AccessAudit Server running on http://localhost:${PORT}`);
    console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();
