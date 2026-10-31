import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Code2, Play, ShieldCheck, RefreshCw, GitPullRequest, Loader2, AlertTriangle } from 'lucide-react';

const ORDER = ['draft','planning','planned','staging','awaiting_ci','ready_for_guardian','blocked','failed'];
const statusLabel = {
 draft:'Ready to plan', planning:'Generating proposal', planned:'Patch ready for review',
 staging:'Creating draft PR', awaiting_ci:'Awaiting GitHub CI', ready_for_guardian:'CI passed — Guardian pending',
 blocked:'Blocked / needs review', failed:'Failed'
};
const stamp = (value) => {
 try { return new Date(value).toLocaleString(); } catch { return value; }
};
export default function CodeFactory() {
 const [jobs,setJobs]=useState([]);
 const [selected,setSelected]=useState(null);
 const [busy,setBusy]=useState('');
 const [error,setError]=useState('');
 const [connection,setConnection]=useState(null);
 const [draft,setDraft]=useState({
  title:'',repo:'Strategic-Minds-AI/x1-infinity-agent-runtime',base_ref:'main',
  paths:'',goal:''
 });
 const invoke=async(action,values={})=>{
  const response=await base44.functions.invoke('codeFactory',{action,...values});
  if(response?.data?.ok===false) throw new Error(response?.data?.error || 'Coding action refused.');
  return response.data;
 };
 const refresh=useCallback(async()=>{
  const result=await invoke('list');
  setJobs(result.jobs || []);
  setSelected(old=>old ? (result.jobs || []).find(j=>j.id===old.id) || old : null);
 },[]);
 useEffect(()=>{ refresh().catch(e=>setError(e.message)); },[refresh]);
 const probe=async()=>{
  setBusy('probe');setError('');
  try {setConnection(await invoke('probe',{repo:draft.repo,base_ref:draft.base_ref}));}
  catch(e){setConnection(null);setError(e?.response?.data?.error || e.message);}
  finally{setBusy('');}
 };
 const create=async(e)=>{
  e.preventDefault();setError('');setBusy('create');
  try {
   const paths=draft.paths.split(/[\n,;]/).map(x=>x.trim()).filter(Boolean);
   const data=await invoke('create',{...draft,paths});
   setSelected(data.job);setDraft(x=>({...x,title:'',goal:'',paths:''}));
   await refresh();
  } catch(e){setError(e.message);} finally{setBusy('');}
 };
 const work=async(job,action)=>{
  setBusy(job.id + action);setError('');
  try {
   const data=await invoke(action,{job_id:job.id});
   setSelected(data.job);
   await refresh();
  } catch(e){setError(e?.response?.data?.error || e.message);} finally{setBusy('');}
 };
 const plan=selected?.plan_json ? (()=>{try{return JSON.parse(selected.plan_json);}catch{return null;}})() : null;
 return (
 <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 lg:px-10">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <div className="flex items-center gap-2"><Code2 size={19}/><h1 className="text-xl font-semibold">Autonomous Code Factory</h1></div>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Branch-first code generation, explicit write approval, GitHub CI and independent Guardian gate. No automatic production merges, paid API purchases or credential changes.</p>
    </div>
    <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary" onClick={()=>refresh().catch(e=>setError(e.message))}>
      <RefreshCw size={14}/> Refresh
    </button>
  </div>
  <div className="grid gap-4 md:grid-cols-4">
    {[
      ['Mission ledger',String(jobs.length)],
      ['Awaiting review',String(jobs.filter(j=>j.state==='planned'||j.state==='ready_for_guardian').length)],
      ['CI pending',String(jobs.filter(j=>j.state==='awaiting_ci').length)],
      ['Production releases','0 — approval gated']
    ].map(([label,value])=><div key={label} className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div>)}
  </div>
  {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 px-3 py-3 text-sm text-destructive"><AlertTriangle size={16}/>{error}</div>}
  <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
    <section className="space-y-4">
      <form onSubmit={create} className="space-y-3 rounded-xl border border-border bg-card p-5">
       <h2 className="text-sm font-semibold">New coding mission</h2>
       <label className="block text-xs text-muted-foreground">Mission name<input required maxLength={120} value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))} placeholder="Fix task queue claim race" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"/></label>
       <label className="block text-xs text-muted-foreground">GitHub repository<input required value={draft.repo} onChange={e=>{setConnection(null);setDraft(v=>({...v,repo:e.target.value}));}} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"/></label>
       <label className="block text-xs text-muted-foreground">Existing base branch<input required value={draft.base_ref} onChange={e=>{setConnection(null);setDraft(v=>({...v,base_ref:e.target.value}));}} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"/></label>
       <button type="button" disabled={!!busy} onClick={probe} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary disabled:opacity-50">{busy==='probe'?'Checking…':'Verify GitHub source — read only / no model credits'}</button>
       {connection && <p role="status" className="break-all text-xs text-muted-foreground">Connected: {connection.repo} · {connection.base_ref} @ {connection.sha.slice(0,12)} · {connection.can_push ? 'branch write permitted' : 'read access only'}. No credits or writes used.</p>}
       <label className="block text-xs text-muted-foreground">Exact existing file paths (1–3, one per line)<textarea required rows={3} value={draft.paths} onChange={e=>setDraft(v=>({...v,paths:e.target.value}))} placeholder="src/worker.ts" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"/></label>
       <label className="block text-xs text-muted-foreground">Requirements and acceptance criteria<textarea required rows={5} value={draft.goal} onChange={e=>setDraft(v=>({...v,goal:e.target.value}))} placeholder="Make the existing worker claim one job atomically. Include tests for expired lease and duplicate execution." className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"/></label>
       <button disabled={!!busy} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50" type="submit">{busy==='create'?'Creating…':'Create mission — no model charge'}</button>
      </form>
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Coding mission ledger</h2>
        {jobs.length===0?<p className="text-xs text-muted-foreground">No coding missions yet. This uses existing X1 scheduling; it does not start another queue.</p>:
        <div className="space-y-2">{jobs.map(job=><button key={job.id} type="button" onClick={()=>setSelected(job)} className={`w-full rounded-lg border px-3 py-3 text-left text-sm ${selected?.id===job.id?'border-primary bg-primary/5':'border-border hover:bg-secondary/50'}`}>
          <div className="font-medium">{job.title}</div><div className="mt-1 text-[11px] text-muted-foreground">{job.repo} · {statusLabel[job.state] || job.state}</div>
        </button>)}</div>}
      </section>
    </section>
    <section className="space-y-4">
    {selected ? <>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-base font-semibold">{selected.title}</h2><p className="mt-1 text-xs text-muted-foreground">{selected.repo} · base {selected.base_ref}</p></div><span className="rounded-full border border-border px-3 py-1 text-xs">{statusLabel[selected.state] || selected.state}</span></div>
        <p className="mt-4 whitespace-pre-wrap text-sm">{selected.goal}</p>
        <p className="mt-3 text-xs text-muted-foreground">Allowed files: {(selected.paths||[]).join(', ')}</p>
        <p className="mt-1 text-xs text-muted-foreground">Pinned SHA: {selected.base_sha || 'not yet read'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(selected.state==='draft'||selected.state==='blocked') && Number(selected.model_calls||0)===0 &&
            <button onClick={()=>work(selected,'plan')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><Play size={13}/> Generate patch (uses Base44 credits)</button>}
          {selected.state==='planned' &&
            <button onClick={()=>work(selected,'stage')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><GitPullRequest size={14}/> Approve isolated draft PR write</button>}
          {(selected.state==='awaiting_ci'||selected.state==='ready_for_guardian') &&
            <button onClick={()=>work(selected,'check')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary disabled:opacity-50"><ShieldCheck size={14}/> Refresh real CI evidence</button>}
          {!!busy && <Loader2 className="animate-spin" size={16}/>}
        </div>
        {selected.pull_request_url && <a href={selected.pull_request_url} target="_blank" rel="noopener noreferrer" className="mt-4 block break-all text-sm text-primary underline">Open draft pull request</a>}
        {!!selected.blocked_reason && <p className="mt-4 text-xs text-destructive">{selected.blocked_reason}</p>}
      </div>
      {plan && <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Generated patch — requires approval</h2>
        <p className="text-sm">{plan.summary}</p>
        <div><h3 className="text-xs font-semibold">Recommended tests (not executed here)</h3>{(plan.test_commands||[]).map((command,i)=><pre key={i} className="mt-1 overflow-x-auto rounded bg-muted px-2 py-1 text-xs">{command}</pre>)}</div>
        {(plan.files||[]).map((file,i)=><details key={i} className="rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm font-medium">{file.path} · {file.content?.length || 0} chars</summary><p className="mt-2 text-xs text-muted-foreground">{file.rationale}</p><pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-3 text-xs">{file.content}</pre></details>)}
      </div>}
      {!!selected.ci_evidence && <div className="rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-semibold">CI evidence · {selected.ci_status}</h3><pre className="mt-2 overflow-auto text-xs">{selected.ci_evidence}</pre></div>}
      <div className="rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-semibold">Execution receipts</h3><ol className="mt-3 space-y-3">{(selected.steps||[]).map((step,i)=><li key={i} className="border-l-2 border-border pl-3"><p className="text-xs font-semibold">{step.stage} · {step.state}</p><p className="text-xs text-muted-foreground">{stamp(step.at)} — {step.detail}</p></li>)}</ol></div>
    </>:<div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Select a mission to inspect the proposed patch, CI evidence, and independent Guardian release gate.</div>}
    </section>
  </div>
  <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
    <strong className="font-semibold text-foreground">Safety policy:</strong> Existing X1 Supabase queues and worker leases remain authoritative. This UI stores scoped draft-PR receipts only; it never merges or deploys. Local JARVIS hardware recovery hold remains active. CI PASS is not Guardian PASS.
  </div>
 </div>
 );
}
