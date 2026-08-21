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
document.body.className = "theme-" + (C.theme || "pulse");
/* Per-client photo-wall copy (config.wall) — defaults stay generic. */
if(C.wall){
  const W = C.wall, set = (id, v, html)=>{ const n = document.getElementById(id); if(n && v != null) html ? n.innerHTML = v : n.textContent = v; };
  set("wallTitle", W.title); set("wallTag", W.tag);
  set("wallCtaTitle", W.ctaTitle, true); set("wallCtaSub", W.ctaSub);
  set("submitBtn", W.btn);
}
const _tc = document.querySelector('meta[name="theme-color"]');
if(_tc) _tc.setAttribute("content", ({ gala:"#F7F4EC", chili:"#101A45" })[C.theme] || "#0A0A0B");

/* ========================= SAFE STORAGE =========================
   localStorage with an in-memory fallback (private browsing, embedded
   previews). Modules may use it too via window.venuLS. */
const venuMem = {};
window.venuLS = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return (k in venuMem) ? venuMem[k] : null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} venuMem[k] = String(v); },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} delete venuMem[k]; }
};

/* ========================= FUN: venuFX =========================
   Shared micro-delight engine. burst() rains brand-colored confetti +
   the occasional pepper. Modules call it on wins (vote cast, hunt done). */
window.venuFX = {
  burst(count){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const n = count || 44;
    const wrap = document.createElement("div");
    wrap.className = "fx-burst";
    const colors = ["#304CB2","#E51D23","#F9B612","#FFFFFF"];
    const pepper = '<svg viewBox="0 0 24 24" width="15" height="15"><path fill="CLR" d="M8 21c-4 0-6-3-6-6 0-2 1-3 2-3 0 3 2 5 5 5 5 0 7-4 7-8 0-1.6-.6-2.6-1.5-3.2.3-.5.8-.8 1.5-.8 0-2 1.5-3 3-3-.3 1-.2 1.8.3 2.3C21.4 5 22 6.4 22 8c0 7-6 13-14 13z"/></svg>';
    for(let i=0;i<n;i++){
      const p = document.createElement("i");
      const c = colors[i % colors.length];
      if(i % 6 === 0){ p.className = "pep"; p.innerHTML = pepper.replace("CLR", c); }
      else p.style.background = c;
      p.style.left = (4 + Math.random()*92) + "%";
      p.style.setProperty("--dx", (Math.random()*160 - 80).toFixed(0) + "px");
      p.style.setProperty("--rot", (Math.random()*720 - 360).toFixed(0) + "deg");
      p.style.animationDelay = (Math.random()*0.25).toFixed(2) + "s";
      p.style.animationDuration = (1.1 + Math.random()*0.9).toFixed(2) + "s";
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(()=>wrap.remove(), 2500);
  },
  /* A jet crosses the screen trailing a tricolor contrail. The aviation
     moment — used on the splash, vote casts, and anywhere a win needs
     wings. opts: { top: "30%", delay: ms } */
  flyby(opts){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const o = opts || {};
    const size = o.size || 34;
    const el = document.createElement("div");
    el.className = "fx-fly";
    el.style.top = o.top || (18 + Math.random()*30) + "%";
    if(o.delay) el.style.animationDelay = (o.delay/1000) + "s";
    el.innerHTML = `
      <span class="fx-trail" style="height:${Math.max(3, Math.round(size/9))}px"></span>
      <svg class="fx-plane" style="width:${size}px;height:${size}px" viewBox="0 0 24 24" aria-hidden="true">
        <g transform="rotate(90 12 12)">
          <path fill="#fff" d="M21.5 15.5v-2l-8-5V3c0-.83-.67-1.5-1.5-1.5S10.5 2.17 10.5 3v5.5l-8 5v2l8-2.5v5.5l-2 1.5V21.5l3.5-1 3.5 1V20l-2-1.5V13l8 2.5z"/>
        </g>
      </svg>`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 2600 + (o.delay||0));
  }
};

/* ========================= DEEP LINKS =========================
   Booth/poster QR codes land people exactly where they need to be:
   <url>/#vote → straight to the ballot (splash + welcome are skipped
   for speed). #display / #mod keep their special handling. */
const DEEP_LINKS = { "#vote":"polls", "#hunt":"venueMap", "#map":"venueMap", "#photos":"wall", "#schedule":"schedule" };
const deepTarget = DEEP_LINKS[location.hash] || null;
function applyDeepLink(){
  if(!deepTarget) return;
  if(document.getElementById("view-" + deepTarget)) switchTab(deepTarget);
}

/* ========================= LIVE CHIP + AVATAR =========================
   One-day events drop the "DAY 1" pill for a pulsing LIVE chip; once
   they've checked in, their photo rides in the chip. */
