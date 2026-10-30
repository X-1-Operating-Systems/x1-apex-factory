import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const fn = (path, context) => {
 const source = fs.readFileSync(path,'utf8')
  .replace(/^import .*;\s*$/gm,'')
  .replace(/export default async function\s*\(req\)/,'async function handler(req)')+'\nhandler';
 return vm.runInNewContext(source, context, {timeout:5000});
};
let calls=[];
const liveAvatarCall=async (action)=>{calls.push(action);return {ok:true,data:{data:{credits_left:10}}};};
const login=(role='admin')=>({auth:{me:async()=>({role,id:'owner123'})},
 entities:{LiveSession:{
  filter:async()=>({items:[]}),update:async()=>{throw Error('No fixture to update')}
 }}});
const context={
 createClientFromRequest:()=>login(),
 secrets:{get:()=>{throw Error('Must not read provider secret for denied action')}},
 callLiveAvatar:liveAvatarCall,
 EDEN_AVATAR_ID:'', SANDBOX_AVATAR_ID:'sandbox', Response,AbortSignal,Date,console,
};
const keep=fn('base44/functions/edenLive/entry.ts',context);
const call=async(handler,body)=>{let r=await handler({json:async()=>body});return {status:r.status,data:await r.json()};};
let n=0;const check=(key,good)=>{assert.ok(good,key);n++;console.log('PASS '+key)};
let r=await call(keep,{action:'keep',sandbox:true});
check('sandbox_auto_keep_denied_423',r.status===423 && r.data.paused===true);
check('backend_does_not_read_key_or_call_provider',calls.length===0);
r=await call(keep,{action:'keep',sandbox:false,confirm_paid:true});
check('paid_keep_denied_423',r.status===423 && calls.length===0);

const client={
 createClientFromRequest:()=>login(),
 secrets:{get:()=> 'unit-test-key'},
 callLiveAvatar:liveAvatarCall, liveAvatarRegistry:()=>[
  {action:'sessions.token'}, {action:'sessions.start',confirm:true}, {action:'contexts.create'},
  {action:'credits.get'}, {action:'sessions.stop'},
 ],
 callHeyGen:async()=>({ok:true,data:{}}), heygenRegistry:()=>[],
 Response,AbortSignal,Date,console,
};
const video=fn('base44/functions/video/entry.ts',client);
for(const action of ['sessions.token','sessions.start','contexts.create']){
 const prior=calls.length;
 r=await call(video,{provider:'liveavatar',action,confirm:true,input:{avatar_id:'fake'}});
 check('video_rejects_'+action,r.status===423 && r.data.paused===true && calls.length===prior);
}
r=await call(video,{provider:'liveavatar',action:'credits.get'});
check('read_only_credit_check_allowed',r.status===200 && r.data.ok===true && calls.at(-1)==='credits.get');
const ui=fs.readFileSync('src/components/live/PersistentRoom.jsx','utf8');
check('ui_safety_hold_enabled',ui.includes('LIVEAVATAR_CREATION_PAUSED = true'));
check('ui_no_automatic_resume',ui.includes('setKeeping(false)') && !ui.includes('setKeeping(true);\n      }\n      if (Number.isFinite'));
check('ui_disables_new_live_button',ui.includes('disabled={LIVEAVATAR_CREATION_PAUSED} onClick={() => setArmed(true)}'));
check('ui_blocks_heartbeat',ui.includes('if (!keeping || LIVEAVATAR_CREATION_PAUSED) return undefined'));
check('ui_stop_preserved',ui.includes("const res = await call('stop')"));
console.log('QA_PASS_ALL',n);
