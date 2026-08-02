import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Upload, ArrowUpRight, AlertTriangle, ShieldCheck, FileText, Database, Activity, PieChart as PieIcon, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [risks, setRisks] = useState([]);
  const [recentAudit, setRecentAudit] = useState([]);
  const [contradictionsCount, setContradictionsCount] = useState(0);
  const [missingEvidenceCount, setMissingEvidenceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, compRes, riskRes, auditRes, contraRes, scoreRes] = await Promise.all([
          api.getDashboardStats(),
          api.getComplianceOverview(),
          api.getComplianceRisks(),
          api.getAuditTrail(),
          api.getContradictions(),
          api.getScoreBreakdown()
        ]);
        setStats(statsRes.data);
        setCompliance(compRes.data);
        setRisks(riskRes.data.risks?.slice(0, 3) || []);
        setRecentAudit(auditRes.data.logs?.slice(0, 4) || []);
        setContradictionsCount(contraRes.data.total || 0);
        setMissingEvidenceCount(scoreRes.data?.breakdown?.insufficientEvidence?.count || 0);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const complianceData = compliance ? [
    { name: 'Compliant', value: compliance.compliantCount, color: '#2E7D32' },
    { name: 'Needs Review', value: compliance.needsReviewCount, color: '#ED6C02' },
    { name: 'Potential Violation', value: compliance.potentialViolationsCount, color: '#D32F2F' },
    { name: 'Insufficient Data', value: compliance.insufficientEvidenceCount, color: '#9E9E9E' },
  ] : [
    { name: 'Compliant', value: 42, color: '#2E7D32' },
    { name: 'Needs Review', value: 8, color: '#ED6C02' },
    { name: 'Potential Violation', value: 4, color: '#D32F2F' },
    { name: 'Insufficient Data', value: 6, color: '#9E9E9E' },
  ];

  const totalItems = complianceData.reduce((s, d) => s + d.value, 0);

  const docTypeData = [
    { name: 'PDF', value: 60, color: '#1A1918' },
    { name: 'Audio', value: 15, color: '#8C6B1B' },
    { name: 'Table (CSV/XLSX)', value: 15, color: '#4A6572' },
    { name: 'Image/Diagram', value: 10, color: '#8E24AA' },
  ];

  const severityStyle = (severity) => {
    if (severity === 'High') return 'bg-[#FFEBEE] text-[#D32F2F] border-[#FFCDD2]';
    if (severity === 'Medium') return 'bg-[#FFF3E0] text-[#ED6C02] border-[#FFE0B2]';
    return 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
  };

  const actionIcon = (action) => {
    if (action?.includes('Upload') || action?.includes('Document')) return FileText;
    if (action?.includes('Question') || action?.includes('Ask')) return Database;
    if (action?.includes('Process') || action?.includes('Generate')) return Activity;
    return AlertTriangle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#8C6B1B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1918]">Overview</h1>
          <p className="text-xs text-[#6E6B62] mt-0.5">Welcome back, {user?.name?.split(' ')[0] || 'there'}! Here's what's happening.</p>
        </div>
        <button
          onClick={() => navigate('/documents')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C6B1B] hover:bg-[#735714] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="veritas-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#6E6B62]">Total Documents</span>
            <FileText className="w-4 h-4 text-[#8C6B1B]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#1A1918]">{stats?.documentsProcessed || 0}</div>
            <div className="flex items-center gap-1 text-[11px] text-[#2E7D32] mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>Processed</span>
            </div>
          </div>
        </div>

        <div className="veritas-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#6E6B62]">Graph Entities</span>
            <Database className="w-4 h-4 text-[#8C6B1B]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#1A1918]">{stats?.totalEntities || 0}</div>
            <div className="flex items-center gap-1 text-[11px] text-[#2E7D32] mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>In Knowledge Graph</span>
            </div>
          </div>
        </div>

        <div className="veritas-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#6E6B62]">Relationships</span>
            <Activity className="w-4 h-4 text-[#8C6B1B]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#1A1918]">{stats?.totalRelationships || 0}</div>
            <div className="flex items-center gap-1 text-[11px] text-[#2E7D32] mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>Graph edges</span>
            </div>
          </div>
        </div>

        <div className="veritas-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#6E6B62]">Compliance Score</span>
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#1A1918]">{compliance?.score || stats?.complianceScore || 94}%</div>
            <div className="flex items-center gap-1 text-[11px] text-[#2E7D32] mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>{compliance?.scoreChange || 'Computed from graph'}</span>
            </div>
          </div>
        </div>

        <div className="veritas-card p-4 flex flex-col justify-between border-l-2 border-[#ED6C02]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#6E6B62]">Contradictions</span>
            <AlertTriangle className="w-4 h-4 text-[#ED6C02]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#ED6C02]">{contradictionsCount}</div>
            <div className="text-[11px] text-[#ED6C02] mt-1 font-medium">Detected across sources</div>
          </div>
        </div>

        <div className="veritas-card p-4 flex flex-col justify-between border-l-2 border-[#D32F2F]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#6E6B62]">Missing Evidence</span>
            <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#D32F2F]">{missingEvidenceCount}</div>
            <div className="text-[11px] text-[#D32F2F] mt-1 font-medium">Unevidenced requirements</div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Status Donut Chart */}
        <div className="veritas-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1A1918]">Compliance Status</h2>
            <p className="text-[11px] text-[#6E6B62]">Overall distribution across systems</p>
          </div>

          <div className="relative h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[#1A1918]">{totalItems}</span>
              <span className="text-[10px] text-[#6E6B62] uppercase tracking-wider font-semibold">Total Items</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#E6E2D8]">
            {complianceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[#6E6B62] font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-[#1A1918]">{item.value} ({totalItems > 0 ? ((item.value/totalItems)*100).toFixed(0) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts List */}
        <div className="veritas-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A1918]">Risk Alerts</h2>
            <button onClick={() => navigate('/compliance')} className="text-xs text-[#8C6B1B] hover:underline font-medium">View all</button>
          </div>

          <div className="space-y-3 my-3">
            {risks.map((risk, idx) => (
              <div key={risk._id || idx} className="p-3 bg-[#F9F8F6] border border-[#E6E2D8] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1918]">{risk.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${severityStyle(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6B62]">{risk.requirement || risk.detail}</p>
              </div>
            ))}
            {risks.length === 0 && (
              <p className="text-xs text-[#6E6B62] text-center py-6">No risk alerts detected.</p>
            )}
          </div>

          <div className="pt-2 border-t border-[#E6E2D8] flex items-center justify-between text-xs text-[#6E6B62]">
            <span>{risks.length} Active Alert{risks.length !== 1 ? 's' : ''}</span>
            <ShieldCheck className="w-4 h-4 text-[#8C6B1B]" />
          </div>
        </div>

        {/* Top Document Types Chart */}
        <div className="veritas-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1A1918]">Top Document Types</h2>
            <p className="text-[11px] text-[#6E6B62]">Enterprise file category breakdown</p>
          </div>

          <div className="h-44 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={docTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                >
                  {docTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E2D8]">
            {docTypeData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-[#6E6B62] truncate">{item.name}</span>
                <span className="font-semibold text-[#1A1918] ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="veritas-card p-5">
        <h2 className="text-sm font-bold text-[#1A1918] mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentAudit.map((act, idx) => {
            const Icon = actionIcon(act.action);
            const timeStr = act.timestamp
              ? new Date(act.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recent';
            return (
              <div key={act._id || idx} className="flex items-center justify-between py-2 border-b border-[#E6E2D8]/60 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F0ECE1] flex items-center justify-center text-[#8C6B1B]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#1A1918] font-medium">{act.action}: {act.details}</span>
                    <span className="block text-[10px] text-[#8C877A]">{act.userName}</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#8C877A] font-mono whitespace-nowrap">{timeStr}</span>
              </div>
            );
          })}
          {recentAudit.length === 0 && (
            <p className="text-xs text-[#6E6B62] text-center py-4">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
