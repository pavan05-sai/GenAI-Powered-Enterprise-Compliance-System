import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['RISK_DETECTED', 'CONTRADICTION_DETECTED', 'POLICY_CHANGED', 'SCORE_CHANGED', 'DOC_PROCESSED', 'EVIDENCE_MISSING'],
    default: 'RISK_DETECTED'
  },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: '/dashboard' },
  affectedCount: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
