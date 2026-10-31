const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the actual TypeScript module with isolated provider mocks.
// These are negative release-safety tests, NOT live deployment tests.
const src = fs.readFileSync('base44/shared/autopilot.ts', 'utf8');
const code = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
function harness() {
  const calls = [];
  const mod = { exports: {} };
  const base44 = {
    asServiceRole: {
      functions: { invoke: async (name, args) => {
        calls.push({ name, args });
        throw Error('Unexpected external action: ' + name);
      }},
      entities: {
        AutopilotJob: { update: async (_id, patch) => ({ id: 'synthetic-1', ...patch }) },
        StudioPage: { get: async () => ({ blocks: [] }) }
      }
    }
  };
  vm.runInNewContext(code, {
    module: mod, exports: mod.exports, require: (name) => {
      if (name === './qa.ts') return { auditPage: () => ({
        verdict: 'pass', score: 100, checks: [], findings: []
      }) };
      throw Error('Unexpected import ' + name);
    },
    Date, JSON, String, Number, Object, Array, Promise, Set, Math
  }, { filename: 'autopilot-release-gate-test.js' });
  return { base44, calls, advance: mod.exports.advanceJob };
}
test('ship stage cannot create or approve a production deployment', async () => {
  const x = harness();
  const result = await x.advance(x.base44, {
    id: 'synthetic-1', stage: 'ship', status: 'running',
    project_id: 'synthetic-project', steps: [], ceiling: { verdict: 'pass', score: 100 }
  });
  assert.equal(result.status, 'awaiting_approval');
  assert.equal(result.stage, 'done');
  assert.equal(x.calls.length, 0);
  assert.match(result.browser_note, /No deployment was initiated/);
});
test('even a perfect quality score cannot auto-publish', async () => {
  const x = harness();
  const quality = await x.advance(x.base44, {
    id: 'synthetic-1', stage: 'ceiling', status: 'running',
    project_id: 'synthetic-project', pages: [], steps: []
  });
  assert.equal(quality.ceiling.verdict, 'pass');
  assert.equal(quality.stage, 'ship');
  const gated = await x.advance(x.base44, quality);
  assert.equal(gated.status, 'awaiting_approval');
  assert.equal(x.calls.length, 0);
});
test('repeated ticks cannot convert awaiting approval into completed', async () => {
  const x = harness();
  const held = { id: 'synthetic-1', status: 'awaiting_approval', stage: 'done', steps: [] };
  const result = await x.advance(x.base44, held);
  assert.equal(result.status, 'awaiting_approval');
  assert.equal(result.stage, 'done');
  assert.equal(x.calls.length, 0);
});
test('the branch schema accepts awaiting_approval and UI describes the hold', () => {
  const schema = JSON.parse(fs.readFileSync('base44/entities/AutopilotJob.jsonc', 'utf8'));
  assert.ok(schema.properties.status.enum.includes('awaiting_approval'));
  const card = fs.readFileSync('src/components/autopilot/JobCard.jsx', 'utf8');
  assert.match(card, /awaiting_approval: 'Release approval required'/);
});
