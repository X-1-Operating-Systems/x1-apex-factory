const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(path, user, stubs = {}) {
  const trace = [];
  const base44 = {
    auth: { me: async () => user },
    asServiceRole: {
      entities: { ManusAccount: { filter: async () => ({ items: [] }) } },
      integrations: { Core: { UploadPublicFile: async () => { trace.push('upload-public'); throw Error('Unexpected upload'); } } }
    },
    entities: {}
  };
  const imports = {
    '../../shared/qa.ts': { auditPage: () => { trace.push('audit'); return {verdict:'pass',score:100}; } },
    '../../shared/bundle.ts': { manifestHash: async () => 'test', renderPageHtml: () => '', targetFiles: () => [] },
    '../../shared/vercel.ts': { deployToVercel: async () => { trace.push('deploy'); throw Error('Unexpected deployment'); }, deploymentName: () => 'test' },
    '../../shared/projects.ts': { projectBrief: async () => '' },
    '../../shared/manus.ts': {
      resolveUserKey: async () => stubs.account || { key: 'FAKE_WORKSPACE_TEST_ONLY', source:'workspace' },
      manusCall: async () => { trace.push('manus'); return { messages:[] }; },
      verifyKey: async () => { trace.push('verifyKey'); },
      keyHint: () => '••••test', digestTask: () => ({}),
      normalizeEvents: () => [], buildContent: () => [],
      summarizeRun: () => ({})
    }
  };
  const src = fs.readFileSync(path,'utf8');
  const js = ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod = {exports:{}};
  vm.runInNewContext(js,{
    module:mod,exports:mod.exports,
    require:(name)=>name.startsWith('npm:@base44/sdk') ? {createClientFromRequest:()=>base44} :
      (imports[name] || (()=>{throw Error('Unknown import '+name)})()),
    Response,Request,URL,Date,Promise,Array,JSON,String,Number,File:globalThis.File,
    TextEncoder,crypto:globalThis.crypto
  }, {filename:path});
  return {handler:mod.exports.default,trace};
}
async function request(handler,body){
  const r=await handler(new Request('https://preview.example/api/call',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
  }));
  return {status:r.status,body:await r.json()};
}
test('non-admin cannot prepare or approve any release',async()=>{
  const x=load('base44/functions/deployRelease/entry.ts',{id:'member',role:'member'});
  for(const action of ['run','approve']){
    const result=await request(x.handler,{action,project_id:'other-project',deployment_id:'other-deployment'});
    assert.equal(result.status,403);
  }
  assert.deepEqual(x.trace,[]);
});
test('share-link publication is admin-only but public resolve and owner read remain reachable',async()=>{
  const x=load('base44/functions/shareLink/entry.ts',{id:'member',role:'member'});
  for(const action of ['handoff','create']){
    const result=await request(x.handler,{action,deployment_id:'other-deployment',task_id:'other-task'});
    assert.equal(result.status,403);
  }
  const invalidPublic=await request(x.handler,{action:'resolve',token:'short'});
  assert.equal(invalidPublic.status,400);
  const listMissing=await request(x.handler,{action:'list'});
  assert.equal(listMissing.status,400);
  assert.deepEqual(x.trace,[]);
});
test('a member cannot use the shared Manus key for calls or key verification',async()=>{
  const x=load('base44/functions/manusAgent/entry.ts',{id:'member',role:'member'});
  for(const action of ['create','detail','status','testKey','tasks']){
    const r=await request(x.handler,{action,instruction:'Make site',task_id:'task-123'});
    assert.equal(r.status,403,action+' '+JSON.stringify(r));
  }
  assert.deepEqual(x.trace,[]);
});
test('personal-key member private-file attachment URI cannot be signed',async()=>{
  const x=load('base44/functions/manusAgent/entry.ts',{id:'member',role:'member'},{
    account:{key:'FAKE_PERSONAL_TEST_ONLY',source:'personal'}
  });
  const r=await request(x.handler,{action:'create',instruction:'Please analyze',attachments:[{file_uri:'private/other-tenant/report.pdf'}]});
  assert.equal(r.status,403);
  assert.deepEqual(x.trace,[]);
});
