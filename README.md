# 🛡️ ComplianceGraph AI — GenAI-Powered Enterprise Compliance System

An enterprise-grade, AI-powered compliance management platform that uses **Graph RAG (Retrieval-Augmented Generation)**, a **Neo4j Knowledge Graph**, and a **Multi-Agent AI pipeline** to analyze compliance documents, detect risks, identify contradictions, and provide evidence-grounded regulatory insights across frameworks like GDPR, CCPA, PCI-DSS, and ISO 27001.

---

## ✨ Key Features

### 🤖 Multi-Agent AI Pipeline (8 Specialized Agents)
| Agent | Responsibility |
|-------|---------------|
| **OrchestratorAgent** | Coordinates all agent pipelines for document ingestion and compliance queries |
| **DocumentProcessorAgent** | Parses and extracts text from PDF, DOCX, CSV/XLSX, TXT, and image files |
| **EntityRelationAgent** | Extracts compliance entities (systems, regulations, controls, data assets) and relationships using LLM or rule-based NLP |
| **KnowledgeGraphAgent** | Syncs extracted entities and relationships into the Neo4j Knowledge Graph |
| **GraphRAGAgent** | Performs multi-hop graph traversal and retrieves evidence-grounded context for compliance queries |
| **ComplianceAnalysisAgent** | Generates zero-hallucination compliance analysis using graph context + document evidence via Lyzr AI |
| **ContradictionAgent** | Detects conflicting claims across multiple enterprise documents |
| **VersionImpactAgent** | Analyzes semantic differences and compliance impact when document versions change |

### 📊 Interactive Knowledge Graph Visualization
- Real-time force-directed graph rendering powered by **React Flow**
- Visualize entities (systems, regulations, controls, data assets) and their relationships
- Multi-hop traversal paths displayed with full provenance

### 📄 Multi-Format Document Ingestion
- Supports **PDF**, **DOCX**, **CSV**, **XLSX**, **TXT**, and **image** uploads
- Automated text extraction, entity extraction, and relationship mapping
- Full document versioning with semantic diff analysis

### 🔍 Evidence-Grounded Compliance Analysis
- **Zero-hallucination policy** — every claim is traceable to source documents
- Graph-augmented retrieval for regulatory question answering
- Structured responses with confidence scores, evidence snippets, and reasoning chains

### ⚖️ Regulatory Framework Support
- **GDPR** — EU General Data Protection Regulation
- **CCPA** — California Consumer Privacy Act
- **PCI-DSS** — Payment Card Industry Data Security Standard
- **ISO 27001** — Information Security Management

### 🔔 Contradiction Detection & Alerts
- Automatically identifies conflicting compliance claims across documents
- Real-time notification system for detected contradictions and risks

### 📈 Compliance Dashboard & Reporting
- Real-time compliance scores derived from Knowledge Graph coverage
- Risk breakdown by category (Data Security, Access Control, Data Retention, Third-Party)
- Downloadable compliance reports with evidence packs

### 📝 Audit Trail
- Complete logging of all user actions, AI queries, document uploads, and system events
- Traceable decision history for regulatory audits

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **React Flow (@xyflow/react)** | Knowledge Graph visualization |
| **Recharts** | Dashboard charts and analytics |
| **Lucide React** | Icon library |
| **Axios** | HTTP client for API communication |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Server runtime |
| **Express.js** | REST API framework |
| **Mongoose** | MongoDB ODM |
| **Neo4j Driver** | Neo4j Aura graph database client |
| **Lyzr AI SDK** | LLM inference via Lyzr AI agent platform |
| **JSON Web Tokens (JWT)** | Authentication and session management |
| **bcrypt.js** | Password hashing |
| **Multer** | File upload middleware |
| **pdf-parse** | PDF text extraction |
| **Mammoth** | DOCX text extraction |
| **xlsx** | CSV/Excel parsing |
| **csv-parser** | CSV file parsing |

