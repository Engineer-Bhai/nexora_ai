/**
 * Nexora AI — Regression Check
 * Verifies that all original non-SDLC agents and plans still work correctly.
 *
 * Correct static API:
 *   AgentRegistry.initialize()
 *   AgentRegistry.listAgents() → Agent[]
 *   AgentRegistry.getAgent(id) → Agent
 *   TaskPlanner['getDefaultPlanForGoal'](goal) → WorkflowPlan
 *   agent.getDefinition() → { agentId, name, role, description, allowedTools, ... }
 */

const { AgentRegistry } = require('./dist/agents/registry.js');
const { TaskPlanner } = require('./dist/orchestrator/planner.js');

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.log(`  ❌  ${label}`);
    failed++;
  }
}

console.log('\n════════════════════════════════════════════════');
console.log('  Nexora AI — Regression Check');
console.log('════════════════════════════════════════════════\n');

// ─── Agent Registry ──────────────────────────────────────────────────────────
console.log('📋 Agent Registry Regression\n');

AgentRegistry.initialize();
const allAgents = AgentRegistry.listAgents();
assert(`Total agents = 16 (13 original + 3 SDLC), got ${allAgents.length}`, allAgents.length === 16);

const originalIds = [
  'resume_agent', 'market_research_agent', 'competitor_agent', 'skill_gap_agent',
  'strategy_agent', 'content_agent', 'verification_agent', 'job_matching_agent',
  'company_research_agent', 'interview_agent', 'customer_persona_agent',
  'business_model_agent', 'mvp_strategy_agent'
];
const missingOriginals = originalIds.filter(id => !AgentRegistry.getAgent(id));
assert(`All 13 original agents present (missing: [${missingOriginals.join(', ')}])`, missingOriginals.length === 0);

const sdlcIds = ['code_analysis_agent', 'architecture_modernization_agent', 'test_strategy_agent'];
const missingSDLC = sdlcIds.filter(id => !AgentRegistry.getAgent(id));
assert(`All 3 SDLC agents present (missing: [${missingSDLC.join(', ')}])`, missingSDLC.length === 0);

// ─── Default Plans ────────────────────────────────────────────────────────────
console.log('\n📋 Default Plan Regression\n');

// TaskPlanner.getDefaultPlanForGoal is a private static method — access via bracket notation
const getDefaultPlan = TaskPlanner['getDefaultPlanForGoal'].bind(TaskPlanner);

// Note: getDefaultPlanForGoal reads goal.goalType (the IGoal interface field), not goal.type
const careerGoal = { goalType: 'career', title: 'Build a resume', description: 'Build a resume for a software engineer' };
const careerPlan = getDefaultPlan(careerGoal);
assert(`Career plan generates (got ${careerPlan.tasks.length} tasks)`, careerPlan.tasks.length >= 4);
assert('Career plan has resume_agent', careerPlan.tasks.some(t => t.agentType === 'resume_agent'));

const startupGoal = { goalType: 'startup', title: 'Build a SaaS startup', description: 'Build a SaaS startup' };
const startupPlan = getDefaultPlan(startupGoal);
assert(`Startup plan generates (got ${startupPlan.tasks.length} tasks)`, startupPlan.tasks.length >= 4);
assert('Startup plan has customer_persona_agent', startupPlan.tasks.some(t => t.agentType === 'customer_persona_agent'));

const researchGoal = { goalType: 'research', title: 'Research AI trends', description: 'Research AI trends' };
const researchPlan = getDefaultPlan(researchGoal);
assert(`Research plan generates (got ${researchPlan.tasks.length} tasks)`, researchPlan.tasks.length >= 2);

const projectGoal = { goalType: 'project', title: 'Build a web app', description: 'Build a web app' };
const projectPlan = getDefaultPlan(projectGoal);
assert(`Project plan generates (got ${projectPlan.tasks.length} tasks)`, projectPlan.tasks.length >= 2);

const sdlcGoal = { goalType: 'sdlc', title: 'Modernize legacy enterprise app', description: 'Modernize a legacy monolithic application' };
const sdlcPlan = getDefaultPlan(sdlcGoal);
assert(`SDLC plan generates (got ${sdlcPlan.tasks.length} tasks)`, sdlcPlan.tasks.length === 5);

const sdlcTaskOrder = sdlcPlan.tasks.map(t => t.agentType).join(' -> ');
assert(
  `SDLC plan task order correct: ${sdlcTaskOrder}`,
  sdlcTaskOrder === 'code_analysis_agent -> architecture_modernization_agent -> test_strategy_agent -> strategy_agent -> verification_agent'
);

// ─── Agent Definitions ────────────────────────────────────────────────────────
console.log('\n📋 Agent Definition Schema Regression\n');

for (const id of [...originalIds, ...sdlcIds]) {
  const agent = AgentRegistry.getAgent(id);
  if (!agent) {
    assert(`${id} agent found`, false);
    continue;
  }
  const def = agent.getDefinition();
  // Definition fields: agentId, name, role, description, allowedTools (array), category, systemPrompt, ...
  assert(
    `${id} has valid definition (name: "${def.name}")`,
    def.name && def.description && Array.isArray(def.allowedTools)
  );
}

// ─── SDLC Agent Definitions ───────────────────────────────────────────────────
console.log('\n📋 SDLC Agent-Specific Checks\n');

const codeAnalysis = AgentRegistry.getAgent('code_analysis_agent');
const caDef = codeAnalysis.getDefinition();
assert(`CodeAnalysisAgent category is "sdlc"`, caDef.category === 'sdlc');
assert(`CodeAnalysisAgent has web_search tool`, caDef.allowedTools.includes('web_search'));
assert(`CodeAnalysisAgent has github_action tool`, caDef.allowedTools.includes('github_action'));

const archMod = AgentRegistry.getAgent('architecture_modernization_agent');
const amDef = archMod.getDefinition();
assert(`ArchitectureModernizationAgent category is "sdlc"`, amDef.category === 'sdlc');
assert(`ArchitectureModernizationAgent has web_search tool`, amDef.allowedTools.includes('web_search'));
assert(`ArchitectureModernizationAgent has read_knowledge tool`, amDef.allowedTools.includes('read_knowledge'));

const testStrat = AgentRegistry.getAgent('test_strategy_agent');
const tsDef = testStrat.getDefinition();
assert(`TestStrategyAgent category is "sdlc"`, tsDef.category === 'sdlc');
assert(`TestStrategyAgent has read_knowledge tool`, tsDef.allowedTools.includes('read_knowledge'));

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All regression checks passed.\n');
}
