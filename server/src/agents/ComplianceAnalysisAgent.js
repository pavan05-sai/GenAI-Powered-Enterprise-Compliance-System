import { llm } from './LLMClient.js';

const COMPLIANCE_SYSTEM_PROMPT = `You are a senior enterprise compliance analyst AI with deep knowledge of GDPR, CCPA, HIPAA, PCI-DSS, ISO 27001, and SOC 2.

You have been given:
1. A user compliance question
2. Graph traversal paths from a Neo4j Knowledge Graph 
3. Evidence snippets extracted from source compliance documents

YOUR STRICT RULES (ZERO-HALLUCINATION POLICY):
- ONLY state facts that are supported by the provided evidence snippets or graph paths
- If evidence is insufficient, respond with Status: INSUFFICIENT_EVIDENCE
- Never invent compliance requirements, system names, or regulatory facts not present in the context
- Clearly distinguish between VERIFIED (direct evidence), POTENTIAL_RISK (implied by graph relationships), and INSUFFICIENT_EVIDENCE
- Every claim must be traceable to the provided evidence

RESPONSE FORMAT (return ONLY valid JSON, no markdown):
{
  "answer": "Direct 2-3 sentence answer to the question based strictly on evidence",
  "systemsProcessed": ["system names if applicable — only those in evidence"],
  "applicablePolicies": ["policy/regulation names if applicable — only those in evidence"],
  "keyInsights": ["bullet insight 1", "bullet insight 2", "bullet insight 3"],
  "confidence": "High | Medium | Low",
  "status": "VERIFIED | POTENTIAL_RISK | INSUFFICIENT_EVIDENCE",
  "reasoning": "1-2 sentences explaining how you reached this conclusion from the evidence"
}`;

export class ComplianceAnalysisAgent {
  constructor() {
    this.name = 'Compliance Analysis Agent';
  }

  /**
   * Analyze retrieved graph context and produce a grounded compliance answer.
   * Zero-hallucination: if no LLM, uses structured rule-based analysis.
   */
  async analyze(question, retrievedContext) {
    console.log(`[${this.name}] Analyzing compliance for: "${question}"`);

    const { graphPaths = [], evidence = [], seedEntities = [] } = retrievedContext;
    const hasEvidence = evidence.length > 0;
    const hasPaths = graphPaths.length > 0;

    // ── Try real LLM analysis ──────────────────────────────────────────────
    if (llm.isRealLLM() && (hasEvidence || hasPaths)) {
      const contextBlock = this._buildContextBlock(question, graphPaths, evidence);
      const rawResponse = await llm.complete(COMPLIANCE_SYSTEM_PROMPT, contextBlock, {
        temperature: 0.1,
        maxTokens: 1500,
        jsonMode: true
      });

      if (rawResponse) {
        try {
          const parsed = JSON.parse(rawResponse);
          console.log(`[${this.name}] ✅ LLM analysis complete — Status: ${parsed.status}`);
          return {
            ...parsed,
            evidence,
            graphPath: graphPaths
          };
        } catch (parseErr) {
          console.warn(`[${this.name}] LLM response parse error, using rule engine:`, parseErr.message);
        }
      }
    }

    // ── Rule-Based Grounded Analysis (no LLM or LLM failed) ──────────────
    return this._ruleBasedAnalysis(question, retrievedContext);
  }

  /** Build a structured context block to send to the LLM */
  _buildContextBlock(question, graphPaths, evidence) {
    const pathsText = graphPaths.length > 0
      ? graphPaths.map(p => `  • ${p.source} —[${p.relationship}]→ ${p.target}`).join('\n')
      : '  (No graph paths retrieved)';

    const evidenceText = evidence.length > 0
      ? evidence.map((e, i) =>
          `  [${i + 1}] Source: ${e.documentName} (${e.page})\n      Snippet: "${e.snippet}"`
        ).join('\n\n')
      : '  (No document evidence retrieved)';

    return `USER QUESTION:
${question}

KNOWLEDGE GRAPH PATHS (from Neo4j traversal):
${pathsText}

DOCUMENT EVIDENCE (from source compliance documents):
${evidenceText}

Based STRICTLY on the above graph context and evidence, answer the compliance question.`;
  }

  /** Structured rule-based analysis — used when no LLM key is available */
  _ruleBasedAnalysis(question, { graphPaths, evidence, seedEntities }) {
    const lower = question.toLowerCase();
    const hasEvidence = evidence.length > 0;
    const hasPaths = graphPaths.length > 0;

    if (!hasEvidence && !hasPaths) {
      return {
        answer: 'Insufficient evidence was found in the available enterprise sources to determine compliance status for this query.',
        systemsProcessed: [],
        applicablePolicies: [],
        keyInsights: ['No verified document references or Knowledge Graph nodes matched this request.'],
        confidence: 'Low',
        status: 'INSUFFICIENT_EVIDENCE',
        reasoning: 'No graph traversal paths or source document evidence could be retrieved for this query.',
        evidence: [],
        graphPath: []
      };
    }

    // Extract system names from graph paths
    const systemsFromPaths = [
      ...new Set(graphPaths
        .filter(p => p.relationship === 'PROCESSED_BY' || p.relationship === 'USED_BY')
        .map(p => p.target))
    ];

    // Extract policies/regulations from graph paths
    const policiesFromPaths = [
      ...new Set(graphPaths
        .filter(p => ['GOVERNED_BY', 'APPLIES_TO', 'REQUIRES'].includes(p.relationship))
        .map(p => p.target))
    ];

    // Build insights from graph paths and evidence
    const insights = [];
    if (systemsFromPaths.length > 0) {
      insights.push(`${systemsFromPaths.length} system(s) identified in knowledge graph: ${systemsFromPaths.join(', ')}.`);
    }
    if (policiesFromPaths.length > 0) {
      insights.push(`Applicable governance frameworks from graph: ${policiesFromPaths.join(', ')}.`);
    }
    if (evidence.length > 0) {
      insights.push(`${evidence.length} source document(s) provide supporting evidence for this analysis.`);
    }

    // Determine status
    let status = 'VERIFIED';
    let confidence = 'High';

    if (/gap|risk|violat|missing/.test(lower)) {
      status = 'POTENTIAL_RISK';
      confidence = 'High';
    } else if (!hasPaths || graphPaths.length < 2) {
      status = 'POTENTIAL_RISK';
      confidence = 'Medium';
    }

    // Build answer text
    let answer = '';
    if (systemsFromPaths.length > 0) {
      answer = `Based on Knowledge Graph traversal, ${systemsFromPaths.length} system(s) are relevant to this query: ${systemsFromPaths.join(', ')}. `;
    }
    if (policiesFromPaths.length > 0) {
      answer += `The following governance frameworks apply: ${policiesFromPaths.join(', ')}. `;
    }
    if (answer === '') {
      answer = `The Knowledge Graph analysis retrieved ${graphPaths.length} relationship paths relevant to "${question}". `;
    }
    answer += `Analysis is grounded in ${evidence.length} enterprise source document(s).`;

    return {
      answer,
      systemsProcessed: systemsFromPaths,
      applicablePolicies: policiesFromPaths,
      keyInsights: insights.length > 0 ? insights : ['Evidence retrieved — see graph paths and source documents.'],
      confidence,
      status,
      reasoning: `Rule-based analysis derived from ${graphPaths.length} graph path(s) and ${evidence.length} document evidence item(s).`,
      evidence,
      graphPath: graphPaths
    };
  }
}
