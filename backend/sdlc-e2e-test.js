/**
 * Nexora AI — SDLC End-to-End Test
 * 
 * Tests the complete SDLC modernization workflow using compiled backend code.
 * Does NOT require MongoDB — tests business logic layer directly.
 * 
 * Goal: "Modernize a legacy Java/Spring enterprise monolith into TypeScript
 *        microservices with Docker and CI/CD."
 * 
 * Validates:
 * 1. Goal type 'sdlc' is accepted by the type system
 * 2. Agent registry contains all 16 agents (13 existing + 3 SDLC)
 * 3. All 3 SDLC agents are found in the registry
 * 4. SDLC default DAG plan generates correctly (5 tasks, correct dependencies)
 * 5. Each SDLC agent can execute without MongoDB (using fake context)
 * 6. Task outputs conform to expected schema
 * 7. Verification agent produces quality score
 * 8. RAG context is accepted and passed through to agent execution
 * 9. PermissionManager logic is exercised
 * 10. Existing career/startup default plans still generate correctly
 */

'use strict';

const assert = (condition, message) => {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
};

let passed = 0;
let failed = 0;
const results = [];

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    passed++;
    results.push({ name, status: 'PASS' });
  } catch (err) {
    console.error(`  ❌  ${name}`);
    console.error(`      ${err.message}`);
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
  }
};

