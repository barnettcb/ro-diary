(() => {
'use strict';

const APP_VERSION = '0.2.1-beta';
const DB_NAME = 'ro-diary-db-v2';
const LEGACY_DB_NAMES = ['ro-diary-db'];
const DB_VERSION = 1;
const PIN_ITERATIONS = 220000;
const BACKUP_ITERATIONS = 600000;
const AUTO_LOCK_MS = 5 * 60 * 1000;
const WEEK_START_DAY = 4; // Thursday

const DEFAULT_PRIVATE_TARGETS = [
  ['avoid-escape','Avoid / Escape Urge','Urge to get away from, end, postpone, or avoid an uncomfortable task, interaction, feeling, or situation.'],
  ['irritation','Irritation','Feeling annoyed, aggravated, frustrated, impatient, or angry. Rate the private experience, not whether it was expressed outwardly.'],
  ['activation','Physical Activation','Noticeable bodily activation such as tension, tightness, heat, faster speech, restlessness, or other signs of arousal.'],
  ['defend-explain','Defend / Explain Urge','Urge to defend yourself, explain your reasoning, correct the record, rebut, or prove a point.'],
  ['shame','Shame / Embarrassment','Feeling exposed, ashamed, embarrassed, inadequate, or socially diminished.'],
  ['criticism','Criticism / Judgment','Experience of interpreting an interaction as criticism, negative judgment, disapproval, or being viewed unfavorably.'],
  ['appease','Appease / Agree Urge','Urge to agree, placate, smooth over, or give in mainly to reduce tension or avoid conflict.']
].map(([id,label,definition], order) => ({id,label,definition,type:'scale',order}));

const DEFAULT_SOCIAL_TARGETS = [
  ['defensive-explaining','Defensive Explaining','Explaining, correcting, rebutting, or giving more detail in a way that functions as outward defensiveness.'],
  ['withdrawal','Withdrawal / Shutdown','Withdrawing, shutting down, ending engagement, becoming unavailable, or signaling that you want the interaction to stop.'],
  ['forceful-tone','Forceful Tone','Irritated, sharp, louder, faster, clipped, forceful, or otherwise tense delivery that may signal hostility or dominance.'],
  ['conflict-appeasing','Conflict Appeasing','Outwardly agreeing, yielding, placating, or signaling agreement mainly to reduce conflict rather than from genuine agreement.']
].map(([id,label,definition], order) => ({id,label,definition,type:'scale',order}));

const SCALE_ANCHORS = [
  '0 — Not present',
  '1 — Slight / low',
  '2 — Definitely present, but low level',
  '3 — Moderate',
  '4 — Severe / intense',
  '5 — Most extreme level for you'
];

const SKILLS = [
  {id:'definitely', name:'DEFinitely', lesson:1, purpose:'Practice radical openness by noticing distress, using self-enquiry, and responding more flexibly.'},
  {id:'big3', name:'Big 3 + 1', lesson:3, purpose:'Use body and facial signals that support social safety and openness.'},
  {id:'lkm', name:'Loving Kindness Meditation', lesson:4, purpose:'Practice warmth and goodwill to support openness and connection.'},
  {id:'varies', name:'Flexible Mind VARIEs', lesson:5, purpose:'Practice novel behavior and willingness to learn from new experience.'},
  {id:'sage', name:'Flexible Mind SAGE', lesson:8, purpose:'Respond skillfully to shame, embarrassment, rejection, or exclusion.'},
  {id:'deep', name:'Flexible Mind Is DEEP', lesson:10, purpose:'Use social signaling deliberately in service of values and connection.'},
  {id:'fixed-fatalistic', name:'Fixed / Fatalistic Mind Skills', lesson:11, purpose:'Notice rigid or resigned states of mind and move toward flexibility.'},
  {id:'awareness', name:'Awareness Continuum', lesson:12, purpose:'Describe present experience directly and with integrity.'},
  {id:'self-enquiry', name:'Self-Enquiry', lesson:13, purpose:'Use healthy self-doubt to look for what you may be missing.'},
  {id:'reveal', name:'Flexible Mind REVEALs', lesson:16, purpose:'Notice pushbacks and hidden control strategies in relationships.'},
  {id:'rocks-on', name:'Flexible Mind ROCKs ON', lesson:17, purpose:'Support interpersonal kindness, effectiveness, and connectedness.'},
  {id:'proves', name:'Flexible Mind PROVEs', lesson:18, purpose:'Practice assertiveness while remaining open to new information.'},
  {id:'validates', name:'Flexible Mind Validates', lesson:19, purpose:'Signal inclusion and understanding through validation.'},
  {id:'allows', name:'Flexible Mind ALLOWs', lesson:21, purpose:'Support intimacy and social connectedness.'},
  {id:'adopts', name:'Flexible Mind ADOPTS', lesson:22, purpose:'Receive and evaluate corrective feedback with openness.'},
  {id:'dares', name:'Flexible Mind DARES', lesson:27, purpose:'Respond more flexibly to unhelpful envy or resentment.'},
  {id:'light', name:'Flexible Mind Is LIGHT', lesson:28, purpose:'Work with cynicism, bitterness, and resignation.'},
  {id:'heart', name:'Flexible Mind Has HEART', lesson:29, purpose:'Practice forgiveness while retaining appropriate boundaries.'},
  {id:'urge-surfing', name:'Urge Surfing', lesson:null, purpose:'Notice an urge without automatically acting on it; use the space to choose what to do next.'}
];

const DEFAULT_FOCUS_SKILLS = ['definitely','big3','lkm','sage','urge-surfing'];
const DEFAULT_SE_FOCUS = 'When I notice the urge to avoid doing my diary card, what do I notice as I sit with and surf the urge instead of immediately acting on it?';
const DEFAULT_HOMEWORK = 'Lesson 9 — Worksheet 9.A: Practicing Enhancing Facial Expressions';

const SE_PROMPTS = [
  ['openness','What might I be missing because I am certain I already understand this situation?'],
  ['openness','What information would be hardest for me to discover about my own part in this?'],
  ['openness','If my interpretation is incomplete, what else might be true?'],
  ['openness','What would I notice if I approached this as something to learn from rather than solve?'],
  ['openness','What part of another perspective am I most resistant to considering?'],
  ['uncertainty','What uncertainty am I trying to eliminate right now?'],
  ['uncertainty','What would happen if I allowed this question to remain unanswered for a while?'],
  ['uncertainty','What feels threatening about not knowing how this will turn out?'],
  ['uncertainty','What conclusion am I treating as fact because uncertainty feels uncomfortable?'],
  ['uncertainty','What could I learn if I did not rush to settle what this means?'],
  ['defensiveness','What am I trying to protect when I feel the urge to explain or correct?'],
  ['defensiveness','If I did not defend myself immediately, what would I fear might happen?'],
  ['defensiveness','What feels at stake when someone sees me differently than I see myself?'],
  ['defensiveness','What part of the feedback could contain useful information even if I disagree with the rest?'],
  ['defensiveness','What do I want the other person to understand about me, and what happens if they do not?'],
  ['avoidance','What experience am I trying not to have right now?'],
  ['avoidance','If I stay present for one minute longer, what do I notice?'],
  ['avoidance','What am I hoping will disappear if I postpone or leave this situation?'],
  ['avoidance','What is the smallest part of this discomfort I am willing to remain with?'],
  ['avoidance','Am I protecting myself from harm, or mainly from discomfort and uncertainty? What tells me that?'],
  ['control','What am I trying to control that may not actually be controllable?'],
  ['control','What feels risky about letting someone else handle this differently than I would?'],
  ['control','What would I lose if I loosened my preferred way of doing this?'],
  ['control','Where might efficiency or correctness be crowding out something else that matters?'],
  ['control','What rule am I following here, and is it useful in this situation?'],
  ['vulnerability','What feeling or admission would be hardest to say plainly right now?'],
  ['vulnerability','What would feel exposing if another person knew it?'],
  ['vulnerability','What softer feeling may be underneath the reaction I notice first?'],
  ['vulnerability','What do I fear another person might conclude about me?'],
  ['vulnerability','What would it be like to allow this feeling without fixing or explaining it?'],
  ['social','What might my face, voice, posture, or timing be communicating that my words are not?'],
  ['social','If someone only saw my behavior and could not hear my intentions, what might they reasonably conclude?'],
  ['social','What signal am I sending about whether I am open to influence?'],
  ['social','Did my behavior invite connection, distance, submission, or conflict? What makes me think that?'],
  ['social','What would a slightly warmer or more open signal look like without pretending to feel something I do not?'],
  ['shame','What judgment about myself am I tempted to treat as a fact?'],
  ['shame','What am I afraid this mistake or interaction says about who I am?'],
  ['shame','What would change if I could acknowledge embarrassment without hiding, attacking, or overexplaining?'],
  ['shame','What part of this experience makes me want to disappear, prove myself, or regain status?'],
  ['shame','Can I distinguish what I did from the global judgment I am making about myself?'],
  ['connection','What matters more to me in this moment: being understood, being right, protecting myself, or staying connected?'],
  ['connection','What would help another person experience me as available rather than defended?'],
  ['connection','What am I unwilling to risk in order to be more connected?'],
  ['connection','What kind of response would make room for both my perspective and someone else’s?'],
  ['connection','Where might I be waiting for the other person to change before I allow myself to act according to my own values?'],
  ['feedback','What part of this feedback do I most want to reject, and why?'],
  ['feedback','If I assumed there is something useful here without assuming it is all correct, what would I examine?'],
  ['feedback','What would make it easier for me to listen without deciding immediately whether the other person is right?'],
  ['feedback','Am I evaluating the feedback itself, or reacting to how it makes me feel about myself?'],
  ['feedback','What evidence supports my current view, and what evidence does not fit it?'],
  ['appeasing','What am I hoping to prevent by agreeing or smoothing this over?'],
  ['appeasing','If I expressed my actual view calmly, what outcome am I afraid of?'],
  ['appeasing','Am I signaling agreement because I agree, or because conflict feels costly?'],
  ['appeasing','What would honest engagement look like without either fighting or giving in?'],
  ['appeasing','What do I risk losing when I hide disagreement to keep the peace?'],
  ['body','What is my body doing before I have words for what I feel?'],
  ['body','Where do I notice the first small sign that I am becoming activated?'],
  ['body','What changes in my voice, face, breathing, or posture when I feel threatened?'],
  ['body','If I stop analyzing for a moment, what physical sensation is most noticeable?'],
  ['body','What urge appears alongside this sensation, and do I have to act on it?']
].map((p, i) => ({id:`p${String(i+1).padStart(3,'0')}`, category:p[0], text:p[1]}));

let db = null;
let vaultKey = null;
let appState = {
  locked: true,
  setupNeeded: false,
  pinBuffer: '',
  pinStage: 'unlock',
  setupPinFirst: '',
  pinError: '',
  nav: 'today',
  page: null,
  profile: null,
  currentWeek: null,
  modal: null,
  currentPromptId: null,
  hiddenAt: null,
  saveChain: Promise.resolve(),
  saveError: null,
  busy: false,
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const enc = new TextEncoder();
const dec = new TextDecoder();

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function toDateOnly(d) {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function parseDateOnly(s) {
  const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d,12,0,0,0);
}
function addDays(date, n) { const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function getWeekStart(date, startDay=WEEK_START_DAY) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const diff = (d.getDay() - startDay + 7) % 7;
  d.setDate(d.getDate() - diff); return d;
}
function fmtDate(s, opts={month:'short',day:'numeric'}) { return parseDateOnly(s).toLocaleDateString(undefined,opts); }
function fmtDay(s) { return parseDateOnly(s).toLocaleDateString(undefined,{weekday:'short'}); }
function fmtLong(s) { return parseDateOnly(s).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}); }
function todayStr(){ return toDateOnly(new Date()); }
function arrToB64(arr) {
  const bytes = arr instanceof Uint8Array ? arr : new Uint8Array(arr);
  let s=''; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) s += String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(s);
}
function b64ToArr(s) { const bin=atob(s); const a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return a; }
function randomBytes(n) { return crypto.getRandomValues(new Uint8Array(n)); }
function escapeHtml(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function openDB() {
  return new Promise((resolve,reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d=req.result;
      if(!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      if(!d.objectStoreNames.contains('secure')) d.createObjectStore('secure');
      if(!d.objectStoreNames.contains('records')) d.createObjectStore('records');
    };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
function idbGet(store,key){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'); const r=tx.objectStore(store).get(key); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);}); }
function idbPut(store,key,val){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite'); tx.objectStore(store).put(val,key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);}); }
function idbDelete(store,key){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);}); }
function idbClear(store){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite'); tx.objectStore(store).clear(); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);}); }

async function derivePinKey(pin, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:PIN_ITERATIONS,hash:'SHA-256'}, base, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
}
async function deriveBackupKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:BACKUP_ITERATIONS,hash:'SHA-256'}, base, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
}
async function aesEncrypt(key, bytes, iv=randomBytes(12)) {
  const data = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, bytes);
  return {iv:new Uint8Array(iv), data:new Uint8Array(data)};
}
async function aesDecrypt(key, payload) {
  return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:payload.iv}, key, payload.data));
}
async function encryptJson(obj) {
  if(!vaultKey) throw new Error('Vault is locked');
  const e=await aesEncrypt(vaultKey, enc.encode(JSON.stringify(obj)));
  return {v:1,iv:arrToB64(e.iv),data:arrToB64(e.data)};
}
async function decryptJson(payload) {
  if(!vaultKey) throw new Error('Vault is locked');
  const bytes=await aesDecrypt(vaultKey,{iv:b64ToArr(payload.iv),data:b64ToArr(payload.data)});
  return JSON.parse(dec.decode(bytes));
}
async function saveRecord(key,obj) { const payload=await encryptJson(obj); await idbPut('records',key,payload); }
async function loadRecord(key) { const p=await idbGet('records',key); return p ? decryptJson(p) : null; }

