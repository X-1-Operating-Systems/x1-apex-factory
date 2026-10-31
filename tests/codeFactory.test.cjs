const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const src = fs.readFileSync('base44/functions/codeFactory/entry.ts', 'utf8');
const js = ts.transpileModule(src, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const owner = 'user-1', repo = 'Strategic-Minds-AI/x1-infinity-agent-runtime', baseSha = 'a'.repeat(40), fileSha = 'b'.repeat(40), headSha = 'c'.repeat(40);
let store, calls, modelCalls, sdk, context, handler, schemaAvailable;
function reset(){
 store=new Map();calls=[];modelCalls=0;schemaAvailable=true;
 sdk={
   auth:{me:async()=>({id:owner,role:'admin'})},
   asServiceRole:{
    connectors:{getConnection:async(key)=>key==='github'?{accessToken:'FAKE_TEST_ONLY'}:null},
    entities:{CodeJob:{
      async create(v){const id='aaaaaaaaaaaa00000000000'+(store.size+1);const job={...v,id,created_by_id:owner};store.set(id,job);return {...job};},
      async get(id){return store.get(id)||null;},
      async update(id,patch){const obj={...store.get(id),...patch};store.set(id,obj);return {...obj};},
      async filter(query){if(!schemaAvailable)throw Error("CodeJob entity schema not found");return {items:[...store.values()].filter(item=>Object.entries(query).every(([k,v])=>item[k]===v))};}
    }},
    integrations:{Core:{InvokeLLM:async()=>{modelCalls++;return {
      summary:'Fix a bounded retry defect',risks:['Check concurrency'],test_commands:['npm test'],
      files:[{path:'src/worker.ts',content:'export const safe = true;\n',rationale:'Small reversible change'}]
    };}}}
   }
 };
 const mod={exports:{}};
 context={module:mod,exports:mod.exports,Response,Request,URL,TextEncoder,TextDecoder,AbortSignal,atob,btoa,console,Date,
   require:(key)=>{if(key.startsWith('npm:@base44/sdk'))return {createClientFromRequest:()=>sdk};throw Error('Unexpected module '+key);},
   fetch:async(u,init={})=>{
    const url=new URL(u);const p=url.pathname;const method=init.method||'GET';calls.push({path:p,method});
    let data={};
    if(p=== '/repos/'+repo || p==='/repos/X-1-Operating-Systems/x1-apex-factory') data={archived:false,disabled:false};
    else if(p.endsWith('/git/ref/heads/main'))data={object:{sha:baseSha}};
    else if(p.includes('/contents/src/worker.ts') && method==='GET')data={type:'file',size:28,encoding:'base64',content:btoa('export const safe = false;\n'),sha:fileSha};
    else if(p.endsWith('/git/refs')&&method==='POST')data={ref:'refs/heads/x1/autocode-test'};
    else if(p.includes('/contents/src/worker.ts')&&method==='PUT')data={commit:{sha:headSha}};
    else if(p.endsWith('/pulls')&&method==='POST')data={number:23,html_url:'https://github.com/'+repo+'/pull/23'};
    else if(p.includes('/check-runs'))data={check_runs:[{name:'worker-checks',status:'completed',conclusion:'success',html_url:'https://github.com/'+repo+'/actions'}]};
    else throw Error('Mock denied unsupported GitHub route '+method+' '+p);
    return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
   }
 };
 vm.runInNewContext(js,context,{filename:'codeFactory-test.cjs'});
 handler=mod.exports.default;
}
async function action(body) {
 const res=await handler(new Request('https://preview.example/api/codeFactory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
 return {status:res.status,body:await res.json()};
}
test('rejects non-admin users and unauthorized repository paths',async()=>{
 reset();sdk.auth.me=async()=>({id:owner,role:'member'});
 const notAdmin=await action({action:'create',repo,title:'test',goal:'Test a safe code change',paths:['src/worker.ts']});
 assert.equal(notAdmin.status,403);
 sdk.auth.me=async()=>({id:owner,role:'admin'});
 const badRepo=await action({action:'create',repo:'someone-else/repo',title:'test',goal:'Test a safe code change',paths:['src/worker.ts']});
 assert.equal(badRepo.body.ok,false);
 const badPath=await action({action:'create',repo,title:'test',goal:'Test a safe code change',paths:['.github/workflows/exfil.yml']});
 assert.equal(badPath.body.ok,false);
 assert.equal(store.size,0);
});
test('read-only GitHub canary pins the existing branch without model use or writes',async()=>{
 reset();
 const result=await action({action:'probe',repo,base_ref:'main'});
 assert.equal(result.status,200,JSON.stringify(result));
 assert.equal(result.body.ok,true);
 assert.equal(result.body.read_only,true);
 assert.equal(result.body.sha,baseSha);
 assert.equal(result.body.model_calls,0);
 assert.equal(modelCalls,0);
 assert.equal(store.size,0);
 assert.equal(calls.length,2);
 assert.equal(calls.filter(c=>c.method!=='GET').length,0);
});
test('exact X1 APEX repository is allowed for read-only probe but sibling repositories are refused',async()=>{
 reset();
 const actual='X-1-Operating-Systems/x1-apex-factory';
 const accepted=await action({action:'probe',repo:actual,base_ref:'main'});
 assert.equal(accepted.status,200,JSON.stringify(accepted.body));
 assert.equal(accepted.body.repo,actual);
 assert.equal(accepted.body.sha,baseSha);
 assert.equal(accepted.body.read_only,true);
 assert.equal(modelCalls,0);
 assert.equal(calls.filter(c=>c.method!=='GET').length,0);
 const sibling=await action({action:'probe',repo:'X-1-Operating-Systems/other-repo',base_ref:'main'});
 assert.equal(sibling.body.ok,false);
 const lowercase=await action({action:'probe',repo:'x-1-operating-systems/x1-apex-factory',base_ref:'main'});
 assert.equal(lowercase.body.ok,false);
 assert.equal(calls.length,2,'rejected repository names must fail before GitHub I/O');
});
test('unregistered branch ledger fails closed while preserving credit-free read-only GitHub probe',async()=>{
 reset();schemaAvailable=false;
 const listing=await action({action:'list'});
 assert.equal(listing.status,200);
 assert.equal(listing.body.schema_ready,false);
 assert.equal(listing.body.jobs.length,0);
 assert.match(listing.body.warning,/not registered/i);
 const noWrite=await action({action:'create',repo,title:'Disabled',goal:'Prevent missing schema writes',paths:['src/worker.ts']});
 assert.equal(noWrite.status,503);
 assert.equal(noWrite.body.ok,false);
 assert.equal(store.size,0);
 const probe=await action({action:'probe',repo:'X-1-Operating-Systems/x1-apex-factory'});
 assert.equal(probe.status,200);
 assert.equal(probe.body.read_only,true);
 assert.equal(modelCalls,0);
 assert.equal(calls.filter(x=>x.method!=='GET').length,0);
});
test('creates a job without spending credits or altering GitHub',async()=>{
 reset();
 const r=await action({action:'create',repo,title:'Bounded fix',goal:'Fix the task retry path with tests',paths:['src/worker.ts']});
 assert.equal(r.body.ok,true);assert.equal(r.body.job.state,'draft');assert.equal(modelCalls,0);assert.equal(calls.length,0);
});
test('plans once, stages draft PR only on explicit action, checks real CI and leaves Guardian pending',async()=>{
 reset();
 const created=await action({action:'create',repo,title:'Bounded fix',goal:'Fix the task retry path with tests',paths:['src/worker.ts']});
 const id=created.body.job.id;
 const planned=await action({action:'plan',job_id:id});
 assert.equal(planned.body.ok,true,JSON.stringify(planned.body));
 assert.equal(planned.body.job.state,'planned');assert.equal(modelCalls,1);
 assert.equal(calls.filter(c=>c.method==='POST'||c.method==='PUT').length,0,'planning must not change GitHub');
 const staged=await action({action:'stage',job_id:id});
 assert.equal(staged.body.ok,true,JSON.stringify(staged.body));assert.equal(staged.body.job.state,'awaiting_ci');
 assert.match(staged.body.job.pull_request_url,/pull\/23/);
 const checks=await action({action:'check',job_id:id});
 assert.equal(checks.body.job.ci_status,'PASSED');assert.equal(checks.body.job.state,'ready_for_guardian');
 assert.equal(checks.body.job.guardian_verdict,'NOT_RUN');
 const repeat=await action({action:'stage',job_id:id});
 assert.equal(repeat.body.ok,false);
 assert.equal(calls.filter(c=>c.path.endsWith('/pulls')&&c.method==='POST').length,1);
});
test('automatic tick only polls approved CI and never invokes the model',async()=>{
 reset();
 const created=await action({action:'create',repo,title:'Bounded fix',goal:'Fix the task retry path with tests',paths:['src/worker.ts']});
 const id=created.body.job.id;
 await action({action:'plan',job_id:id});await action({action:'stage',job_id:id});
 const before=modelCalls;const result=await action({action:'tick'});
 assert.equal(result.body.ok,true);assert.equal(result.body.checked,1);assert.equal(modelCalls,before);
 assert.equal(store.get(id).state,'ready_for_guardian');
});