const AVATAR_KEY = "venu:" + SLUG + ":avatar";
if(C.oneDay) document.querySelector(".live-pill").classList.add("live-chip");
window.venuAvatar = ()=> venuLS.get(AVATAR_KEY);
function venuSetAvatar(url){ renderChip(); }
/* Header chip. Aviation clients get the flight-progress widget from the
   Southwest app (DAL ——✈—— SFR, plane drifting) with their check-in
   photo riding along; everyone else keeps the pulsing LIVE chip. */
function renderChip(){
  const pill = document.querySelector(".live-pill");
  if(!pill) return;
  const av = venuLS.get(AVATAR_KEY);
  if(C.aviation){
    pill.classList.add("route-chip");
    pill.innerHTML = `
      ${av ? `<img class="pill-avatar" src="${av}" alt="Your check-in photo">` : `<span class="rc-heart">${SW_HEART}</span>`}
      <span class="rc-ap">${C.aviation.from}</span>
      <span class="rc-track"><svg class="rc-plane" viewBox="0 0 24 24" fill="#F9B612">${JET}</svg></span>
      <span class="rc-ap">${C.aviation.to}</span>`;
  } else if(av){
    pill.classList.add("has-avatar");
    pill.innerHTML = `<img class="pill-avatar" src="${av}" alt="Your check-in photo"><span class="live-dot"></span><span id="livePillText">LIVE</span>`;
  }
}

/* ========================= BOARDING PASS =========================
   The aviation layer (client.aviation config). Check-in issues a pass:
   flight, DAL→SFR, boarding group + position, their selfie, a barcode.
   Lives behind the LIVE chip and a teaser card on Now. Everyone boards
   Group A today — obviously. */
const PASS_KEY = "venu:" + SLUG + ":pass";
const JET = '<g transform="rotate(90 12 12)"><path d="M21.5 15.5v-2l-8-5V3c0-.83-.67-1.5-1.5-1.5S10.5 2.17 10.5 3v5.5l-8 5v2l8-2.5v5.5l-2 1.5V21.5l3.5-1 3.5 1V20l-2-1.5V13l8 2.5z"/></g>';
/* The Southwest heart — tri-band with silver dividers, drawn to spec from
   the brand mark. Woven through: appbar kicker, splash, route chip,
   boarding pass. */
const SW_HEART = `
<svg class="sw-heart" viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <clipPath id="swHeartClip"><path d="M50 88C22 64 9 46 9 31 9 17 20 8 32 8c8 0 15 4.5 18 11 3-6.5 10-11 18-11 12 0 23 9 23 23 0 15-13 33-41 57z"/></clipPath>
  </defs>
  <g clip-path="url(#swHeartClip)">
    <g transform="rotate(-33 50 50)">
      <rect x="-40" y="-60" width="180" height="76" fill="#F9B612"/>
      <rect x="-40" y="16"  width="180" height="5"  fill="#CCCDD1"/>
      <rect x="-40" y="21"  width="180" height="38" fill="#E51D23"/>
      <rect x="-40" y="59"  width="180" height="5"  fill="#CCCDD1"/>
      <rect x="-40" y="64"  width="180" height="96" fill="#304CB2"/>
    </g>
  </g>
</svg>`;
function ensurePass(){
  if(!C.aviation) return null;
  let p = null;
  try{ p = JSON.parse(venuLS.get(PASS_KEY) || "null"); }catch(e){}
  if(!p || !p.pos){
    p = { group:"A", pos: 1 + Math.floor(Math.random()*60) };
    venuLS.set(PASS_KEY, JSON.stringify(p));
  }
  return p;
}
function passHtml(){
  const A = C.aviation, p = ensurePass(), av = venuLS.get(AVATAR_KEY);
  return `<div class="bp-card">
    <div class="bp-head">
      <span class="bp-logo">${SW_HEART}</span>
      <span class="bp-flight">${A.flight}</span>
      <span class="bp-date">${C.splash && C.splash.date ? C.splash.date.split("·")[1].trim() : "NOV 14"}</span>
    </div>
    <div class="bp-route">
      <span class="bp-ap"><b>${A.from}</b><i>${A.fromCity}</i></span>
      <svg class="bp-jet" viewBox="0 0 24 24" fill="#304CB2">${JET}</svg>
      <span class="bp-ap"><b>${A.to}</b><i>${A.toCity}</i></span>
      ${av ? `<img class="bp-face" src="${av}" alt="Your check-in photo">` : ""}
    </div>
    <div class="bp-row">
      <span><i>GROUP</i><b>${p.group}</b></span>
      <span><i>POSITION</i><b>${String(p.pos).padStart(2,"0")}</b></span>
      <span><i>SEAT</i><b>OPEN</b></span>
    </div>
    <div class="bp-code"></div>
    <div class="bp-note">${A.passNote}</div>
  </div>`;
}
function showPass(){
  if(!C.aviation) return;
  const m = document.createElement("div");
  m.className = "bp-modal";
  m.innerHTML = `<div class="bp-wrap">${passHtml()}<button class="bp-close">Close</button></div>`;
  m.addEventListener("click", (e)=>{
    if(e.target === m || e.target.classList.contains("bp-close")){
      m.classList.add("out");
      setTimeout(()=>m.remove(), 320);
    }
  });
  document.body.appendChild(m);
}
function refreshTeaser(){
  const t = document.getElementById("bpTeaser");
  if(!t) return;
  const av = venuLS.get(AVATAR_KEY);
  if(av){
    const p = ensurePass();
    t.innerHTML = `<img src="${av}" alt="">
      <span><i>Boarding pass · ${C.aviation.flight}</i><b>GROUP ${p.group} · POS ${String(p.pos).padStart(2,"0")}</b></span>
      <em>View</em>`;
    t.onclick = showPass;
  } else {
    t.innerHTML = `<svg class="bp-tick" viewBox="0 0 24 24" fill="currentColor">${JET}</svg>
      <span><i>Not checked in</i><b>Get your boarding pass</b></span>
      <em>Check in</em>`;
    t.onclick = ()=>showWelcome(true);
  }
}
if(C.aviation){
  const pill = document.querySelector(".live-pill");
  pill.style.cursor = "pointer";
  pill.onclick = ()=>{ venuLS.get(AVATAR_KEY) ? showPass() : showWelcome(true); };
  renderChip();
  const bk = document.getElementById("brandKicker");
  if(bk) bk.innerHTML = SW_HEART + bk.textContent;
}