async function setupVault(pin) {
  const deviceKey = await crypto.subtle.generateKey({name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
  const rawVault = randomBytes(32);
  const deviceWrap = await aesEncrypt(deviceKey, rawVault);
  const pinSalt=randomBytes(16); const pinKey=await derivePinKey(pin,pinSalt);
  const inner = enc.encode(JSON.stringify({iv:arrToB64(deviceWrap.iv),data:arrToB64(deviceWrap.data)}));
  const pinWrap=await aesEncrypt(pinKey,inner);
  await idbPut('secure','deviceKey',deviceKey);
  await idbPut('secure','vaultWrap',{
    pinSalt:arrToB64(pinSalt), pinIv:arrToB64(pinWrap.iv), pinData:arrToB64(pinWrap.data)
  });
  await idbPut('meta','failedAttempts',{count:0,nextAllowedAt:0});
  vaultKey=await crypto.subtle.importKey('raw',rawVault,{name:'AES-GCM'},false,['encrypt','decrypt']);
  rawVault.fill(0);
  await initializeFreshData();
}

async function unlockVault(pin) {
  const attempts = await idbGet('meta','failedAttempts') || {count:0,nextAllowedAt:0};
  if(Date.now() < attempts.nextAllowedAt) throw new Error(`Try again in ${Math.ceil((attempts.nextAllowedAt-Date.now())/1000)} seconds.`);
  try {
    const deviceKey=await idbGet('secure','deviceKey'); const wrap=await idbGet('secure','vaultWrap');
    if(!deviceKey || !wrap) throw new Error('Vault setup is incomplete.');
    const pinKey=await derivePinKey(pin,b64ToArr(wrap.pinSalt));
    const innerBytes=await aesDecrypt(pinKey,{iv:b64ToArr(wrap.pinIv),data:b64ToArr(wrap.pinData)});
    const inner=JSON.parse(dec.decode(innerBytes));
    const rawVault=await aesDecrypt(deviceKey,{iv:b64ToArr(inner.iv),data:b64ToArr(inner.data)});
    vaultKey=await crypto.subtle.importKey('raw',rawVault,{name:'AES-GCM'},false,['encrypt','decrypt']);
    rawVault.fill(0);
    await idbPut('meta','failedAttempts',{count:0,nextAllowedAt:0});
    await loadAppData();
    return true;
  } catch (e) {
    vaultKey=null;
    const count=(attempts.count||0)+1;
    let delay=0; if(count>=5) delay=Math.min(300000, 5000 * Math.pow(2, Math.min(count-5,6)));
    await idbPut('meta','failedAttempts',{count,nextAllowedAt:Date.now()+delay});
    throw new Error(delay ? `Incorrect passcode. Try again in ${Math.ceil(delay/1000)} seconds.` : 'Incorrect passcode.');
  }
}

function buildNewWeek(startDate, previous=null) {
  const start=typeof startDate==='string'?parseDateOnly(startDate):startDate; const end=addDays(start,6);
  const id=uid(); const days={};
  for(let i=0;i<7;i++){ const ds=toDateOnly(addDays(start,i)); days[ds]={date:ds,ratings:{},skills:[],events:[],completed:false,completedAt:null,modifiedAt:new Date().toISOString()}; }
  return {
    id,startDate:toDateOnly(start),endDate:toDateOnly(end),
    privateTargets:structuredClone(previous?.privateTargets || DEFAULT_PRIVATE_TARGETS),
    socialTargets:structuredClone(previous?.socialTargets || DEFAULT_SOCIAL_TARGETS),
    focusSkills:[...(previous?.focusSkills || DEFAULT_FOCUS_SKILLS)],
    weeklySEFocus:previous?.weeklySEFocus || DEFAULT_SE_FOCUS,
    homework:previous?.homework || DEFAULT_HOMEWORK,
    valuedGoal:previous?.valuedGoal || '', majorOCTheme:'', majorOCThemeEnabled:false,
    savedSEPrompts:[], days, archived:false, createdAt:new Date().toISOString(),modifiedAt:new Date().toISOString()
  };
}

async function initializeFreshData() {
  const start=getWeekStart(new Date(),WEEK_START_DAY); const week=buildNewWeek(start);
  const profile={
    version:1,therapyWeekStart:WEEK_START_DAY,currentWeekId:week.id,weekIds:[week.id],
    pdfName:'Brooke',lastBackupAt:null,createdAt:new Date().toISOString(),modifiedAt:new Date().toISOString(),
    favoritePromptIds:[],notUsefulPromptIds:[],myQuestions:[]
  };
  await saveRecord('profile',profile); await saveRecord(`week:${week.id}`,week);
  appState.profile=profile; appState.currentWeek=week;
}

async function loadAppData() {
  const profile=await loadRecord('profile'); if(!profile) throw new Error('Profile could not be loaded.');
  appState.profile=profile;
  let week=await loadRecord(`week:${profile.currentWeekId}`);
  const today=new Date(); const expectedStart=getWeekStart(today,profile.therapyWeekStart ?? WEEK_START_DAY);
  if(!week || parseDateOnly(week.endDate) < parseDateOnly(todayStr())) {
    const prev=week || (profile.weekIds.length ? await loadRecord(`week:${profile.weekIds[profile.weekIds.length-1]}`) : null);
    if(prev) { prev.archived=true; prev.modifiedAt=new Date().toISOString(); await saveRecord(`week:${prev.id}`,prev); }
    week=buildNewWeek(expectedStart,prev);
    profile.currentWeekId=week.id; profile.weekIds.push(week.id); profile.modifiedAt=new Date().toISOString();
    await saveRecord(`week:${week.id}`,week); await saveRecord('profile',profile);
  }
  appState.currentWeek=week;
}

function queueSaveWeek() {
  const snapshot=structuredClone(appState.currentWeek); snapshot.modifiedAt=new Date().toISOString(); appState.currentWeek.modifiedAt=snapshot.modifiedAt;
  appState.saveChain=appState.saveChain.then(()=>saveRecord(`week:${snapshot.id}`,snapshot)).catch(e=>{appState.saveError=e.message; render();});
}
function queueSaveProfile() {
  const snapshot=structuredClone(appState.profile); snapshot.modifiedAt=new Date().toISOString(); appState.profile.modifiedAt=snapshot.modifiedAt;
  appState.saveChain=appState.saveChain.then(()=>saveRecord('profile',snapshot)).catch(e=>{appState.saveError=e.message; render();});
}

function lockApp() {
  vaultKey=null; appState.locked=true; appState.pinBuffer=''; appState.pinError=''; appState.profile=null; appState.currentWeek=null; appState.modal=null; render();
}

function getTodayEntry() {
  const w=appState.currentWeek; if(!w) return null;
  const ds=todayStr();
  if(!w.days[ds]) {
    const latest=Object.keys(w.days).sort().at(-1); return w.days[latest];
  }
  return w.days[ds];
}
function targetValue(day,id){ return Object.prototype.hasOwnProperty.call(day.ratings,id) ? day.ratings[id] : null; }
function setTargetValue(day,id,val){ day.ratings[id]=val; day.modifiedAt=new Date().toISOString(); if(day.completed){day.completed=false;day.completedAt=null;} queueSaveWeek(); render(); }
function skillName(id){ return SKILLS.find(s=>s.id===id)?.name || id; }
function promptById(id){ return SE_PROMPTS.find(p=>p.id===id); }

function render() {
  const root=document.getElementById('app'); if(!root) return;
  if(appState.setupNeeded || appState.locked){ root.innerHTML=renderLock(); bindLock(); return; }
  root.innerHTML=`${renderAppShell()}${renderModal()}${renderPrintReport()}`; bindApp();
}

function renderLock() {
  const setup=appState.setupNeeded;
  const title=setup ? (appState.pinStage==='confirm'?'Confirm Passcode':'Create Passcode') : 'RO Diary';
  const subtitle=setup ? (appState.pinStage==='confirm'?'Enter the same 4 digits again.':'Choose a 4-digit passcode for everyday access.') : 'Enter your 4-digit passcode';
  const dots=[0,1,2,3].map(i=>`<span class="pin-dot ${i<appState.pinBuffer.length?'filled':''}"></span>`).join('');
  return `<div class="lock-screen"><div class="lock-card">
    <div class="lock-title">${escapeHtml(title)}</div><div class="subtle">${escapeHtml(subtitle)}</div>
    <div class="pin-dots">${dots}</div>
    <div class="pin-grid">
      ${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" data-pin="${n}">${n}</button>`).join('')}
      <button class="pin-key" data-action="clear">Clear</button><button class="pin-key" data-pin="0">0</button><button class="pin-key" data-action="back">⌫</button>
    </div>
    ${appState.pinError?`<div class="error">${escapeHtml(appState.pinError)}</div>`:''}
    ${setup?`<div class="notice">If you forget this passcode, the local diary cannot be opened. Encrypted backups use a separate password.</div>`:''}
  </div></div>`;
}

function renderAppShell() {
  const w=appState.currentWeek; const day=getTodayEntry();
  const nav=appState.nav;
  let body='';
  if(appState.page==='week-setup') body=renderWeekSetup();
  else if(appState.page==='archive') body=renderArchive();
  else if(appState.page==='skills') body=renderSkillsReference();
  else if(appState.page==='settings') body=renderSettings();
  else if(nav==='today') body=renderToday(day);
  else if(nav==='se') body=renderSE();
  else if(nav==='review') body=renderReview();
  else body=renderMore();
  const title=appState.page ? ({'week-setup':'Week Setup','archive':'Archive','skills':'RO Skills','settings':'Settings'}[appState.page]) : 'RO Diary';
  return `<div class="app-shell">
    <header class="topbar"><div class="topbar-row"><div class="brand">${title}</div><div class="status-pill">${day?.completed?'Today complete':'Private • Local'}</div></div></header>
    <main class="content">${body}${appState.saveError?`<div class="notice">Save problem: ${escapeHtml(appState.saveError)}</div>`:''}</main>
    ${appState.page?'':renderNav(nav)}
  </div>`;
}
function renderNav(nav){ return `<nav class="bottom-nav"><div class="bottom-nav-inner">
  <button class="nav-btn ${nav==='today'?'active':''}" data-nav="today">Today</button>
  <button class="nav-btn ${nav==='se'?'active':''}" data-nav="se">Self-Enquiry</button>
  <button class="nav-btn ${nav==='review'?'active':''}" data-nav="review">Review</button>
  <button class="nav-btn ${nav==='more'?'active':''}" data-nav="more">More</button>
</div></nav>`; }

function renderTargetSection(kicker,title,targets,day) {
  return `<section class="card"><div class="card-header"><div class="section-kicker">${escapeHtml(kicker)}</div><div class="section-title">${escapeHtml(title)}</div></div><div class="card-body">
    ${targets.map(t=>renderTarget(t,day)).join('')}
  </div></section>`;
}
function renderTarget(t,day){ const val=targetValue(day,t.id);
  if(t.type==='yn') return `<div class="target-row"><div class="target-head"><button class="target-name" data-info="${t.id}">${escapeHtml(t.label)}</button><button class="info-btn" data-info="${t.id}">i</button></div><div class="scale yesno">
    <button class="score-btn ${val===false?'selected':''}" data-target="${t.id}" data-value="false">No</button><button class="score-btn ${val===true?'selected':''}" data-target="${t.id}" data-value="true">Yes</button></div></div>`;
  return `<div class="target-row"><div class="target-head"><button class="target-name" data-info="${t.id}">${escapeHtml(t.label)}</button><button class="info-btn" data-info="${t.id}">i</button></div><div class="scale">
    ${[0,1,2,3,4,5].map(n=>`<button class="score-btn ${val===n?'selected':''}" data-target="${t.id}" data-value="${n}">${n}</button>`).join('')}
  </div></div>`;
}

function renderToday(day) {
  const w=appState.currentWeek; if(!day) return '<div class="notice">No daily entry is available.</div>';
  const focusSkills=w.focusSkills.map(id=>SKILLS.find(s=>s.id===id)).filter(Boolean);
  return `<h1 class="page-title">${escapeHtml(fmtLong(day.date))}</h1><div class="subtle">Therapy week ${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</div>
    ${renderTargetSection('What I noticed internally','Private Behaviors, Emotions & Urges',w.privateTargets,day)}
    ${renderTargetSection('What I signaled or did','Social Signals & Overt Behaviors',w.socialTargets,day)}
    <section class="card"><div class="card-header"><div class="section-kicker">Skills used</div></div><div class="card-body"><div class="checkbox-list">
      ${focusSkills.map(s=>`<label class="check-row"><input type="checkbox" data-skill="${s.id}" ${day.skills.includes(s.id)?'checked':''}><span>${escapeHtml(s.name)}</span></label>`).join('')}
    </div><button class="btn soft wide" style="margin-top:10px" data-action="other-skill">+ Other RO Skill</button></div></section>
    <section class="card"><div class="card-header"><div class="section-kicker">Self-Enquiry focus</div></div><div class="card-body"><div>${escapeHtml(w.weeklySEFocus||'No weekly focus question entered.')}</div><div class="btn-row" style="margin-top:12px"><button class="btn soft" data-action="go-se">Give Me an SE Prompt</button><button class="btn" data-action="saved-questions">Saved Questions</button></div></div></section>
    <section class="card"><div class="card-header"><div class="section-kicker">Notes / Events</div></div><div class="card-body">
      ${day.events.length?day.events.map(e=>renderEvent(e)).join(''):'<div class="subtle">No events recorded today.</div>'}
      <button class="btn soft wide" style="margin-top:10px" data-action="add-event">+ Add Note / Event</button></div></section>
    <section class="card"><div class="card-body">${day.completed?`<div class="notice success-notice">Completed ${new Date(day.completedAt).toLocaleString()}</div>`:''}<button class="btn primary wide" data-action="complete-day">${day.completed?'Review Completion':'Complete Today'}</button></div></section>`;
}
function renderEvent(e){return `<div class="event-card"><div class="event-context">${escapeHtml(e.context||'Event')}</div><div class="event-note">${escapeHtml(e.note||'')}</div>${e.discuss?'<div class="flag">★ Discuss in Therapy</div>':''}<div class="event-actions"><button class="btn" data-action="edit-event" data-event-id="${e.id}">Edit</button><button class="btn danger" data-action="delete-event" data-event-id="${e.id}">Delete</button></div></div>`;}

function choosePrompt() {
  const blocked=new Set(appState.profile.notUsefulPromptIds||[]); let pool=SE_PROMPTS.filter(p=>!blocked.has(p.id));
  if(appState.currentPromptId && pool.length>1) pool=pool.filter(p=>p.id!==appState.currentPromptId);
  const p=pool[Math.floor(Math.random()*pool.length)] || SE_PROMPTS[0]; appState.currentPromptId=p.id; return p;
}
function renderSE(){ const p=promptById(appState.currentPromptId)||choosePrompt(); const w=appState.currentWeek; const fav=appState.profile.favoritePromptIds.includes(p.id); const saved=w.savedSEPrompts.includes(p.id);
  return `<h1 class="page-title">Self-Enquiry</h1><section class="card"><div class="card-header"><div class="section-kicker">Weekly focus</div></div><div class="card-body">${escapeHtml(w.weeklySEFocus||'No weekly focus question.')}</div></section>
  <section class="card"><div class="card-header"><div class="section-kicker">Random self-enquiry</div></div><div class="card-body"><div class="prompt-box">${escapeHtml(p.text)}</div><div class="btn-row" style="margin-top:12px">
    <button class="btn primary" data-action="another-prompt">Another Prompt</button>
    <button class="btn ${saved?'soft':''}" data-action="save-prompt">${saved?'Saved This Week':'Save for This Week'}</button>
    <button class="btn ${fav?'soft':''}" data-action="favorite-prompt">${fav?'★ Favorite':'☆ Favorite'}</button>
    <button class="btn" data-action="reject-prompt">Not Useful</button></div></div></section>
  <section class="card"><div class="card-body"><div class="list-row"><strong>Saved This Week</strong><span>${w.savedSEPrompts.length}</span></div><div class="list-row"><strong>Favorites</strong><span>${appState.profile.favoritePromptIds.length}</span></div><div class="list-row"><strong>My Questions</strong><span>${appState.profile.myQuestions.length}</span></div><div class="btn-row" style="margin-top:10px"><button class="btn soft" data-action="saved-questions">View Questions</button><button class="btn" data-action="add-my-question">+ My Question</button></div></div></section>`;
}

function weekDates(w){ return Object.keys(w.days).sort(); }
function renderRatingsTable(targets,w){ const dates=weekDates(w); return `<div class="table-wrap"><table><thead><tr><th>Target</th>${dates.map(d=>`<th>${fmtDay(d)}</th>`).join('')}</tr></thead><tbody>${targets.map(t=>`<tr><td title="${escapeHtml(t.label)}">${escapeHtml(t.label)}</td>${dates.map(d=>{const v=targetValue(w.days[d],t.id); return `<td>${v===null?'—':typeof v==='boolean'?(v?'Y':'N'):v}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;}
function renderReview(){const w=appState.currentWeek; const dates=weekDates(w); const flagged=dates.flatMap(d=>w.days[d].events.filter(e=>e.discuss).map(e=>({...e,date:d}))); const skillMap={}; dates.forEach(d=>w.days[d].skills.forEach(s=>(skillMap[s]??=[]).push(fmtDay(d))));
 const needsBackup=!appState.profile.lastBackupAt || (Date.now()-new Date(appState.profile.lastBackupAt).getTime()>7*86400000);
 return `<h1 class="page-title">Weekly Review</h1><div class="subtle">${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</div>${needsBackup?'<div class="notice">A current encrypted backup is recommended this week.</div>':''}
 <section class="card"><div class="card-header"><div class="section-kicker">Completion</div></div><div class="card-body"><div class="btn-row">${dates.map(d=>`<span class="status-pill">${fmtDay(d)} ${w.days[d].completed?'✓':'○'}</span>`).join('')}</div></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Private behaviors, emotions & urges</div></div><div class="card-body">${renderRatingsTable(w.privateTargets,w)}</div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Social signals & overt behaviors</div></div><div class="card-body">${renderRatingsTable(w.socialTargets,w)}</div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Discuss in Therapy</div></div><div class="card-body">${flagged.length?flagged.map(e=>`<div class="event-card"><div class="event-context">${fmtDay(e.date)} — ${escapeHtml(e.context||'Event')}</div><div class="event-note">${escapeHtml(e.note||'')}</div></div>`).join(''):'<div class="subtle">No events flagged.</div>'}</div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Skills used</div></div><div class="card-body">${Object.keys(skillMap).length?Object.entries(skillMap).map(([s,ds])=>`<div class="list-row"><strong>${escapeHtml(skillName(s))}</strong><span class="small">${ds.join(', ')}</span></div>`).join(''):'<div class="subtle">No skills recorded.</div>'}</div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Self-Enquiry</div></div><div class="card-body"><div><strong>Weekly focus:</strong><br>${escapeHtml(w.weeklySEFocus||'—')}</div><div style="margin-top:10px"><strong>Saved questions:</strong> ${w.savedSEPrompts.length}</div></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Week context</div></div><div class="card-body"><div><strong>Homework:</strong> ${escapeHtml(w.homework||'—')}</div><div style="margin-top:8px"><strong>Valued goal:</strong> ${escapeHtml(w.valuedGoal||'—')}</div></div></section>
 <section class="card"><div class="card-body"><button class="btn primary wide" data-action="print-report">Print / Save Therapist PDF</button><button class="btn wide" style="margin-top:8px" data-action="backup">Create Encrypted Backup</button></div></section>`;}

function renderMore(){ const p=appState.profile; return `<h1 class="page-title">More</h1><section class="card"><div class="card-body menu-list">
  <button class="btn" data-page="week-setup">Week Setup</button><button class="btn" data-page="archive">Archive</button><button class="btn" data-page="skills">RO Skills Reference</button><button class="btn" data-page="settings">Settings</button>
 </div></section><section class="card"><div class="card-body"><div class="list-row"><strong>Last encrypted backup</strong><span class="small">${p.lastBackupAt?new Date(p.lastBackupAt).toLocaleString():'None yet'}</span></div><button class="btn primary wide" style="margin-top:10px" data-action="backup">Create Encrypted Backup</button><button class="btn wide" style="margin-top:8px" data-action="restore">Restore Backup</button></div></section><div class="subtle">RO Diary ${APP_VERSION}. Data stays on this device unless you deliberately export it.</div>`;}

function renderWeekSetup(){const w=appState.currentWeek; return `<button class="btn" data-action="back-page">← Back</button><h1 class="page-title">Week Setup</h1><div class="subtle">${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</div>
 <section class="card"><div class="card-header"><div class="section-kicker">Private targets</div></div><div class="card-body">${renderTargetEditors(w.privateTargets,'private')}<button class="btn soft wide" data-action="add-target" data-kind="private">+ Add Private Target</button></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Social signals</div></div><div class="card-body">${renderTargetEditors(w.socialTargets,'social')}<button class="btn soft wide" data-action="add-target" data-kind="social">+ Add Social Target</button></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Weekly focus skills</div></div><div class="card-body"><div class="checkbox-list">${SKILLS.map(s=>`<label class="check-row"><input type="checkbox" data-focus-skill="${s.id}" ${w.focusSkills.includes(s.id)?'checked':''}><span>${escapeHtml(s.name)}</span></label>`).join('')}</div><div class="subtle" style="margin-top:8px">Choose up to five focus skills. Other skills remain available on the daily card.</div></div></section>
 <section class="card"><div class="card-body"><div class="field"><label>Weekly self-enquiry focus</label><textarea data-week-field="weeklySEFocus">${escapeHtml(w.weeklySEFocus)}</textarea></div><div class="field"><label>Skills-class homework</label><input data-week-field="homework" value="${escapeHtml(w.homework)}"></div><div class="field"><label>Valued goal (optional)</label><input data-week-field="valuedGoal" value="${escapeHtml(w.valuedGoal)}"></div></div></section>`;}
function renderTargetEditors(targets,kind){return targets.map(t=>`<div class="inline-edit"><div class="inline-edit-row"><input data-target-label="${t.id}" data-kind="${kind}" value="${escapeHtml(t.label)}"><select data-target-type="${t.id}" data-kind="${kind}"><option value="scale" ${t.type==='scale'?'selected':''}>0–5</option><option value="yn" ${t.type==='yn'?'selected':''}>Y/N</option></select><button class="btn danger" data-delete-target="${t.id}" data-kind="${kind}">×</button></div><textarea data-target-def="${t.id}" data-kind="${kind}" class="small">${escapeHtml(t.definition||'')}</textarea></div>`).join('');}

function renderArchive(){const ids=[...appState.profile.weekIds].reverse(); return `<button class="btn" data-action="back-page">← Back</button><h1 class="page-title">Archive</h1><section class="card"><div class="card-body" id="archive-list">${ids.map(id=>`<div class="list-row" data-week-id="${id}"><span>Week ${escapeHtml(id.slice(0,8))}</span><button class="btn" data-action="open-archive" data-week-id="${id}">Open</button></div>`).join('')}</div></section>`;}

function renderSkillsReference(){return `<button class="btn" data-action="back-page">← Back</button><h1 class="page-title">RO Skills Reference</h1><section class="card"><div class="card-body">${SKILLS.map(s=>`<div class="list-row"><div><strong>${escapeHtml(s.name)}</strong><div class="small subtle">${s.lesson?`Lesson ${s.lesson}`:'Current practice'} · ${escapeHtml(s.purpose)}</div></div></div>`).join('')}</div></section>`;}

function renderSettings(){return `<button class="btn" data-action="back-page">← Back</button><h1 class="page-title">Settings</h1><section class="card"><div class="card-body"><div class="field"><label>Therapy week starts</label><select id="week-start">${[[0,'Sunday'],[1,'Monday'],[2,'Tuesday'],[3,'Wednesday'],[4,'Thursday'],[5,'Friday'],[6,'Saturday']].map(([v,n])=>`<option value="${v}" ${appState.profile.therapyWeekStart===v?'selected':''}>${n}</option>`).join('')}</select><div class="subtle small">Changing this affects future weeks only.</div></div><div class="field"><label>PDF name</label><input id="pdf-name" value="${escapeHtml(appState.profile.pdfName||'')}"></div><button class="btn" data-action="change-pin">Change 4-Digit Passcode</button><button class="btn wide" style="margin-top:8px" data-action="lock-now">Lock Now</button></div></section>`;}

function renderModal(){ const m=appState.modal; if(!m) return '';
  if(m.type==='info'){ const t=[...appState.currentWeek.privateTargets,...appState.currentWeek.socialTargets].find(x=>x.id===m.targetId); if(!t) return ''; return `<div class="modal-backdrop"><div class="modal"><h2>${escapeHtml(t.label)}</h2><p>${escapeHtml(t.definition||'No definition entered.')}</p>${t.type==='scale'?`<div>${SCALE_ANCHORS.map(a=>`<div class="list-row"><span>${escapeHtml(a)}</span></div>`).join('')}</div>`:'<div class="subtle">Answer Yes or No. Unanswered remains blank.</div>'}<button class="btn primary wide" data-action="close-modal">Close</button></div></div>`; }
  if(m.type==='event'){ const existing=m.eventId?getTodayEntry().events.find(e=>e.id===m.eventId):null; return `<div class="modal-backdrop"><div class="modal"><h2>${existing?'Edit Event':'Add Event'}</h2><div class="field"><label>Context</label><input id="event-context" placeholder="Conversation after work" value="${escapeHtml(existing?.context||'')}"></div><div class="field"><label>Brief Note</label><textarea id="event-note" placeholder="Enough context to remember what happened later.">${escapeHtml(existing?.note||'')}</textarea></div><label class="check-row"><input type="checkbox" id="event-discuss" ${existing?.discuss?'checked':''}><span>Discuss in Therapy</span></label><div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="save-event" data-event-id="${existing?.id||''}">${existing?'Save Changes':'Save Event'}</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;}
  if(m.type==='other-skill') return `<div class="modal-backdrop"><div class="modal"><h2>Other RO Skill</h2><div class="checkbox-list">${SKILLS.filter(s=>!appState.currentWeek.focusSkills.includes(s.id)).map(s=>`<label class="check-row"><input type="checkbox" data-other-skill="${s.id}" ${getTodayEntry().skills.includes(s.id)?'checked':''}><span>${escapeHtml(s.name)}</span></label>`).join('')}</div><button class="btn primary wide" style="margin-top:12px" data-action="close-modal">Done</button></div></div>`;
  if(m.type==='saved-questions'){ const w=appState.currentWeek; const saved=w.savedSEPrompts.map(promptById).filter(Boolean); const fav=appState.profile.favoritePromptIds.map(promptById).filter(Boolean); return `<div class="modal-backdrop"><div class="modal"><h2>Saved Questions</h2><div class="section-kicker">This Week</div>${saved.length?saved.map(p=>`<div class="event-card">${escapeHtml(p.text)}</div>`).join(''):'<div class="subtle">None saved this week.</div>'}<div class="section-kicker" style="margin-top:16px">Favorites</div>${fav.length?fav.map(p=>`<div class="event-card">${escapeHtml(p.text)}</div>`).join(''):'<div class="subtle">No favorites yet.</div>'}<div class="section-kicker" style="margin-top:16px">My Questions</div>${appState.profile.myQuestions.length?appState.profile.myQuestions.map(q=>`<div class="event-card">${escapeHtml(q.text)}</div>`).join(''):'<div class="subtle">No personal questions yet.</div>'}<button class="btn primary wide" style="margin-top:12px" data-action="close-modal">Close</button></div></div>`;}
  if(m.type==='my-question') return `<div class="modal-backdrop"><div class="modal"><h2>Add My Question</h2><div class="field"><label>Question</label><textarea id="my-question-text"></textarea></div><div class="btn-row"><button class="btn primary" data-action="save-my-question">Save</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  if(m.type==='complete'){return `<div class="modal-backdrop"><div class="modal"><h2>Complete Today</h2>${m.missing.length?`<div class="notice">${m.missing.length} target${m.missing.length===1?' is':'s are'} unanswered.</div>${m.missing.map(x=>`<div class="list-row"><span>${escapeHtml(x.label)}</span></div>`).join('')}<div class="btn-row" style="margin-top:12px"><button class="btn" data-action="close-modal">Go Back</button><button class="btn primary" data-action="fill-zero-complete">Set to 0 / No and Complete</button></div>`:`<div class="subtle">All targets are answered.</div><button class="btn primary wide" style="margin-top:12px" data-action="confirm-complete">Mark Today Complete</button>`}</div></div>`;}
  if(m.type==='backup-password') return `<div class="modal-backdrop"><div class="modal"><h2>Create Encrypted Backup</h2><div class="field"><label>Backup password</label><input type="password" id="backup-pass1" autocomplete="new-password"></div><div class="field"><label>Confirm password</label><input type="password" id="backup-pass2" autocomplete="new-password"></div><div class="subtle">Use a strong password you can recover later. The app does not store it.</div>${m.error?`<div class="error">${escapeHtml(m.error)}</div>`:''}<div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="do-backup">Create Backup</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  if(m.type==='restore-password') return `<div class="modal-backdrop"><div class="modal"><h2>Restore Backup</h2><div class="field"><label>Backup password</label><input type="password" id="restore-pass"></div><div class="notice">Restore replaces the current vault after the backup is decrypted and validated.</div>${m.error?`<div class="error">${escapeHtml(m.error)}</div>`:''}<div class="btn-row"><button class="btn primary" data-action="do-restore">Validate & Restore</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  if(m.type==='change-pin') return `<div class="modal-backdrop"><div class="modal"><h2>Change Passcode</h2><div class="field"><label>Current 4-digit passcode</label><input type="password" inputmode="numeric" maxlength="4" id="old-pin"></div><div class="field"><label>New 4-digit passcode</label><input type="password" inputmode="numeric" maxlength="4" id="new-pin1"></div><div class="field"><label>Confirm new passcode</label><input type="password" inputmode="numeric" maxlength="4" id="new-pin2"></div>${m.error?`<div class="error">${escapeHtml(m.error)}</div>`:''}<div class="btn-row"><button class="btn primary" data-action="do-change-pin">Change</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  if(m.type==='archive-view') return renderArchiveModal(m.week);
  return '';
}

function renderArchiveModal(w){const dates=weekDates(w); return `<div class="modal-backdrop"><div class="modal"><h2>${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</h2><div class="section-kicker">Private</div>${renderRatingsTable(w.privateTargets,w)}<div class="section-kicker" style="margin-top:14px">Social</div>${renderRatingsTable(w.socialTargets,w)}<div class="section-kicker" style="margin-top:14px">Discuss in Therapy</div>${dates.flatMap(d=>w.days[d].events.filter(e=>e.discuss).map(e=>`<div class="event-card"><strong>${fmtDay(d)} — ${escapeHtml(e.context)}</strong><div>${escapeHtml(e.note)}</div></div>`)).join('')||'<div class="subtle">None flagged.</div>'}<button class="btn primary wide" style="margin-top:12px" data-action="close-modal">Close</button></div></div>`;}

function renderPrintRatingsTable(targets,w){const dates=weekDates(w);return `<table class="report-table"><thead><tr><th>Target</th>${dates.map(d=>`<th>${fmtDay(d)}<br><span>${fmtDate(d,{month:'numeric',day:'numeric'})}</span></th>`).join('')}</tr></thead><tbody>${targets.map(t=>`<tr><td>${escapeHtml(t.label)}</td>${dates.map(d=>{const v=targetValue(w.days[d],t.id);return `<td>${v===null?'—':typeof v==='boolean'?(v?'Y':'N'):v}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`;}
function renderPrintCompletion(w){const dates=weekDates(w);return `<table class="report-table completion-table"><thead><tr>${dates.map(d=>`<th>${fmtDay(d)}<br><span>${fmtDate(d,{month:'numeric',day:'numeric'})}</span></th>`).join('')}</tr></thead><tbody><tr>${dates.map(d=>`<td>${w.days[d].completed?'Complete':'Incomplete'}</td>`).join('')}</tr></tbody></table>`;}
function renderPrintSkills(w){const dates=weekDates(w);const used=SKILLS.filter(s=>dates.some(d=>w.days[d].skills.includes(s.id)));if(!used.length)return '<div class="report-empty">No skills recorded.</div>';return `<table class="report-table"><thead><tr><th>Skill</th>${dates.map(d=>`<th>${fmtDay(d)}</th>`).join('')}</tr></thead><tbody>${used.map(s=>`<tr><td>${escapeHtml(s.name)}</td>${dates.map(d=>`<td>${w.days[d].skills.includes(s.id)?'✓':''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function renderPrintReport(){
  if(appState.locked || !appState.currentWeek) return '';
  const w=appState.currentWeek; const dates=weekDates(w);
  const events=dates.flatMap(d=>w.days[d].events.map(e=>({...e,date:d})));
  const saved=w.savedSEPrompts.map(promptById).filter(Boolean);
  const oc=(w.majorOCThemeEnabled && w.majorOCTheme)?`<div class="report-context-row"><strong>Major OC Theme:</strong> ${escapeHtml(w.majorOCTheme)}</div>`:'';
  return `<div class="print-report">
    <div class="report-heading"><div><h1>RO Diary — ${escapeHtml(appState.profile.pdfName||'')}</h1><div class="report-meta">Therapy week ${fmtDate(w.startDate,{month:'short',day:'numeric',year:'numeric'})} – ${fmtDate(w.endDate,{month:'short',day:'numeric',year:'numeric'})}</div></div></div>
    <h2>Completion</h2>${renderPrintCompletion(w)}
    <h2>Private Behaviors, Emotions & Urges</h2>${renderPrintRatingsTable(w.privateTargets,w)}
    <h2>Social Signals & Overt Behaviors</h2>${renderPrintRatingsTable(w.socialTargets,w)}
    <h2>Skills Used</h2>${renderPrintSkills(w)}
    <h2>Notes / Events</h2>${events.length?events.map(e=>`<div class="report-event ${e.discuss?'report-event-flagged':''}"><div><strong>${fmtDay(e.date)} ${fmtDate(e.date,{month:'numeric',day:'numeric'})}${e.context?` — ${escapeHtml(e.context)}`:''}</strong>${e.discuss?' <span class="report-flag">Discuss in Therapy</span>':''}</div>${e.note?`<div class="report-event-note">${escapeHtml(e.note)}</div>`:''}</div>`).join(''):'<div class="report-empty">No notes or events recorded.</div>'}
    <h2>Self-Enquiry</h2><div class="report-context-row"><strong>Weekly focus:</strong> ${escapeHtml(w.weeklySEFocus||'—')}</div>${saved.length?`<div class="report-context-row"><strong>Saved questions this week:</strong><ul>${saved.map(p=>`<li>${escapeHtml(p.text)}</li>`).join('')}</ul></div>`:''}
    <h2>Week Context</h2><div class="report-context-row"><strong>Homework:</strong> ${escapeHtml(w.homework||'—')}</div><div class="report-context-row"><strong>Valued Goal:</strong> ${escapeHtml(w.valuedGoal||'—')}</div>${oc}
    <div class="report-footer">Generated locally by RO Diary ${APP_VERSION}</div>
  </div>`;
}

function bindLock(){
  $$('[data-pin]').forEach(b=>b.addEventListener('click',()=>handlePinDigit(b.dataset.pin)));
  $('[data-action="clear"]')?.addEventListener('click',()=>{appState.pinBuffer='';appState.pinError='';render();});
  $('[data-action="back"]')?.addEventListener('click',()=>{appState.pinBuffer=appState.pinBuffer.slice(0,-1);appState.pinError='';render();});
}
async function handlePinDigit(d){ if(appState.busy || appState.pinBuffer.length>=4) return; appState.pinBuffer+=d; render(); if(appState.pinBuffer.length<4) return; appState.busy=true;
  try {
    if(appState.setupNeeded){
      if(appState.pinStage==='setup'){appState.setupPinFirst=appState.pinBuffer;appState.pinBuffer='';appState.pinStage='confirm';render();}
      else if(appState.pinBuffer!==appState.setupPinFirst){appState.pinBuffer='';appState.pinStage='setup';appState.setupPinFirst='';appState.pinError='Passcodes did not match. Try again.';render();}
      else {await setupVault(appState.pinBuffer);appState.setupNeeded=false;appState.locked=false;appState.pinBuffer='';appState.pinStage='unlock';appState.pinError='';render();}
    } else {await unlockVault(appState.pinBuffer);appState.locked=false;appState.pinBuffer='';appState.pinError='';render();}
  } catch(e){appState.pinBuffer='';appState.pinError=e.message;render();}
  finally{appState.busy=false;}
}

function bindApp(){
  $$('[data-nav]').forEach(b=>b.addEventListener('click',()=>{appState.nav=b.dataset.nav;appState.page=null;render();}));
  $$('[data-page]').forEach(b=>b.addEventListener('click',()=>{appState.page=b.dataset.page;render(); if(appState.page==='archive') hydrateArchiveLabels();}));
  $('[data-action="back-page"]')?.addEventListener('click',()=>{appState.page=null;appState.nav='more';render();});
  $$('[data-target]').forEach(b=>b.addEventListener('click',()=>{const day=getTodayEntry();let v=b.dataset.value; if(v==='true')v=true; else if(v==='false')v=false; else v=Number(v); setTargetValue(day,b.dataset.target,v);}));
  $$('[data-info]').forEach(b=>b.addEventListener('click',()=>{appState.modal={type:'info',targetId:b.dataset.info};render();}));
  $$('[data-skill]').forEach(c=>c.addEventListener('change',()=>toggleSkill(c.dataset.skill,c.checked)));
  $$('[data-other-skill]').forEach(c=>c.addEventListener('change',()=>toggleSkill(c.dataset.otherSkill,c.checked,false)));
  $$('[data-focus-skill]').forEach(c=>c.addEventListener('change',()=>toggleFocusSkill(c.dataset.focusSkill,c.checked)));
  $$('[data-action]').forEach(b=>{ const a=b.dataset.action; if(b.__boundAction) return; b.__boundAction=true; b.addEventListener('click',()=>handleAction(a,b)); });
  $$('[data-week-field]').forEach(el=>el.addEventListener('change',()=>{appState.currentWeek[el.dataset.weekField]=el.value;queueSaveWeek();}));
  $$('[data-target-label]').forEach(el=>el.addEventListener('change',()=>updateTargetField(el.dataset.kind,el.dataset.targetLabel,'label',el.value)));
  $$('[data-target-def]').forEach(el=>el.addEventListener('change',()=>updateTargetField(el.dataset.kind,el.dataset.targetDef,'definition',el.value)));
  $$('[data-target-type]').forEach(el=>el.addEventListener('change',()=>updateTargetField(el.dataset.kind,el.dataset.targetType,'type',el.value)));
  $$('[data-delete-target]').forEach(b=>b.addEventListener('click',()=>deleteTarget(b.dataset.kind,b.dataset.deleteTarget)));
  $('#pdf-name')?.addEventListener('change',e=>{appState.profile.pdfName=e.target.value;queueSaveProfile();});
  $('#week-start')?.addEventListener('change',e=>{appState.profile.therapyWeekStart=Number(e.target.value);queueSaveProfile();});
}
function toggleSkill(id,checked,doRender=true){const d=getTodayEntry(); if(checked&&!d.skills.includes(id))d.skills.push(id); if(!checked)d.skills=d.skills.filter(x=>x!==id); d.modifiedAt=new Date().toISOString();queueSaveWeek(); if(doRender)render();}
function toggleFocusSkill(id,checked){const w=appState.currentWeek;if(checked){if(w.focusSkills.length>=5){alert('Choose up to five focus skills.');render();return;} if(!w.focusSkills.includes(id))w.focusSkills.push(id);}else w.focusSkills=w.focusSkills.filter(x=>x!==id);queueSaveWeek();render();}
function updateTargetField(kind,id,field,val){const arr=kind==='private'?appState.currentWeek.privateTargets:appState.currentWeek.socialTargets;const t=arr.find(x=>x.id===id);if(t){t[field]=val;queueSaveWeek();}}
function deleteTarget(kind,id){const arr=kind==='private'?appState.currentWeek.privateTargets:appState.currentWeek.socialTargets;if(!confirm('Remove this target from the current week?'))return;const next=arr.filter(x=>x.id!==id);if(kind==='private')appState.currentWeek.privateTargets=next;else appState.currentWeek.socialTargets=next;queueSaveWeek();render();}

async function handleAction(a,b){
  if(a==='close-modal'){appState.modal=null;render();return;}
  if(a==='other-skill'){appState.modal={type:'other-skill'};render();return;}
  if(a==='go-se'){appState.nav='se';appState.page=null;render();return;}
  if(a==='add-event'){appState.modal={type:'event'};render();return;}
  if(a==='edit-event'){appState.modal={type:'event',eventId:b.dataset.eventId};render();return;}
  if(a==='delete-event'){const day=getTodayEntry();const eventId=b.dataset.eventId;if(!confirm('Delete this note/event?'))return;day.events=day.events.filter(e=>e.id!==eventId);day.modifiedAt=new Date().toISOString();queueSaveWeek();render();return;}
  if(a==='save-event'){const ctx=$('#event-context')?.value.trim()||'';const note=$('#event-note')?.value.trim()||'';const discuss=$('#event-discuss')?.checked||false;if(!ctx&&!note){return;}const day=getTodayEntry();const eventId=b.dataset.eventId||'';const existing=eventId?day.events.find(e=>e.id===eventId):null;if(existing){existing.context=ctx;existing.note=note;existing.discuss=discuss;existing.modifiedAt=new Date().toISOString();}else{day.events.push({id:uid(),context:ctx,note,discuss,createdAt:new Date().toISOString(),modifiedAt:new Date().toISOString()});}day.modifiedAt=new Date().toISOString();queueSaveWeek();appState.modal=null;render();return;}
  if(a==='complete-day'){const d=getTodayEntry();const all=[...appState.currentWeek.privateTargets,...appState.currentWeek.socialTargets];const missing=all.filter(t=>targetValue(d,t.id)===null).map(t=>({id:t.id,label:t.label,type:t.type}));appState.modal={type:'complete',missing};render();return;}
  if(a==='fill-zero-complete'){const d=getTodayEntry();for(const x of appState.modal.missing)d.ratings[x.id]=x.type==='yn'?false:0;completeDay(d);return;}
  if(a==='confirm-complete'){completeDay(getTodayEntry());return;}
  if(a==='another-prompt'){choosePrompt();render();return;}
  if(a==='save-prompt'){const id=appState.currentPromptId;const arr=appState.currentWeek.savedSEPrompts;appState.currentWeek.savedSEPrompts=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];queueSaveWeek();render();return;}
  if(a==='favorite-prompt'){const id=appState.currentPromptId;const arr=appState.profile.favoritePromptIds;appState.profile.favoritePromptIds=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];queueSaveProfile();render();return;}
  if(a==='reject-prompt'){const id=appState.currentPromptId;if(!appState.profile.notUsefulPromptIds.includes(id))appState.profile.notUsefulPromptIds.push(id);queueSaveProfile();choosePrompt();render();return;}
  if(a==='saved-questions'){appState.modal={type:'saved-questions'};render();return;}
  if(a==='add-my-question'){appState.modal={type:'my-question'};render();return;}
  if(a==='save-my-question'){const text=$('#my-question-text')?.value.trim();if(text){appState.profile.myQuestions.push({id:uid(),text,createdAt:new Date().toISOString()});queueSaveProfile();}appState.modal=null;render();return;}
  if(a==='print-report'){window.print();return;}
  if(a==='backup'){appState.modal={type:'backup-password',error:''};render();return;}
  if(a==='do-backup'){await createBackupFromModal();return;}
  if(a==='restore'){pickRestoreFile();return;}
  if(a==='do-restore'){await restoreFromModal();return;}
  if(a==='lock-now'){lockApp();return;}
  if(a==='change-pin'){appState.modal={type:'change-pin',error:''};render();return;}
  if(a==='do-change-pin'){await changePinFromModal();return;}
  if(a==='add-target'){const kind=b.dataset.kind;const arr=kind==='private'?appState.currentWeek.privateTargets:appState.currentWeek.socialTargets;arr.push({id:uid(),label:'New Target',definition:'',type:'scale',order:arr.length});queueSaveWeek();render();return;}
  if(a==='open-archive'){const w=await loadRecord(`week:${b.dataset.weekId}`);appState.modal={type:'archive-view',week:w};render();return;}
}
function completeDay(d){d.completed=true;d.completedAt=new Date().toISOString();d.modifiedAt=d.completedAt;queueSaveWeek();appState.modal=null;render();}

async function hydrateArchiveLabels(){const rows=$$('[data-week-id]');for(const row of rows){const id=row.dataset.weekId;const w=await loadRecord(`week:${id}`);if(w){const span=row.querySelector('span');span.textContent=`${fmtDate(w.startDate)} – ${fmtDate(w.endDate)} ${w.id===appState.currentWeek.id?'(Current)':w.archived?'':'(Past)'}`;}}}

async function collectPortableData(){ const profile=structuredClone(appState.profile); const weeks=[]; for(const id of profile.weekIds){const w= id===appState.currentWeek.id ? structuredClone(appState.currentWeek) : await loadRecord(`week:${id}`); if(w) weeks.push(w);} return {format:'ro-diary-data',version:1,appVersion:APP_VERSION,exportedAt:new Date().toISOString(),profile,weeks}; }
function validatePortableData(data){if(!data||data.format!=='ro-diary-data'||data.version!==1||!data.profile||!Array.isArray(data.weeks))throw new Error('This is not a supported RO Diary backup.');if(!data.profile.currentWeekId||!Array.isArray(data.profile.weekIds))throw new Error('Backup profile is incomplete.');for(const w of data.weeks){if(!w.id||!w.startDate||!w.endDate||!w.days||!Array.isArray(w.privateTargets)||!Array.isArray(w.socialTargets))throw new Error('A therapy week in the backup is invalid.');for(const d of Object.values(w.days)){if(!d.date||!d.ratings||!Array.isArray(d.skills)||!Array.isArray(d.events))throw new Error('A daily entry in the backup is invalid.');for(const v of Object.values(d.ratings)){if(v!==null && typeof v!=='boolean' && !(Number.isInteger(v)&&v>=0&&v<=5))throw new Error('A rating in the backup is invalid.');}}}return true;}
async function createBackupFromModal(){const p1=$('#backup-pass1')?.value||'';const p2=$('#backup-pass2')?.value||'';if(p1.length<10){appState.modal.error='Use at least 10 characters for the backup password.';render();return;}if(p1!==p2){appState.modal.error='Passwords do not match.';render();return;}try{appState.busy=true;const portable=await collectPortableData();const salt=randomBytes(16);const key=await deriveBackupKey(p1,salt);const e=await aesEncrypt(key,enc.encode(JSON.stringify(portable)));const envelope={format:'ro-diary-backup',version:1,kdf:{name:'PBKDF2-SHA256',iterations:BACKUP_ITERATIONS,salt:arrToB64(salt)},cipher:{name:'AES-256-GCM',iv:arrToB64(e.iv)},data:arrToB64(e.data)};const blob=new Blob([JSON.stringify(envelope)],{type:'application/octet-stream'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`RO-Diary-Backup-${todayStr()}.rodbt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);appState.profile.lastBackupAt=new Date().toISOString();queueSaveProfile();appState.modal=null;render();}catch(e){appState.modal.error=e.message;render();}finally{appState.busy=false;}}
let pendingRestoreEnvelope=null;
function pickRestoreFile(){const input=document.createElement('input');input.type='file';input.accept='.rodbt,application/octet-stream,application/json';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{pendingRestoreEnvelope=JSON.parse(await file.text());if(pendingRestoreEnvelope.format!=='ro-diary-backup')throw new Error('Not an RO Diary backup.');appState.modal={type:'restore-password',error:''};render();}catch(e){alert(`Backup could not be opened: ${e.message}`);}};input.click();}
async function restoreFromModal(){const pass=$('#restore-pass')?.value||'';try{appState.busy=true;const env=pendingRestoreEnvelope;if(!env)throw new Error('No backup selected.');const key=await deriveBackupKey(pass,b64ToArr(env.kdf.salt));const plain=await aesDecrypt(key,{iv:b64ToArr(env.cipher.iv),data:b64ToArr(env.data)});const data=JSON.parse(dec.decode(plain));validatePortableData(data);if(!confirm(`Restore ${data.weeks.length} therapy week(s) and replace the current vault?`))return;
 const oldProfile=await idbGet('records','profile'); const oldWeekPayloads={}; for(const id of appState.profile.weekIds) oldWeekPayloads[id]=await idbGet('records',`week:${id}`);
 try{const encryptedProfile=await encryptJson(data.profile);const encryptedWeeks={};for(const w of data.weeks)encryptedWeeks[w.id]=await encryptJson(w);await idbPut('records','profile',encryptedProfile);for(const id of appState.profile.weekIds)await idbDelete('records',`week:${id}`);for(const [id,p] of Object.entries(encryptedWeeks))await idbPut('records',`week:${id}`,p);appState.profile=data.profile;appState.currentWeek=data.weeks.find(w=>w.id===data.profile.currentWeekId)||data.weeks.at(-1);pendingRestoreEnvelope=null;appState.modal=null;render();}catch(e){if(oldProfile)await idbPut('records','profile',oldProfile);for(const [id,p] of Object.entries(oldWeekPayloads))if(p)await idbPut('records',`week:${id}`,p);throw e;}
 }catch(e){appState.modal={type:'restore-password',error:'Backup password is wrong or the backup is damaged.'};render();}finally{appState.busy=false;}}

async function changePinFromModal(){const oldPin=$('#old-pin')?.value||'';const n1=$('#new-pin1')?.value||'';const n2=$('#new-pin2')?.value||'';if(!/^\d{4}$/.test(oldPin)||!/^\d{4}$/.test(n1)){appState.modal.error='Passcodes must be exactly 4 digits.';render();return;}if(n1!==n2){appState.modal.error='New passcodes do not match.';render();return;}try{const deviceKey=await idbGet('secure','deviceKey');const wrap=await idbGet('secure','vaultWrap');const oldKey=await derivePinKey(oldPin,b64ToArr(wrap.pinSalt));const innerBytes=await aesDecrypt(oldKey,{iv:b64ToArr(wrap.pinIv),data:b64ToArr(wrap.pinData)});const newSalt=randomBytes(16);const newKey=await derivePinKey(n1,newSalt);const newWrap=await aesEncrypt(newKey,innerBytes);await idbPut('secure','vaultWrap',{pinSalt:arrToB64(newSalt),pinIv:arrToB64(newWrap.iv),pinData:arrToB64(newWrap.data)});appState.modal=null;render();}catch(e){appState.modal.error='Current passcode is incorrect.';render();}}

function deleteLegacyDatabase(name){return new Promise(resolve=>{try{const req=indexedDB.deleteDatabase(name);req.onsuccess=req.onerror=req.onblocked=()=>resolve();}catch(_){resolve();}});}

async function init(){
  if(!window.crypto?.subtle || !window.indexedDB){document.getElementById('app').innerHTML='<div class="lock-screen"><div class="lock-card"><div class="lock-title">RO Diary</div><div class="error">This browser does not support the required local security features.</div></div></div>';return;}
  for(const name of LEGACY_DB_NAMES) await deleteLegacyDatabase(name);
  db=await openDB(); const wrap=await idbGet('secure','vaultWrap'); appState.setupNeeded=!wrap; appState.pinStage=appState.setupNeeded?'setup':'unlock'; appState.locked=true; render();
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){appState.hiddenAt=Date.now();}else if(appState.hiddenAt && Date.now()-appState.hiddenAt>=AUTO_LOCK_MS && !appState.locked){lockApp();}else appState.hiddenAt=null;});
}

init().catch(e=>{document.getElementById('app').innerHTML=`<div class="lock-screen"><div class="lock-card"><div class="lock-title">RO Diary</div><div class="error">${escapeHtml(e.message)}</div></div></div>`;});

})();