### Databases & AI
| Technology | Purpose |
|-----------|---------|
| **MongoDB Atlas** | Document storage, user data, audit logs, compliance records |
| **Neo4j Aura** | Knowledge Graph for entity-relationship storage and multi-hop traversal |
| **Lyzr AI** | LLM-powered compliance analysis with zero-hallucination enforcement |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Dashboard │ │Documents │ │AI Analyst│ │Knowledge │ │Compliance│ │
│  │  Page    │ │  Page    │ │  Page    │ │Graph Page│ │  Page    │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       └─────────────┴─────────────┴─────────────┴──────────┘       │
│                              │ Axios API Client                     │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ REST API (HTTP/JSON)
┌──────────────────────────────┼──────────────────────────────────────┐
│                     BACKEND (Express.js)                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API Routes Layer                           │   │
│  │  /api/auth  /api/documents  /api/ai  /api/graph              │   │
│  │  /api/compliance  /api/audit  /api/alerts  /api/reports      │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               MULTI-AGENT AI PIPELINE                        │   │
│  │                                                              │   │
│  │  ┌──────────────────┐     ┌──────────────────────────────┐   │   │
│  │  │  Orchestrator    │────▶│ Pipeline A: Document Ingest  │   │   │
│  │  │     Agent        │     │  DocProcessor → EntityRelation│   │   │
│  │  │                  │     │  → KnowledgeGraph → Contradict│   │   │
│  │  │                  │     └──────────────────────────────┘   │   │
│  │  │                  │     ┌──────────────────────────────┐   │   │
│  │  │                  │────▶│ Pipeline B: Compliance Query │   │   │
│  │  │                  │     │  GraphRAG → ComplianceAnalysis│   │   │
│  │  │                  │     └──────────────────────────────┘   │   │
│  │  │                  │     ┌──────────────────────────────┐   │   │
│  │  │                  │────▶│ Pipeline C: Impact Analysis  │   │   │
│  │  │                  │     │  VersionImpactAgent           │   │   │
│  │  └──────────────────┘     └──────────────────────────────┘   │   │
│  │                                                              │   │
│  │  ┌──────────────┐                                            │   │
│  │  │  LLM Client  │──── Lyzr AI / OpenAI / Pattern Engine     │   │
│  │  └──────────────┘                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│         ┌────────────────────┼────────────────────┐                 │
│         ▼                    ▼                    ▼                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐          │
│  │ MongoDB Atlas│  │ Neo4j Aura       │  │ Lyzr AI      │          │
│  │ (Documents,  │  │ (Knowledge Graph,│  │ (LLM-powered │          │
│  │  Users,      │  │  Entities,       │  │  compliance  │          │
│  │  AuditLogs)  │  │  Relationships)  │  │  analysis)   │          │
│  └──────────────┘  └──────────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
GenAI-Powered-Enterprise-Compliance-System/
│
├── client/                          # Frontend (React + Vite)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   └── ReportModal.jsx      # Report generation modal
│   │   ├── context/                 # React context providers
│   │   │   └── AuthContext.jsx      # Authentication state management
│   │   ├── layouts/                 # Page layout wrappers
│   │   │   └── AppLayout.jsx        # Main application shell with sidebar
│   │   ├── pages/                   # Application pages
│   │   │   ├── DashboardPage.jsx    # Compliance dashboard with metrics
│   │   │   ├── DocumentsPage.jsx    # Document upload & management
│   │   │   ├── AiAnalystPage.jsx    # AI-powered compliance Q&A
│   │   │   ├── KnowledgeGraphPage.jsx # Interactive graph visualization
│   │   │   ├── CompliancePage.jsx   # Compliance framework overview
│   │   │   ├── AuditTrailPage.jsx   # Activity audit log
│   │   │   ├── SettingsPage.jsx     # System settings
│   │   │   ├── LoginPage.jsx        # User login
│   │   │   └── RegisterPage.jsx     # User registration
│   │   ├── services/                # API communication layer
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Root app component with routing
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── package.json                 # Frontend dependencies
│
├── server/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── agents/                  # Multi-Agent AI Pipeline
│   │   │   ├── OrchestratorAgent.js # Central pipeline coordinator
│   │   │   ├── DocumentProcessorAgent.js # File parsing & text extraction
│   │   │   ├── EntityRelationAgent.js    # Entity & relationship extraction
│   │   │   ├── KnowledgeGraphAgent.js    # Neo4j graph sync
│   │   │   ├── GraphRAGAgent.js          # Graph-augmented retrieval
│   │   │   ├── ComplianceAnalysisAgent.js # Zero-hallucination analysis
│   │   │   ├── ContradictionAgent.js     # Cross-document contradiction detection
│   │   │   ├── VersionImpactAgent.js     # Document version impact analysis
│   │   │   └── LLMClient.js             # Unified LLM abstraction (Lyzr/OpenAI)
│   │   ├── graph/                   # Knowledge Graph layer
│   │   │   └── neo4jDriver.js       # Neo4j Aura driver + in-memory fallback
│   │   ├── models/                  # Mongoose data models
│   │   │   ├── User.js              # User accounts
│   │   │   ├── Organization.js      # Enterprise organizations
│   │   │   ├── Document.js          # Uploaded documents & metadata
│   │   │   ├── DocumentVersion.js   # Document version history
│   │   │   ├── Query.js             # AI query history
│   │   │   ├── AuditLog.js          # Audit trail entries
│   │   │   ├── ComplianceCheck.js   # Compliance check results
│   │   │   ├── ComplianceReport.js  # Generated compliance reports
│   │   │   ├── Contradiction.js     # Detected contradictions
│   │   │   └── Notification.js      # System notifications
│   │   ├── routes/                  # Express API routes
│   │   │   ├── authRoutes.js        # Authentication (register/login/me)
│   │   │   ├── documentRoutes.js    # Document CRUD & upload pipeline
│   │   │   ├── aiRoutes.js          # AI query & dashboard stats
│   │   │   ├── graphRoutes.js       # Knowledge Graph API
│   │   │   ├── complianceRoutes.js  # Compliance overview, risks, contradictions
│   │   │   ├── auditRoutes.js       # Audit trail API
│   │   │   ├── alertRoutes.js       # Notifications & alerts
│   │   │   └── reportRoutes.js      # Report generation & download
│   │   ├── utils/                   # Utility scripts
│   │   │   └── seedData.js          # Database & graph seed data
│   │   ├── app.js                   # Express app setup & middleware
│   │   └── server.js                # Server entry point
│   ├── .env                         # Environment variables (NOT committed)
│   └── package.json                 # Backend dependencies
│
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules
└── README.md                        # Project documentation
```

---

## 🔐 Environment Variables

Create a `server/.env` file using the template in `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/compliancegraph