/* ========================= PEPPER MASCOTS =========================
   The cookoff's walking peppers, redrawn as SVG from the event's own
   merch (51st coozie: yellow/orange/red, white gloves + shoes, no
   cowboy clothes). Config flags sprinkle them in: splash.mascots,
   polls.mascots — corporate look stays, peppers bring the party. */
function venuPepper(color, pose){
  const poses = [
    ["M30 52 C20 46 15 37 17 26", [17,24], "M68 60 C78 64 84 72 82 80", [82,82]],
    ["M30 52 C20 46 14 38 15 28", [15,26], "M68 54 C78 48 84 40 83 30", [83,28]],
    ["M30 60 C21 64 15 71 16 79", [16,81], "M68 52 C77 45 82 36 80 26", [80,24]]
  ];
  const a = poses[pose % 3];
  return `<svg class="venu-pep" viewBox="0 0 100 140" aria-hidden="true">
    <path fill="#3E9B4F" d="M50 16c-2-9 4-14 13-13-6 2-8 6-8 13z"/>
    <path fill="${color}" stroke="#101A45" stroke-width="2.5" d="M52 13 C30 13 20 34 23 60 C26 82 36 97 50 99 C60 100 67 92 69 79 C73 56 74 32 64 19 C60 14 56 13 52 13 Z"/>
    <circle cx="42" cy="45" r="3.4" fill="#101A45"/><circle cx="56" cy="45" r="3.4" fill="#101A45"/>
    <circle cx="43.2" cy="43.8" r="1.1" fill="#fff"/><circle cx="57.2" cy="43.8" r="1.1" fill="#fff"/>
    <path d="M39 58 Q49 68 60 57" fill="none" stroke="#101A45" stroke-width="2.6" stroke-linecap="round"/>
    <path d="${a[0]}" fill="none" stroke="#101A45" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="${a[1][0]}" cy="${a[1][1]}" r="6" fill="#fff" stroke="#101A45" stroke-width="2.2"/>
    <path d="${a[2]}" fill="none" stroke="#101A45" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="${a[3][0]}" cy="${a[3][1]}" r="6" fill="#fff" stroke="#101A45" stroke-width="2.2"/>
    <path d="M44 98 C42 108 38 114 32 119" fill="none" stroke="#101A45" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M56 99 C58 110 61 116 67 121" fill="none" stroke="#101A45" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="27" cy="123" rx="11" ry="5.5" fill="#fff" stroke="#101A45" stroke-width="2.2"/>
    <ellipse cx="72" cy="125" rx="11" ry="5.5" fill="#fff" stroke="#101A45" stroke-width="2.2"/>
  </svg>`;
}
window.VENU_PEPPERS = {
  one(color, pose){ return venuPepper(color || "#E51D23", pose == null ? 1 : pose); },
  trio(){ return `<div class="pep-trio">${venuPepper("#F9B612",0)}${venuPepper("#F07C22",1)}${venuPepper("#E51D23",2)}</div>`; }
};

