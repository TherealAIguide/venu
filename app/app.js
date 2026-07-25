/* =========================================================================
   STORAGE ADAPTER — Firebase (Firestore)
   ---------------------------------------------------------------------
   Backed by Cloud Firestore (project venu-b5134). The five method
   signatures are IDENTICAL to the original demo adapter, so nothing else
   in the app changes.

   Every key is scoped by client slug so one event's photos can never leak
   into another's:  clients/{slug}/photos/{id}
   The photos collection itself IS the index, so getIndex() queries it and
   setIndex() is a no-op kept only for signature compatibility.

   Photos are stored as the resized display image (a ~700px JPEG data URL,
   typically 50-150KB) in the doc's `img` field. Full-resolution originals
   in Cloud Storage are a later upgrade (requires the Blaze plan).
   Doc shape: { img, status: "pending"|"approved", ts }
   ========================================================================= */
const SLUG = resolveSlug();
const photosCol = () => db.collection("clients").doc(SLUG).collection("photos");

const store = {
  available: true,
  async getIndex(){
    try{
      const snap = await photosCol().orderBy("ts").get();
      return snap.docs.map(d => d.id);
    }catch(e){ return []; }
  },
  async setIndex(ids){ /* no-op: the photos collection is the source of truth */ },
  async getPhoto(id){
    try{
      const doc = await photosCol().doc(id).get();
      return doc.exists ? doc.data() : null;
    }catch(e){ return null; }
  },
  async setPhoto(id, obj){
    try{ await photosCol().doc(id).set(obj, { merge:true }); return true; }
    catch(e){ return false; }
  },
  async delPhoto(id){
    try{ await photosCol().doc(id).delete(); }catch(e){}
  }
};

/* ========================= BOOT / THEMING ========================= */
const C = resolveClient();
document.documentElement.style.setProperty("--accent", C.brand.accent);
document.documentElement.style.setProperty("--gold", C.brand.gold);
document.getElementById("brandKicker").textContent = C.brand.kicker;
document.getElementById("brandName").textContent = C.brand.name;
document.getElementById("schedVenue").textContent = C.brand.venue;
document.getElementById("displayCaption").textContent = C.brand.displayCaption;
document.getElementById("displaySub").textContent = C.brand.displaySub;
document.title = C.brand.name + " — Event App";

/* ========================= TABS ========================= */
const TABS = [
  { id:"home", label:"Now", ico:"⚡", show:true },
  { id:"schedule", label:"Schedule", ico:"🗓", show:C.features.schedule },
  { id:"speakers", label:"Speakers", ico:"🎤", show:C.features.speakers },
  { id:"sponsors", label:"Sponsors", ico:"🤝", show:C.features.sponsors },
  { id:"wall", label:"Photo wall", ico:"📸", show:C.features.photoWall }
];
const tabbar = document.getElementById("tabbar");
TABS.filter(t=>t.show).forEach(t=>{
  const b = document.createElement("button");
  b.id = "tab-"+t.id;
  b.innerHTML = `<span class="ico">${t.ico}</span>${t.label}`;
  b.onclick = ()=>switchTab(t.id);
  tabbar.appendChild(b);
});
function switchTab(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.querySelectorAll(".tabbar button").forEach(b=>b.classList.remove("active"));
  document.getElementById("view-"+id).classList.add("active");
  const tb = document.getElementById("tab-"+id);
  if(tb) tb.classList.add("active");
  if(id==="wall") renderWall();
  if(id==="mod") loadModQueue();
  window.scrollTo({top:0});
}
switchTab("home");

/* ========================= NOW / NEXT ========================= */
(function renderNow(){
  const day = C.days[0];
  const now = day.slots[1] || day.slots[0];
  const next = day.slots[2];
  document.getElementById("nowTitle").textContent = now.title;
  document.getElementById("nowMeta").textContent = now.time + " · " + now.who;
  document.getElementById("nextUp").innerHTML = next ? `Up next · <strong>${next.time} — ${next.title}</strong>` : "";
  document.getElementById("livePillText").textContent = "DAY 1 · " + day.label.split(" ")[0].toUpperCase();
})();

/* ========================= SCHEDULE ========================= */
const chips = document.getElementById("dayChips");
C.days.forEach((d,i)=>{
  const b=document.createElement("button");
  b.textContent=d.label;
  b.onclick=()=>{ chips.querySelectorAll("button").forEach(x=>x.classList.remove("active")); b.classList.add("active"); renderDay(i); };
  if(i===0) b.classList.add("active");
  chips.appendChild(b);
});
function renderDay(i){
  document.getElementById("slotList").innerHTML = C.days[i].slots.map(s=>`
    <div class="slot">
      <div class="time">${s.time}</div>
      <div class="what"><div class="title">${s.title}</div><div class="who">${s.who}</div></div>
      <div class="kind ${s.kind==="main"?"main":""}">${s.kind}</div>
    </div>`).join("");
}
renderDay(0);

/* ========================= SPEAKERS ========================= */
document.getElementById("speakerList").innerHTML = C.speakers.map(s=>{
  const initials = s.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return `<div class="speaker"><div class="avatar">${initials}</div>
    <div class="info"><div class="nm">${s.name}</div><div class="rl">${s.role}</div></div></div>`;
}).join("");

