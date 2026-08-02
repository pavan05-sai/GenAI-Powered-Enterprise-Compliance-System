import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

let driver = null;
let _connected = false;

// ─── In-Memory Knowledge Graph Engine ─────────────────────────────────────────
// Used when Neo4j is not configured or unavailable.
// Maintains node/relationship maps with full provenance.

class InMemoryGraph {
  constructor() {
    this.nodes = new Map();     // name → node object
    this.edges = [];            // [{id, source, target, type, properties}]
  }

  /**
   * Merge node — if a node with this name exists, merge properties;
   * otherwise create it. Returns the node.
   */
  mergeNode(name, label, properties = {}) {
    const key = name.toLowerCase().trim();
    if (this.nodes.has(key)) {
      const existing = this.nodes.get(key);
      // Merge additional source documents
      if (properties.sourceDocuments) {
        existing.properties.sourceDocuments = [
          ...new Set([...(existing.properties.sourceDocuments || []), ...properties.sourceDocuments])
        ];
      }
      existing.properties.lastUpdated = new Date().toISOString();
      return existing;
    }
    const node = {
      id: name,
      labels: [label || 'Entity'],
      properties: {
        name,
        type: label || 'Entity',
        ...properties,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
    this.nodes.set(key, node);
    return node;
  }

  /** Merge relationship — deduplicate by source+target+type */
  mergeRelationship(sourceName, targetName, type, properties = {}) {
    const existing = this.edges.find(
      e => e.source.toLowerCase() === sourceName.toLowerCase() &&
           e.target.toLowerCase() === targetName.toLowerCase() &&
           e.type === type
    );
    if (existing) {
      if (properties.sourceDocument) {
        existing.properties.sourceDocuments = [
          ...new Set([...(existing.properties.sourceDocuments || []), properties.sourceDocument])
        ];
      }
      return existing;
    }
    const edge = {
      id: `${sourceName}__${type}__${targetName}`,
      source: sourceName,
      target: targetName,
      type,
      properties: {
        sourceDocuments: properties.sourceDocument ? [properties.sourceDocument] : [],
        createdAt: new Date().toISOString()
      }
    };
    this.edges.push(edge);
    return edge;
  }

  getNodes() { return Array.from(this.nodes.values()); }
  getEdges() { return this.edges; }

  /** Find a node by name (case-insensitive) */
  findNode(name) {
    return this.nodes.get(name.toLowerCase().trim()) || null;
  }

  /** Return all edges connected to a node (by name) */
  getNodeEdges(name) {
    const lower = name.toLowerCase();
    return this.edges.filter(
      e => e.source.toLowerCase() === lower || e.target.toLowerCase() === lower
    );
  }

  /**
   * Multi-hop BFS traversal from a seed node up to `maxHops` hops.
   * Returns list of { source, relationship, target } path segments.
   */
  traverse(seedNames, maxHops = 2) {
    const visited = new Set();
    const paths = [];
    let frontier = seedNames.map(n => n.toLowerCase());

    for (let hop = 0; hop < maxHops; hop++) {
      const nextFrontier = [];
      for (const name of frontier) {
        if (visited.has(name)) continue;
        visited.add(name);

        const edges = this.getNodeEdges(name);
        for (const edge of edges) {
          paths.push({
            source: edge.source,
            relationship: edge.type,
            target: edge.target
          });
          const neighbor = edge.source.toLowerCase() === name ? edge.target.toLowerCase() : edge.source.toLowerCase();
          if (!visited.has(neighbor)) nextFrontier.push(neighbor);
        }
      }
      frontier = nextFrontier;
    }

    // Deduplicate paths
    return Array.from(
      new Map(paths.map(p => [`${p.source}|${p.relationship}|${p.target}`, p])).values()
    );
  }

  stats() {
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length
    };
  }
}

export const memoryGraph = new InMemoryGraph();

// ─── Neo4j Aura Connection ────────────────────────────────────────────────────

export function initNeo4j() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER || 'neo4j';
  const password = process.env.NEO4J_PASSWORD;

  const isRemote = uri && (uri.startsWith('neo4j+s://') || uri.startsWith('neo4j://') || uri.startsWith('bolt+s://'));

  if (isRemote && password) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      console.log('✅ Neo4j Aura: Connected — Knowledge Graph using cloud Neo4j');
      _connected = true;
    } catch (err) {
      console.warn('⚠️  Neo4j connection failed:', err.message);
      _connected = false;
    }
  } else {
    console.log('ℹ️  Neo4j: No remote URI configured — using In-Memory Knowledge Graph Engine');
    _connected = false;
  }
}

export function isNeo4jConnected() { return _connected; }

/**
 * Execute a Cypher query against Neo4j Aura.
 * Returns Neo4j records array, or null if not connected.
 */
export async function runCypher(cypher, params = {}) {
  if (!_connected || !driver) return null;

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } catch (err) {
    console.error('[Neo4j] Cypher error:', err.message);
    throw err;
  } finally {
    await session.close();
  }
}

/**
 * Fetch full graph for visualization:
 * Returns { nodes, edges } in a normalized format.
 */
export async function getFullGraph() {
  if (_connected) {
    try {
      const records = await runCypher(
        `MATCH (n)
         OPTIONAL MATCH (n)-[r]->(m)
         RETURN
           n.name AS sourceName,
           labels(n) AS sourceLabels,
           n.description AS sourceDesc,
           n.confidence AS sourceConf,
           n.sourceDocuments AS sourceDocs,
           type(r) AS relType,
           m.name AS targetName
         LIMIT 500`
      );

      const nodesMap = new Map();
      const edges = [];

      for (const rec of records) {
        const sName = rec.get('sourceName');
        if (sName && !nodesMap.has(sName)) {
          nodesMap.set(sName, {
            id: sName,
            label: sName,
            type: (rec.get('sourceLabels') || [])[0] || 'Entity',
            description: rec.get('sourceDesc') || '',
            confidence: rec.get('sourceConf') || 0.9,
            sourceDocuments: rec.get('sourceDocs') || []
          });
        }

        const relType = rec.get('relType');
        const tName = rec.get('targetName');
        if (relType && tName) {
          if (!nodesMap.has(tName)) {
            nodesMap.set(tName, { id: tName, label: tName, type: 'Entity', description: '', confidence: 0.9, sourceDocuments: [] });
          }
          edges.push({
            id: `${sName}__${relType}__${tName}`,
            source: sName,
            target: tName,
            label: relType.toLowerCase().replace(/_/g, ' '),
            relationship: relType
          });
        }
      }

      return { nodes: Array.from(nodesMap.values()), edges };
    } catch (err) {
      console.warn('[Neo4j] getFullGraph fallback to memory:', err.message);
    }
  }

  // Fallback to memory graph
  const nodes = memoryGraph.getNodes().map(n => ({
    id: n.id,
    label: n.properties.name,
    type: n.properties.type || n.labels[0],
    description: n.properties.description || '',
    confidence: n.properties.confidence || 0.9,
    sourceDocuments: n.properties.sourceDocuments || []
  }));

  const edges = memoryGraph.getEdges().map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.type.toLowerCase().replace(/_/g, ' '),
    relationship: e.type
  }));

  return { nodes, edges };
}