/* ========================= BRANDED SPLASH =========================
   High-visibility opening screen, rendered before the shell when the
   client config carries a `splash` block. Pure config: kicker, stacked
   title lines, date pill, sub line, CTA. Logo defaults to the Venu
   heart-pepper mark; a client can override with `splash.logoSvg`. */
const HEART_PEPPER_SVG = `
<svg class="sp-logo" viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <linearGradient id="hpGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#304CB2"/>
      <stop offset=".52" stop-color="#E51D23"/>
      <stop offset="1" stop-color="#F9B612"/>
    </linearGradient>
  </defs>
  <path fill="#3E9B4F" d="M52 16c4-7 12-10 19-8-5 1-9 4-11 9l-2 5-8-2z"/>
  <path fill="url(#hpGrad)" d="M50 34c0-10-8-18-18-18S12 24 12 36c0 22 26 40 38 50 12-10 38-28 38-50 0-12-10-20-20-20s-18 8-18 18z"/>
</svg>`;
if(C.splash && !deepTarget && !["#display","#mod"].includes(location.hash)){
  const sp = document.createElement("div");
  sp.id = "splash";
  sp.innerHTML = `
    <div class="sp-bands"><i></i><i></i><i></i></div>
    <div class="sp-inner">
      ${C.splash.logoSvg || ""}
      <div class="sp-kicker">${C.aviation ? SW_HEART : ""}${C.splash.kicker}</div>
      <h1 class="sp-title">${C.splash.title.map((l,i)=>`<span style="animation-delay:${(0.18*i+0.25).toFixed(2)}s">${l}</span>`).join("")}</h1>
      <div class="sp-date">${C.splash.date}</div>
      <p class="sp-sub">${C.splash.sub}</p>
      ${C.splash.mascots && window.VENU_PEPPERS ? `<div class="sp-peps">${VENU_PEPPERS.trio()}</div>` : ""}
      <button class="sp-cta" id="splashCta">${C.splash.cta}</button>
    </div>`;
  document.body.appendChild(sp);
  document.body.classList.add("splash-open");
  if(C.aviation) venuFX.flyby({ top:"12%", delay:900, size:58 });
  document.getElementById("splashCta").onclick = ()=>{
    sp.classList.add("out");
    setTimeout(()=>{ sp.remove(); document.body.classList.remove("splash-open"); showWelcome(); }, 480);
  };
} else if(!deepTarget && !["#display","#mod"].includes(location.hash)){
  setTimeout(showWelcome, 300);
}

/* ========================= WELCOME CHECK-IN =========================
   Post-splash moment: welcome them to the venue, capture a check-in
   selfie. The photo becomes their avatar (LIVE chip, vote card) and the
   copy bridges them to the Photos tab. In production the selfie also
   gives moderators a face next to flagged content and adds one more
   signal for vote-integrity review. Shown once per device. */
function showWelcome(force){
  if(!C.welcome) return;
  if(!force && (venuLS.get(AVATAR_KEY) || venuLS.get("venu:" + SLUG + ":welcomed"))) return;
  if(document.getElementById("welcome")) return;
  const w = document.createElement("div");
  w.id = "welcome";
  w.innerHTML = `
    <div class="wc-card">
      <div class="wc-stripe"></div>
      <div class="wc-body">
        <h2>${C.welcome.title}</h2>
        <p>${C.welcome.sub}</p>
        <input type="file" id="welcomeCam" accept="image/*" capture="user" hidden>
        <button class="btn" id="welcomeSnap">${C.welcome.cta}</button>
        <button class="wc-skip" id="welcomeSkip">${C.welcome.skip}</button>
      </div>
    </div>`;
  document.body.appendChild(w);
  const close = ()=>{
    venuLS.set("venu:" + SLUG + ":welcomed", "1");
    w.classList.add("out");
    setTimeout(()=>w.remove(), 400);
  };
  document.getElementById("welcomeSkip").onclick = close;
  document.getElementById("welcomeSnap").onclick = ()=>document.getElementById("welcomeCam").click();
  document.getElementById("welcomeCam").addEventListener("change", async (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    try{
      const url = await resizeImage(f, 360, 0.8);
      venuLS.set(AVATAR_KEY, url);
      venuSetAvatar(url);
      if(C.aviation){
        ensurePass();
        w.querySelector(".wc-body").innerHTML = `
          <h2>${C.welcome.afterTitle || "You're in."}</h2>
          ${passHtml()}
          <p>${C.welcome.after}</p>
          <button class="btn" id="welcomeGo">Let's board</button>`;
        venuFX.flyby({ top:"10%" });
        refreshTeaser();
      } else {
        w.querySelector(".wc-body").innerHTML = `
          <img class="wc-photo" src="${url}" alt="Your check-in photo">
          <h2>${C.welcome.afterTitle || "You're in."}</h2>
          <p>${C.welcome.after}</p>
          <button class="btn" id="welcomeGo">Let's go</button>`;
      }
      venuFX.burst(30);
      document.getElementById("welcomeGo").onclick = close;
    }catch(err){ close(); }
  });
}
const _savedAvatar = venuLS.get(AVATAR_KEY);
if(_savedAvatar) venuSetAvatar(_savedAvatar);

