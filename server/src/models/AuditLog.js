import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'usr_001' },
  userName: { type: String, default: 'Riya Sharma' },
  userRole: { type: String, default: 'Compliance Officer' },
  organizationId: { type: String, default: 'org_acme_001' },
  action: { type: String, required: true }, // e.g. "Ask Question", "Generate Answer", "View Document", "Upload Document", "Entities Extracted"
  entityType: { type: String, default: 'Document' },
  entityId: { type: String, default: '' },
  details: { type: String, default: '' },
  documentsUsed: { type: Number, default: 0 },
  agent: { type: String, default: 'Graph RAG Agent' },
  status: { type: String, default: 'Success' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
