import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const router = express.Router();

// GET /api/alerts — Fetch alerts/notifications
router.get('/', async (req, res) => {
  try {
    let alerts = [];
    if (mongoose.connection.readyState === 1) {
      alerts = await Notification.find({}).sort({ createdAt: -1 }).limit(20);
    }

    if (alerts.length === 0) {
      alerts = [
        {
          _id: 'alt_01',
          title: 'Customer Data Protection Policy Changed',
          message: 'Previous: AES-128 encryption. Current: AES-256 encryption. 3 systems affected.',
          type: 'POLICY_CHANGED',
          severity: 'High',
          isRead: false,
          link: '/documents',
          affectedCount: 3,
          createdAt: new Date()
        },
        {
          _id: 'alt_02',
          title: 'Contradiction Detected',
          message: 'Conflicting claims: Customer PII location in Security Policy vs System Architecture.',
          type: 'CONTRADICTION_DETECTED',
          severity: 'High',
          isRead: false,
          link: '/compliance',
          affectedCount: 2,
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          _id: 'alt_03',
          title: 'Compliance Gap Identified',
          message: 'Database A lacks explicit encryption controls in Knowledge Graph.',
          type: 'RISK_DETECTED',
          severity: 'Medium',
          isRead: true,
          link: '/compliance',
          affectedCount: 1,
          createdAt: new Date(Date.now() - 7200000)
        }
      ];
    }

    const unreadCount = alerts.filter(a => !a.isRead).length;
    return res.json({ alerts, unreadCount, total: alerts.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

// PATCH /api/alerts/:id/read — Mark alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    return res.json({ message: 'Alert marked as read.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update alert status.' });
  }
});

export default router;