/* ========================= SPONSORS ========================= */
document.getElementById("sponsorList").innerHTML = C.sponsors.map(t=>`
  <div class="sponsor-tier">${t.tier}</div>
  ${t.items.map(s=>{
    const initials = s.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    return `<div class="sponsor card"><div class="logo">${initials}</div>
      <div class="info"><div class="nm">${s.name}</div><div class="booth">${s.booth}</div></div>
      <a class="visit" href="${s.url}">Visit</a></div>`;
  }).join("")}`).join("");

/* ========================= PHOTO SUBMIT ========================= */
document.getElementById("photoInput").addEventListener("change", async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const status = document.getElementById("photoStatus");
  const btn = document.getElementById("submitBtn");
  btn.disabled = true; btn.textContent = "Uploading…";
  try{
    const dataUrl = await resizeImage(file, 700, 0.72);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    const ok = await store.setPhoto(id, { img:dataUrl, status:"pending", ts:Date.now() });
    if(!ok) throw new Error("storage");
    const idx = await store.getIndex();
    idx.push(id);
    await store.setIndex(idx);
    status.className = "status-banner ok";
    status.textContent = "Sent to moderators — watch the big screen!";
  }catch(err){
    status.className = "status-banner err";
    status.textContent = store.available
      ? "Upload didn't go through. Try a smaller photo or try again."
      : "Storage isn't available in this preview — works once deployed.";
  }
  btn.disabled = false; btn.textContent = "📸  Take or choose a photo";
  e.target.value = "";
});

function resizeImage(file, maxDim, quality){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    const reader = new FileReader();
    reader.onload = ()=>{ img.src = reader.result; };
    reader.onerror = reject;
    img.onload = ()=>{
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const cnv = document.createElement("canvas");
      cnv.width = Math.round(img.width*scale);
      cnv.height = Math.round(img.height*scale);
      cnv.getContext("2d").drawImage(img, 0, 0, cnv.width, cnv.height);
      resolve(cnv.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ========================= WALL (approved grid) ========================= */
async function renderWall(){
  const grid = document.getElementById("wallGrid");
  const idx = await store.getIndex();
  const photos = [];
  for(const id of idx.slice(-30)){
    const p = await store.getPhoto(id);
    if(p && p.status==="approved") photos.push(p);
  }
  grid.innerHTML = photos.length
    ? photos.reverse().map(p=>`<div class="ph"><img src="${p.img}" alt="Featured event photo"></div>`).join("")
    : `<div class="wall-empty">No photos featured yet — be the first.</div>`;
}

/* ========================= MODERATOR ========================= */
function enterMod(e){ if(e) e.preventDefault(); switchTab("mod"); }
async function loadModQueue(){
  const q = document.getElementById("modQueue");
  const idx = await store.getIndex();
  const pending = [];
  for(const id of idx){
    const p = await store.getPhoto(id);
    if(p && p.status==="pending") pending.push({id, ...p});
  }
  document.getElementById("modCount").textContent = pending.length + " photo(s) waiting for review";
  q.innerHTML = pending.map(p=>`
    <div class="mod-item card">
      <div class="thumb"><img src="${p.img}" alt="Submitted photo pending review"></div>
      <div class="meta"><div class="nm">Submission</div>${new Date(p.ts).toLocaleTimeString()}</div>
      <div class="mod-actions">
        <button class="ok" onclick="modAction('${p.id}','approved')">Approve</button>
        <button class="no" onclick="modAction('${p.id}','rejected')">Reject</button>
      </div>
    </div>`).join("") || `<div class="card wall-empty">Queue is clear 🎉</div>`;
}
async function modAction(id, status){
  const p = await store.getPhoto(id);
  if(!p) return;
  if(status==="rejected"){
    await store.delPhoto(id);
    const idx = await store.getIndex();
    await store.setIndex(idx.filter(x=>x!==id));
  } else {
    p.status = "approved";
    await store.setPhoto(id, p);
  }
  loadModQueue();
}

/* ========================= BIG SCREEN ========================= */
let displayTimer = null, displayPool = [], displayI = 0;
function enterDisplay(e){
  if(e) e.preventDefault();
  document.body.classList.add("display-mode");
  refreshDisplayPool();
  displayTimer = setInterval(refreshDisplayPool, 8000);
}
async function refreshDisplayPool(){
  const idx = await store.getIndex();
  const pool = [];
  for(const id of idx.slice(-40)){
    const p = await store.getPhoto(id);
    if(p && p.status==="approved") pool.push(p.img);
  }
  displayPool = pool;
  rotateDisplay();
}
function rotateDisplay(){
  const frame = document.getElementById("displayFrame");
  if(!displayPool.length){
    frame.innerHTML = `<div class="empty">Waiting for your photos…<br>Submit in the event app</div>`;
    return;
  }
  displayI = (displayI + 1) % displayPool.length;
  frame.innerHTML = `<img src="${displayPool[displayI]}" alt="Featured attendee photo">`;
}
if(location.hash === "#display") enterDisplay();
if(location.hash === "#mod") enterMod();
