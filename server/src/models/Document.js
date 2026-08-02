import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true, enum: ['PDF', 'Audio', 'Table', 'Image', 'DOCX', 'TEXT'] },
  fileSize: { type: String, required: true },
  storagePath: { type: String, default: '' },
  uploadedBy: { type: String, default: 'Riya Sharma' },
  organizationId: { type: String, default: 'org_acme_001' },
  processingStatus: { 
    type: String, 
    enum: ['UPLOADING', 'PROCESSING', 'EXTRACTING', 'GRAPH_BUILDING', 'COMPLETED', 'FAILED'],
    default: 'COMPLETED'
  },
  extractedText: { type: String, default: '' },
  entitiesExtracted: { type: Number, default: 0 },
  relationshipsExtracted: { type: Number, default: 0 },
  sourceCategory: { type: String, default: 'Internal' }, // e.g. Internal, Meeting, IT Team, Third Party
  documentVersion: { type: Number, default: 1 },
  hasContradictions: { type: Boolean, default: false },
  riskLevel: { type: String, enum: ['High', 'Medium', 'Low', 'None'], default: 'None' },
  extractedEntities: [{
    name: String,
    type: String,
    confidence: Number,
    description: String
  }],
  extractedRelationships: [{
    source: String,
    relationship: String,
    target: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Document || mongoose.model('Document', documentSchema);

