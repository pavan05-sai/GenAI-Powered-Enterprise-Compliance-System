import express from 'express';
import { getFullGraph, memoryGraph, isNeo4jConnected, runCypher } from '../graph/neo4jDriver.js';

const router = express.Router();

// GET /api/graph — Full knowledge graph for visualization
router.get('/', async (req, res) => {
  try {
    const { nodes, edges } = await getFullGraph();

    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    const entityTypes = [...new Set(nodes.map(n => n.type))];

    return res.json({
      nodes,
      edges,
      stats: { totalNodes, totalEdges, entityTypes },
      source: isNeo4jConnected() ? 'neo4j' : 'memory'
    });
  } catch (err) {
    console.error('[Graph Route] GET / error:', err);
    return res.status(500).json({ error: 'Failed to retrieve Knowledge Graph.' });
  }
});

// GET /api/graph/entity/:name — Entity details + relationships
router.get('/entity/:name', async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);

    // Try Neo4j first
    if (isNeo4jConnected()) {
      try {
        const records = await runCypher(
          `MATCH (n:Entity { name: $name })
           OPTIONAL MATCH (n)-[r]->(m)
           OPTIONAL MATCH (k)-[s]->(n)
           RETURN
             n.name AS name, n.type AS type, n.description AS description,
             n.confidence AS confidence, n.sourceDocuments AS sourceDocs,
             collect(DISTINCT { rel: type(r), target: m.name }) AS outgoing,
             collect(DISTINCT { rel: type(s), target: k.name }) AS incoming`,
          { name }
        );

        if (records && records.length > 0) {
          const rec = records[0];
          const outgoing = (rec.get('outgoing') || []).filter(r => r.target).map(r => ({
            relationship: r.rel.toLowerCase().replace(/_/g, ' '),
            target: r.target,
            direction: 'outgoing'
          }));
          const incoming = (rec.get('incoming') || []).filter(r => r.target).map(r => ({
            relationship: r.rel.toLowerCase().replace(/_/g, ' '),
            target: r.target,
            direction: 'incoming'
          }));

          return res.json({
            entity: {
              id: rec.get('name'),
              name: rec.get('name'),
              type: rec.get('type') || 'Entity',
              description: rec.get('description') || '',
              confidence: (rec.get('confidence') || 0.9).toString(),
              sourceDocuments: rec.get('sourceDocs') || [],
              lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              relationships: [...outgoing, ...incoming]
            },
            source: 'neo4j'
          });
        }
      } catch (e) {
        console.warn('[Graph Route] Neo4j entity fetch error:', e.message);
      }
    }

    // Fallback: In-Memory Graph
    const node = memoryGraph.findNode(name);
    if (!node) {
      return res.status(404).json({ error: `Entity "${name}" not found in Knowledge Graph.` });
    }

    const edges = memoryGraph.getNodeEdges(name);
    const relationships = edges.map(e => ({
      relationship: e.type.toLowerCase().replace(/_/g, ' '),
      target: e.source.toLowerCase() === name.toLowerCase() ? e.target : e.source,
      direction: e.source.toLowerCase() === name.toLowerCase() ? 'outgoing' : 'incoming'
    }));

    return res.json({
      entity: {
        id: node.id,
        name: node.properties.name,
        type: node.properties.type || 'Entity',
        description: node.properties.description || '',
        confidence: (node.properties.confidence || 0.9).toString(),
        sourceDocuments: node.properties.sourceDocuments || [],
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        relationships
      },
      source: 'memory'
    });
  } catch (err) {
    console.error('[Graph Route] GET /entity/:name error:', err);
    return res.status(500).json({ error: 'Failed to retrieve entity details.' });
  }
});

// GET /api/graph/stats — Graph summary counts
router.get('/stats', async (req, res) => {
  try {
    if (isNeo4jConnected()) {
      const records = await runCypher(
        `MATCH (n:Entity)
         WITH count(n) AS nodeCount
         MATCH ()-[r]->()
         RETURN nodeCount, count(r) AS edgeCount`
      );
      if (records && records.length > 0) {
        const rec = records[0];
        return res.json({
          totalNodes: rec.get('nodeCount').toNumber(),
          totalEdges: rec.get('edgeCount').toNumber(),
          source: 'neo4j'
        });
      }
    }

    const s = memoryGraph.stats();
    return res.json({ ...s, source: 'memory' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get graph stats.' });
  }
});

export default router;
