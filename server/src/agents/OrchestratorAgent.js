import { DocumentProcessorAgent } from './DocumentProcessorAgent.js';
import { EntityRelationAgent } from './EntityRelationAgent.js';
import { KnowledgeGraphAgent } from './KnowledgeGraphAgent.js';
import { GraphRAGAgent } from './GraphRAGAgent.js';
import { ComplianceAnalysisAgent } from './ComplianceAnalysisAgent.js';
import { ContradictionAgent } from './ContradictionAgent.js';
import { VersionImpactAgent } from './VersionImpactAgent.js';
import { llm } from './LLMClient.js';

export class OrchestratorAgent {
  constructor() {
    this.name = 'Orchestrator Agent';
    this.docProcessor    = new DocumentProcessorAgent();
    this.entityExtractor = new EntityRelationAgent();
    this.graphAgent      = new KnowledgeGraphAgent();
    this.graphRag        = new GraphRAGAgent();
    this.complianceAgent = new ComplianceAnalysisAgent();
    this.contradictionAgent = new ContradictionAgent();
    this.versionImpactAgent = new VersionImpactAgent();
  }

  /**
   * PIPELINE A — Document Ingestion → Entity Extraction → Knowledge Graph → Contradiction Detection
   *
   * Called when a user uploads a file.
   * Returns { docData, entities, relationships, graphStats, contradictions }
   */
  async processDocumentPipeline(file) {
    console.log('\n══════════════════════════════════════════');
    console.log(`[${this.name}] PIPELINE A — Document Ingestion & Multi-Agent Analysis`);
    console.log(`   File: ${file.originalname}`);
    console.log('══════════════════════════════════════════\n');

    // Step 1 — Document Processing Agent
    const docData = await this.docProcessor.processFile(file);

    // Step 2 — Entity + Relationship Extraction Agent
    const extraction = await this.entityExtractor.extractEntitiesAndRelationships(
      docData.title,
      docData.extractedText
    );

    // Step 3 — Knowledge Graph Agent
    const graphStats = await this.graphAgent.syncGraphData(
      extraction.entities,
      extraction.relationships,
      docData.title
    );

    // Step 4 — Contradiction Detection Agent
    const contradictions = await this.contradictionAgent.detectContradictions(
      docData.title,
      extraction.entities,
      extraction.relationships
    );

    console.log(`\n[${this.name}] Pipeline A complete:`);
    console.log(`   Entities: ${extraction.entities.length}`);
    console.log(`   Relationships: ${extraction.relationships.length}`);
    console.log(`   Graph nodes total: ${graphStats.totalNodes}`);
    console.log(`   Contradictions flagged: ${contradictions.length}`);

    return {
      docData,
      entities: extraction.entities,
      relationships: extraction.relationships,
      graphStats,
      contradictions,
      extractionMethod: extraction.method
    };
  }

  /**
   * PIPELINE B — User Query → Graph RAG → Compliance Analysis
   *
   * Called when a user submits a question in AI Analyst.
   * Returns { question, analysis }
   */
  async executeComplianceQuery(userQuestion) {
    console.log('\n══════════════════════════════════════════');
    console.log(`[${this.name}] PIPELINE B — Graph RAG Compliance Query`);
    console.log(`   Question: "${userQuestion}"`);
    console.log('══════════════════════════════════════════\n');

    // Step 1 — Graph RAG Retrieval Agent
    const retrievedContext = await this.graphRag.retrieveContext(userQuestion);

    // Step 2 — Compliance Analysis Agent
    const analysis = await this.complianceAgent.analyze(userQuestion, retrievedContext);

    console.log(`\n[${this.name}] Pipeline B complete:`);
    console.log(`   Status: ${analysis.status}`);
    console.log(`   Confidence: ${analysis.confidence}`);
    console.log(`   Graph paths: ${analysis.graphPath?.length || 0}`);
    console.log(`   Evidence items: ${analysis.evidence?.length || 0}`);
    console.log(`   LLM provider: ${llm.provider}`);

    return { question: userQuestion, analysis };
  }

  /**
   * PIPELINE C — Entity Impact Analysis
   */
  async analyzeEntityImpact(entityName) {
    return this.versionImpactAgent.analyzeImpact(entityName);
  }
}

// Singleton shared across all routes
export const orchestrator = new OrchestratorAgent();

