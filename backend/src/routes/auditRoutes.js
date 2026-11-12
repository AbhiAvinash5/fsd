import express from 'express';
import {
  startScan,
  getAudits,
  getAuditById,
  deleteAudit,
  compareAudits,
  getIssueAiAdvice,
  getDashboardStats
} from '../controllers/auditController.js';
import { requireAuth } from '../middleware/auth.js';
import { scanLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(requireAuth);

router.post('/scan', scanLimiter, startScan);
router.get('/stats/overview', getDashboardStats);
router.get('/compare', compareAudits);
router.get('/', getAudits);
router.get('/:id', getAuditById);
router.delete('/:id', deleteAudit);
router.post('/issues/:issueId/ai-advice', getIssueAiAdvice);

export default router;

