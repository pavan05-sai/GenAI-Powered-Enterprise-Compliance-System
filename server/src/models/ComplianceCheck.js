import mongoose from 'mongoose';

const complianceCheckSchema = new mongoose.Schema({
  category: { type: String, required: true }, // Data Security, Access Control, Data Retention, Third-Party Compliance
  title: { type: String, required: true },
  system: { type: String, required: true },
  requirement: { type: String, required: true },
  evidenceSnippet: { type: String, default: '' },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['COMPLIANT', 'NEEDS_REVIEW', 'POTENTIAL_VIOLATION', 'INSUFFICIENT_EVIDENCE'], default: 'NEEDS_REVIEW' },
  framework: { type: String, default: 'GDPR' },
  reason: { type: String, default: 'Identified during knowledge graph compliance traversal.' },
  recommendation: { type: String, default: 'Review system configuration and supporting documentation.' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ComplianceCheck || mongoose.model('ComplianceCheck', complianceCheckSchema);

