import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Upload, FileText, Music, Table as TableIcon, Image as ImageIcon, CheckCircle, AlertCircle, Clock, X, Eye, Trash2, Search, Loader2, Sparkles, History, GitBranch, ShieldAlert, Plus, Minus, RefreshCw } from 'lucide-react';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docTab, setDocTab] = useState('overview');
  const [versionHistory, setVersionHistory] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments({
        type: activeTab,
        status: statusFilter,
        search: searchQuery
      });
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.warn('Failed to load documents.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activeTab, statusFilter, searchQuery]);

  const counts = {
    All: documents.length,
    PDF: documents.filter(d => d.fileType === 'PDF').length,
    Audio: documents.filter(d => d.fileType === 'Audio').length,
    Table: documents.filter(d => d.fileType === 'Table').length,
    Image: documents.filter(d => d.fileType === 'Image').length,
  };

  const tabs = [
    { label: `All (${counts.All})`, value: 'All' },
    { label: `PDF (${counts.PDF})`, value: 'PDF' },
    { label: `Audio (${counts.Audio})`, value: 'Audio' },
    { label: `Table (${counts.Table})`, value: 'Table' },
    { label: `Images/Diagrams (${counts.Image})`, value: 'Image' },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Document Processing Agent parsing file & extracting content...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => setUploadProgress('Entity & Relationship Agent running LLM extraction...'), 1200);
      setTimeout(() => setUploadProgress('Knowledge Graph Agent syncing Neo4j nodes & edges...'), 2400);

      const res = await api.uploadDocument(formData);
      setTimeout(() => {
        setUploading(false);
        setShowUploadModal(false);
        fetchDocs();
      }, 3000);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(id);
      fetchDocs();
      if (selectedDoc && selectedDoc._id === id) setSelectedDoc(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleView = async (id) => {
    setDocTab('overview');
    setVersionHistory([]);
    try {
      const res = await api.getDocumentById(id);
      setSelectedDoc(res.data.document);
    } catch (err) {
      const found = documents.find(d => d._id === id);
      if (found) setSelectedDoc(found);
    }
  };

  const fetchVersionHistory = async (id) => {
    setVersionsLoading(true);
    try {
      const res = await api.getDocumentVersions(id);
      setVersionHistory(res.data.versions || []);
    } catch (err) {
      console.warn('Failed to load version history.');
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleDocTabChange = (tab) => {
    setDocTab(tab);
    if (tab === 'versions' && selectedDoc && versionHistory.length === 0) {
      fetchVersionHistory(selectedDoc._id);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'PDF': return <FileText className="w-4 h-4 text-[#D32F2F]" />;
      case 'Audio': return <Music className="w-4 h-4 text-[#8C6B1B]" />;
      case 'Table': return <TableIcon className="w-4 h-4 text-[#2E7D32]" />;
      case 'Image': return <ImageIcon className="w-4 h-4 text-[#8E24AA]" />;
      default: return <FileText className="w-4 h-4 text-[#1A1918]" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'Processed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-medium">
            <CheckCircle className="w-3 h-3" /> Processed
          </span>
        );
      case 'PROCESSING':
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#FFF3E0] text-[#ED6C02] border border-[#FFE0B2] font-medium">
            <Clock className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case 'FAILED':
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#FFEBEE] text-[#D32F2F] border border-[#FFCDD2] font-medium">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return <span className="text-xs text-[#6E6B62]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1918]">Documents</h1>
          <p className="text-xs text-[#6E6B62] mt-0.5">Upload, manage and track all your compliance documents.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C6B1B] hover:bg-[#735714] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Tabs Bar */}
      <div className="veritas-card p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E6E2D8] pb-3">
          {/* File Type Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === tab.value
                    ? 'bg-[#1A1918] text-white shadow-sm'
                    : 'text-[#6E6B62] hover:bg-[#F7F5F0] hover:text-[#1A1918]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-3">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877A]" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
            >
              <option value="All Status">All Status</option>
              <option value="COMPLETED">Processed</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Documents Table matching screenshot */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#8C6B1B] animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6E2D8] text-[11px] uppercase font-bold text-[#6E6B62] tracking-wider">
                  <th className="py-2.5 px-3">Filename</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Entities</th>
                  <th className="py-2.5 px-3">Date Uploaded</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E2D8]/60 text-xs">
                {documents.map((doc) => {
                  const dateStr = doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'May 24, 2024';
                  return (
                    <tr key={doc._id} className="hover:bg-[#FAF8F5] transition-colors group">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {getFileIcon(doc.fileType)}
                          <div>
                            <span className="font-semibold text-[#1A1918] block truncate max-w-xs">{doc.title}</span>
                            <span className="text-[10px] text-[#8C877A]">{doc.fileSize}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-[#6E6B62]">{doc.fileType}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-[#6E6B62]">{doc.sourceCategory || 'Internal'}</span>
                      </td>
                      <td className="py-3 px-3">
                        {getStatusBadge(doc.processingStatus)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#1A1918]">{doc.entitiesExtracted || 0}</span>
                        <span className="text-[10px] text-[#8C877A] block">nodes</span>
                      </td>
                      <td className="py-3 px-3 text-[#6E6B62]">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(doc._id)}
                            className="p-1 text-[#6E6B62] hover:text-[#8C6B1B] transition-colors"
                            title="View extracted text & entities"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="p-1 text-[#6E6B62] hover:text-[#D32F2F] transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-[#6E6B62]">
                      No compliance documents found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Document Details Modal — Tabbed */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6E2D8] max-w-2xl w-full shadow-xl max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#E6E2D8] px-6 py-4 flex-shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C6B1B] tracking-wider">Document Inspection</span>
                <h2 className="font-serif text-lg font-bold text-[#1A1918] mt-0.5 max-w-sm truncate">{selectedDoc.title}</h2>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 text-[#6E6B62] hover:text-[#1A1918] ml-4 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Strip */}
            <div className="grid grid-cols-4 gap-3 bg-[#F7F5F0] px-6 py-3 border-b border-[#E6E2D8] text-xs flex-shrink-0">
              <div>
                <span className="text-[10px] text-[#6E6B62] block">File Type</span>
                <span className="font-semibold text-[#1A1918]">{selectedDoc.fileType || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E6B62] block">Entities</span>
                <span className="font-semibold text-[#2E7D32]">{selectedDoc.entitiesExtracted || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E6B62] block">Relationships</span>
                <span className="font-semibold text-[#8C6B1B]">{selectedDoc.relationshipsExtracted || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E6B62] block">Status</span>
                <span className="font-semibold text-[#1A1918]">{selectedDoc.processingStatus || '—'}</span>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-[#E6E2D8] px-6 flex-shrink-0">
              {[
                { key: 'overview', label: 'Overview', icon: FileText },
                { key: 'versions', label: 'Version History', icon: History },
                { key: 'risks', label: 'Risks', icon: ShieldAlert },
                { key: 'changes', label: 'Change Diff', icon: GitBranch },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleDocTabChange(key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all mr-1 ${
                    docTab === key
                      ? 'border-[#8C6B1B] text-[#8C6B1B]'
                      : 'border-transparent text-[#6E6B62] hover:text-[#1A1918]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* OVERVIEW TAB */}
              {docTab === 'overview' && (
                <>
                  <div>
                    <h3 className="text-xs font-bold text-[#1A1918] mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8C6B1B]" />
                      Extracted Text Content
                    </h3>
                    <div className="p-3 bg-[#FAF8F5] border border-[#E6E2D8] rounded-lg text-xs text-[#1A1918] font-mono leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                      {selectedDoc.extractedText || 'No text content extracted from this document.'}
                    </div>
                  </div>

                  {selectedDoc.extractedEntities && selectedDoc.extractedEntities.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-[#1A1918] mb-2">Extracted Entities</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.extractedEntities.slice(0, 20).map((ent, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#F0ECE1] text-[#8C6B1B] text-[11px] rounded font-medium border border-[#E6E2D8]">
                            {typeof ent === 'string' ? ent : ent.name}
                          </span>
                        ))}
                        {selectedDoc.extractedEntities.length > 20 && (
                          <span className="px-2 py-0.5 bg-[#F7F5F0] text-[#6E6B62] text-[11px] rounded font-medium">
                            +{selectedDoc.extractedEntities.length - 20} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E6E2D8]">
                      <span className="text-[10px] text-[#6E6B62] block">Source Category</span>
                      <span className="font-semibold text-[#1A1918]">{selectedDoc.sourceCategory || 'Internal'}</span>
                    </div>
                    <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E6E2D8]">
                      <span className="text-[10px] text-[#6E6B62] block">File Size</span>
                      <span className="font-semibold text-[#1A1918]">{selectedDoc.fileSize || '—'}</span>
                    </div>
                    <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E6E2D8]">
                      <span className="text-[10px] text-[#6E6B62] block">Risk Level</span>
                      <span className={`font-semibold ${
                        selectedDoc.riskLevel === 'high' || selectedDoc.riskLevel === 'critical' ? 'text-[#D32F2F]' :
                        selectedDoc.riskLevel === 'medium' ? 'text-[#ED6C02]' : 'text-[#2E7D32]'
                      }`}>{selectedDoc.riskLevel ? selectedDoc.riskLevel.toUpperCase() : 'LOW'}</span>
                    </div>
                    <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E6E2D8]">
                      <span className="text-[10px] text-[#6E6B62] block">Document Version</span>
                      <span className="font-semibold text-[#1A1918]">v{selectedDoc.version || 1}</span>
                    </div>
                  </div>
                </>
              )}

              {/* VERSION HISTORY TAB */}
              {docTab === 'versions' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#1A1918]">Document Version History</h3>
                    <button
                      onClick={() => fetchVersionHistory(selectedDoc._id)}
                      className="flex items-center gap-1 text-[11px] text-[#8C6B1B] hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>

                  {versionsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#8C6B1B] animate-spin" />
                    </div>
                  ) : versionHistory.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <History className="w-8 h-8 text-[#E6E2D8] mx-auto" />
                      <p className="text-xs text-[#6E6B62]">No previous versions found. Upload a new version of this document to track changes.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Current version indicator */}
                      <div className="flex items-center gap-3 p-3 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg">
                        <CheckCircle className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                        <div className="text-xs">
                          <span className="font-bold text-[#2E7D32] block">Current Version (v{selectedDoc.version || 1})</span>
                          <span className="text-[#2E7D32]">{selectedDoc.processingStatus} — {selectedDoc.entitiesExtracted || 0} entities extracted</span>
                        </div>
                      </div>

                      {/* Previous versions */}
                      {versionHistory.map((ver, idx) => (
                        <div key={idx} className="p-4 bg-[#FAF8F5] border border-[#E6E2D8] rounded-xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-[#1A1918]">Version {ver.versionNumber || idx + 1}</span>
                              <span className="block text-[11px] text-[#6E6B62] mt-0.5">{ver.documentName}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              ver.impactLevel === 'High' ? 'bg-[#FFEBEE] text-[#D32F2F]' :
                              ver.impactLevel === 'Medium' ? 'bg-[#FFF3E0] text-[#ED6C02]' : 'bg-[#E8F5E9] text-[#2E7D32]'
                            }`}>{ver.impactLevel} Impact</span>
                          </div>

                          <p className="text-[11px] text-[#1A1918] bg-white p-2.5 rounded-lg border border-[#E6E2D8] italic">
                            {ver.changeSummary}
                          </p>

                          {/* Changed Entities Diff */}
                          {ver.changedEntities && ver.changedEntities.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-[#6E6B62] uppercase tracking-wider">Entity Changes</span>
                              {ver.changedEntities.map((ent, eIdx) => (
                                <div key={eIdx} className="flex items-start gap-2 text-xs">
                                  {ent.changeType === 'ADDED' && <Plus className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5 flex-shrink-0" />}
                                  {ent.changeType === 'REMOVED' && <Minus className="w-3.5 h-3.5 text-[#D32F2F] mt-0.5 flex-shrink-0" />}
                                  {ent.changeType === 'MODIFIED' && <RefreshCw className="w-3.5 h-3.5 text-[#ED6C02] mt-0.5 flex-shrink-0" />}
                                  <div>
                                    <span className={`font-semibold ${
                                      ent.changeType === 'ADDED' ? 'text-[#2E7D32]' :
                                      ent.changeType === 'REMOVED' ? 'text-[#D32F2F]' : 'text-[#ED6C02]'
                                    }`}>{ent.entityName}</span>
                                    {ent.oldValue && ent.newValue && (
                                      <span className="text-[#6E6B62] ml-1">
                                        <span className="line-through">{ent.oldValue}</span>
                                        <span className="mx-1">→</span>
                                        <span className="font-medium text-[#1A1918]">{ent.newValue}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Impact stats */}
                          <div className="flex gap-3 text-[11px]">
                            {ver.affectedSystemsCount > 0 && (
                              <span className="px-2 py-0.5 bg-[#FFF3E0] text-[#ED6C02] rounded font-semibold">
                                {ver.affectedSystemsCount} systems affected
                              </span>
                            )}
                            {ver.affectedControlsCount > 0 && (
                              <span className="px-2 py-0.5 bg-[#FFEBEE] text-[#D32F2F] rounded font-semibold">
                                {ver.affectedControlsCount} controls affected
                              </span>
                            )}
                          </div>

                          {/* Changed Relationships */}
                          {ver.changedRelationships && ver.changedRelationships.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#6E6B62] uppercase tracking-wider">Relationship Changes</span>
                              {ver.changedRelationships.map((rel, rIdx) => (
                                <div key={rIdx} className="text-[11px] text-[#6E6B62] flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  <span className="font-medium text-[#1A1918]">{rel.source}</span>
                                  <span className="font-mono text-[#8C6B1B]">{rel.relationship}</span>
                                  <span className="font-medium text-[#1A1918]">{rel.target}</span>
                                  <span className={`ml-1 text-[10px] uppercase font-bold ${
                                    rel.changeType === 'ADDED' ? 'text-[#2E7D32]' : 'text-[#D32F2F]'
                                  }`}>({rel.changeType})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RISKS TAB */}
              {docTab === 'risks' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#1A1918]">Document-Specific Risks</h3>
                  {selectedDoc.riskLevel && selectedDoc.riskLevel !== 'low' ? (
                    <div className="p-4 bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#D32F2F]" />
                        <span className="text-xs font-bold text-[#D32F2F] uppercase">{selectedDoc.riskLevel} Risk Detected</span>
                      </div>
                      <p className="text-xs text-[#1A1918]">
                        This document has been flagged as {selectedDoc.riskLevel} risk. Review the extracted entities and relationships in the Knowledge Graph for detailed risk tracing.
                      </p>
                      <div className="flex gap-2 pt-1">
                        {selectedDoc.hasContradictions && (
                          <span className="px-2 py-0.5 bg-[#D32F2F] text-white text-[10px] font-bold rounded">Contradictions</span>
                        )}
                        {selectedDoc.processingStatus === 'COMPLETED' && (
                          <span className="px-2 py-0.5 bg-[#ED6C02] text-white text-[10px] font-bold rounded">Needs Review</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-2">
                      <CheckCircle className="w-8 h-8 text-[#C8E6C9] mx-auto" />
                      <p className="text-xs text-[#6E6B62]">No high-risk items detected for this document. All extracted controls appear compliant.</p>
                    </div>
                  )}
                </div>
              )}

              {/* CHANGE DIFF TAB */}
              {docTab === 'changes' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#1A1918]">Change Detection Log</h3>
                  {selectedDoc.changesFromPrevious && selectedDoc.changesFromPrevious.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDoc.changesFromPrevious.map((change, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-[#FAF8F5] rounded-lg border border-[#E6E2D8] text-xs">
                          {change.type === 'added' ? <Plus className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5" /> : <Minus className="w-3.5 h-3.5 text-[#D32F2F] mt-0.5" />}
                          <span className="text-[#1A1918]">{change.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-2">
                      <GitBranch className="w-8 h-8 text-[#E6E2D8] mx-auto" />
                      <p className="text-xs text-[#6E6B62]">No changes detected from previous version, or this is the first version of this document.</p>
                      <button
                        onClick={() => handleDocTabChange('versions')}
                        className="text-xs text-[#8C6B1B] underline"
                      >View Version History →</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-[#E6E2D8] flex-shrink-0">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-[#1A1918] hover:bg-[#33312E] text-white text-xs font-semibold rounded-lg"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal matching Lyzr multi-agent processing spec */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6E2D8] max-w-md w-full p-6 shadow-xl space-y-5 text-center">
            <div className="flex justify-between items-center">
              <span className="font-serif text-lg font-bold text-[#1A1918]">Upload Compliance Document</span>
              {!uploading && (
                <button onClick={() => setShowUploadModal(false)} className="text-[#6E6B62] hover:text-[#1A1918]">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {uploading ? (
              <div className="py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#F0ECE1] border-2 border-[#8C6B1B] flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-6 h-6 text-[#8C6B1B]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1A1918]">Lyzr Multi-Agent Pipeline Active</h3>
                  <p className="text-xs text-[#8C6B1B] font-mono font-medium px-4">{uploadProgress}</p>
                </div>
                <div className="w-full bg-[#F7F5F0] rounded-full h-1.5 overflow-hidden border border-[#E6E2D8]">
                  <div className="bg-[#8C6B1B] h-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#E6E2D8] rounded-xl p-8 hover:border-[#C59B27] transition-colors cursor-pointer bg-[#FAF8F5] relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc,.csv,.xlsx,.xls,.mp3,.wav,.png,.jpg,.jpeg,.vsd,.vsdx,.txt,.md"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-[#8C6B1B] mx-auto mb-3" />
                <p className="text-xs font-semibold text-[#1A1918]">Click or drag file to upload</p>
                <p className="text-[11px] text-[#6E6B62] mt-1">Supports PDF, DOCX, CSV/XLSX, MP3, PNG, Visio diagrams (Max 50MB)</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
