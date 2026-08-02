import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, FileText, PieChart as PieIcon, Download, Sparkles, X, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ReportModal from '../components/ReportModal';

export default function CompliancePage() {
  const [risks, setRisks] = useState([]);
  const [contradictions, setContradictions] = useState([]);
  const [scoreBreakdown, setScoreBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [systemFilter, setSystemFilter] = useState('All');
  const [regulationFilter, setRegulationFilter] = useState('All');

  const categoryData = [
    { name: 'Data Security', value: 40, color: '#1A1918' },
    { name: 'Access Control', value: 25, color: '#8C6B1B' },
    { name: 'Data Retention', value: 15, color: '#4A6572' },
    { name: 'Data Governance', value: 20, color: '#2E7D32' },
  ];

  const frameworks = [
    { name: 'GDPR', score: 95 },
    { name: 'CCPA', score: 92 },
    { name: 'ISO 27001', score: 90 },
    { name: 'PCI-DSS', score: 98 }
  ];

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [riskRes, contraRes, scoreRes] = await Promise.all([
          api.getComplianceRisks(),
          api.getContradictions(),
          api.getScoreBreakdown()
        ]);
        setRisks(riskRes.data.risks || []);
        setContradictions(contraRes.data.contradictions || []);
        setScoreBreakdown(scoreRes.data);
      } catch (err) {
        console.warn('Failed loading compliance data.');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await api.generateComplianceReport();
      setReportData(res.data.report);
      setShowReportModal(true);
    } catch (err) {
      console.error('Failed generating report:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Derive unique systems and regulations from loaded risks for filter dropdowns
  const uniqueSystems = ['All', ...new Set(risks.map(r => r.system).filter(Boolean))];
  const uniqueRegulations = ['All', 'GDPR', 'CCPA', 'PCI-DSS', 'ISO 27001', 'SOC 2'];

  const filteredRisks = risks.filter(r => {
    const matchSeverity = severityFilter === 'All' || r.severity === severityFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchSystem = systemFilter === 'All' || r.system === systemFilter;
    const matchReg = regulationFilter === 'All' || (r.regulation && r.regulation.includes(regulationFilter));
    return matchSeverity && matchStatus && matchSystem && matchReg;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1918]">Compliance</h1>
          <p className="text-xs text-[#6E6B62] mt-0.5">Monitor compliance status, claim contradictions, and risk items across all systems.</p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generatingReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C6B1B] hover:bg-[#735714] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 self-start sm:self-auto"
        >
          {generatingReport ? <Sparkles className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          <span>{generatingReport ? 'Generating Report...' : 'Generate Audit Report'}</span>
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="veritas-card p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#6E6B62]">Compliant</span>
          <div className="text-3xl font-bold text-[#2E7D32] mt-2">42</div>
        </div>

        <div className="veritas-card p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#6E6B62]">Needs Review</span>
          <div className="text-3xl font-bold text-[#ED6C02] mt-2">8</div>
        </div>

        <div className="veritas-card p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#6E6B62]">Potential Violations</span>
          <div className="text-3xl font-bold text-[#D32F2F] mt-2">4</div>
        </div>

        <div
          onClick={() => setShowScoreModal(true)}
          className="veritas-card p-4 flex flex-col justify-between cursor-pointer hover:border-[#C59B27] transition-all group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-[#6E6B62]">Overall Score</span>
            <Info className="w-3.5 h-3.5 text-[#8C6B1B] opacity-70 group-hover:opacity-100" />
          </div>
          <div className="text-3xl font-bold text-[#1A1918] mt-2">
            {scoreBreakdown?.score || 94.2}%
          </div>
          <span className="text-[10px] text-[#8C6B1B] font-semibold mt-1">Click to view score calculation →</span>
        </div>
      </div>

      {/* Grid: Risk Overview Table & Risk by Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Overview Table */}
        <div className="lg:col-span-2 veritas-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#1A1918]">Risk Overview</h2>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2 py-1 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
              >
                <option value="All">All Severity</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
              >
                <option value="All">All Status</option>
                <option value="Needs Review">Needs Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="POTENTIAL_RISK">Potential Risk</option>
              </select>
              <select
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value)}
                className="px-2 py-1 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
              >
                {uniqueSystems.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Systems' : s}</option>
                ))}
              </select>
              <select
                value={regulationFilter}
                onChange={(e) => setRegulationFilter(e.target.value)}
                className="px-2 py-1 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
              >
                {uniqueRegulations.map(r => (
                  <option key={r} value={r}>{r === 'All' ? 'All Regulations' : r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A1918]">
              <thead className="bg-[#F7F5F0] border-b border-[#E6E2D8] text-[10px] text-[#6E6B62] font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5">Risk</th>
                  <th className="px-3 py-2.5">Requirement</th>
                  <th className="px-3 py-2.5">Severity</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E2D8]">
                {filteredRisks.map((risk) => (
                  <tr key={risk._id} className="hover:bg-[#F9F8F6]">
                    <td className="px-3 py-3">
                      <div className="font-bold text-[#1A1918]">{risk.title}</div>
                      <div className="text-[11px] text-[#6E6B62]">{risk.system}</div>
                    </td>
                    <td className="px-3 py-3 text-[#6E6B62]">{risk.requirement}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        risk.severity === 'High' ? 'bg-[#FFEBEE] text-[#D32F2F]' :
                        risk.severity === 'Medium' ? 'bg-[#FFF3E0] text-[#ED6C02]' : 'bg-[#E8F5E9] text-[#2E7D32]'
                      }`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button className="text-xs font-semibold text-[#8C6B1B] hover:underline">
                        Review Evidence
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-xs text-[#6E6B62]">
                      No risks match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk by Category Pie Chart */}
        <div className="veritas-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1A1918]">Risk by Category</h2>
            <p className="text-[11px] text-[#6E6B62]">Distribution across domain areas</p>
          </div>

          <div className="h-44 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#E6E2D8]">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[#6E6B62] font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-[#1A1918]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claim Contradictions Section */}
      <div className="veritas-card p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-[#1A1918]">Detected Claim Contradictions</h2>
            <p className="text-[11px] text-[#6E6B62]">Conflicting claims detected across uploaded enterprise sources</p>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#FFEBEE] text-[#D32F2F]">
            {contradictions.length} Contradictions Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contradictions.map((contra, idx) => (
            <div key={contra._id || idx} className="p-4 bg-[#FAF8F5] border border-[#FFE0B2] rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#1A1918] text-xs">Entity: {contra.entityName}</span>
                <span className="text-[10px] font-bold text-[#D32F2F] bg-[#FFEBEE] px-2 py-0.5 rounded uppercase">
                  {contra.severity} Severity
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-[#E6E2D8] space-y-1">
                  <span className="text-[10px] font-bold text-[#8C6B1B] block">Source 1: {contra.source1?.documentName}</span>
                  <p className="text-[#1A1918] text-[11px] font-medium">"{contra.source1?.claim}"</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-[#E6E2D8] space-y-1">
                  <span className="text-[10px] font-bold text-[#8C6B1B] block">Source 2: {contra.source2?.documentName}</span>
                  <p className="text-[#1A1918] text-[11px] font-medium">"{contra.source2?.claim}"</p>
                </div>
              </div>

              <p className="text-[11px] text-[#6E6B62] italic">Recommendation: {contra.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Frameworks Section */}
      <div className="veritas-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#1A1918]">Compliance Frameworks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {frameworks.map((fw) => (
            <div key={fw.name} className="p-4 bg-[#FAF8F5] border border-[#E6E2D8] rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#1A1918]">{fw.name}</span>
                <span className="text-[#8C6B1B]">{fw.score}%</span>
              </div>
              <div className="w-full bg-[#E6E2D8] h-2 rounded-full overflow-hidden">
                <div className="bg-[#8C6B1B] h-full rounded-full transition-all duration-500" style={{ width: `${fw.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Score Calculation Modal */}
      {showScoreModal && scoreBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6E2D8] max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start border-b border-[#E6E2D8] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C6B1B] tracking-wider">Transparent Calculation Engine</span>
                <h2 className="font-serif text-xl font-bold text-[#1A1918] mt-0.5">Compliance Score Breakdown</h2>
              </div>
              <button onClick={() => setShowScoreModal(false)} className="text-[#6E6B62] hover:text-[#1A1918]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E6E2D8] rounded-xl text-center">
              <span className="text-xs text-[#6E6B62] font-semibold block">Calculated Overall Score</span>
              <div className="text-4xl font-bold text-[#1A1918] my-1">{scoreBreakdown.score}%</div>
              <p className="text-[11px] text-[#8C6B1B] font-mono">{scoreBreakdown.calculationFormula}</p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[#1A1918] uppercase tracking-wider text-[10px]">Evaluation Components</h4>
              {Object.entries(scoreBreakdown.breakdown || {}).map(([key, item]) => (
                <div key={key} className="flex justify-between items-center p-2.5 bg-[#F7F5F0] rounded-lg border border-[#E6E2D8]">
                  <div>
                    <span className="font-semibold text-[#1A1918] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="block text-[10px] text-[#6E6B62]">{item.weight}</span>
                  </div>
                  <span className="font-bold text-[#8C6B1B]">{item.count} items ({item.percentage}%)</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowScoreModal(false)}
                className="px-4 py-2 bg-[#1A1918] text-white text-xs font-semibold rounded-lg"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Report Modal */}
      {showReportModal && (
        <ReportModal report={reportData} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}

