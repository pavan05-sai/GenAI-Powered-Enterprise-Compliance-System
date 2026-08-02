import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema({
  documentId: { type: String, required: true },
  documentName: { type: String, required: true },
  versionNumber: { type: Number, default: 1 },
  previousVersionId: { type: String, default: null },
  changeSummary: { type: String, required: true },
  changedEntities: [{
    entityName: String,
    changeType: { type: String, enum: ['ADDED', 'REMOVED', 'MODIFIED'] },
    oldValue: String,
    newValue: String
  }],
  changedRelationships: [{
    source: String,
    relationship: String,
    target: String,
    changeType: { type: String, enum: ['ADDED', 'REMOVED', 'MODIFIED'] }
  }],
  impactLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  affectedSystemsCount: { type: Number, default: 0 },
  affectedControlsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.DocumentVersion || mongoose.model('DocumentVersion', documentVersionSchema);
