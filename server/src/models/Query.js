import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  userId: { type: String, default: 'usr_001' },
  organizationId: { type: String, default: 'org_acme_001' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  systemsProcessed: [{ type: String }],
  applicablePolicies: [{ type: String }],
  evidence: [{
    documentId: String,
    documentName: String,
    page: String,
    snippet: String
  }],
  graphPath: [{
    source: String,
    target: String,
    relationship: String
  }],
  keyInsights: [{ type: String }],
  confidence: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
  status: { type: String, enum: ['VERIFIED', 'POTENTIAL_RISK', 'INSUFFICIENT_EVIDENCE'], default: 'VERIFIED' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Query || mongoose.model('Query', querySchema);