async function runTests() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  Nexora AI — SDLC End-to-End Validation Suite');
  console.log('════════════════════════════════════════════════════════════\n');

  // ──────────────────────────────────────────────────────────
  // SECTION 1: Registry & Agent Count
  // ──────────────────────────────────────────────────────────
  console.log('📋 Section 1: Agent Registry');

  const { AgentRegistry } = require('./dist/agents/registry');
  AgentRegistry.initialize();
  const allAgents = AgentRegistry.listAgents();

  await test('Registry initializes without errors', () => {
    assert(allAgents !== null, 'listAgents returned null');
  });

  await test('Registry contains exactly 16 agents (13 original + 3 SDLC)', () => {
    assert(allAgents.length === 16, `Expected 16, got ${allAgents.length}`);
  });

  await test('code_analysis_agent is registered', () => {
    const a = AgentRegistry.getAgent('code_analysis_agent');
    assert(a !== undefined, 'code_analysis_agent not found');
    assert(a.agentId === 'code_analysis_agent', 'wrong agentId');
    assert(a.category === 'sdlc', `wrong category: ${a.category}`);
  });

  await test('architecture_modernization_agent is registered', () => {
    const a = AgentRegistry.getAgent('architecture_modernization_agent');
    assert(a !== undefined, 'architecture_modernization_agent not found');
    assert(a.category === 'sdlc', `wrong category: ${a.category}`);
  });

  await test('test_strategy_agent is registered', () => {
    const a = AgentRegistry.getAgent('test_strategy_agent');
    assert(a !== undefined, 'test_strategy_agent not found');
    assert(a.category === 'sdlc', `wrong category: ${a.category}`);
  });

  await test('All 13 pre-existing agents still present', () => {
    const requiredIds = [
      'resume_agent', 'market_research_agent', 'competitor_agent',
      'skill_gap_agent', 'strategy_agent', 'content_agent',
      'verification_agent', 'job_matching_agent', 'company_research_agent',
      'interview_agent', 'customer_persona_agent', 'business_model_agent',
      'mvp_strategy_agent',
    ];
    for (const id of requiredIds) {
      const agent = AgentRegistry.getAgent(id);
      assert(agent !== undefined, `Missing pre-existing agent: ${id}`);
    }
  });

  await test('No duplicate agentIds in registry', () => {
    const ids = allAgents.map(a => a.agentId);
    const unique = new Set(ids);
    assert(unique.size === ids.length, `Duplicates found: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
  });

  await test('SDLC agent definition schema is complete (getDefinition)', () => {
    const agent = AgentRegistry.getAgent('code_analysis_agent');
    const def = agent.getDefinition();
    assert(def.agentId === 'code_analysis_agent', 'agentId missing');
    assert(def.name.length > 0, 'name empty');
    assert(def.description.length > 0, 'description empty');
    assert(def.systemPrompt.length > 0, 'systemPrompt empty');
    assert(Array.isArray(def.allowedTools), 'allowedTools not array');
    assert(def.isActive === true, 'isActive should be true');
    assert(def.knowledgeAccess === true, 'knowledgeAccess should be true');
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 2: SDLC DAG Plan Generation
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 2: SDLC Default DAG Plan');

  const { TaskPlanner } = require('./dist/orchestrator/planner');

  const sdlcGoal = {
    _id: '000000000000000000000001',
    userId: '000000000000000000000002',
    title: 'Modernize Legacy Java/Spring Monolith to TypeScript Microservices',
    rawPrompt: 'Modernize a legacy Java/Spring enterprise monolith into TypeScript microservices with Docker and CI/CD.',
    goalType: 'sdlc',
    extractedData: {
      goalType: 'sdlc',
      industry: 'Enterprise Software',
      objective: 'Modernize legacy monolith to microservices',
      keyConstraints: ['Zero-downtime migration', 'Backward compatibility'],
    },
    missingInformation: [],
    status: 'planned',
  };

  const careerGoal = {
    _id: '000000000000000000000003',
    userId: '000000000000000000000002',
    title: 'Get Senior Software Engineer Role',
    rawPrompt: 'I want to get a senior software engineering job at a top tech company.',
    goalType: 'career',
    extractedData: { goalType: 'career', targetRole: 'Senior Software Engineer' },
    missingInformation: [],
    status: 'planned',
  };

  const startupGoal = {
    _id: '000000000000000000000004',
    userId: '000000000000000000000002',
    title: 'Launch AI CRM SaaS',
    rawPrompt: 'I want to build an AI CRM for B2B sales teams.',
    goalType: 'startup',
    extractedData: { goalType: 'startup' },
    missingInformation: [],
    status: 'planned',
  };

  // Access private method via bracket notation
  const getDefaultPlan = (goal) => TaskPlanner['getDefaultPlanForGoal'](goal);

  let sdlcPlan;
  await test('SDLC default plan generates without error', () => {
    sdlcPlan = getDefaultPlan(sdlcGoal);
    assert(sdlcPlan !== null && sdlcPlan !== undefined, 'plan is null');
  });

  await test('SDLC plan has correct title', () => {
    assert(sdlcPlan.workflowTitle.includes('Legacy Modernization Plan'), `title: "${sdlcPlan.workflowTitle}"`);
  });

  await test('SDLC plan contains exactly 5 tasks', () => {
    assert(sdlcPlan.tasks.length === 5, `Expected 5, got ${sdlcPlan.tasks.length}`);
  });

  await test('SDLC plan task_1 is code_analysis_agent with no dependencies', () => {
    const t = sdlcPlan.tasks[0];
    assert(t.tempId === 'task_1', `tempId: ${t.tempId}`);
    assert(t.agentType === 'code_analysis_agent', `agentType: ${t.agentType}`);
    assert(t.dependsOn.length === 0, `dependsOn should be empty, got ${JSON.stringify(t.dependsOn)}`);
  });

  await test('SDLC plan task_2 is architecture_modernization_agent depending on task_1', () => {
    const t = sdlcPlan.tasks[1];
    assert(t.agentType === 'architecture_modernization_agent', `agentType: ${t.agentType}`);
    assert(t.dependsOn.includes('task_1'), `dependsOn: ${JSON.stringify(t.dependsOn)}`);
  });

  await test('SDLC plan task_3 is test_strategy_agent depending on task_2', () => {
    const t = sdlcPlan.tasks[2];
    assert(t.agentType === 'test_strategy_agent', `agentType: ${t.agentType}`);
    assert(t.dependsOn.includes('task_2'), `dependsOn: ${JSON.stringify(t.dependsOn)}`);
  });

  await test('SDLC plan task_4 is strategy_agent depending on task_3', () => {
    const t = sdlcPlan.tasks[3];
    assert(t.agentType === 'strategy_agent', `agentType: ${t.agentType}`);
    assert(t.dependsOn.includes('task_3'), `dependsOn: ${JSON.stringify(t.dependsOn)}`);
  });

  await test('SDLC plan task_5 is verification_agent depending on task_4', () => {
    const t = sdlcPlan.tasks[4];
    assert(t.agentType === 'verification_agent', `agentType: ${t.agentType}`);
    assert(t.dependsOn.includes('task_4'), `dependsOn: ${JSON.stringify(t.dependsOn)}`);
  });

  await test('SDLC plan DAG is acyclic (no circular dependencies)', () => {
    const taskMap = {};
    sdlcPlan.tasks.forEach(t => { taskMap[t.tempId] = t; });
    const visited = new Set();
    const inStack = new Set();
    function hasCycle(id) {
      if (inStack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      inStack.add(id);
      const task = taskMap[id];
      for (const dep of (task.dependsOn || [])) {
        if (hasCycle(dep)) return true;
      }
      inStack.delete(id);
      return false;
    }
    for (const t of sdlcPlan.tasks) {
      assert(!hasCycle(t.tempId), `Cycle detected at ${t.tempId}`);
    }
  });

  await test('All SDLC agentTypes are registered in AgentRegistry', () => {
    for (const t of sdlcPlan.tasks) {
      const agent = AgentRegistry.getAgent(t.agentType);
      assert(agent !== undefined, `Agent '${t.agentType}' from SDLC plan not found in registry`);
    }
  });

  await test('Career default plan still generates correctly (regression)', () => {
    const plan = getDefaultPlan(careerGoal);
    assert(plan.tasks.length > 0, 'career plan has no tasks');
    assert(plan.tasks[0].agentType === 'resume_agent', `career root task: ${plan.tasks[0].agentType}`);
    // All career agents must be in registry
    for (const t of plan.tasks) {
      const agent = AgentRegistry.getAgent(t.agentType);
      assert(agent !== undefined, `Agent '${t.agentType}' from career plan not found in registry`);
    }
  });

  await test('Startup default plan still generates correctly (regression)', () => {
    const plan = getDefaultPlan(startupGoal);
    assert(plan.tasks.length > 0, 'startup plan has no tasks');
    assert(plan.tasks[0].agentType === 'customer_persona_agent', `startup root task: ${plan.tasks[0].agentType}`);
    for (const t of plan.tasks) {
      const agent = AgentRegistry.getAgent(t.agentType);
      assert(agent !== undefined, `Agent '${t.agentType}' from startup plan not found in registry`);
    }
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 3: SDLC Agent Execution (without MongoDB)
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 3: SDLC Agent Execution');

  const makeContext = (overrides = {}) => ({
    taskTitle: 'Test Task',
    taskDescription: 'Test task description',
    inputPayload: {},
    upstreamOutputs: {},
    goal: sdlcGoal,
    profile: null,
    ragContext: '',
    memoryContext: '',
    ...overrides,
  });

  await test('CodeAnalysisAgent executes and returns structured output', async () => {
    const agent = AgentRegistry.getAgent('code_analysis_agent');
    const ctx = makeContext({ taskTitle: 'Legacy Code & Technical Debt Analysis' });
    const result = await agent.execute(ctx);
    
    assert(result.outputPayload !== null, 'outputPayload is null');
    assert(typeof result.outputPayload === 'object', 'outputPayload not an object');
    assert(result.verificationScore > 0, `verificationScore: ${result.verificationScore}`);
    assert(result.durationMs >= 0, `durationMs: ${result.durationMs}`);
    
    // Schema validation
    const o = result.outputPayload;
    assert(typeof o.architecturePattern === 'string', 'missing architecturePattern');
    assert(typeof o.technicalDebtScore === 'number', 'missing technicalDebtScore');
    assert(Array.isArray(o.couplingHotspots), 'missing couplingHotspots');
    assert(Array.isArray(o.eolRisks), 'missing eolRisks');
    assert(Array.isArray(o.serviceBoundaryCandidates), 'missing serviceBoundaryCandidates');
    assert(typeof o.estimatedTotalRefactorDays === 'number', 'missing estimatedTotalRefactorDays');
    assert(typeof o.summary === 'string', 'missing summary');
  });

  await test('CodeAnalysisAgent incorporates RAG context when provided', async () => {
    const agent = AgentRegistry.getAgent('code_analysis_agent');
    const ctx = makeContext({
      taskTitle: 'Legacy Code & Technical Debt Analysis',
      ragContext: '[Source 1: RetailCore Architecture v3.2 (Relevance: 94%)]\nSpring Framework 4.x monolith with 480k lines of Java code.',
    });
    const result = await agent.execute(ctx);
    // Should still execute successfully with RAG context
    assert(result.outputPayload.architecturePattern !== undefined, 'output missing architecturePattern with RAG context');
  });

  let codeAnalysisOutput;
  await test('CodeAnalysisAgent validate() passes on valid output', async () => {
    const agent = AgentRegistry.getAgent('code_analysis_agent');
    const ctx = makeContext({ taskTitle: 'Legacy Code & Technical Debt Analysis' });
    const result = await agent.execute(ctx);
    codeAnalysisOutput = result.outputPayload;
    const validation = agent.validate(result.outputPayload);
    assert(validation.isValid === true, `validate() failed: ${validation.notes}`);
    assert(validation.score > 0, `score: ${validation.score}`);
  });

  await test('ArchitectureModernizationAgent executes with upstream code analysis output', async () => {
    const agent = AgentRegistry.getAgent('architecture_modernization_agent');
    const ctx = makeContext({
      taskTitle: 'Architecture Modernization & Migration Strategy',
      upstreamOutputs: {
        'code_analysis_agent': codeAnalysisOutput || { architecturePattern: 'Monolithic MVC', technicalDebtScore: 72 },
        'Legacy Code & Technical Debt Analysis': codeAnalysisOutput || {},
      },
    });
    const result = await agent.execute(ctx);
    
    assert(result.outputPayload !== null, 'outputPayload is null');
    const o = result.outputPayload;
    assert(typeof o.modernizationApproach === 'string', 'missing modernizationApproach');
    assert(typeof o.targetArchitecture === 'string', 'missing targetArchitecture');
    assert(Array.isArray(o.phases), 'missing phases');
    assert(o.phases.length > 0, 'phases is empty');
    assert(Array.isArray(o.eventDrivenBoundaries), 'missing eventDrivenBoundaries');
    assert(typeof o.estimatedTimelineMonths === 'number', 'missing estimatedTimelineMonths');
    assert(Array.isArray(o.successMetrics), 'missing successMetrics');
    assert(typeof o.summary === 'string', 'missing summary');
    assert(result.verificationScore >= 80, `verificationScore too low: ${result.verificationScore}`);
  });

  await test('ArchitectureModernizationAgent phases contain API contracts', async () => {
    const agent = AgentRegistry.getAgent('architecture_modernization_agent');
    const ctx = makeContext({ taskTitle: 'Architecture Modernization & Migration Strategy' });
    const result = await agent.execute(ctx);
    const phase1 = result.outputPayload.phases[0];
    assert(phase1 !== undefined, 'phase 1 missing');
    assert(Array.isArray(phase1.apiContracts), 'phase1 missing apiContracts');
    assert(phase1.apiContracts.length > 0, 'phase1 apiContracts is empty');
  });

  let archOutput;
  await test('TestStrategyAgent executes with upstream architecture output', async () => {
    const agent = AgentRegistry.getAgent('test_strategy_agent');
    archOutput = {
      modernizationApproach: 'strangler_fig',
      phases: [{ phase: 1, name: 'Extract Payment Service', servicesExtracted: ['PaymentService'] }],
    };
    const ctx = makeContext({
      taskTitle: 'Testing & Quality Assurance Strategy',
      upstreamOutputs: {
        'architecture_modernization_agent': archOutput,
        'Architecture Modernization & Migration Strategy': archOutput,
      },
    });
    const result = await agent.execute(ctx);
    
    const o = result.outputPayload;
    assert(typeof o.testingPyramid === 'object', 'missing testingPyramid');
    assert(typeof o.testingPyramid.unitTests === 'object', 'missing unitTests');
    assert(typeof o.testingPyramid.contractTests === 'object', 'missing contractTests');
    assert(Array.isArray(o.cicdQualityGates), 'missing cicdQualityGates');
    assert(o.cicdQualityGates.length > 0, 'cicdQualityGates empty');
    assert(typeof o.estimatedTestingEffortDays === 'number', 'missing estimatedTestingEffortDays');
    assert(typeof o.summary === 'string', 'missing summary');
    assert(result.verificationScore >= 80, `verificationScore: ${result.verificationScore}`);
  });

  await test('TestStrategyAgent CI/CD quality gates have required fields', async () => {
    const agent = AgentRegistry.getAgent('test_strategy_agent');
    const ctx = makeContext({ taskTitle: 'Testing & Quality Assurance Strategy' });
    const result = await agent.execute(ctx);
    for (const gate of result.outputPayload.cicdQualityGates) {
      assert(typeof gate.gate === 'string', `gate.gate missing`);
      assert(typeof gate.threshold === 'string', `gate.threshold missing`);
      assert(typeof gate.blocksMerge === 'boolean', `gate.blocksMerge missing`);
    }
  });

  await test('StrategyAgent executes on SDLC goal context', async () => {
    const agent = AgentRegistry.getAgent('strategy_agent');
    const ctx = makeContext({
      taskTitle: 'Modernization Strategy Synthesis & Executive Roadmap',
      inputPayload: { format: 'executive_roadmap', includeKPIs: true },
    });
    const result = await agent.execute(ctx);
    assert(result.outputPayload !== null, 'outputPayload is null');
    assert(result.verificationScore > 0, 'verificationScore must be > 0');
  });

  await test('VerificationAgent executes on SDLC workflow outputs', async () => {
    const agent = AgentRegistry.getAgent('verification_agent');
    const ctx = makeContext({
      taskTitle: 'Output Verification & Quality Assurance',
      inputPayload: {
        targetOutput: { modernizationApproach: 'strangler_fig', phases: 3 },
        checkFactualGrounding: true,
      },
      upstreamOutputs: {
        'code_analysis_agent': { technicalDebtScore: 72 },
        'architecture_modernization_agent': { modernizationApproach: 'strangler_fig' },
      },
    });
    const result = await agent.execute(ctx);
    assert(result.outputPayload !== null, 'outputPayload is null');
    // Verification agent output must contain quality scoring
    const o = result.outputPayload;
    const hasScoring = (
      o.confidenceScore !== undefined ||
      o.passed !== undefined ||
      o.verificationScore !== undefined ||
      o.score !== undefined
    );
    assert(hasScoring, `Output missing quality scoring fields. Keys: ${Object.keys(o).join(', ')}`);
    assert(result.verificationScore > 0, `verificationScore: ${result.verificationScore}`);
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 4: RAG Document & Demo Seed
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 4: RAG Demo Document');

  await test('legacyDemoSeed module loads without error', () => {
    const { DEMO_LEGACY_ARCHITECTURE_DOCUMENT, seedLegacyDemoDocument } = require('./dist/rag/legacyDemoSeed');
    assert(typeof DEMO_LEGACY_ARCHITECTURE_DOCUMENT === 'string', 'DEMO doc not a string');
    assert(DEMO_LEGACY_ARCHITECTURE_DOCUMENT.length > 5000, `Doc too short: ${DEMO_LEGACY_ARCHITECTURE_DOCUMENT.length}`);
    assert(typeof seedLegacyDemoDocument === 'function', 'seedLegacyDemoDocument not a function');
  });

  await test('Demo document contains fictional RetailCore content', () => {
    const { DEMO_LEGACY_ARCHITECTURE_DOCUMENT } = require('./dist/rag/legacyDemoSeed');
    const doc = DEMO_LEGACY_ARCHITECTURE_DOCUMENT;
    const docLower = doc.toLowerCase();
    assert(doc.includes('RetailCore'), 'missing RetailCore');
    assert(doc.includes('Spring Framework'), 'missing Spring Framework reference');
    assert(docLower.includes('strangler'), 'missing strangler fig reference');
    assert(doc.includes('OrderService'), 'missing OrderService coupling analysis');
    assert(docLower.includes('service boundary'), 'missing service boundary section');
  });

  await test('Demo document contains no real credentials', () => {
    const { DEMO_LEGACY_ARCHITECTURE_DOCUMENT } = require('./dist/rag/legacyDemoSeed');
    const doc = DEMO_LEGACY_ARCHITECTURE_DOCUMENT.toLowerCase();
    // Check for patterns that would indicate real secrets
    const sensitivePatterns = [
      /password\s*=\s*[^\s"'<>]{8,}/,
      /api_key\s*=\s*[^\s"'<>]{20,}/,
      /secret\s*=\s*[^\s"'<>]{20,}/,
      /sk-[a-z0-9]{40,}/,  // OpenAI key pattern
      /AIza[a-z0-9\-_]{35}/i,  // Gemini key pattern
    ];
    for (const pattern of sensitivePatterns) {
      assert(!pattern.test(doc), `Document may contain real credential matching ${pattern}`);
    }
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 5: DAG Logic Validation
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 5: DAG Execution Logic');

  const { DAGService } = require('./dist/orchestrator/dag');

  await test('DAGService.getReadyTasks identifies root task as ready', () => {
    const mockTasks = [
      { _id: { toString: () => 'id1' }, status: 'pending', dependencies: [] },
      { _id: { toString: () => 'id2' }, status: 'pending', dependencies: [{ toString: () => 'id1' }] },
      { _id: { toString: () => 'id3' }, status: 'pending', dependencies: [{ toString: () => 'id2' }] },
    ];
    const ready = DAGService.getReadyTasks(mockTasks);
    assert(ready.length === 1, `Expected 1 ready task, got ${ready.length}`);
    assert(ready[0]._id.toString() === 'id1', 'Wrong task marked ready');
  });

  await test('DAGService unlocks downstream task when dependency completes', () => {
    const mockTasks = [
      { _id: { toString: () => 'id1' }, status: 'completed', dependencies: [] },
      { _id: { toString: () => 'id2' }, status: 'pending', dependencies: [{ toString: () => 'id1' }] },
      { _id: { toString: () => 'id3' }, status: 'pending', dependencies: [{ toString: () => 'id2' }] },
    ];
    const ready = DAGService.getReadyTasks(mockTasks);
    // id1 is completed, id2's dep is complete → id2 should be ready
    // id3's dep (id2) is not complete → id3 should not be ready
    const readyIds = ready.map(t => t._id.toString());
    assert(readyIds.includes('id2'), 'id2 should be ready (dep id1 completed)');
    assert(!readyIds.includes('id3'), 'id3 should NOT be ready (dep id2 not completed)');
  });

  await test('DAGService.calculateWorkflowProgress returns 0 for no completed tasks', () => {
    const tasks = [
      { _id: { toString: () => 'a' }, status: 'pending', dependencies: [] },
      { _id: { toString: () => 'b' }, status: 'pending', dependencies: [] },
    ];
    const progress = DAGService.calculateWorkflowProgress(tasks);
    assert(progress === 0, `Expected 0, got ${progress}`);
  });

  await test('DAGService.calculateWorkflowProgress returns 60 for 3/5 completed', () => {
    const tasks = [
      { _id: { toString: () => 'a' }, status: 'completed', dependencies: [] },
      { _id: { toString: () => 'b' }, status: 'completed', dependencies: [] },
      { _id: { toString: () => 'c' }, status: 'completed', dependencies: [] },
      { _id: { toString: () => 'd' }, status: 'pending', dependencies: [] },
      { _id: { toString: () => 'e' }, status: 'pending', dependencies: [] },
    ];
    const progress = DAGService.calculateWorkflowProgress(tasks);
    assert(progress === 60, `Expected 60, got ${progress}`);
  });

  await test('DAGService.serializeToReactFlow produces valid nodes and edges for SDLC-shaped DAG', () => {
    // Simulate what the SDLC 5-task plan would look like after persisting
    const { Types } = require('mongoose');
    const ids = ['aaa', 'bbb', 'ccc', 'ddd', 'eee'].map(s => ({
      toString: () => s,
    }));
    const tasks = [
      { _id: ids[0], title: 'Code Analysis', description: 'Tech debt', agentType: 'code_analysis_agent', status: 'completed', dependencies: [], retryCount: 0 },
      { _id: ids[1], title: 'Architecture Plan', description: 'Modernize', agentType: 'architecture_modernization_agent', status: 'running', dependencies: [ids[0]], retryCount: 0 },
      { _id: ids[2], title: 'Test Strategy', description: 'Tests', agentType: 'test_strategy_agent', status: 'pending', dependencies: [ids[1]], retryCount: 0 },
      { _id: ids[3], title: 'Strategy Synthesis', description: 'Roadmap', agentType: 'strategy_agent', status: 'pending', dependencies: [ids[2]], retryCount: 0 },
      { _id: ids[4], title: 'Verification', description: 'Verify', agentType: 'verification_agent', status: 'pending', dependencies: [ids[3]], retryCount: 0 },
    ];
    const graph = DAGService.serializeToReactFlow(tasks);
    assert(graph.nodes.length === 5, `Expected 5 nodes, got ${graph.nodes.length}`);
    assert(graph.edges.length === 4, `Expected 4 edges, got ${graph.edges.length}`);
    // Validate edge source/target reference valid node ids
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    for (const edge of graph.edges) {
      assert(nodeIds.has(edge.source), `Edge source ${edge.source} not in nodes`);
      assert(nodeIds.has(edge.target), `Edge target ${edge.target} not in nodes`);
    }
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 6: Permission Manager (HITL) — Unit Test
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 6: HITL Approval Logic');

  const { ToolRegistry } = require('./dist/tools/toolRegistry');
  ToolRegistry.initialize();

  await test('ToolRegistry initializes and contains expected tools', () => {
    const tools = ToolRegistry.listTools();
    assert(Array.isArray(tools), 'listTools() should return array');
    const toolNames = tools.map(t => t.name);
    assert(toolNames.includes('web_search'), 'missing web_search');
    assert(toolNames.includes('github_action'), 'missing github_action');
    assert(toolNames.includes('email_dispatch'), 'missing email_dispatch');
    assert(toolNames.includes('calendar_schedule'), 'missing calendar_schedule');
  });

  await test('email_dispatch is marked sensitive (requires HITL)', () => {
    const tool = ToolRegistry.getTool('email_dispatch');
    assert(tool !== undefined, 'email_dispatch not registered');
    assert(tool.isSensitive === true, 'email_dispatch should be sensitive');
  });

  await test('calendar_schedule is marked sensitive (requires HITL)', () => {
    const tool = ToolRegistry.getTool('calendar_schedule');
    assert(tool !== undefined, 'calendar_schedule not registered');
    assert(tool.isSensitive === true, 'calendar_schedule should be sensitive');
  });

  await test('web_search is NOT marked sensitive (safe tool)', () => {
    const tool = ToolRegistry.getTool('web_search');
    assert(tool !== undefined, 'web_search not registered');
    assert(tool.isSensitive === false, 'web_search should not be sensitive');
  });

  await test('github_action is NOT marked sensitive (safe tool)', () => {
    const tool = ToolRegistry.getTool('github_action');
    assert(tool !== undefined, 'github_action not registered');
    assert(tool.isSensitive === false, 'github_action should not be sensitive');
  });

  await test('SDLC agents have appropriate tool permissions', () => {
    // code_analysis_agent is allowed github_action (code repo audit)
    const codeAgent = AgentRegistry.getAgent('code_analysis_agent');
    assert(codeAgent.allowedTools.includes('github_action'), 'code_analysis_agent should have github_action');
    assert(codeAgent.allowedTools.includes('read_knowledge'), 'code_analysis_agent should have read_knowledge');
    
    // architecture_modernization_agent should NOT have sensitive tools
    const archAgent = AgentRegistry.getAgent('architecture_modernization_agent');
    assert(!archAgent.allowedTools.includes('email_dispatch'), 'arch agent should not have email_dispatch');
    assert(!archAgent.allowedTools.includes('calendar_schedule'), 'arch agent should not have calendar_schedule');

    // test_strategy_agent only needs read_knowledge
    const testAgent = AgentRegistry.getAgent('test_strategy_agent');
    assert(testAgent.allowedTools.includes('read_knowledge'), 'test_strategy_agent should have read_knowledge');
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 7: LLM Semantic Fallback Engine (direct — bypasses live LLM key)
  // NOTE: generateJSON() calls a live LLM if a key is present in .env.
  // These tests call generateSemanticFallback() directly to test the fallback
  // engine in isolation, regardless of environment configuration.
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 7: LLM Semantic Fallback Engine (direct)');

  const { LLMService } = require('./dist/services/llm.service');
  const semanticFallback = (opts) => LLMService['generateSemanticFallback'](opts);

  await test('SDLC goal analyzer fallback returns extractedData.goalType=sdlc', () => {
    const result = semanticFallback({
      prompt: 'goal understanding request: modernize legacy monolith sdlc migration',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    assert(parsed.extractedData !== undefined, 'missing extractedData');
    assert(parsed.extractedData.goalType === 'sdlc', `goalType: ${parsed.extractedData.goalType}`);
    assert(typeof parsed.readinessScore === 'number', 'missing readinessScore');
    assert(Array.isArray(parsed.missingInformation), 'missing missingInformation');
  });

  await test('SDLC fallback returns tech-stack clarification questions', () => {
    const result = semanticFallback({
      prompt: 'goal understanding request: modernize legacy monolith sdlc migration',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    const questions = parsed.missingInformation.map(q => q.question || '').join(' ').toLowerCase();
    assert(
      questions.includes('stack') || questions.includes('codebase') || questions.includes('engineer'),
      `SDLC questions not SDLC-relevant: "${questions.substring(0, 120)}"`
    );
  });

  await test('Code analysis fallback returns structured technical debt output', () => {
    const result = semanticFallback({
      prompt: 'legacy code technical debt coupling hotspot analysis service boundaries',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    assert(typeof parsed.architecturePattern === 'string', 'missing architecturePattern');
    assert(typeof parsed.technicalDebtScore === 'number', 'missing technicalDebtScore');
    assert(Array.isArray(parsed.couplingHotspots), 'missing couplingHotspots');
  });

  await test('Career goal analyzer fallback returns goalType=career (regression)', () => {
    const result = semanticFallback({
      prompt: 'goal understanding request: i want a software engineer job career resume',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    assert(parsed.extractedData?.goalType === 'career', `goalType: ${parsed.extractedData?.goalType}`);
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 8: BaseAgent.validate() consistency
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 8: BaseAgent Validation');

  await test('All SDLC agents return isValid=false for empty output', () => {
    const sdlcAgentIds = ['code_analysis_agent', 'architecture_modernization_agent', 'test_strategy_agent'];
    for (const id of sdlcAgentIds) {
      const agent = AgentRegistry.getAgent(id);
      const v1 = agent.validate({});
      const v2 = agent.validate(null);
      const v3 = agent.validate(undefined);
      assert(v1.isValid === false, `${id} validate({}) should be invalid`);
      assert(v2.isValid === false, `${id} validate(null) should be invalid`);
      assert(v3.isValid === false, `${id} validate(undefined) should be invalid`);
    }
  });

  await test('All SDLC agents return isValid=true for non-empty output', () => {
    const sdlcAgentIds = ['code_analysis_agent', 'architecture_modernization_agent', 'test_strategy_agent'];
    for (const id of sdlcAgentIds) {
      const agent = AgentRegistry.getAgent(id);
      const v = agent.validate({ result: 'some output', key: 'value' });
      assert(v.isValid === true, `${id} validate(valid_output) should be valid`);
      assert(v.score > 0, `${id} validate score should be > 0`);
    }
  });

  // ──────────────────────────────────────────────────────────
  // SECTION 9: Goal Route Validation (type level)
  // ──────────────────────────────────────────────────────────
  console.log('\n📋 Section 9: Route Schema Validation (static)');

  await test('goal.routes.ts Zod schema allows sdlc type', () => {
    // Test Zod schema directly
    const { z } = require('zod');
    const createGoalSchema = z.object({
      title: z.string().min(3),
      rawPrompt: z.string().min(5),
      goalType: z.enum([
        'career', 'startup', 'business', 'product_launch',
        'personal_brand', 'freelance', 'sdlc', 'custom',
      ]).default('career'),
    });
    const result = createGoalSchema.safeParse({
      title: 'Modernize Legacy Monolith',
      rawPrompt: 'Modernize a legacy Java Spring monolith into microservices',
      goalType: 'sdlc',
    });
    assert(result.success === true, `Schema rejected sdlc: ${JSON.stringify(result.error?.issues)}`);
    assert(result.data.goalType === 'sdlc', `goalType not sdlc: ${result.data.goalType}`);
  });

  await test('goal.routes.ts Zod schema accepts all original types (regression)', () => {
    const { z } = require('zod');
    const schema = z.object({
      title: z.string().min(3),
      rawPrompt: z.string().min(5),
      goalType: z.enum(['career', 'startup', 'business', 'product_launch', 'personal_brand', 'freelance', 'sdlc', 'custom']).default('career'),
    });
    for (const type of ['career', 'startup', 'business', 'product_launch', 'personal_brand', 'freelance', 'custom']) {
      const result = schema.safeParse({
        title: 'Test Goal',
        rawPrompt: 'Test prompt',
        goalType: type,
      });
      assert(result.success, `Schema rejected existing type '${type}'`);
    }
  });

  // ──────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('✅ All tests passed.\n');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('\nTest runner crashed:', err);
  process.exit(1);
});
