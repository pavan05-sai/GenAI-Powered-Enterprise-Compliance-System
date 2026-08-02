import { llm } from './LLMClient.js';

const EXTRACTION_SYSTEM_PROMPT = `You are an expert enterprise compliance knowledge graph builder.

Your task is to extract structured compliance entities and their relationships from the given document text.

ENTITY TYPES (extract only what is explicitly mentioned or strongly implied):
- Organization: companies, institutions, business units
- Department: business departments, teams
- Person: named individuals, roles (CISO, DPO, CEO)
- System: software systems, platforms, microservices
- Application: applications, apps, tools
- Database: databases, data stores, storage systems
- DataAsset: data categories (PII, payment data, health records)
- Policy: internal policies, procedures, standards
- Regulation: laws, regulations (GDPR, HIPAA, CCPA, PCI-DSS, SOC 2, ISO 27001)
- Requirement: specific compliance requirements, obligations
- Control: security controls, safeguards, countermeasures
- Service: business services, APIs, integrations

RELATIONSHIP TYPES:
- STORED_IN: data stored in a database/system
- PROCESSED_BY: data processed by a system/service
- GOVERNED_BY: entity subject to a regulation/policy
- PROTECTED_BY: entity protected by a control
- APPLIES_TO: policy/regulation applies to a system/org
- REQUIRES: regulation requires a control/action
- DEPENDS_ON: system depends on another system
- CONNECTED_TO: systems connected to each other
- VIOLATES: entity potentially violates a regulation/policy
- USED_BY: system/data used by a department/person
- MANAGED_BY: system managed by a team/person

RULES:
- Only extract entities explicitly mentioned or clearly implied in the text
- Return ONLY a valid JSON object — no markdown, no explanation
- Use concise, canonical entity names (e.g. "Customer PII" not "customer personally identifiable information")
- Confidence is a float from 0.0 to 1.0 based on how explicitly the entity is mentioned
- Every relationship source and target must match an extracted entity name exactly

OUTPUT FORMAT (strict JSON, no extra text):
{
  "entities": [
    {
      "name": "string",
      "type": "one of the types above",
      "description": "one sentence description from the document context",
      "confidence": 0.95
    }
  ],
  "relationships": [
    {
      "source": "entity name (must exist in entities array)",
      "relationship": "RELATIONSHIP_TYPE",
      "target": "entity name (must exist in entities array)"
    }
  ]
}`;

export class EntityRelationAgent {
  constructor() {
    this.name = 'Entity + Relationship Extraction Agent';
  }

  async extractEntitiesAndRelationships(documentTitle, textContent) {
    console.log(`[${this.name}] Extracting from: "${documentTitle}" (${textContent.length} chars)`);

    // Truncate to model context limit (~12000 chars to stay within token budget)
    const truncatedText = textContent.length > 12000
      ? textContent.substring(0, 12000) + '\n...[truncated]'
      : textContent;

    const userMessage = `Document Title: "${documentTitle}"\n\nDocument Content:\n${truncatedText}`;

    let result = null;

    // Try real LLM first
    const rawResponse = await llm.complete(EXTRACTION_SYSTEM_PROMPT, userMessage, {
      temperature: 0.0,
      maxTokens: 2048,
      jsonMode: true
    });

    if (rawResponse) {
      try {
        result = JSON.parse(rawResponse);
        console.log(`[${this.name}] ✅ LLM extracted ${result.entities?.length || 0} entities, ${result.relationships?.length || 0} relationships`);
      } catch (parseErr) {
        console.warn(`[${this.name}] JSON parse failed, using pattern fallback:`, parseErr.message);
        result = null;
      }
    }

    // Pattern-match fallback when no LLM key is configured
    if (!result) {
      result = this._patternExtract(documentTitle, textContent);
      console.log(`[${this.name}] ℹ️ Pattern engine: ${result.entities.length} entities, ${result.relationships.length} relationships`);
    }

    // Validate: ensure relationship endpoints exist in entity names
    const entityNames = new Set(result.entities.map(e => e.name));
    result.relationships = result.relationships.filter(
      r => entityNames.has(r.source) && entityNames.has(r.target)
    );

    return {
      documentTitle,
      entities: result.entities,
      relationships: result.relationships,
      extractedAt: new Date().toISOString(),
      method: rawResponse ? 'llm' : 'pattern'
    };
  }

