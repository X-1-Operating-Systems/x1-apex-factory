import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const outbound = read('base44/shared/bridge.ts');
const factory = read('base44/functions/x1Bridge/entry.ts');
const mesh = read('base44/shared/mesh.ts');
const mcp = JSON.parse(read('base44/mcp/config.json'));
const bridgeTool = (mcp.tools?.functions || []).find((t) => t.name === 'x1_os_bridge');

test('outbound factory helper targets X1 factory bridge, not worker endpoint', () => {
  assert.match(outbound, /const url = `[^`\n]*\/functions\/x1ApexBridge`;/);
  assert.doesNotMatch(outbound, /const url = `[^`\n]*\/functions\/x1Bridge`;/);
});

test('outbound preserves signed bridge request and timeout', () => {
  assert.match(outbound, /\[BRIDGE_HEADER\]: key/);
  assert.match(outbound, /AbortSignal\.timeout\(25000\)/);
});

test('factory inbound keyed actions remain implemented independently', () => {
  assert.match(factory, /const endpoint = `[^`\n]*\/functions\/x1Bridge`;/);
  assert.match(factory, /keyMatches/);
});

test('factory-to-X1 only permits ping and report', () => {
  assert.match(factory, /const OUTBOUND_ACTIONS = \['ping', 'report'\];/);
  assert.doesNotMatch(factory, /const OUTBOUND_ACTIONS = \[[^\n]*heartbeat/);
});

test('os.status performs an actual factory ping', () => {
  assert.match(factory, /const target = action === 'os.call' \? String\(body\?\.os_action \|\| 'ping'\)\.trim\(\) : 'ping';/);
});

test('factory status cannot register a synthetic machine worker', () => {
  assert.doesNotMatch(factory, /name: 'x1-apex-factory'/);
  assert.match(factory, /A factory handshake must never register itself as a machine worker/);
});

test('mesh uses dedicated X1 factory endpoint and a non-mutating ping', () => {
  assert.match(mesh, /const res = await fetch\(`[^`\n]*\/functions\/x1ApexBridge`/);
  assert.match(mesh, /body: JSON\.stringify\(\{ action: 'ping' \}\)/);
  assert.doesNotMatch(mesh, /body: JSON\.stringify\(\{ action: 'heartbeat'/);
});

test('mesh response describes the factory bridge rather than queued machine jobs', () => {
  assert.match(mesh, /Factory bridge authenticated/);
  assert.doesNotMatch(mesh, /Heartbeat accepted — worker/);
});

test('MCP contract exposes the correct outbound action semantics', () => {
  assert.ok(bridgeTool);
  assert.match(bridgeTool.input_schema.properties.os_action.description, /ping.*report/);
  assert.match(bridgeTool.input_schema.properties.action.description, /dedicated factory bridge/);
});

test('no worker claim or complete is allowed through os.call', () => {
  assert.doesNotMatch(factory, /const OUTBOUND_ACTIONS = \[[^\n]*(claim|complete)/);
});