/* ========================= TABS ========================= */
const ICONS = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  schedule:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  speakers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/></svg>',
  sponsors:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.5 1.6 6.7L12 17l-6.2 3.6 1.6-6.7L2.2 8.9l6.9-.6z"/></svg>',
  wall:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.2"/></svg>'
};
const TABS = [
  { id:"home", label:"Now", ico:ICONS.home, show:true },
  { id:"schedule", label:"Schedule", ico:ICONS.schedule, show:C.features.schedule },
  { id:"speakers", label:"Speakers", ico:ICONS.speakers, show:C.features.speakers },
  { id:"sponsors", label:"Sponsors", ico:ICONS.sponsors, show:C.features.sponsors },
  { id:"wall", label:"Photos", ico:ICONS.wall, show:C.features.photoWall }
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
  if(id==="home" && typeof refreshHomeTiles === "function"){ refreshHomeTiles(); if(typeof startMirror === "function") startMirror(); }
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
  const _lp = document.getElementById("livePillText");
  if(_lp) _lp.textContent = C.oneDay ? "LIVE" : "DAY 1 · " + day.label.split(" ")[0].toUpperCase();
})();

/* ========================= NOW — THE HOMEPAGE =========================
   Aviation clients get a rebuilt Now screen: flight-status hero, boarding
   pass teaser, live state tiles (vote / hunt / tasting log), a live
   mirror of the big screen, and rotating insider quips. This is the
   first thing they see after the splash — it has to carry the show. */
if(C.aviation) buildChiliHome();
function buildChiliHome(){
  const day = C.days[0];
  const now = day.slots[1] || day.slots[0];
  const next = day.slots[2];
  const home = document.getElementById("view-home");
  home.innerHTML = `
    <div class="hero">
      <div class="stripe"></div>
      <div class="hero-inner">
        <div class="now-label"><span class="live-dot"></span> ${C.aviation.nowLabel} · ${C.aviation.flight}</div>
        <h1>${now.title}</h1>
        <div class="meta">${now.time} · ${now.who}</div>
        <div class="next">${next ? `Up next · <strong>${next.time} — ${next.title}</strong>` : ""}</div>
      </div>
    </div>
    <button class="bp-teaser" id="bpTeaser"></button>
    <div class="home-tiles" id="homeTiles"></div>
    <button class="hunt-strip" id="huntStrip" hidden onclick="venuGoHunt()"></button>
    <div class="mirror card">
      <div class="mirror-head"><span class="live-dot"></span> ON THE BIG SCREEN <em id="mirrorCount"></em></div>
      <div class="mirror-frame" id="mirrorFrame"><div class="mirror-empty">Photos land here as moderators approve them.</div></div>
      <button class="btn" onclick="switchTab('wall')">Get on it — add yours</button>
    </div>
    <div class="quip" id="quipTicker"></div>
    <div class="demo-note">
      Demo build · <a href="#mod" onclick="enterMod(event)">Moderator</a> · <a href="#display" onclick="enterDisplay(event)">Big screen</a> · <a id="devReset">Dev: reset</a>
    </div>`;
  refreshTeaser();
  refreshHomeTiles();
  setTimeout(startMirror, 600);
  startQuips();
  document.getElementById("devReset").onclick = devReset;
}

