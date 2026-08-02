import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

// Force Node to use Google DNS to bypass local router SRV resolution bugs on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

import { initNeo4j } from './graph/neo4jDriver.js';
import { seedInitialData } from './utils/seedData.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://gen-ai-powered-enterprise-complianc.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Neo4j Knowledge Graph Driver
initNeo4j();

// MongoDB Connection with graceful fallback
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/compliancegraph';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas / Local DB');
    seedInitialData();
  })
  .catch(err => {
    console.warn('⚠️ MongoDB Connection Notice:', err.message);
    console.log('ℹ️ Server will run with Memory Storage Engine fallback for full client features.');
    seedInitialData();
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'ComplianceGraph AI',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;
