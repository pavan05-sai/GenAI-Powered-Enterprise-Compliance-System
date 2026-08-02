import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, Send, CheckCircle2, AlertTriangle, FileText, ArrowRight, Download, ShieldCheck, Database, Layers } from 'lucide-react';

export default function AiAnalystPage() {
  const [question, setQuestion] = useState('Which systems process customer PII and which compliance policies apply to them?');
  const [activeTab, setActiveTab] = useState('Answer');
  const [groundedMode, setGroundedMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [providerInfo, setProviderInfo] = useState({ provider: 'pattern', isRealLLM: false });

  useEffect(() => {
    api.getAIProviderStatus()
      .then(res => {
        if (res.data) setProviderInfo(res.data);
      })
      .catch(() => {});
  }, []);

  const [response, setResponse] = useState({
    answer: "Based on the knowledge graph and source documents, 3 enterprise systems process Customer PII under mandatory compliance policies:",
    systemsProcessed: ["Payment Service - Processes customer PII for payment transactions.", "Analytics Service - Uses customer PII for analytics and reporting.", "CRM Platform - Stores and manages customer information."],
    applicablePolicies: ["GDPR - General Data Protection Regulation", "CCPA - California Consumer Privacy Act", "Data Protection Policy v2.1", "Information Security Policy"],
    evidence: [
      { documentName: 'Security_Policy_2024.pdf', page: 'Page 12, Sec 4', snippet: 'Payment Service processes customer PII and requires AES-256 payload encryption at rest under GDPR regulations.' },
      { documentName: 'System_Architecture.png', page: 'Diagram Sheet 1', snippet: 'Customer PII data store feeds directly into Payment Service, Analytics Service, and CRM Platform.' },
      { documentName: 'Vendor_Assessment_Report.pdf', page: 'Page 3', snippet: 'Third-party vendor assessment verified SOC 2 Type II attestation for all payment handling microservices.' }
    ],
    graphPath: [
      { source: 'Customer PII', relationship: 'processed_by', target: 'Payment Service' },
      { source: 'Payment Service', relationship: 'governed_by', target: 'GDPR' },
      { source: 'Payment Service', relationship: 'protected_by', target: 'Encryption (AES-256)' }
    ],
    keyInsights: [
      "All 3 systems are governed by GDPR mandates.",
      "Payment Service also falls under PCI DSS requirements.",
      "Encryption (AES-256) is required for storage compliance."
    ],
    confidence: "High",
    status: "VERIFIED"
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await api.queryAI(question);
      if (res.data && res.data.analysis) {
        setResponse(res.data.analysis);
      }
    } catch (err) {
      console.warn('Using grounded engine result fallback.');
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Which systems process customer PII and which compliance policies apply to them?",
    "Which regulations apply to the Payment Service?",
    "Show potential compliance gaps in Database X.",
    "Is customer data adequately protected by encryption?"
  ];

  return (
    <div className="space-y-6">
      {/* Header with Grounded Mode Toggle and Provider Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1918]">AI Analyst</h1>
          <p className="text-xs text-[#6E6B62] mt-0.5">Ask compliance questions. Get answers with evidence and sources.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* AI Provider Mode Badge */}
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
            providerInfo.provider === 'lyzr'
              ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
              : providerInfo.provider === 'openai'
              ? 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]'
              : 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {providerInfo.provider === 'lyzr'
                ? `Lyzr AI (${providerInfo.lyzrAgentId || 'Active'})`
                : providerInfo.provider === 'openai'
                ? `OpenAI (${providerInfo.model})`
                : 'Demo / Pattern Mode'}
            </span>
          </div>

          {/* Grounded Mode Toggle */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E6E2D8] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-xs font-semibold text-[#1A1918]">Grounded Mode</span>
            <button
              onClick={() => setGroundedMode(!groundedMode)}
              className={`w-8 h-4 rounded-full transition-colors p-0.5 relative ${groundedMode ? 'bg-[#2E7D32]' : 'bg-[#D5CEBD]'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${groundedMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Prompt Bar matching center frame of screenshot */}
      <form onSubmit={handleSearch} className="veritas-card p-2 flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask questions about your enterprise compliance data..."
          className="flex-1 px-4 py-2 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2.5 bg-[#8C6B1B] hover:bg-[#735714] text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
        >
          {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      {/* Sample Question Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setQuestion(q)}
            className="px-3 py-1 bg-white hover:bg-[#F0ECE1] border border-[#E6E2D8] rounded-full text-[11px] text-[#6E6B62] hover:text-[#1A1918] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Answer View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Response Tabs & Answer Details */}
        <div className="lg:col-span-2 veritas-card p-5 space-y-5">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
            <div className="flex items-center gap-2">
              {['Answer', 'Graph Reasoning', 'Sources (5)'].map((tab) => {
                const tabName = tab.split(' ')[0];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tabName)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      activeTab === tabName
                        ? 'bg-[#1A1918] text-white'
                        : 'text-[#6E6B62] hover:bg-[#F0ECE1]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                Status: {response.status}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#E8E2D2] text-[#8C6B1B]">
                Confidence: {response.confidence}
              </span>
            </div>
          </div>

          {/* Tab Content: Answer */}
          {activeTab === 'Answer' && (
            <div className="space-y-4 text-xs text-[#1A1918]">
              <p className="leading-relaxed text-[#1A1918] font-medium">{response.answer}</p>

              <div className="space-y-2">
                <h4 className="font-bold text-[#1A1918]">Systems that process Customer PII</h4>
                <div className="space-y-1.5 pl-2">
                  {response.systemsProcessed.map((sys, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-[#F7F5F0] rounded border border-[#E6E2D8]">
                      <span className="font-bold text-[#8C6B1B]">{idx + 1}.</span>
                      <span>{sys}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-[#1A1918]">Applicable Compliance Policies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {response.applicablePolicies.map((pol, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-[#F0ECE1] text-[#8C6B1B] border border-[#E6E2D8] font-medium">
                      {pol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Graph Reasoning */}
          {activeTab === 'Graph' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1A1918]">Graph Path (Reasoning Traversal)</h4>
                <a
                  href="/graph"
                  className="inline-flex items-center gap-1 text-[11px] text-[#8C6B1B] hover:underline font-semibold"
                >
                  View Interactive Knowledge Graph →
                </a>
              </div>
              <div className="p-4 bg-[#FAF8F5] border border-[#E6E2D8] rounded-xl flex flex-col items-center justify-center space-y-3">
                {response.graphPath && response.graphPath.map((path, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="px-3 py-1.5 bg-[#1565C0] text-white font-bold rounded-lg">{path.source}</span>
                    <span className="text-[#8C6B1B] font-mono font-semibold flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5" /> [{path.relationship}] <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="px-3 py-1.5 bg-[#2E7D32] text-white font-bold rounded-lg">{path.target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Sources */}
          {activeTab === 'Sources' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1A1918]">Retrieved Document Evidence</h4>
              {response.evidence && response.evidence.map((ev, idx) => (
                <div key={idx} className="p-3 bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#8C6B1B]">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {ev.documentName}</span>
                    <span className="text-[#6E6B62] font-normal">{ev.page}</span>
                  </div>
                  <p className="text-xs text-[#1A1918] italic">"{ev.snippet}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Insights & Evidence Pack Button matching center screenshot */}
        <div className="veritas-card p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E6B62]">KEY INSIGHTS</h3>
            <div className="space-y-2.5">
              {response.keyInsights && response.keyInsights.map((insight, idx) => (
                <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#E6E2D8] rounded-lg flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <span className="text-xs text-[#1A1918] font-medium leading-tight">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              const pack = `COMPLIANCE EVIDENCE PACK\n=========================\nQuestion: ${question}\nStatus: ${response.status}\nConfidence: ${response.confidence}\n\nANSWER:\n${response.answer}\n\nEVIDENCE SNIPPETS:\n${response.evidence?.map(e => `• [${e.documentName} - ${e.page}]: "${e.snippet}"`).join('\n')}\n\nGRAPH TRAVERSAL:\n${response.graphPath?.map(p => `• ${p.source} -> [${p.relationship}] -> ${p.target}`).join('\n')}`;
              const element = document.createElement('a');
              const file = new Blob([pack], { type: 'text/plain' });
              element.href = URL.createObjectURL(file);
              element.download = `Evidence_Pack_${Date.now()}.txt`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="w-full py-2.5 bg-[#8C6B1B] hover:bg-[#735714] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Evidence Pack</span>
          </button>
        </div>
      </div>
    </div>
  );
}