/* Live state tiles — re-read on every return to Now. */
function refreshHomeTiles(){
  const t = document.getElementById("homeTiles");
  if(!t) return;
  const P = C.polls || { options:[] };
  let vote = null;
  try{ vote = JSON.parse(venuLS.get("venu:" + SLUG + ":poll:" + (P.id||"")) || "null"); }catch(e){}
  let hunt = {};
  try{ hunt = JSON.parse(venuLS.get("venu:" + SLUG + ":hunt") || "{}"); }catch(e){}
  const hn = Object.keys(hunt).length, ha = (C.scavenger && C.scavenger.stops.length) || 0;
  let log = {};
  try{ log = JSON.parse(venuLS.get("venu:" + SLUG + ":tastelog") || "{}"); }catch(e){}
  const tried = Object.values(log).filter(x=>x && x.tried).length;
  const luvd  = Object.values(log).filter(x=>x && x.luv).length;
  t.innerHTML = `
    <button onclick="switchTab('polls')"><i>Vote</i><b>${vote ? "Results" : "Cast it"}</b><span>${vote ? "You're locked in" : "Closes 2:00 PM"}</span></button>
    <button onclick="switchTab('polls')"><i>Tasting log</i><b>${tried} tried</b><span>${luvd} LUV'd</span></button>`;
  /* The hunt rides quieter: a slim strip, only once they've started,
     deep-linking to the hunt section at the bottom of the map page. */
  const strip = document.getElementById("huntStrip");
  if(strip){
    if(hn > 0){
      strip.hidden = false;
      strip.innerHTML = `<i>Hunt</i><b>${hn} of ${ha} found</b><em>${ha && hn===ha ? "Complete — claim it →" : "Keep hunting →"}</em>`;
    } else {
      strip.hidden = true;
    }
  }
}
window.refreshHomeTiles = refreshHomeTiles;
window.venuGoHunt = function(){
  switchTab("venueMap");
  setTimeout(()=>{
    const e = document.getElementById("embed-scavenger");
    if(e) e.scrollIntoView({ behavior:"smooth", block:"start" });
  }, 250);
};

/* Live mirror of the big screen — the same approved pool the venue
   display rotates, cycling in-app. Doubles as the no-screen contingency:
   if the venue has no jumbotron, THIS is the big screen. */
let mirrorTimer = null, mirrorPool = [], mirrorI = 0;
async function startMirror(){
  const frame = document.getElementById("mirrorFrame");
  if(!frame) return;
  try{
    const idx = await store.getIndex();
    const pool = [];
    for(const id of idx.slice(-16)){
      const p = await store.getPhoto(id);
      if(p && p.status === "approved") pool.push(p.img);
    }
    mirrorPool = pool;
  }catch(e){ mirrorPool = []; }
  clearInterval(mirrorTimer);
  const count = document.getElementById("mirrorCount");
  if(!mirrorPool.length){ if(count) count.textContent = ""; return; }
  if(count) count.textContent = mirrorPool.length + " rotating";
  const show = ()=>{
    const f = document.getElementById("mirrorFrame");
    if(!f){ clearInterval(mirrorTimer); return; }
    mirrorI = (mirrorI + 1) % mirrorPool.length;
    f.innerHTML = `<img src="${mirrorPool[mirrorI]}" alt="Live from the big screen">`;
  };
  show();
  mirrorTimer = setInterval(show, 4500);
}

/* Insider quips ticker — config-driven (client.quips). */
function startQuips(){
  const q = C.quips || [], el = document.getElementById("quipTicker");
  if(!el || !q.length) return;
  let i = Math.floor(Math.random() * q.length);
  const show = ()=>{
    if(!document.getElementById("quipTicker")) return;
    el.classList.remove("in");
    void el.offsetWidth;
    el.textContent = q[i % q.length];
    el.classList.add("in");
    i++;
  };
  show();
  setInterval(show, 7000);
}

/* DEV ONLY: full device reset (profile, pass, vote, hunt, tasting log).
   Two-tap to confirm. REMOVE or passcode-gate before the live build —
   flagged in the go-live checklist. */
