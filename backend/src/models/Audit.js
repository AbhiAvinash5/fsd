import mongoose from 'mongoose';
import { getIsMongoConnected } from '../config/db.js';
import { JsonCollection } from './storeFallback.js';

const AuditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  websiteUrl: { type: String, required: true },
  pageTitle: { type: String, default: '' },
  score: { type: Number, required: true, min: 0, max: 100 },
  scanDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'scanning', 'completed', 'failed'], default: 'completed' },
  totalIssues: { type: Number, default: 0 },
  severityCounts: {
    critical: { type: Number, default: 0 },
    serious: { type: Number, default: 0 },
    moderate: { type: Number, default: 0 },
    minor: { type: Number, default: 0 }
  },
  pagesScanned: [{ type: String }],
  scanDurationMs: { type: Number, default: 0 },
  errorMessage: { type: String }
}, {
  timestamps: true
});

const MongoAudit = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
const FallbackAudit = new JsonCollection('audits');

const Audit = {
  create: async (data) => (getIsMongoConnected() ? MongoAudit.create(data) : FallbackAudit.create(data)),
  findOne: (query) => (getIsMongoConnected() ? MongoAudit.findOne(query) : FallbackAudit.findOne(query)),
  findById: (id) => (getIsMongoConnected() ? MongoAudit.findById(id) : FallbackAudit.findById(id)),
  find: (query) => (getIsMongoConnected() ? MongoAudit.find(query) : FallbackAudit.find(query)),
  findByIdAndDelete: (id) => (getIsMongoConnected() ? MongoAudit.findByIdAndDelete(id) : FallbackAudit.findByIdAndDelete(id)),
  deleteMany: (query) => (getIsMongoConnected() ? MongoAudit.deleteMany(query) : FallbackAudit.deleteMany(query)),
  countDocuments: (query) => (getIsMongoConnected() ? MongoAudit.countDocuments(query) : FallbackAudit.countDocuments(query)),
  updateOne: (query, update) => (getIsMongoConnected() ? MongoAudit.updateOne(query, update) : FallbackAudit.updateOne(query, update))
};

export default Audit;

