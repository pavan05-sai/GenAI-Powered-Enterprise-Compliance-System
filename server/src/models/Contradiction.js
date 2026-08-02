import mongoose from 'mongoose';

const contradictionSchema = new mongoose.Schema({
  entityName: { type: String, required: true },
  source1: {
    documentId: String,
    documentName: { type: String, required: true },
    page: { type: String, default: 'Page 1' },
    claim: { type: String, required: true },
    snippet: String
  },
  source2: {
    documentId: String,
    documentName: { type: String, required: true },
    page: { type: String, default: 'Page 1' },
    claim: { type: String, required: true },
    snippet: String
  },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
  status: { type: String, enum: ['UNRESOLVED', 'RESOLVED', 'IN_REVIEW'], default: 'UNRESOLVED' },
  recommendation: { type: String, default: 'Manual verification recommended between contradictory source documents.' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Contradiction || mongoose.model('Contradiction', contradictionSchema);