function devReset(){
  const btn = document.getElementById("devReset");
  if(!btn) return;
  if(btn.dataset.armed){
    try{
      Object.keys(localStorage).filter(k=>k.indexOf("venu:") === 0)
        .forEach(k=>localStorage.removeItem(k));
    }catch(e){}
    Object.keys(venuMem).forEach(k=>delete venuMem[k]);
    location.reload();
  } else {
    btn.dataset.armed = "1";
    btn.textContent = "Tap again to wipe this device";
    setTimeout(()=>{ btn.dataset.armed = ""; btn.textContent = "Dev: reset"; }, 2500);
  }
}

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
  const list = document.getElementById("slotList");
  /* Departures-board mode (client.departures): the schedule reads like an
     airport board — TIME / EVENT / STATUS, staggered flip-in rows. */
  if(C.departures){
    list.classList.add("depboard");
    list.innerHTML = `
      <div class="dep-head"><span>Time</span><span>Event</span><span>Status</span></div>` +
      C.days[i].slots.map((s,idx)=>{
        const st = s.status || "ON TIME";
        const cls = "s-" + st.replace(/\s/g,"").toLowerCase();
        return `
        <div class="dep-row" style="animation-delay:${(idx*0.06).toFixed(2)}s">
          <div class="dep-time">${s.time}</div>
          <div class="dep-what"><div class="dep-title">${s.title}</div><div class="dep-who">${s.who}</div></div>
          <div class="dep-status ${cls}">${st}</div>
        </div>`;
      }).join("");
    return;
  }
  list.classList.remove("depboard");
  list.innerHTML = C.days[i].slots.map(s=>`
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

/* ========================= PHOTO SUBMIT =========================
   Two-step: pick/take a photo → preview + optional caption → send.
   No `capture` attribute on the input, so phones offer camera AND
   library. Captions ride with the photo everywhere it appears. */
let pendingPhoto = null;
const _pc = ()=>document.getElementById("photoCompose");
function resetPhotoCompose(){
  pendingPhoto = null;
  _pc().hidden = true;
  document.getElementById("submitBtn").hidden = false;
  document.getElementById("photoCaption").value = "";
  document.getElementById("photoInput").value = "";
}
document.getElementById("photoInput").addEventListener("change", async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  try{
    pendingPhoto = await resizeImage(file, 700, 0.72);
    document.getElementById("photoPreview").src = pendingPhoto;
    document.getElementById("photoStatus").className = "status-banner";
    document.getElementById("photoStatus").textContent = "";
    _pc().hidden = false;
    document.getElementById("submitBtn").hidden = true;
  }catch(err){ resetPhotoCompose(); }
});
document.getElementById("photoCancel").onclick = resetPhotoCompose;
document.getElementById("photoSend").onclick = async ()=>{
  if(!pendingPhoto) return;
  const status = document.getElementById("photoStatus");
  const send = document.getElementById("photoSend");
  send.disabled = true; send.textContent = "Sending…";
  try{
    const cap = document.getElementById("photoCaption").value.trim().slice(0,60);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    const ok = await store.setPhoto(id, { img:pendingPhoto, cap, status:"pending", ts:Date.now() });
    if(!ok) throw new Error("storage");
    const idx = await store.getIndex();
    idx.push(id);
    await store.setIndex(idx);
    status.className = "status-banner ok";
    status.textContent = "Sent to moderators — watch the big screen!";
    resetPhotoCompose();
  }catch(err){
    status.className = "status-banner err";
    status.textContent = store.available
      ? "Upload didn't go through. Try a smaller photo or try again."
      : "Storage isn't available in this preview — works once deployed.";
  }
  send.disabled = false; send.textContent = "Send it";
};

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
  const rev = photos.slice().reverse();
  grid.innerHTML = rev.length
    ? rev.map((p,i)=>`<button class="ph" data-i="${i}"><img src="${p.img}" alt="${p.cap || "Featured event photo"}">${p.cap ? `<span class="ph-cap">${p.cap}</span>` : ""}</button>`).join("")
    : `<div class="wall-empty">No photos featured yet — be the first.</div>`;
  grid.querySelectorAll(".ph").forEach(b=>{ b.onclick = ()=>openLightbox(rev[+b.dataset.i]); });
}

/* Tap any wall photo to expand it. */
function openLightbox(p){
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `
    <img src="${p.img}" alt="${p.cap || "Event photo"}">
    ${p.cap ? `<div class="lb-cap">${p.cap}</div>` : ""}
    <button class="lb-close" aria-label="Close">✕</button>`;
  const close = ()=>{ lb.classList.add("out"); setTimeout(()=>lb.remove(), 250); };
  lb.addEventListener("click", close);
  document.body.appendChild(lb);
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
      <div class="meta"><div class="nm">${p.cap || "Submission"}</div>${new Date(p.ts).toLocaleTimeString()}</div>
      <div class="mod-actions">
        <button class="ok" onclick="modAction('${p.id}','approved')">Approve</button>
        <button class="no" onclick="modAction('${p.id}','rejected')">Reject</button>
      </div>
    </div>`).join("") || `<div class="card wall-empty">Queue is clear.</div>`;
  loadModFeatured();
}

/* Everything currently featured (approved) — moderators can pull any
   photo off the wall + big screen loop instantly. */
async function loadModFeatured(){
  const box = document.getElementById("modFeatured");
  if(!box) return;
  const idx = await store.getIndex();
  const feats = [];
  for(const id of idx){
    const p = await store.getPhoto(id);
    if(p && p.status === "approved") feats.push({ id, ...p });
  }
  box.innerHTML = feats.length ? feats.reverse().map(p=>`
    <div class="mod-item card">
      <div class="thumb"><img src="${p.img}" alt="${p.cap || "Featured photo"}"></div>
      <div class="meta"><div class="nm">${p.cap || "Featured"}</div>${new Date(p.ts).toLocaleTimeString()}</div>
      <div class="mod-actions">
        <button class="no" onclick="modRemove('${p.id}')">Remove</button>
      </div>
    </div>`).join("") : `<div class="card wall-empty">Nothing featured right now.</div>`;
}
async function modRemove(id){
  await store.delPhoto(id);
  const idx = await store.getIndex();
  await store.setIndex(idx.filter(x=>x !== id));
  loadModQueue();
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
    if(p && p.status==="approved") pool.push({ img:p.img, cap:p.cap });
  }
  displayPool = pool;
  rotateDisplay();
}
/* Portrait shots letterbox over a blurred fill instead of cropping —
   every photo shows whole on the venue screen. */
