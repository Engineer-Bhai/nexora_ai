# Nexora AI — Autonomous SDLC Modernization & Engineering Workflow Orchestrator

> **IBM Bob 2.0 Hackathon Submission**
> *Built with IBM Bob — AI-powered development partner*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-68a063)](https://nodejs.org/)

---

## Problem

Software modernization and complex engineering tasks impose significant coordination costs on development teams:

- **Legacy system analysis** requires weeks of manual archaeology across code, dependencies, and documentation
- **Migration planning** demands expert architectural judgment that is expensive and scarce
- **Task decomposition** is inconsistently applied — dependencies are missed, risks are underestimated
- **Verification** of architectural recommendations is manual and subjective
- **Governance** of risky operations (external API calls, deployments, data migrations) lacks auditability

The result: enterprise modernization projects routinely overrun by 40–60%, with teams lacking a systematic, reproducible process.

---

## Solution: Nexora AI

Nexora is an **autonomous multi-agent workflow orchestrator** that reduces the friction of complex engineering and modernization tasks by decomposing developer goals into a **dependency-aware DAG (Directed Acyclic Graph)** of specialized AI agents, each with access to a RAG knowledge layer, and each subject to human approval for sensitive operations.

```
Developer Goal
    ↓
Goal Analysis Agent (extracts structure, constraints, success criteria)
    ↓
AI Orchestrator (generates dependency-aware DAG task plan)
    ↓
┌─────────────┬──────────────────────────┬──────────────────┐
│ Code        │ Architecture             │ Test Strategy    │
│ Analysis    │ Modernization            │ Agent            │
│ Agent       │ Agent                    │                  │
└─────────────┴──────────────────────────┴──────────────────┘
    ↓                  (RAG context from architecture documents)
Verification Agent
    ↓
Strategy Synthesis & Executive Roadmap
    ↓
Human-in-the-Loop Approval (for sensitive tool operations)
    ↓
Audit Trail & Analytics
```

---

## Why It Matters to Developers

1. **Reduce planning time** — A full legacy modernization analysis that takes a senior architect 2 weeks can be drafted in minutes with Nexora's orchestrated agent pipeline
2. **Reproducibility** — Every plan follows the same rigorous process (dependency analysis → service boundaries → API contracts → test strategy → risk matrix)
3. **Grounded recommendations** — Agents retrieve relevant context from uploaded architecture documents via the RAG Knowledge Hub
4. **Governed execution** — Sensitive operations are automatically intercepted and routed to human approval before execution
5. **Audit trail** — Every agent execution, tool call, and approval decision is logged with full context

---

## IBM Bob 2.0 Hackathon Relevance

This project was **developed and refined using IBM Bob** as the primary AI development partner. Bob was used to:

- Inspect and understand the existing repository architecture
- Identify gaps between current functionality and the SDLC demonstration objective
- Plan the minimal targeted changes needed to reposition the platform
- Implement three new specialized SDLC agents with rigorous fallback behavior
- Create the fictional legacy architecture demo document for RAG demonstration
- Update the planner, registry, type system, and API routes consistently
- Validate the implementation through typecheck and build

Bob's multi-file awareness, code search, and apply_diff precision enabled changes across 15+ files without breaking existing functionality.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXORA AI PLATFORM                       │
│                                                                   │
│  Frontend (React + TypeScript + Vite + Three.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │Dashboard │ │Onboarding│ │DAG Workflow│ │Knowledge Hub     │  │
│  │          │ │Goal Input│ │3D Visualiz.│ │RAG Document Mgmt │  │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │Approvals │ │Analytics │ │Agent       │ │AI Assistant      │  │
│  │Governance│ │Telemetry │ │Registry    │ │Widget            │  │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ REST API
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express + TypeScript)              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   ORCHESTRATION LAYER                    │    │
│  │  GoalAnalyzer → TaskPlanner → DAGService → TaskRunner   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AGENT REGISTRY (16 agents)            │    │
│  │  SDLC: CodeAnalysis | ArchModernization | TestStrategy   │    │
│  │  Core: Strategy | Verification | Content                 │    │
│  │  Career: Resume | JobMatch | CompanyResearch | Interview │    │
│  │  Startup: Market | Competitor | Persona | Business | MVP │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  RAG ENGINE  │  │  3-TIER MEM  │  │  PERMISSION MANAGER  │  │
│  │  Ingestion   │  │  Short-term  │  │  Tool Registry       │  │
│  │  Chunking    │  │  Long-term   │  │  Approval Queue      │  │
│  │  Embeddings  │  │  Knowledge   │  │  HITL Intercept      │  │
│  │  Retrieval   │  │  (RAG)       │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 LLM SERVICE (Multi-provider)              │    │
│  │  Gemini | OpenAI | Anthropic | Semantic Fallback Engine  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB (Mongoose)                           │
│  users | profiles | goals | workflows | tasks | documents        │
│  document_chunks | approvals | agent_runs | analytics            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Primary Demo: Autonomous SDLC Workflow

### Scenario: Modernize the RetailCore Legacy Java Monolith

**Goal Prompt:**
> "Analyze the RetailCore legacy enterprise application — a 480,000-line Spring 4 / Java 8 monolith with 47-dependency god classes, EOL technology stack, and 12% test coverage. Create a dependency-aware modernization plan that identifies service boundaries, API contracts, strangler-fig migration strategy, testing requirements, and phased execution roadmap."

### DAG Execution Flow

```
task_1: Code Analysis Agent (no dependencies — starts immediately)
    ↓
task_2: Architecture Modernization Agent (depends on task_1)
    ↓
task_3: Test Strategy Agent (depends on task_2)
    ↓
task_4: Strategy Agent — Executive Roadmap (depends on task_3)
    ↓
task_5: Verification Agent (depends on task_4)
```

### What Each Agent Produces

| Agent | Output |
|-------|--------|
| **Code Analysis Agent** | Technical debt score (0-100), coupling hotspots, EOL risks, service boundary candidates with effort estimates |
| **Architecture Modernization Agent** | Strangler-fig phase plan, API contracts (OpenAPI style), event-driven boundaries, infrastructure requirements, risk matrix |
| **Test Strategy Agent** | Testing pyramid, contract testing plan (Pact), CI/CD quality gates, migration regression checkpoints, performance baselines |
| **Strategy Agent** | 30/60/90-day executive roadmap with milestones, KPIs, risk mitigations |
| **Verification Agent** | Quality score (0-100), accuracy/completeness/actionability assessment, recommended action |

---

## SDLC Workflow Stage Details

### Stage 1: Goal Analysis
The [`GoalAnalyzerAgent`](backend/src/agents/goalAnalyzer.ts) parses the natural language goal and extracts:
- Goal type (detects `sdlc` for modernization goals)
- Technical constraints and success criteria
- Readiness score (0-100)
- Clarifying questions for missing context

### Stage 2: DAG Planning
The [`TaskPlanner`](backend/src/orchestrator/planner.ts) uses an LLM (with structured fallback) to generate a 5-task DAG:
- Each task has a `tempId`, `agentType`, `dependsOn[]`, and `inputPayload`
- The planner maps temp IDs to MongoDB ObjectIds and persists the dependency graph
- Root tasks (no dependencies) are immediately set to `ready`; downstream tasks are `pending` until prerequisites complete

### Stage 3: RAG Context Injection
Before each agent executes, the [`MemoryManager`](backend/src/memory/memoryManager.ts) assembles 3-tier context:
- **Short-term**: Active goal, workflow state, recent task outputs
- **Long-term**: User profile, preferences
- **Knowledge (RAG)**: Semantically retrieved chunks from the uploaded legacy architecture document

The [`EmbeddingService`](backend/src/rag/embeddings.ts) uses either OpenAI embeddings or a local semantic hash-based fallback. Retrieval uses cosine similarity across all indexed document chunks.

### Stage 4: Task Execution
The [`TaskRunner`](backend/src/orchestrator/runner.ts) executes each ready task:
1. Fetches upstream outputs from completed prerequisite tasks
2. Retrieves the agent from [`AgentRegistry`](backend/src/agents/registry.ts)
3. Injects RAG + memory context into `AgentExecutionContext`
4. Calls `agent.execute(context)` — LLM or semantic fallback
5. Validates output quality (`agent.validate()`)
6. Saves output, updates verification score, and unlocks downstream tasks via DAG evaluation

### Stage 5: Human Governance
The [`PermissionManager`](backend/src/tools/permissionManager.ts) intercepts any agent tool call marked `isSensitive = true`:
1. Creates an `Approval` document in MongoDB with full payload context
2. Sets the associated task to `approval_required`
3. The user reviews and approves/rejects via the **Governance & Tools** page
4. On approval: tool executes, task completes; on rejection: task is set to `skipped`

**Tools and their sensitivity:**

| Tool | Sensitive | Notes |
|------|-----------|-------|
| `web_search` | No | Simulated — returns structured demo data |
| `github_action` | No | Simulated — audit_repo, generate_readme, create_issue |
| `email_dispatch` | **Yes** | Requires human approval before SMTP send |
| `calendar_schedule` | **Yes** | Requires human approval before calendar write |

### Stage 6: Verification
The [`VerificationAgent`](backend/src/agents/implementations/VerificationAgent.ts) scores the output on:
- Accuracy and factual consistency
- Completeness against task requirements
- Relevance to the primary goal
- Actionability (no vague placeholders)

### Stage 7: Analytics
Every agent run logs execution time, tokens used, and verification score to the `Analytics` collection. The Analytics page shows aggregated metrics per agent and workflow.

---

## Agent Orchestration

### 16 Registered Agents

**SDLC / Modernization (NEW)**
- `code_analysis_agent` — Technical debt analysis, coupling hotspots, service boundary candidates
- `architecture_modernization_agent` — Strangler-fig phases, API contracts, event boundaries, risk matrix
- `test_strategy_agent` — Testing pyramid, contract tests, CI gates, migration regression plan

**Core**
- `strategy_agent` — 30/60/90-day roadmap synthesis
- `verification_agent` — Quality assurance and output scoring
- `content_agent` — Cover letters, outreach templates, launch content

**Career**
- `resume_agent`, `job_matching_agent`, `company_research_agent`, `interview_agent`, `skill_gap_agent`

**Startup**
- `market_research_agent`, `competitor_agent`, `customer_persona_agent`, `business_model_agent`, `mvp_strategy_agent`

---

## RAG Knowledge Hub

### Demo Document
Click **"⭐ Load SDLC Demo Document"** in the Knowledge Hub to ingest the fictional `RetailCore Enterprise Platform — Legacy Architecture Document v3.2`.

This document contains (fictional, no real credentials):
- System architecture overview and tech stack
- Module analysis with coupling metrics
- EOL risk register
- Identified service boundary candidates
- Target architecture recommendations
- Risk matrix

### RAG Flow
```
Upload document → Text extraction → Chunking (500 tokens, 80 token overlap)
    → Embedding generation (semantic hash or OpenAI)
    → MongoDB DocumentChunk storage
    → Cosine similarity retrieval at agent execution time
    → Context injection into agent LLM prompt
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local `mongodb://127.0.0.1:27017/nexora` or Atlas)
- (Optional) Gemini, OpenAI, or Anthropic API key for live LLM calls

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd nexora-ai

# Backend setup
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and optionally an LLM API key
npm install
npm run dev

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

See [`backend/.env.example`](backend/.env.example) for full documentation.

**Minimum required for demo:**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nexora
JWT_SECRET=<any-strong-random-string>
```

**For live LLM calls (optional):**
```env
GEMINI_API_KEY=<your-gemini-key>
# or
OPENAI_API_KEY=<your-openai-key>
```

> The platform runs in **full demo mode without an LLM API key** using the built-in semantic fallback engine. All agent outputs are realistic and structured.

---

## Demo Walkthrough

### Step 1: Register & Log In
Navigate to `http://localhost:5173` → Register → Log in

### Step 2: Load Legacy Architecture Context
Sidebar → **RAG Knowledge Hub** → Click **"⭐ Load SDLC Demo Document"**

This seeds the fictional RetailCore architecture document into the vector store.

### Step 3: Create the Modernization Goal
Sidebar → **New Goal / SDLC Demo** → Click the **"⭐ SDLC Demo"** preset → **Analyze Goal & Extract Requirements**

### Step 4: Review Goal Analysis
The Goal Understanding Agent extracts:
- Goal type: `sdlc`
- Constraints: Zero-downtime migration, backward compatibility
- Success criteria: Monolith decommissioned in 8 months, p99 ≤ 200ms, coverage ≥ 80%
- Clarifying questions (answer optional)

Click **"Generate Multi-Agent DAG Workflow"**

### Step 5: View the DAG
The workflow view shows the 5-task DAG with dependency arrows:
- `Code Analysis → Architecture Modernization → Test Strategy → Strategy Synthesis → Verification`
- Click any node for full task details and agent type

### Step 6: Execute Tasks
Click **"Execute Next Task"** or **"Run All"** to step through the DAG. Each task:
- Transitions through `pending → ready → running → completed`
- Ingests RAG context from the uploaded legacy architecture document
- Produces structured JSON output viewable in the task detail panel

### Step 7: Observe Human Approval
If a task triggers a sensitive tool (email, calendar), execution pauses and an approval record is created.

Sidebar → **Governance & Tools** → Review the pending approval → **Approve & Execute** or **✕ Reject**

### Step 8: View Results & Analytics
Dashboard → Active goal shows verification scores and output summaries.
Sidebar → **Analytics & Telemetry** → Per-agent execution times, verification scores, token usage.

---

## Known Limitations

| Limitation | Notes |
|------------|-------|
| **No real code parsing** | Code analysis uses architecture documents as RAG context + LLM reasoning. No AST or static analysis of actual source files. |
| **Simulated external tools** | `web_search`, `github_action`, `email_dispatch`, `calendar_schedule` return structured demo data. No live external API integration. |
| **Local embedding only (without OpenAI key)** | Uses a semantic hash-based fallback embedding. Retrieval quality is lower than production vector embeddings. |
| **No real-time streaming** | Agent execution is synchronous. No WebSocket streaming of partial results. |
| **Sequential DAG execution** | The TaskRunner executes tasks one at a time. Parallel independent tasks are not executed concurrently in the current implementation. |
| **No GitHub integration** | The `github_action` tool is simulated and does not connect to real GitHub APIs. |
| **MongoDB required** | All state is persisted to MongoDB. No in-memory or file-based mode. |

---

## Security

- `.env` is excluded from git tracking via `.gitignore`
- JWT authentication on all protected API routes
- Password hashing with bcryptjs
- Sensitive tool operations require human approval before execution
- Input validation via Zod on all POST/PUT endpoints
- No real credentials, keys, or proprietary data in the codebase
- All demo documents are fictional

**If you fork and deploy:**
- Replace `JWT_SECRET` with a strong random value
- Use MongoDB Atlas with network access restrictions in production
- Never commit `.env` to version control

---

## Validation

```bash
# Backend typecheck (zero errors expected)
cd backend && npm run typecheck

# Backend production build
cd backend && npm run build

# Frontend production build
cd frontend && npm run build
```

---

## Project Structure

```
nexora-ai/
├── backend/
│   └── src/
│       ├── agents/
│       │   ├── base.agent.ts          # BaseAgent abstract class
│       │   ├── goalAnalyzer.ts        # Goal Understanding Agent
│       │   ├── registry.ts            # Agent Registry (16 agents)
│       │   └── implementations/
│       │       ├── CodeAnalysisAgent.ts          # NEW: SDLC
│       │       ├── ArchitectureModernizationAgent.ts  # NEW: SDLC
│       │       ├── TestStrategyAgent.ts          # NEW: SDLC
│       │       ├── VerificationAgent.ts
│       │       ├── StrategyAgent.ts
│       │       └── ... (11 more agents)
│       ├── orchestrator/
│       │   ├── planner.ts             # DAG task planner (LLM + fallback)
│       │   ├── runner.ts              # Task execution engine
│       │   └── dag.ts                 # DAG topology & React Flow serializer
│       ├── rag/
│       │   ├── ingestion.ts           # Document ingest pipeline
│       │   ├── chunking.ts            # Text chunking
│       │   ├── embeddings.ts          # OpenAI or semantic fallback embeddings
│       │   ├── retrieval.ts           # Cosine similarity retrieval
│       │   └── legacyDemoSeed.ts      # NEW: RetailCore demo document
│       ├── memory/memoryManager.ts    # 3-tier memory assembly
│       ├── tools/
│       │   ├── permissionManager.ts   # HITL approval intercept
│       │   ├── toolRegistry.ts
│       │   └── implementations/       # github, search, email, calendar tools
│       ├── models/                    # Mongoose schemas
│       ├── routes/                    # Express API routes
│       ├── services/llm.service.ts    # Multi-provider LLM + fallback
│       └── server.ts
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Onboarding.tsx         # Goal intake (SDLC demo featured)
│       │   ├── WorkflowView.tsx       # DAG visualization + execution
│       │   ├── KnowledgeHub.tsx       # RAG document management
│       │   ├── ApprovalsPage.tsx      # Human-in-the-loop governance
│       │   ├── AnalyticsPage.tsx
│       │   └── AgentsPage.tsx
│       ├── components/
│       │   ├── 3d/                    # Three.js 3D workflow visualizations
│       │   └── layout/Sidebar.tsx     # Navigation (SDLC-first ordering)
│       └── services/api.ts            # API client
├── .gitignore
├── backend/.env.example
└── README.md
```

---

*Nexora AI — From Ambition to Autonomous Execution*
*IBM Bob 2.0 Hackathon 2025*
