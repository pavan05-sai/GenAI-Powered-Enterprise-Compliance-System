import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, RotateCcw, Filter, FileText, CheckCircle2, Share2, Layers, ExternalLink, Loader2, X } from 'lucide-react';

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Entities');
  const [selectedRelation, setSelectedRelation] = useState('All Relationships');
  const [dataSource, setDataSource] = useState('memory');
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [impactData, setImpactData] = useState(null);


  // Color mapping per entity type
  const typeColorMap = {
    'DataAsset': '#1565C0',
    'Data Asset': '#1565C0',
    'System': '#2E7D32',
    'Database': '#0288D1',
    'Regulation': '#C59B27',
    'Policy': '#D32F2F',
    'Control': '#F57F17',
    'Organization': '#8E24AA',
    'Requirement': '#D84315',
    'Application': '#00838F',
    'Service': '#283593'
  };

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.getGraph();
      const rawNodes = res.data.nodes || [];
      const rawEdges = res.data.edges || [];
      setDataSource(res.data.source || 'memory');

      // Calculate radial/grid layout coordinates for visual SVG rendering
      const center = { cx: 300, cy: 220 };
      const radius = 150;
      
      const positionedNodes = rawNodes.map((node, index) => {
        let cx = center.cx;
        let cy = center.cy;

        if (index > 0) {
          const angle = ((index - 1) / Math.max(1, rawNodes.length - 1)) * 2 * Math.PI;
          cx = Math.round(center.cx + radius * Math.cos(angle));
          cy = Math.round(center.cy + radius * Math.sin(angle));
        }

        return {
          ...node,
          name: node.label || node.id,
          type: node.type || 'System',
          color: typeColorMap[node.type] || typeColorMap[node.type?.replace(/\s+/g, '')] || '#4A6572',
          cx,
          cy,
          r: index === 0 ? 40 : 34
        };
      });

      setGraphData({ nodes: positionedNodes, edges: rawEdges });

      if (positionedNodes.length > 0 && !selectedEntity) {
        fetchEntityDetail(positionedNodes[0].id);
      }
    } catch (err) {
      console.warn('Failed to load graph data, using default view.', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityDetail = async (entityName) => {
    try {
      const res = await api.getEntity(entityName);
      setSelectedEntity(res.data.entity);
    } catch (err) {
      const localNode = graphData.nodes.find(n => n.id === entityName);
      if (localNode) {
        setSelectedEntity({
          id: localNode.id,
          name: localNode.name,
          type: localNode.type,
          sensitivity: localNode.type === 'Data Asset' || localNode.type === 'DataAsset' ? 'High' : 'Medium',
          description: localNode.description || `Enterprise compliance entity node (${localNode.type}).`,
          sourceDocuments: localNode.sourceDocuments || ['Security_Policy_2024.pdf'],
          confidence: localNode.confidence || '0.95',
          lastUpdated: 'May 26, 2024',
          relationships: graphData.edges
            .filter(e => e.source === localNode.id || e.target === localNode.id)
            .map(e => ({
              relationship: e.label || e.relationship,
              target: e.source === localNode.id ? e.target : e.source
            }))
        });
      }
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const filteredNodes = graphData.nodes.filter(node => {
    const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All Entities' || node.type === selectedType || node.type?.replace(/\s+/g, '') === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = graphData.edges.filter(edge => {
    const matchesEndpoints = filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target);
    const matchesRelation = selectedRelation === 'All Relationships' || 
      edge.label?.toLowerCase() === selectedRelation.toLowerCase() ||
      edge.relationship?.toLowerCase() === selectedRelation.toLowerCase();
    return matchesEndpoints && matchesRelation;
  });

  const getNode = (id) => graphData.nodes.find(n => n.id === id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1918]">Knowledge Graph</h1>
          <p className="text-xs text-[#6E6B62] mt-0.5">Explore entities and their relationships across your compliance data.</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded bg-[#E8E2D2] text-[#8C6B1B] font-semibold border border-[#D5CEBD]">
          Engine: {dataSource === 'neo4j' ? 'Neo4j Aura (Cloud)' : 'In-Memory Graph Engine'}
        </span>
      </div>

      {/* Controls Bar */}
      <div className="veritas-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877A]" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
          >
            <option value="All Entities">All Entities</option>
            <option value="DataAsset">Data Asset</option>
            <option value="System">System</option>
            <option value="Database">Database</option>
            <option value="Regulation">Regulation</option>
            <option value="Policy">Policy</option>
            <option value="Control">Control</option>
          </select>

          <select
            value={selectedRelation}
            onChange={(e) => setSelectedRelation(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
          >
            <option value="All Relationships">All Relationships</option>
            <option value="processed_by">processed_by</option>
            <option value="stored_in">stored_in</option>
            <option value="governed_by">governed_by</option>
            <option value="protected_by">protected_by</option>
            <option value="applies_to">applies_to</option>
          </select>
        </div>

        <button
          onClick={() => { setSearchQuery(''); setSelectedType('All Entities'); setSelectedRelation('All Relationships'); fetchGraph(); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6E6B62] bg-[#F7F5F0] hover:bg-[#EAE5D8] rounded-md border border-[#E6E2D8] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Graph</span>
        </button>
      </div>

      {/* Main Container: Graph Canvas + Right Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-2 veritas-card p-4 relative min-h-[480px] bg-[#FAF8F5] flex flex-col justify-between overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
              <Loader2 className="w-8 h-8 text-[#8C6B1B] animate-spin" />
              <span className="text-xs text-[#6E6B62] font-semibold">Traversing Knowledge Graph...</span>
            </div>
          ) : (
            <>
              <svg className="w-full h-full min-h-[440px]" viewBox="0 0 600 440">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#8C877A" />
                  </marker>
                </defs>

                {/* Edges */}
                {filteredEdges.map((edge, idx) => {
                  const sNode = getNode(edge.source);
                  const tNode = getNode(edge.target);
                  if (!sNode || !tNode) return null;
                  const midX = (sNode.cx + tNode.cx) / 2;
                  const midY = (sNode.cy + tNode.cy) / 2;

                  return (
                    <g key={`edge-${idx}`}>
                      <line
                        x1={sNode.cx}
                        y1={sNode.cy}
                        x2={tNode.cx}
                        y2={tNode.cy}
                        stroke="#D5CEBD"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <rect
                        x={midX - 32}
                        y={midY - 9}
                        width="64"
                        height="16"
                        rx="4"
                        fill="#F7F5F0"
                        stroke="#E6E2D8"
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        className="text-[9px] font-sans fill-[#6E6B62] font-semibold select-none"
                      >
                        {edge.label || edge.relationship}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const isSelected = selectedEntity && (selectedEntity.id === node.id || selectedEntity.name === node.name);
                  return (
                    <g
                      key={node.id}
                      onClick={() => fetchEntityDetail(node.id)}
                      className="cursor-pointer transition-transform duration-150 hover:scale-105"
                    >
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={node.r}
                        fill={node.color}
                        stroke={isSelected ? '#1A1918' : '#FFFFFF'}
                        strokeWidth={isSelected ? '3' : '2'}
                        className="shadow-md"
                      />
                      <text
                        x={node.cx}
                        y={node.cy + 3}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        className="text-[10px] font-bold font-sans select-none pointer-events-none"
                      >
                        {node.name.length > 12 ? node.name.substring(0, 10) + '...' : node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Graph Legend */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E6E2D8] text-[11px] text-[#6E6B62]">
                <span className="font-semibold text-[#1A1918]">Legend:</span>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#1565C0]"></span> Data Asset</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></span> System</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0288D1]"></span> Database</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#C59B27]"></span> Regulation</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F]"></span> Policy</div>
              </div>
            </>
          )}
        </div>

        {/* Right Side Entity Details Panel */}
        <div className="veritas-card p-5 space-y-5">
          {selectedEntity ? (
            <>
              <div className="flex justify-between items-start pb-3 border-b border-[#E6E2D8]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E6B62] tracking-wider">Entity Details</span>
                  <h2 className="font-serif text-xl font-bold text-[#1A1918] mt-0.5">{selectedEntity.name}</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#E8E2D2] text-[#8C6B1B]">
                  {selectedEntity.type}
                </span>
              </div>

              {/* Properties Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1A1918]">Properties</h3>

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F5F0] p-3 rounded-lg border border-[#E6E2D8]">
                  <div>
                    <span className="text-[#6E6B62] block text-[10px]">Type</span>
                    <span className="font-semibold text-[#1A1918]">{selectedEntity.type}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6B62] block text-[10px]">Sensitivity</span>
                    <span className="font-semibold text-[#D32F2F]">{selectedEntity.sensitivity || 'High'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#6E6B62] block text-[10px]">Description</span>
                    <span className="text-[#1A1918]">{selectedEntity.description || 'Enterprise compliance entity.'}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6B62] block text-[10px]">Source Documents</span>
                    <span className="font-semibold text-[#8C6B1B]">
                      {selectedEntity.sourceDocuments ? selectedEntity.sourceDocuments[0] : 'Security_Policy_2024.pdf'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E6B62] block text-[10px]">Confidence</span>
                    <span className="font-semibold text-[#2E7D32]">{selectedEntity.confidence || '0.95'}</span>
                  </div>
                </div>
              </div>

              {/* Relationships List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#1A1918]">
                  Relationships ({selectedEntity.relationships ? selectedEntity.relationships.length : 0})
                </h3>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedEntity.relationships && selectedEntity.relationships.map((rel, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#FAF8F5] border border-[#E6E2D8] text-xs">
                      <span className="text-[#8C6B1B] font-mono text-[11px] font-medium">{rel.relationship}</span>
                      <span className="font-semibold text-[#1A1918]">{rel.target}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const res = await api.analyzeImpact(selectedEntity.name);
                    setImpactData(res.data.impact);
                    setShowImpactModal(true);
                  } catch (e) {
                    console.warn('Impact analysis call error:', e);
                  }
                }}
                className="w-full py-2 bg-[#8C6B1B] hover:bg-[#735714] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Analyze Entity Impact</span>
              </button>
            </>
          ) : (
            <div className="text-xs text-[#6E6B62] py-12 text-center">
              Select a node in the graph to view entity properties and relationships.
            </div>
          )}
        </div>
      </div>

      {/* Graph RAG Impact Analysis Modal */}
      {showImpactModal && impactData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6E2D8] max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#E6E2D8] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C6B1B] tracking-wider">Graph RAG Impact Analysis</span>
                <h2 className="font-serif text-xl font-bold text-[#1A1918] mt-0.5">{impactData.entityName}</h2>
              </div>
              <button onClick={() => setShowImpactModal(false)} className="text-[#6E6B62] hover:text-[#1A1918]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#E6E2D8] rounded-xl text-xs space-y-2">
              <span className="font-bold text-[#1A1918] block uppercase tracking-wider text-[10px]">Ripple Effect Summary</span>
              <p className="text-[#1A1918] leading-relaxed">{impactData.impactSummary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E6E2D8]">
                <span className="text-[10px] uppercase font-bold text-[#6E6B62] block">Affected Systems ({impactData.systems.length})</span>
                <span className="font-semibold text-[#1A1918] block mt-1">{impactData.systems.join(', ') || 'None'}</span>
              </div>
              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E6E2D8]">
                <span className="text-[10px] uppercase font-bold text-[#6E6B62] block">Governance Frameworks</span>
                <span className="font-semibold text-[#8C6B1B] block mt-1">{impactData.regulations.join(', ') || 'GDPR'}</span>
              </div>
              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E6E2D8]">
                <span className="text-[10px] uppercase font-bold text-[#6E6B62] block">Security Controls</span>
                <span className="font-semibold text-[#2E7D32] block mt-1">{impactData.controls.join(', ') || 'AES-256'}</span>
              </div>
              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E6E2D8]">
                <span className="text-[10px] uppercase font-bold text-[#6E6B62] block">Risk Rating</span>
                <span className="font-bold text-[#D32F2F] block mt-1">{impactData.riskLevel || 'HIGH'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowImpactModal(false)}
                className="px-4 py-2 bg-[#1A1918] text-white text-xs font-semibold rounded-lg"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

