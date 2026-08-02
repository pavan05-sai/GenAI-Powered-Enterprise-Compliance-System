import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';
import { orchestrator } from '../agents/OrchestratorAgent.js';
import { memoryGraph } from '../graph/neo4jDriver.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Get All Documents with filtering & pagination support
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.fileType = type;
    }

    if (status && status !== 'All Status') {
      query.processingStatus = status.toUpperCase();
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let docs = [];
    if (Document.db && Document.db.readyState === 1) {
      docs = await Document.find(query).sort({ createdAt: -1 });
    }

    // Do not return fallback mock data if DB is empty

    return res.json({ documents: docs, total: docs.length });
  } catch (err) {
    console.error('Fetch documents error:', err);
    return res.status(500).json({ error: 'Failed to fetch documents.' });
  }
});

// Upload Document & Process Multi-Agent Pipeline
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    console.log(`Receiving upload: ${file.originalname} (${file.size} bytes)`);

    // Execute Multi-Agent Orchestrator Pipeline
    const pipelineResult = await orchestrator.processDocumentPipeline(file);

    const { docData, entities, relationships, graphStats, extractionMethod } = pipelineResult;

    // Extract user info from JWT for audit trail
    let userName = 'Unknown User';
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'compliancegraph_secret');
        userName = decoded.name || decoded.email || 'Unknown User';
      }
    } catch (e) { /* ignore decode errors */ }

    let savedDoc = null;
    let versionInfo = null;

    if (Document.db && Document.db.readyState === 1) {
      // Check if document already exists to increment version & run VersionImpactAgent diffing
      const existingDoc = await Document.findOne({ originalName: docData.originalName });
      let versionNum = 1;
      let previousVersionId = null;

      if (existingDoc) {
        versionNum = (existingDoc.version || 1) + 1;
        previousVersionId = existingDoc._id;

        // Run Version Impact Agent to calculate diffs & raise notifications
        try {
          const { VersionImpactAgent } = await import('../agents/VersionImpactAgent.js');
          const versionAgent = new VersionImpactAgent();
          versionInfo = await versionAgent.compareVersions(
            existingDoc._id.toString(),
            docData.title,
            docData.extractedText,
            entities,
            relationships
          );
        } catch (vErr) {
          console.warn('Version impact calculation warning:', vErr.message);
        }
      }

      savedDoc = await Document.create({
        title: docData.title,
        originalName: docData.originalName,
        fileType: docData.fileType,
        fileSize: docData.fileSize,
        extractedText: docData.extractedText,
        processingStatus: 'COMPLETED',
        entitiesExtracted: entities.length,
        relationshipsExtracted: relationships.length,
        sourceCategory: 'Internal',
        extractedEntities: entities,
        extractedRelationships: relationships,
        version: versionNum,
        previousVersionId,
        riskLevel: entities.length > 50 ? 'medium' : 'low'
      });

      // Add to audit log
      await AuditLog.create({
        userName,
        action: versionNum > 1 ? 'Update Document Version' : 'Upload Document',
        entityType: 'Document',
        entityId: savedDoc._id.toString(),
        details: `${versionNum > 1 ? `Uploaded version ${versionNum} of` : 'Uploaded'} ${docData.title} and extracted ${entities.length} entities.`,
        documentsUsed: 1,
        agent: 'Document & Entity Agent',
        status: 'Success'
      });
    } else {
      savedDoc = {
        _id: `doc_${Date.now()}`,
        title: docData.title,
        originalName: docData.originalName,
        fileType: docData.fileType,
        fileSize: docData.fileSize,
        processingStatus: 'COMPLETED',
        entitiesExtracted: entities.length,
        relationshipsExtracted: relationships.length,
        sourceCategory: 'Internal',
        version: 1,
        createdAt: new Date()
      };
    }

    return res.status(201).json({
      message: 'Document processed successfully and Knowledge Graph updated.',
      document: savedDoc,
      entities,
      relationships,
      graphStats,
      extractionMethod,
      versionInfo
    });
  } catch (err) {
    console.error('Upload document error:', err);
    return res.status(500).json({ error: 'Failed to process and ingest document.' });
  }
});

// Get Document Detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let doc = null;

    if (Document.db && Document.db.readyState === 1) {
      doc = await Document.findById(id);
    }

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    return res.json({ document: doc });
  } catch (err) {
    return res.status(500).json({ error: 'Error retrieving document details.' });
  }
});

// Delete Document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (Document.db && Document.db.readyState === 1) {
      await Document.findByIdAndDelete(id);
    }
    return res.json({ message: 'Document deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete document.' });
  }
});

// GET /api/documents/:id/versions — Get document versioning history
router.get('/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const { VersionImpactAgent } = await import('../agents/VersionImpactAgent.js');
    const agent = new VersionImpactAgent();
    const versionRecord = await agent.compareVersions(id, 'Customer Data Protection Policy', '', [], []);
    return res.json({ versions: [versionRecord] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch document versions.' });
  }
});

export default router;

