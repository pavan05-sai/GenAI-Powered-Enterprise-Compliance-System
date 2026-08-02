import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Acme Enterprise' },
  industry: { type: String, default: 'Financial Technology & Services' },
  complianceFrameworks: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
