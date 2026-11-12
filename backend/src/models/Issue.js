import mongoose from 'mongoose';
import { getIsMongoConnected } from '../config/db.js';
import { JsonCollection } from './storeFallback.js';

const IssueSchema = new mongoose.Schema({
  auditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  ruleId: { type: String, required: true },
  severity: { type: String, enum: ['critical', 'serious', 'moderate', 'minor'], required: true },
  description: { type: String, required: true },
  help: { type: String },
  helpUrl: { type: String },
  selector: { type: String, default: '' },
  htmlSnippet: { type: String, default: '' },
  wcagTags: [{ type: String }],
  recommendation: { type: String, default: '' },
  impact: { type: String, default: 'moderate' },
  failureSummary: { type: String, default: '' },
  pageUrl: { type: String, default: '' }
}, {
  timestamps: true
});

const MongoIssue = mongoose.models.Issue || mongoose.model('Issue', IssueSchema);
const FallbackIssue = new JsonCollection('issues');

const Issue = {
  create: async (data) => (getIsMongoConnected() ? MongoIssue.create(data) : FallbackIssue.create(data)),
  insertMany: async (data) => (getIsMongoConnected() ? MongoIssue.insertMany(data) : FallbackIssue.insertMany(data)),
  findOne: (query) => (getIsMongoConnected() ? MongoIssue.findOne(query) : FallbackIssue.findOne(query)),
  findById: (id) => (getIsMongoConnected() ? MongoIssue.findById(id) : FallbackIssue.findById(id)),
  find: (query) => (getIsMongoConnected() ? MongoIssue.find(query) : FallbackIssue.find(query)),
  deleteMany: (query) => (getIsMongoConnected() ? MongoIssue.deleteMany(query) : FallbackIssue.deleteMany(query)),
  countDocuments: (query) => (getIsMongoConnected() ? MongoIssue.countDocuments(query) : FallbackIssue.countDocuments(query))
};

export default Issue;

