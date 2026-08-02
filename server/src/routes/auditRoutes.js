import express from 'express';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// GET /api/audit — with action/user/date-range/search/pagination filtering
router.get('/', async (req, res) => {
  try {
    const { action, user, dateFrom, dateTo, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    if (action && action !== 'All Actions') {
      query.action = { $regex: action, $options: 'i' };
    }

    if (user && user !== 'All Users') {
      query.userName = user;
    }

    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    if (search) {
      const searchFilter = { $regex: search, $options: 'i' };
      const orClauses = [
        { details: searchFilter },
        { action: searchFilter },
        { userName: searchFilter }
      ];
      if (Object.keys(query).length > 0) {
        query = { $and: [query, { $or: orClauses }] };
      } else {
        query.$or = orClauses;
      }
    }

    let logs = [];
    let total = 0;

    if (AuditLog.db && AuditLog.db.readyState === 1) {
      [logs, total] = await Promise.all([
        AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
        AuditLog.countDocuments(query)
      ]);
    }

    // Fallback sample data when no filters and DB empty
    if (logs.length === 0 && !search && (!action || action === 'All Actions') && (!user || user === 'All Users') && !dateFrom && !dateTo) {
      const allSamples = [
        { _id: 'a1', timestamp: new Date('2024-05-25T10:45:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Ask Question', details: 'Which systems process PII?', documentsUsed: 5, agent: 'Graph RAG Agent', status: 'Success' },
        { _id: 'a2', timestamp: new Date('2024-05-25T10:43:00'), userName: 'AI System', userRole: 'System', action: 'AI Analyst', details: 'Answer generated with 96% confidence', documentsUsed: 5, agent: 'Compliance Analysis Agent', status: 'Success' },
        { _id: 'a3', timestamp: new Date('2024-05-25T10:30:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'View Document', details: 'Security_Policy_2024.pdf', documentsUsed: 1, agent: 'Document Agent', status: 'Success' },
        { _id: 'a4', timestamp: new Date('2024-05-25T10:15:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Upload Document', details: 'Network_Diagram.vsd uploaded and processed', documentsUsed: 1, agent: 'Document Agent', status: 'Success' },
        { _id: 'a5', timestamp: new Date('2024-05-25T09:50:00'), userName: 'AI System', userRole: 'System', action: 'Process Document', details: '78 entities extracted from Network_Diagram.vsd', documentsUsed: 1, agent: 'EntityRelationAgent', status: 'Success' },
        { _id: 'a6', timestamp: new Date('2024-05-25T09:45:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Ask Question', details: 'Is Database A compliant with GDPR?', documentsUsed: 3, agent: 'Graph RAG Agent', status: 'Success' },
        { _id: 'a7', timestamp: new Date('2024-05-25T09:20:00'), userName: 'AI System', userRole: 'System', action: 'Risk Detected', details: 'Customer PII lacks explicit encryption evidence', documentsUsed: 2, agent: 'Compliance Analysis Agent', status: 'Success' },
        { _id: 'a8', timestamp: new Date('2024-05-24T16:30:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Generate Report', details: 'Compliance Audit Report generated successfully', documentsUsed: 8, agent: 'Orchestrator Agent', status: 'Success' },
        { _id: 'a9', timestamp: new Date('2024-05-24T14:00:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Upload Document', details: 'Data_Inventory.xlsx uploaded', documentsUsed: 1, agent: 'Document Agent', status: 'Success' },
        { _id: 'a10', timestamp: new Date('2024-05-23T11:00:00'), userName: 'AI System', userRole: 'System', action: 'Process Document', details: 'Extracted 217 entities from Data_Inventory.xlsx', documentsUsed: 1, agent: 'EntityRelationAgent', status: 'Success' }
      ];
      const pageSamples = allSamples.slice(skip, skip + parseInt(limit));
      return res.json({ logs: pageSamples, total: allSamples.length });
    }

    return res.json({ logs, total });
  } catch (err) {
    console.error('Audit log error:', err);
    return res.status(500).json({ error: 'Failed to fetch audit log trail.' });
  }
});

export default router;
