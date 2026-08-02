import mongoose from 'mongoose';

const complianceReportSchema = new mongoose.Schema({
  reportTitle: { type: String, default: 'Enterprise Compliance Audit Report' },
  generatedBy: { type: String, default: 'Riya Sharma' },
  organization: { type: String, default: 'Acme Enterprise' },
  executiveSummary: { type: String, required: true },
  complianceScore: { type: Number, required: true },
  scoreBreakdown: {
    verifiedRequirements: Number,
    needsReviewCount: Number,
    highRiskCount: Number,
    insufficientEvidenceCount: Number,
    contradictionCount: Number
  },
  systemsCount: { type: Number, default: 0 },
  regulationsCount: { type: Number, default: 0 },
  policiesCount: { type: Number, default: 0 },
  risks: [{
    title: String,
    system: String,
    severity: String,
    recommendation: String
  }],
  contradictions: [{
    entityName: String,
    source1: String,
    source2: String
  }],
  recommendations: [{ type: String }],
  auditActivityCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ComplianceReport || mongoose.model('ComplianceReport', complianceReportSchema);