# Neo4j Aura Knowledge Graph
NEO4J_URI=neo4j+s://<instance-id>.databases.neo4j.io
NEO4J_USER=<neo4j-user>
NEO4J_PASSWORD=<neo4j-password>

# Lyzr AI (LLM Provider)
LYZR_API_KEY=<your-lyzr-api-key>
LYZR_AGENT_ID=<your-lyzr-agent-id>
LLM_MODEL=gpt-4o-mini
```

> ⚠️ **Important:** Never commit the `.env` file. It is excluded in `.gitignore`.

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18+ (v24 recommended)
- **npm** v9+
- **MongoDB Atlas** account with a cluster created
- **Neo4j Aura** free-tier or paid instance
- **Lyzr AI** API key ([studio.lyzr.ai](https://studio.lyzr.ai))

### 1. Clone the Repository

```bash
git clone https://github.com/pavan05-sai/GenAI-Powered-Enterprise-Compliance-System.git
cd GenAI-Powered-Enterprise-Compliance-System
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create the environment file:

```bash
cp ../.env.example .env
# Edit .env with your MongoDB Atlas, Neo4j Aura, and Lyzr AI credentials
```

Start the backend server:

```bash
npm start
```

The server will start on `http://localhost:5000`.

### 3. Setup the Frontend

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 4. Seed the Database

The database is automatically seeded on first server startup. To manually re-seed:

```bash
cd server
npm run seed
```

---

## 👤 Author

**pavan05-sai**

- GitHub: [@pavan05-sai](https://github.com/pavan05-sai)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 pavan05-sai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
