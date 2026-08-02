import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Document from '../models/Document.js';
import Query from '../models/Query.js';
import AuditLog from '../models/AuditLog.js';
import ComplianceCheck from '../models/ComplianceCheck.js';
import { memoryGraph } from '../graph/neo4jDriver.js';

dotenv.config();

export async function seedInitialData() {
  console.log('🌱 Seeding ComplianceGraph AI Sample Enterprise Data...');

  // Populate In-Memory Graph with rich node structure matching reference graph
  const nodes = [
    { name: 'Customer PII', type: 'DataAsset', confidence: 0.98, description: 'Personally Identifiable Information of enterprise customers.' },
    { name: 'Payment Data', type: 'DataAsset', confidence: 0.96, description: 'Customer payment card and financial transaction data.' },
    { name: 'Payment Service', type: 'System', confidence: 0.96, description: 'Processes customer PII for payment transactions.' },
    { name: 'Analytics Service', type: 'System', confidence: 0.94, description: 'Uses customer PII for analytics and reporting.' },
    { name: 'CRM Platform', type: 'Application', confidence: 0.95, description: 'Stores and manages customer information.' },
    { name: 'Customer Database', type: 'Database', confidence: 0.97, description: 'Primary relational store for user profile data.' },
    { name: 'GDPR', type: 'Regulation', confidence: 0.99, description: 'EU General Data Protection Regulation.' },
    { name: 'CCPA', type: 'Regulation', confidence: 0.93, description: 'California Consumer Privacy Act.' },
    { name: 'PCI-DSS', type: 'Regulation', confidence: 0.97, description: 'Payment Card Industry Data Security Standard.' },
    { name: 'Security Policy', type: 'Policy', confidence: 0.97, description: 'Enterprise Data Protection Policy v2.1.' },
    { name: 'Data Retention Policy', type: 'Policy', confidence: 0.94, description: 'Policy governing data storage duration and deletion.' },
    { name: 'AES-256 Encryption', type: 'Control', confidence: 0.98, description: 'AES-256 symmetric encryption for data at rest.' },
    { name: 'TLS Encryption', type: 'Control', confidence: 0.95, description: 'TLS/SSL encryption for data in transit.' },
    { name: 'RBAC', type: 'Control', confidence: 0.94, description: 'Role-Based Access Control governing data access.' },
    { name: 'Acme Enterprise', type: 'Organization', confidence: 0.99, description: 'Primary enterprise organization.' }
  ];

  nodes.forEach(n => memoryGraph.mergeNode(n.name, n.type, {
    description: n.description,
    confidence: n.confidence,
    type: n.type,
    sourceDocuments: ['Seed Data']
  }));

  const rels = [
    { source: 'Customer PII', target: 'Customer Database', type: 'STORED_IN' },
    { source: 'Customer PII', target: 'Payment Service', type: 'PROCESSED_BY' },
    { source: 'Customer PII', target: 'Analytics Service', type: 'PROCESSED_BY' },
    { source: 'Customer PII', target: 'CRM Platform', type: 'PROCESSED_BY' },
    { source: 'Payment Data', target: 'Payment Service', type: 'PROCESSED_BY' },
    { source: 'Payment Service', target: 'GDPR', type: 'GOVERNED_BY' },
    { source: 'Payment Service', target: 'PCI-DSS', type: 'GOVERNED_BY' },
    { source: 'Payment Service', target: 'TLS Encryption', type: 'PROTECTED_BY' },
    { source: 'Customer Database', target: 'AES-256 Encryption', type: 'PROTECTED_BY' },
    { source: 'Customer Database', target: 'RBAC', type: 'PROTECTED_BY' },
    { source: 'Security Policy', target: 'Customer PII', type: 'APPLIES_TO' },
    { source: 'GDPR', target: 'AES-256 Encryption', type: 'REQUIRES' },
    { source: 'Data Retention Policy', target: 'Customer Database', type: 'APPLIES_TO' },
    { source: 'Acme Enterprise', target: 'GDPR', type: 'GOVERNED_BY' },
    { source: 'Acme Enterprise', target: 'CCPA', type: 'GOVERNED_BY' },
    { source: 'Customer Database', target: 'Payment Service', type: 'USED_BY' }
  ];

  rels.forEach(r => memoryGraph.mergeRelationship(r.source, r.target, r.type, { sourceDocument: 'Seed Data' }));

  const stats = memoryGraph.stats();
  console.log(`   In-Memory Graph: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`);

  // Check MongoDB connection status
  if (mongoose.connection.readyState !== 1) {
    console.log('ℹ️ MongoDB not connected. Seed data loaded into active memory engine.');
    return;
  }

  try {
    // Only seed if the DB is empty (don't wipe user-uploaded data)
    const existingDocs = await Document.countDocuments();
    if (existingDocs > 0) {
      console.log('ℹ️ Database already contains data — skipping DB seed (graph memory seeded).');
      return;
    }

    // Demo User
    const existingUser = await User.findOne({ email: 'riya.sharma@example.com' });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Riya Sharma',
        email: 'riya.sharma@example.com',
        passwordHash,
        role: 'Compliance Officer',
        organizationId: 'org_acme_001'
      });
    }

    // Organization
    const existingOrg = await Organization.countDocuments();
    if (existingOrg === 0) {
      await Organization.create({
        name: 'Acme Enterprise',
        industry: 'Financial Technology & Services',
        complianceFrameworks: ['GDPR', 'CCPA', 'ISO 27001', 'PCI-DSS']
      });
    }

    // Seed Documents
    const sampleDocs = [
      { title: 'Security_Policy_2024.pdf', originalName: 'Security_Policy_2024.pdf', fileType: 'PDF', fileSize: '2.4 MB', sourceCategory: 'Internal', processingStatus: 'COMPLETED', entitiesExtracted: 142, relationshipsExtracted: 310, extractedText: 'Enterprise Security Policy 2024. All microservices processing Customer PII must implement AES-256 payload encryption at rest and TLS 1.3 in transit. Access controls are governed under GDPR and CCPA regulatory frameworks. Payment Service handles card data under PCI-DSS compliance.', createdAt: new Date('2024-05-26') },
      { title: 'Board_Meeting_Mar_2024.mp3', originalName: 'Board_Meeting_Mar_2024.mp3', fileType: 'Audio', fileSize: '14.2 MB', sourceCategory: 'Meeting', processingStatus: 'COMPLETED', entitiesExtracted: 86, relationshipsExtracted: 140, extractedText: 'Board meeting transcript covering data protection strategy. Discussion on GDPR compliance gaps, third-party vendor assessment, and customer PII handling procedures. Analytics Service flagged for overly permissive access to payment data.', createdAt: new Date('2024-05-24') },
      { title: 'Data_Inventory.xlsx', originalName: 'Data_Inventory.xlsx', fileType: 'Table', fileSize: '850 KB', sourceCategory: 'Internal', processingStatus: 'COMPLETED', entitiesExtracted: 217, relationshipsExtracted: 490, extractedText: 'Customer PII data inventory across all enterprise systems. Payment Service processes credit card data. Customer Database stores PII with AES-256 encryption. CRM Platform accesses customer names, emails, phone numbers. Data retention policy applies to all customer records.', createdAt: new Date('2024-05-23') },
      { title: 'System_Architecture.png', originalName: 'System_Architecture.png', fileType: 'Image', fileSize: '3.1 MB', sourceCategory: 'IT Team', processingStatus: 'COMPLETED', entitiesExtracted: 102, relationshipsExtracted: 210, extractedText: 'System architecture diagram showing data flow: API Gateway connects to Payment Service, Analytics Service, and CRM Platform. Customer Database is the central data store. All connections use TLS encryption. RBAC controls access to customer database.', createdAt: new Date('2024-05-22') },
      { title: 'Vendor_Assessment_Report.pdf', originalName: 'Vendor_Assessment_Report.pdf', fileType: 'PDF', fileSize: '1.8 MB', sourceCategory: 'Third Party', processingStatus: 'COMPLETED', entitiesExtracted: 64, relationshipsExtracted: 110, extractedText: 'Third-party vendor compliance assessment. Vendor AnalyticsPro lacks current SOC 2 Type II attestation. Payment processor Stripe maintains PCI-DSS Level 1 certification. All vendors processing customer PII must sign GDPR Data Processing Agreements.', createdAt: new Date('2024-05-21') },
      { title: 'Compliance_Call_April.mp3', originalName: 'Compliance_Call_April.mp3', fileType: 'Audio', fileSize: '18.5 MB', sourceCategory: 'Meeting', processingStatus: 'COMPLETED', entitiesExtracted: 45, relationshipsExtracted: 78, extractedText: 'Monthly compliance review call. Discussion of CCPA requirements for data deletion requests. Payment Service data retention exceeds policy limits. Action item: implement automated data purging for customer database records older than 36 months.', createdAt: new Date('2024-05-20') },
      { title: 'Access_Control_Matrix.csv', originalName: 'Access_Control_Matrix.csv', fileType: 'Table', fileSize: '420 KB', sourceCategory: 'IT Team', processingStatus: 'COMPLETED', entitiesExtracted: 94, relationshipsExtracted: 180, extractedText: 'Role-based access control matrix. Admin role has full access to Customer Database. Analyst role has read-only access to Analytics Service. Payment Service restricted to finance department. RBAC enforcement verified for GDPR Article 25 compliance.', createdAt: new Date('2024-05-18') },
      { title: 'Network_Diagram.vsd', originalName: 'Network_Diagram.vsd', fileType: 'Image', fileSize: '5.6 MB', sourceCategory: 'IT Team', processingStatus: 'COMPLETED', entitiesExtracted: 78, relationshipsExtracted: 135, extractedText: 'Network topology diagram. DMZ contains API Gateway. Internal zone hosts Payment Service, CRM Platform, Analytics Service. Data zone contains Customer Database with encrypted storage. All inter-zone communication uses TLS 1.3.', createdAt: new Date('2024-05-16') }
    ];

    await Document.insertMany(sampleDocs);

    // Audit logs
    const sampleAudits = [
      { timestamp: new Date('2024-05-25T10:45:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Ask Question', details: 'Which systems process PII?', documentsUsed: 5, agent: 'Graph RAG Agent', status: 'Success' },
      { timestamp: new Date('2024-05-25T10:45:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Generate Answer', details: 'Answer generated with graph-grounded evidence', documentsUsed: 5, agent: 'Compliance Analysis Agent', status: 'Success' },
      { timestamp: new Date('2024-05-25T10:30:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'View Document', details: 'Security_Policy_2024.pdf', documentsUsed: 1, agent: 'Document Agent', status: 'Success' },
      { timestamp: new Date('2024-05-25T10:15:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Upload Document', details: 'Network_Diagram.vsd', documentsUsed: 1, agent: 'Document Agent', status: 'Success' },
      { timestamp: new Date('2024-05-25T09:50:00'), userName: 'AI System', userRole: 'System', action: 'Process Document', details: 'Extracted 78 entities from Network_Diagram.vsd', documentsUsed: 1, agent: 'EntityRelationAgent', status: 'Success' },
      { timestamp: new Date('2024-05-25T09:45:00'), userName: 'Riya Sharma', userRole: 'Compliance Officer', action: 'Ask Question', details: 'Is Customer Database A GDPR compliant?', documentsUsed: 3, agent: 'Graph RAG Agent', status: 'Success' }
    ];

    await AuditLog.insertMany(sampleAudits);

    // Compliance checks
    const sampleChecks = [
      { category: 'Data Security', title: 'Unencrypted Database', system: 'Database "Customer-DB-02"', requirement: 'Stores PII without AES-256 encryption at rest.', severity: 'High', status: 'POTENTIAL_VIOLATION', framework: 'GDPR', evidenceSnippet: 'Security_Policy_2024.pdf — Section 4.2: "All databases storing PII must implement AES-256."' },
      { category: 'Access Control', title: 'Missing Data Retention Policy', system: 'System X', requirement: 'No retention policy found for logs in System X.', severity: 'Medium', status: 'NEEDS_REVIEW', framework: 'CCPA', evidenceSnippet: 'Data_Inventory.xlsx — Row 142: System X logs contain customer activity data.' },
      { category: 'Third-Party Compliance', title: 'Vendor Missing SOC 2', system: 'Vendor AnalyticsPro', requirement: 'Vendor AnalyticsPro lacks current SOC 2 Type II attestation.', severity: 'Medium', status: 'NEEDS_REVIEW', framework: 'ISO 27001', evidenceSnippet: 'Vendor_Assessment_Report.pdf — Page 3: "AnalyticsPro SOC 2 report expired Dec 2023."' },
      { category: 'Data Governance', title: 'Analytics Access Review', system: 'Analytics Service', requirement: 'Overly permissive access to customer PII in Analytics Service.', severity: 'Low', status: 'COMPLIANT', framework: 'PCI-DSS', evidenceSnippet: 'Access_Control_Matrix.csv — Analyst role restricted to read-only after June 2024 update.' }
    ];

    await ComplianceCheck.insertMany(sampleChecks);

    console.log('✅ Initial database seed completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