  _patternExtract(title, text) {
    const lower = text.toLowerCase();
    const entities = [];
    const relationships = [];
    const pushed = new Set();

    const addEntity = (name, type, description, confidence) => {
      if (!pushed.has(name)) {
        pushed.add(name);
        entities.push({ name, type, description, confidence });
      }
    };

    // Detect regulations
    if (/gdpr|general data protection/.test(lower)) addEntity('GDPR', 'Regulation', 'EU General Data Protection Regulation.', 0.99);
    if (/ccpa|california consumer privacy/.test(lower)) addEntity('CCPA', 'Regulation', 'California Consumer Privacy Act.', 0.99);
    if (/hipaa|health insurance portability/.test(lower)) addEntity('HIPAA', 'Regulation', 'Health Insurance Portability and Accountability Act.', 0.99);
    if (/pci.?dss|payment card industry/.test(lower)) addEntity('PCI-DSS', 'Regulation', 'Payment Card Industry Data Security Standard.', 0.99);
    if (/iso.?27001/.test(lower)) addEntity('ISO 27001', 'Regulation', 'ISO/IEC 27001 Information Security Management Standard.', 0.99);
    if (/soc.?2/.test(lower)) addEntity('SOC 2', 'Requirement', 'Service Organization Control 2 compliance attestation.', 0.97);

    // Detect data assets
    if (/\bpii\b|personally identifiable|personal data/.test(lower)) addEntity('Customer PII', 'DataAsset', 'Personally identifiable information of customers.', 0.98);
    if (/payment data|payment information|card.*data/.test(lower)) addEntity('Payment Data', 'DataAsset', 'Customer payment and financial transaction data.', 0.96);
    if (/health.*record|medical.*data|patient.*data/.test(lower)) addEntity('Health Records', 'DataAsset', 'Patient and health-related personal data.', 0.95);

    // Detect systems/services
    if (/payment.*service|payment.*system|payment.*gateway/.test(lower)) addEntity('Payment Service', 'System', 'Payment processing microservice handling financial transactions.', 0.96);
    if (/crm|customer relationship/.test(lower)) addEntity('CRM Platform', 'Application', 'Customer relationship management platform.', 0.94);
    if (/analytics.*service|analytics.*platform/.test(lower)) addEntity('Analytics Service', 'System', 'Internal analytics and reporting service.', 0.93);
    if (/api.*gateway|api gateway/.test(lower)) addEntity('API Gateway', 'System', 'Central API gateway routing service requests.', 0.92);

    // Detect databases
    if (/customer.*database|customer.*db|user.*database/.test(lower)) addEntity('Customer Database', 'Database', 'Primary database storing customer records.', 0.95);
    if (/\bpostgres|postgresql/.test(lower)) addEntity('PostgreSQL Database', 'Database', 'PostgreSQL relational database instance.', 0.93);

    // Detect controls
    if (/aes.?256|aes encryption/.test(lower)) addEntity('AES-256 Encryption', 'Control', 'AES-256 symmetric encryption for data at rest.', 0.97);
    if (/tls|ssl|https/.test(lower)) addEntity('TLS Encryption', 'Control', 'TLS/SSL encryption for data in transit.', 0.95);
    if (/rbac|role.based access|access control/.test(lower)) addEntity('RBAC', 'Control', 'Role-Based Access Control governing data access.', 0.94);
    if (/mfa|multi.factor/.test(lower)) addEntity('MFA', 'Control', 'Multi-Factor Authentication control.', 0.93);

    // Detect policies
    if (/security policy|data.*protection policy|privacy policy/.test(lower)) addEntity('Security Policy', 'Policy', 'Enterprise security and data protection policy.', 0.96);
    if (/data retention|retention policy/.test(lower)) addEntity('Data Retention Policy', 'Policy', 'Policy governing data storage duration and deletion.', 0.94);
    if (/incident response/.test(lower)) addEntity('Incident Response Policy', 'Policy', 'Policy defining procedures for security incidents.', 0.93);

    // Detect organizations
    if (/acme|acme enterprise/.test(lower)) addEntity('Acme Enterprise', 'Organization', 'Primary enterprise organization.', 0.97);
    if (/vendor|third.party|supplier/.test(lower)) addEntity('Third-Party Vendor', 'Organization', 'External vendor or service provider.', 0.88);

    // Build relationships from co-occurring entities
    const enames = entities.map(e => e.name);
    if (enames.includes('Customer PII') && enames.includes('Customer Database'))
      relationships.push({ source: 'Customer PII', relationship: 'STORED_IN', target: 'Customer Database' });
    if (enames.includes('Customer PII') && enames.includes('Payment Service'))
      relationships.push({ source: 'Customer PII', relationship: 'PROCESSED_BY', target: 'Payment Service' });
    if (enames.includes('Customer PII') && enames.includes('CRM Platform'))
      relationships.push({ source: 'Customer PII', relationship: 'PROCESSED_BY', target: 'CRM Platform' });
    if (enames.includes('Customer PII') && enames.includes('Analytics Service'))
      relationships.push({ source: 'Customer PII', relationship: 'PROCESSED_BY', target: 'Analytics Service' });
    if (enames.includes('Payment Service') && enames.includes('GDPR'))
      relationships.push({ source: 'Payment Service', relationship: 'GOVERNED_BY', target: 'GDPR' });
    if (enames.includes('Payment Service') && enames.includes('PCI-DSS'))
      relationships.push({ source: 'Payment Service', relationship: 'GOVERNED_BY', target: 'PCI-DSS' });
    if (enames.includes('AES-256 Encryption') && enames.includes('Customer Database'))
      relationships.push({ source: 'Customer Database', relationship: 'PROTECTED_BY', target: 'AES-256 Encryption' });
    if (enames.includes('TLS Encryption') && enames.includes('Payment Service'))
      relationships.push({ source: 'Payment Service', relationship: 'PROTECTED_BY', target: 'TLS Encryption' });
    if (enames.includes('GDPR') && enames.includes('AES-256 Encryption'))
      relationships.push({ source: 'GDPR', relationship: 'REQUIRES', target: 'AES-256 Encryption' });
    if (enames.includes('Security Policy') && enames.includes('Customer PII'))
      relationships.push({ source: 'Security Policy', relationship: 'APPLIES_TO', target: 'Customer PII' });
    if (enames.includes('Third-Party Vendor') && enames.includes('SOC 2'))
      relationships.push({ source: 'Third-Party Vendor', relationship: 'REQUIRES', target: 'SOC 2' });
    if (enames.includes('RBAC') && enames.includes('Customer Database'))
      relationships.push({ source: 'Customer Database', relationship: 'PROTECTED_BY', target: 'RBAC' });
    if (enames.includes('Customer Database') && enames.includes('Payment Service'))
      relationships.push({ source: 'Customer Database', relationship: 'USED_BY', target: 'Payment Service' });

    // Add source document entity if nothing else found
    if (entities.length === 0) {
      addEntity(title.replace(/\.[^/.]+$/, ''), 'Policy', `Compliance document: ${title}`, 0.85);
    }

    return { entities, relationships };
  }
}
