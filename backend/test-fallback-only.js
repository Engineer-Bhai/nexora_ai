/**
 * Tests the semantic fallback engine directly (bypasses LLM key).
 * Calls the private generateSemanticFallback method.
 */
const { LLMService } = require('./dist/services/llm.service');

let passed = 0; let failed = 0;
const test = async (name, fn) => {
  try { await fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.error(`  FAIL: ${name} — ${e.message}`); failed++; }
};

// Access private method directly for targeted testing
const fallback = (opts) => LLMService['generateSemanticFallback'](opts);

async function run() {
  await test('SDLC goal analyzer fallback returns extractedData.goalType=sdlc', () => {
    const result = fallback({
      prompt: 'goal understanding request: modernize legacy monolith sdlc migration',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    if (!parsed.extractedData) throw new Error('missing extractedData');
    if (parsed.extractedData.goalType !== 'sdlc') throw new Error('goalType: ' + parsed.extractedData.goalType);
    if (typeof parsed.readinessScore !== 'number') throw new Error('missing readinessScore');
  });

  await test('Career goal analyzer fallback returns goalType=career', () => {
    const result = fallback({
      prompt: 'goal understanding request: i want a software engineer job career resume',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    if (!parsed.extractedData) throw new Error('missing extractedData');
    if (parsed.extractedData.goalType !== 'career') throw new Error('goalType: ' + parsed.extractedData.goalType);
  });

  await test('Startup goal analyzer fallback returns startup payload', () => {
    const result = fallback({
      prompt: 'goal understanding request: i want to build an ai startup saas founder',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    if (!parsed.extractedData) throw new Error('missing extractedData');
    if (parsed.extractedData.goalType !== 'startup') throw new Error('goalType: ' + parsed.extractedData.goalType);
  });

  await test('Technical debt/code analysis fallback returns architecturePattern', () => {
    const result = fallback({
      prompt: 'legacy code technical debt coupling hotspot analysis service boundaries',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    if (typeof parsed.architecturePattern !== 'string') throw new Error('missing architecturePattern');
    if (typeof parsed.technicalDebtScore !== 'number') throw new Error('missing technicalDebtScore');
    if (!Array.isArray(parsed.couplingHotspots)) throw new Error('missing couplingHotspots');
  });

  await test('Architecture modernization fallback returns phases', () => {
    const result = fallback({
      prompt: 'modernization strangler microservices decomposition migration strategy phased',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    if (typeof parsed.modernizationApproach !== 'string') throw new Error('missing modernizationApproach');
    if (!Array.isArray(parsed.phases)) throw new Error('missing phases');
    if (parsed.phases.length === 0) throw new Error('phases empty');
  });

  await test('Test strategy fallback returns testingPyramid', () => {
    const result = fallback({
      prompt: 'task: testing & quality assurance strategy respond in json with keys testingpyramid unittests cicdqualitygates',
      systemPrompt: ''
    });
    const parsed = JSON.parse(result.text);
    if (typeof parsed.testingPyramid !== 'object') throw new Error('missing testingPyramid');
    if (!Array.isArray(parsed.cicdQualityGates)) throw new Error('missing cicdQualityGates');
  });

  await test('Default fallback returns ok for unrecognized prompt', () => {
    const result = fallback({ prompt: 'some unrecognized prompt xyz abc', systemPrompt: '' });
    const parsed = JSON.parse(result.text);
    if (typeof parsed !== 'object') throw new Error('result not object');
  });

  console.log(`\nFallback tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('Crash:', err.message); process.exit(1); });
