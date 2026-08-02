import { memoryGraph, runCypher, isNeo4jConnected } from '../graph/neo4jDriver.js';

export class KnowledgeGraphAgent {
  constructor() {
    this.name = 'Knowledge Graph Agent';
  }

  /**
   * Sync extracted entities and relationships into:
   *   1. In-Memory graph (always)
   *   2. Neo4j Aura (if connected) using MERGE to avoid duplicates
   */
  async syncGraphData(entities, relationships, documentTitle) {
    console.log(`[${this.name}] Syncing ${entities.length} entities, ${relationships.length} relationships for: "${documentTitle}"`);

    // ── 1. In-Memory Graph ──────────────────────────────────────────────────
    for (const entity of entities) {
      memoryGraph.mergeNode(entity.name, entity.type, {
        description: entity.description || '',
        confidence: entity.confidence || 0.9,
        type: entity.type,
        sourceDocuments: [documentTitle]
      });
    }

    for (const rel of relationships) {
      memoryGraph.mergeRelationship(
        rel.source,
        rel.target,
        rel.relationship || rel.type || 'RELATED_TO',
        { sourceDocument: documentTitle }
      );
    }

    const memStats = memoryGraph.stats();

    // ── 2. Neo4j Aura (if connected) ────────────────────────────────────────
    if (isNeo4jConnected()) {
      try {
        // Batch-create/merge nodes
        for (const entity of entities) {
          // Sanitize label — Neo4j labels can't have spaces
          const label = entity.type.replace(/\s+/g, '');
          await runCypher(
            `MERGE (n:Entity { name: $name })
             ON CREATE SET
               n.type = $type,
               n.description = $description,
               n.confidence = $confidence,
               n.sourceDocuments = [$sourceDoc],
               n.createdAt = datetime()
             ON MATCH SET
               n.sourceDocuments = CASE
                 WHEN $sourceDoc IN n.sourceDocuments THEN n.sourceDocuments
                 ELSE n.sourceDocuments + [$sourceDoc]
               END,
               n.lastUpdated = datetime()`,
            {
              name: entity.name,
              type: entity.type,
              description: entity.description || '',
              confidence: entity.confidence || 0.9,
              sourceDoc: documentTitle
            }
          );
        }

        // Batch-create/merge relationships
        for (const rel of relationships) {
          const relType = (rel.relationship || rel.type || 'RELATED_TO')
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '');

          await runCypher(
            `MATCH (a:Entity { name: $sourceName })
             MATCH (b:Entity { name: $targetName })
             MERGE (a)-[r:${relType}]->(b)
             ON CREATE SET r.sourceDocument = $sourceDoc, r.createdAt = datetime()`,
            {
              sourceName: rel.source,
              targetName: rel.target,
              sourceDoc: documentTitle
            }
          );
        }

        console.log(`[${this.name}] ✅ Neo4j Aura sync complete`);
      } catch (err) {
        console.warn(`[${this.name}] Neo4j sync error (continuing):`, err.message);
      }
    }

    return {
      nodesAdded: entities.length,
      relationshipsAdded: relationships.length,
      totalNodes: memStats.totalNodes,
      totalEdges: memStats.totalEdges,
      neo4jSynced: isNeo4jConnected()
    };
  }
}
