'use strict';
const $=s=>document.querySelector(s);
const ACTS=[['scrolling','📱','Scrolling'],['studying','📚','Studying'],['working','💻','Working'],['eating','🍜','Eating'],['relaxing','🛋','Relaxing'],['sleeping','😴','Sleeping'],['nothing','🫠','Doing nothing']];
const LBL=Object.fromEntries(ACTS.map(a=>[a[0],a[2].toLowerCase()]));
const D={
baby:["Hello. Are we friends now?","What happens if I sit here?","I have absolutely no idea what we're doing.","You opened the app again! Is that good?"],
teen:["It's getting late. Are we about to make questionable decisions?","You usually do something around this time. I forgot what.","Are you procrastinating? I'm procrastinating.","I predicted your next move. I was spectacularly wrong."],
mini:["We said five minutes approximately twenty minutes ago.","I think we need a vacation from our vacation.","I've adopted your schedule. It's chaos. I love it."],
unsure:["I'm still figuring out our schedule.","I have a theory. It's probably wrong.","I need a few more observations before I can accuse you of having a routine."],
teenR:["I have a theory you tend toward {a} around now. Probably wrong.","Something about this hour says {a}. Or snacks. Unclear."],
miniR:["It's nearly your usual {a} hour.","We seem to have a routine ({a}). I'm not sure how I feel about that.","You tend to do {a} around this time. I noticed. Sorry."],
late:["It's 11 PM. I have a suspicious feeling we're about to scroll.","Sleep is also a hobby, you know."],
act:{scrolling:["Ah yes, our regularly scheduled expedition.","Scrolling logged. I'll bring snacks.","Just one? I've heard that before."],
studying:["Wait. We're actually doing the thing?","Studying?! I'm so proud I might pop.","Quiet mode engaged. I'll be dramatically still."],
working:["Working. Noted. I'll supervise from here.","Productive vibes. Suspicious but welcome."],
eating:["Finally, a meeting I understand.","Eating logged. Best activity so far."],
relaxing:["Excellent. I have also contributed nothing.","Relaxing: the underrated discipline."],
sleeping:["Goodnight. I'll guard the rectangle.","Sleep! The one thing we're good at."],
nothing:["Beautiful. We are achieving absolutely nothing together.","Doing nothing, honestly reported. Gold star.","Nothing is a full-time job and we're thriving."]},
tap:["Boop.","That tickles in a spiritual way.","I felt that. Emotionally.","Hi. Yes. I'm here.","Stop poking me. Actually don't."],
w:{start:["Just one. I trust us.","Okay. Rectangle time."],reel:["Ha! Okay that one counted.","Next. Next. Next.","I was not watching. (I was.)","Just one more, right?"],
m5:"That was a very convincing one more.",m20:"I think I've seen this exact rectangle before.",m45:"We're going to need a support group for this.",night:"It's tomorrow soon. Just saying."}};
let db=null,persist=true,events=[],meta={adopted:Date.now()},last=[],W=null;
const pick=a=>{let c=a.filter(x=>!last.includes(x));if(!c.length)c=a;const x=c[Math.floor(Math.random()*c.length)];last=[...last.slice(-5),x];return x};
function openDB(){return new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('IndexedDB unavailable'));const r=indexedDB.open('gean',1);
r.onupgradeneeded=()=>{r.result.createObjectStore('events',{keyPath:'id',autoIncrement:true});r.result.createObjectStore('meta',{keyPath:'k'})};
r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
const tx=(st,mode,fn)=>new Promise((res,rej)=>{const t=db.transaction(st,mode),q=fn(t.objectStore(st));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)});
async function addEvent(e){try{if(db)e.id=await tx('events','readwrite',s=>s.add(e));else throw 0}catch{persist=false;e.id=Date.now()+Math.random();warn()}events.push(e)}
async function delEvent(id){try{if(db)await tx('events','readwrite',s=>s.delete(id))}catch{persist=false;warn()}events=events.filter(e=>e.id!==id)}
function warn(){const w=$('#warn');w.hidden=persist;w.textContent="⚠ Couldn't save to this browser (private mode or storage blocked). Data will be lost when you close the app."}
const day=()=>Math.floor((Date.now()-meta.adopted)/864e5)+1;
const stage=()=>day()<=3?'baby':day()<=7?'teen':'mini';
const SN={baby:'Baby',teen:'Teen',mini:'Mini-you'};
const checks=()=>events.filter(e=>e.type==='checkin');
const nDays=l=>new Set(l.map(e=>new Date(e.t).toDateString())).size;
const hr=t=>new Date(t).getHours(),fh=h=>(h%12||12)+(h<12?' AM':' PM');
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
// null = insufficient (<3 days); 'weak' = 3 days or <50% share of that hour; 'established' = 4+ days and >=50% share
function routine(h=new Date().getHours(),dow=new Date().getDay()){let best=null;const inH=checks().filter(e=>hr(e.t)===h);
for(const[a]of ACTS){const m=inH.filter(e=>e.act===a),n=nDays(m);if(n<3)continue;
const level=n>=4&&m.length/inH.length>=.5?'established':'weak',r={a,n,level,dow:nDays(m.filter(e=>new Date(e.t).getDay()===dow))>=3};
if(!best||n>best.n)best=r}return best}
function mood(){const h=new Date().getHours(),late=h>=23||h<5,rc=checks().filter(e=>Date.now()-e.t<864e5),l=rc[rc.length-1];
if(late)return rc.some(e=>e.act==='scrolling')?'concerned':'sleepy';if(stage()==='baby')return'curious';
if(!l)return'confused';if(['studying','working'].includes(l.act))return'dramatic';if(l.act==='scrolling')return'mischievous';return'happy'}
function say(t){$('#bubble').textContent=t;render()}
function idleLine(){const r=routine(),s=stage(),h=new Date().getHours();
if(r&&s!=='baby'){const hedge=r.level==='weak'||s==='teen';return pick(hedge?D.teenR:D.miniR).replace('{a}',LBL[r.a])}
if(s!=='baby'&&checks().length<5)return pick(D.unsure);
if(s==='mini'&&(h>=23||h<3))return pick(D.late);return pick(D[s])}
function render(){$('#stage').textContent=SN[stage()];$('#dayn').textContent='Day '+day();const m=mood();$('#mood').textContent='Mood: '+m;$('#pet').dataset.mood=m;
const ul=$('#recent');ul.innerHTML='';const rc=checks().slice(-5).reverse();
if(!rc.length)ul.innerHTML='<li><span class="note">No check-ins yet. Tap one above.</span></li>';
rc.forEach(e=>{const li=document.createElement('li'),d=new Date(e.t);li.innerHTML=`<span>${LBL[e.act]} · ${d.toLocaleDateString(undefined,{weekday:'short'})} ${fh(d.getHours())}</span>`;
const b=document.createElement('button');b.textContent='✕';b.setAttribute('aria-label','Delete check-in');b.onclick=()=>{delEvent(e.id).then(render)};li.append(b);ul.append(li)});
const r=routine();$('#obs').textContent=r&&stage()!=='baby'?`${r.level==='established'?'Established pattern':'Weak pattern'}: ${LBL[r.a]} around ${fh(new Date().getHours())} on ${r.n} different days${r.dow?` (also on ${WD[new Date().getDay()]}s)`:''}. To fix a mistake, delete it and log again.`:'Not enough data yet. Needs the same activity at the same hour on 3+ days.'}
function checkin(a){addEvent({type:'checkin',act:a,t:Date.now()});say(pick(D.act[a]))}
function tap(){const p=$('#pet');p.classList.remove('bounce');void p.offsetWidth;p.classList.add('bounce');say(Math.random()<.5?pick(D.tap):idleLine())}
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const wsec=()=>W?Math.floor((W.acc+(W.paused?0:Date.now()-W.t0))/1000):0;
function wStart(){W={start:Date.now(),t0:Date.now(),acc:0,paused:false,reels:0,done:{}};$('#home').hidden=true;$('#watch').hidden=false;$('#bPause').textContent='Pause';wUpd();say(pick(D.w.start));W.iv=setInterval(wTick,1000)}
function wUpd(){$('#timer').textContent=fmt(wsec());$('#reels').textContent=`Reels you've tapped: ${W.reels}. Counted by you, not detected.`}
function wTick(){if(W.paused)return;wUpd();const m=wsec()/60;[[5,D.w.m5],[20,D.w.m20],[45,D.w.m45]].forEach(([k,t])=>{if(m>=k&&!W.done[k]){W.done[k]=1;say(t)}})}
function wNext(){if(W.paused)return;W.reels++;wUpd();const h=new Date().getHours();say((h>=23||h<4)&&W.reels%3===0?D.w.night:pick(D.w.reel))}
function wPause(){if(W.paused){W.t0=Date.now();W.paused=false;$('#bPause').textContent='Pause'}else{W.acc+=Date.now()-W.t0;W.paused=true;$('#bPause').textContent='Resume'}}
function wEnd(){clearInterval(W.iv);const s=wsec();if(s>=5)addEvent({type:'watch',t:W.start,dur:s,reels:W.reels});
say(s<5?'That was quick. I respect it.':`We watched for ${fmt(s)}. I'm choosing not to judge.`);W=null;$('#watch').hidden=true;$('#home').hidden=false}
function report(){const c=checks(),w=events.filter(e=>e.type==='watch'),b=$('#repBody');
if(!c.length&&!w.length){b.innerHTML='<p>Nothing to report yet. Do a few check-ins first.</p>';return}
const cnt={};c.forEach(e=>cnt[e.act]=(cnt[e.act]||0)+1);const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]||ACTS.findIndex(x=>x[0]===a[0])-ACTS.findIndex(x=>x[0]===b[0]))[0];
const hc={};c.forEach(e=>hc[hr(e.t)]=(hc[hr(e.t)]||0)+1);const ph=c.length>=5&&nDays(c)>=2?Object.entries(hc).sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0]:null;
const ws=w.reduce((s,e)=>s+e.dur,0),obs=nDays([...c,...w]);
let sum=top?`Your most frequently recorded activity was ${LBL[top[0]]}.`:'No check-ins recorded.';
if(ph)sum+=` Your peak recorded hour was ${fh(+ph[0])}. We have some questions.`;
b.innerHTML=`<p class="note">Based only on what you recorded in GEAN, not total device usage.</p><ul><li>Check-ins: <b>${c.length}</b></li><li>Top activity: <b>${top?LBL[top[0]]:'n/a'}</b></li><li>Peak hour: <b>${ph?fh(+ph[0]):'needs 5+ check-ins on 2+ days'}</b></li><li>Watch Together: <b>${w.length?fmt(ws):'none yet'}</b></li><li>Days with check-ins or watch sessions: <b>${obs}</b></li></ul><p>${sum}</p>`}
async function exportData(){const blob=new Blob([JSON.stringify({app:'GEAN',version:2,exportedAt:Date.now(),adopted:meta.adopted,events},null,2)],{type:'application/json'}),a=document.createElement('a');
a.href=URL.createObjectURL(blob);a.download='gean-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function wipe(){if(!confirm('Delete ALL GEAN data on this device? This cannot be undone.'))return;
try{if(db){await tx('events','readwrite',s=>s.clear());await tx('meta','readwrite',s=>s.clear())}}catch{alert("Couldn't delete the data. Please try again.");return}location.reload()}
// Sessions (best effort): one 'open' event per visit; end/dur are saved on hide/pagehide and every 60s while visible. Returns within 5 min resume the same session.
let cur=null,hiddenAt=0;const GAP=3e5;
async function saveSession(){if(!cur)return;cur.end=Date.now();cur.dur=Math.round((cur.end-cur.t)/1000);try{if(db)await tx('events','readwrite',s=>s.put(cur))}catch{persist=false;warn()}}
async function endSession(){if(!cur||hiddenAt)return;hiddenAt=Date.now();await saveSession()}
async function beginSession(){if(cur&&!hiddenAt)return'same';
if(cur&&Date.now()-hiddenAt<GAP){hiddenAt=0;return'resumed'}
const lo=events.filter(e=>e.type==='open').pop();
if(!cur&&lo&&lo.end&&Date.now()-lo.end<GAP){cur=lo;hiddenAt=0;return'resumed'}
cur={type:'open',t:Date.now()};hiddenAt=0;await addEvent(cur);return'new'}
async function init(){
$('#acts').innerHTML=ACTS.map(a=>`<button data-a="${a[0]}" class="${a[0]==='nothing'?'nothing':''}">${a[1]} ${a[2]}</button>`).join('');
$('#acts').onclick=e=>{const b=e.target.closest('button');if(b)checkin(b.dataset.a)};
$('#pet').onclick=tap;$('#bWatch').onclick=wStart;$('#bNext').onclick=wNext;$('#bPause').onclick=wPause;$('#bEnd').onclick=wEnd;
$('#bRep').onclick=()=>{report();$('#dRep').showModal()};$('#bSet').onclick=()=>$('#dSet').showModal();
$('#bExp').onclick=exportData;$('#bDel').onclick=wipe;document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
let first=true;
try{db=await openDB();if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});events=await tx('events','readonly',s=>s.getAll())||[];const m=await tx('meta','readonly',s=>s.get('adopted'));
if(m)meta.adopted=m.v,first=false;else await tx('meta','readwrite',s=>s.put({k:'adopted',v:meta.adopted}))}
catch(e){db=null;persist=false}
warn();
await beginSession();
render();say(first?"Hello. Are we friends now?":idleLine());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')endSession();else beginSession().then(r=>{if(r==='new')say(idleLine())})});
window.addEventListener('pagehide',endSession);
setInterval(()=>{if(cur&&!hiddenAt)saveSession()},6e4);
if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('service-worker.js').catch(e=>console.warn('SW failed',e))}
init();