function rotateDisplay(){
  const frame = document.getElementById("displayFrame");
  if(!displayPool.length){
    frame.innerHTML = `<div class="empty">Waiting for your photos…<br>Submit in the event app</div>`;
    return;
  }
  displayI = (displayI + 1) % displayPool.length;
  const p = displayPool[displayI];
  frame.innerHTML = `
    <div class="disp-wrap">
      <img class="disp-bg" src="${p.img}" alt="" aria-hidden="true">
      <img class="disp-main" src="${p.img}" alt="Featured attendee photo">
      ${p.cap ? `<div class="disp-cap">${p.cap}</div>` : ""}
    </div>`;
}
function exitDisplay(){
  document.body.classList.remove("display-mode");
  if(displayTimer){ clearInterval(displayTimer); displayTimer = null; }
  if(location.hash === "#display") history.replaceState(null, "", location.pathname + location.search);
}
if(location.hash === "#display") enterDisplay();
if(location.hash === "#mod") enterMod();

/* ========================= MODULE LOADER (Task 11) =========================
   Loads modules/<file> for every feature flag the legacy shell doesn't
   already render (schedule/speakers/sponsors/photoWall stay inline until
   they're extracted). File names come from the manifest; each module
   registers itself per modules/README.md, then gets a view section, its
   styles injected once, a bottom tab, and a render(ctx) call. */
const LEGACY_FEATURES = ["schedule","speakers","sponsors","photoWall"];
window.VenuModules = window.VenuModules || { registry:{}, register(id,def){ this.registry[id]=def; } };
(function loadModules(){
  const catalog = {};
  (window.VENU_MODULES || []).forEach(m => catalog[m.id] = m.file);
  const ids = Object.keys(C.features || {})
    .filter(id => C.features[id] && !LEGACY_FEATURES.includes(id) && catalog[id]);
  if(!ids.length){ applyTabOrder(); applyDeepLink(); return; }
  let left = ids.length;
  ids.forEach(id=>{
    const s = document.createElement("script");
    s.src = "modules/" + catalog[id];
    s.onload = s.onerror = ()=>{ if(--left === 0) initModules(ids); };
    document.body.appendChild(s);
  });
})();
function initModules(ids){
  const main = document.querySelector("main");
  /* A module whose config carries embedIn:"<hostId>" gets no tab and no
     view of its own — the host module renders a <div id="embed-<id>">
     placeholder and the embedded module renders into it (e.g. the
     scavenger hunt living at the bottom of the map page). Hosts render
     first, embeds second. */
  const normal = [], embedded = [];
  ids.forEach(id=>{
    const def = VenuModules.registry[id];
    if(!def) return;
    const cfg = C[def.configKey || id] || {};
    (cfg.embedIn ? embedded : normal).push({ id, def, cfg });
  });
  const renderOne = (id, def, sec)=>{
    if(def.styles && !document.getElementById("mstyle-" + id)){
      const st = document.createElement("style");
      st.id = "mstyle-" + id;
      st.textContent = def.styles;
      document.head.appendChild(st);
    }
    try{
      def.render({ el:sec, client:C, slug:SLUG, store, db:(typeof db !== "undefined" ? db : null) });
    }catch(e){
      console.warn("Venu: module '"+id+"' failed to render:", e);
      sec.innerHTML = "";   /* one broken module never takes down the app */
    }
  };
  const credit = main.querySelector(".venu-credit");   /* footer stays last */
  normal.forEach(({id, def, cfg})=>{
    const sec = document.createElement("section");
    sec.className = "view";
    sec.id = "view-" + id;
    credit ? main.insertBefore(sec, credit) : main.appendChild(sec);
    renderOne(id, def, sec);
    if(def.tab){
      const b = document.createElement("button");
      b.id = "tab-" + id;
      b.innerHTML = `<span class="ico">${def.tab.ico || ""}</span>${cfg.tabLabel || def.tab.label}`;
      b.onclick = ()=>switchTab(id);
      tabbar.appendChild(b);
    }
  });
  embedded.forEach(({id, def})=>{
    const sec = document.getElementById("embed-" + id);
    if(sec) renderOne(id, def, sec);
  });
  applyTabOrder();
  applyDeepLink();
}
/* Client config can pin the bottom-nav order: tabOrder:["home","polls",...] */
function applyTabOrder(){
  if(!C.tabOrder) return;
  C.tabOrder.forEach(id=>{
    const b = document.getElementById("tab-" + id);
    if(b) tabbar.appendChild(b);
  });
}
