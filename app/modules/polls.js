/* =========================================================================
   MODULE: polls  ·  status: beta
   The Chili Vote, v2 — built as an EXPERIENCE, not a form:
     ballot cards w/ photos → tap for the full story (maker, heat, booth)
     → vote with an optional note + photo → confetti cast moment → live
     results with your vote pinned on top.

   Config (client.polls):
     { tabLabel, id, title, resultsTitle, sub, closes,
       options:[{ id, dept, name, desc, booth, img|null, heat 1-5,
                  maker, makerRole, story }] }
   img:null renders a branded placeholder tile until real photos land.

   Booth QR codes deep-link straight to this tab: <event-url>/#vote

   VOTE INTEGRITY (production plan — demo enforces per-device locally):
     - anonymous Firebase Auth: every phone gets a UID with zero friction
     - security rule: votes/{uid} is CREATE-ONLY (no edit, no second vote)
     - App Check blocks scripted voting; check-in selfie gives reviewers
       one more signal on flagged ballots
     - notes are moderated with the same queue as photos before any
       public display
   AT 25K SCALE: votes land in sharded counters, a Cloud Function folds
   them into ONE results doc every few seconds, every phone listens to
   that single doc. Nobody counts votes client-side.
   ========================================================================= */
(function(){
  window.VenuModules = window.VenuModules || { registry:{}, register(id,def){ this.registry[id]=def; } };

  const ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-5"/><rect x="4" y="4" width="16" height="16" rx="3"/></svg>';
  const PEP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 6.5c0-2 1.5-3.5 3.5-3.5"/><path d="M12.5 6.5C6 7 4 12 4 15c0 3.5 2.5 6 6 6 6.5 0 10-6.5 10-11 0-2-1.6-3.6-3.5-3.5-2 .1-4 .1-4 0z"/></svg>';
  const HRT = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  /* branded placeholder tiles until real chili/team photos arrive */
  const TILES = [
    ["#E51D23","#F9B612"],["#304CB2","#E51D23"],["#F9B612","#E86A10"],
    ["#1B2A6E","#304CB2"],["#E86A10","#E51D23"],["#304CB2","#F9B612"],
    ["#B3151A","#E86A10"],["#22367F","#E51D23"],["#E86A10","#F9B612"],["#26399B","#22D3EE"]
  ];
  function tileStyle(i){
    const t = TILES[i % TILES.length];
    return `background:linear-gradient(135deg,${t[0]},${t[1]});`;
  }
  function photoHtml(o, i, cls){
    return o.img
      ? `<div class="${cls}"><img src="${o.img}" alt="${o.name}"></div>`
      : `<div class="${cls} ph-tile" style="${tileStyle(i)}"><span class="ph-pep">${PEP}</span><span class="ph-booth">${o.booth}</span></div>`;
  }
  function heatHtml(h){
    let s = "";
    for(let i=1;i<=5;i++) s += `<span class="pep ${i<=h?"on":""}">${PEP}</span>`;
    return `<span class="heat">${s}</span>`;
  }

  /* Deterministic demo baseline so results render identically for everyone
     previewing the prototype. DELETE for production. */
  function seedCount(id){
    let h = 0;
    for(let i=0;i<id.length;i++) h = (h*31 + id.charCodeAt(i)) % 997;
    return 160 + (h % 270);
  }
  function deviceId(){
    let d = venuLS.get("venu:device");
    if(!d){
      d = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
      venuLS.set("venu:device", d);
    }
    return d;
  }

  VenuModules.register("polls", {
    configKey: "polls",
    tab: { label:"Vote", view:"polls", ico:ICO },
    styles: `
      .poll-sub{color:var(--muted); font-size:14px; margin:-4px 0 16px; line-height:1.55;}
      .poll-peps{margin:-4px 0 16px;}
      .poll-peps .venu-pep{width:52px;}
      .poll-note{font-size:12px; color:var(--muted); text-align:center; margin:14px 0 4px; line-height:1.6;}
      /* ballot cards */
      .poll-opt{display:flex; align-items:center; gap:13px; width:100%; text-align:left;
        background:var(--surface); border:1.5px solid var(--line); border-radius:18px;
        padding:12px; margin-bottom:10px; color:var(--ink); transition:transform .12s, border-color .15s;}
      .poll-opt:active{transform:scale(.98);}
      .poll-opt .shot{flex:0 0 74px; height:74px; border-radius:13px; overflow:hidden; position:relative;}
      .poll-opt .shot img{width:100%; height:100%; object-fit:cover;}
      .ph-tile{display:grid; place-items:center; position:relative;}
      .ph-tile .ph-pep{width:30px; height:30px; color:rgba(255,255,255,.9);}
      .ph-tile .ph-pep svg{width:100%; height:100%;}
      .ph-tile .ph-booth{position:absolute; bottom:5px; right:6px; font-size:9px; font-weight:800;
        color:rgba(255,255,255,.85); letter-spacing:.06em;}
      .poll-opt .body{flex:1; min-width:0;}
      .poll-opt .dept{font-size:10px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--gold);}
      .poll-opt .nm{font-family:var(--display); font-weight:800; font-size:17px; letter-spacing:-.01em; margin-top:2px; color:#fff;}
      .poll-opt .ds{color:var(--muted); font-size:12px; margin-top:2px;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
      .poll-opt .meta{display:flex; align-items:center; gap:8px; margin-top:6px;}
      .heat{display:inline-flex; gap:1px;}
      .heat .pep{width:13px; height:13px; color:var(--line); display:inline-block;}
      .heat .pep.on{color:var(--accent);}
      .heat .pep svg{width:100%; height:100%;}
      .poll-opt .chev{flex:0 0 auto; color:var(--muted); font-size:20px; font-weight:600;}
      /* detail sheet */
      .sheet-back{position:fixed; inset:0; z-index:150; background:rgba(6,10,30,.72);
        backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); animation:sheetFade .25s ease;}
      @keyframes sheetFade{from{opacity:0;}}
      .sheet{position:fixed; left:50%; transform:translateX(-50%); bottom:0; width:100%; max-width:520px;
        z-index:151; background:var(--surface); border:1px solid var(--line); border-bottom:none;
        border-radius:26px 26px 0 0; overflow:hidden auto; max-height:88dvh;
        padding-bottom:calc(20px + env(safe-area-inset-bottom));
        animation:sheetUp .4s cubic-bezier(.2,.9,.2,1);}
      @keyframes sheetUp{from{transform:translate(-50%,55%);}to{transform:translate(-50%,0);}}
      .sheet .hero-shot{height:200px; position:relative;}
      .sheet .hero-shot img{width:100%; height:100%; object-fit:cover;}
      .sheet .hero-shot .ph-pep{width:64px; height:64px;}
      .sheet .hero-shot .ph-booth{font-size:13px; bottom:12px; right:14px;}
      .sheet .grab{position:absolute; top:10px; left:50%; transform:translateX(-50%);
        width:44px; height:5px; border-radius:99px; background:rgba(255,255,255,.55);}
      .sheet .sh-body{padding:18px 22px 0;}
      .sheet .dept{font-size:10.5px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; color:var(--gold);}
      .sheet h3{font-family:var(--display); font-weight:800; font-size:32px; letter-spacing:-.02em; color:#fff; line-height:1.02; margin:4px 0 8px;}
      .sheet .ds{color:var(--muted); font-size:14px;}
      .sheet .stats{display:flex; align-items:center; gap:14px; margin:14px 0;}
      .sheet .stats .booth-chip{font-size:11px; font-weight:800; color:var(--ink);
        border:1px solid var(--line); border-radius:8px; padding:5px 9px;}
      .sheet .maker{display:flex; gap:13px; background:var(--surface2); border:1px solid var(--line);
        border-radius:16px; padding:14px; margin-bottom:16px;}
      .sheet .maker .mk-av{flex:0 0 46px; height:46px; border-radius:50%; display:grid; place-items:center;
        background:var(--accent-soft); color:var(--accent); font-family:var(--display); font-weight:800; font-size:16px;}
      .sheet .maker .mk-nm{font-weight:800; font-size:14.5px; color:#fff;}
      .sheet .maker .mk-rl{font-size:11.5px; color:var(--gold); font-weight:700; margin:1px 0 5px;}
      .sheet .maker .mk-st{font-size:12.5px; color:var(--muted); line-height:1.55;}
      .sheet .btn{width:100%;}
      .sheet .sh-close{display:block; width:100%; text-align:center; margin-top:12px;
        font-size:12.5px; color:var(--muted); text-decoration:underline;}
      /* compose (note + photo) */
      .compose .back{font-size:13px; color:var(--muted); margin:6px 0 2px; display:inline-flex; gap:6px;}
      .compose .picked{display:flex; align-items:center; gap:12px; background:var(--surface);
        border:1.5px solid var(--gold); border-radius:18px; padding:12px; margin:12px 0 16px;}
      .compose .picked .shot{flex:0 0 56px; height:56px; border-radius:11px; overflow:hidden;}
      .compose .picked .shot img{width:100%; height:100%; object-fit:cover;}
      .compose .picked .nm{font-family:var(--display); font-weight:800; font-size:16px; color:#fff;}
      .compose .picked .dept{font-size:10px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--gold);}
      .compose textarea{width:100%; min-height:86px; resize:none; background:var(--surface);
        border:1.5px solid var(--line); border-radius:14px; color:var(--ink); font-family:var(--body);
        font-size:14px; padding:13px 14px; outline:none;}
      .compose textarea:focus{border-color:var(--gold);}
      .compose .attach-row{display:flex; align-items:center; gap:10px; margin:12px 0 18px;}
      .compose .attach{font-size:12.5px; font-weight:700; color:var(--ink);
        border:1.5px dashed var(--line); border-radius:12px; padding:10px 14px;}
      .compose .attach-thumb{width:44px; height:44px; border-radius:10px; object-fit:cover; border:1.5px solid var(--gold);}
      .compose .as-row{display:flex; align-items:center; gap:9px; margin-bottom:14px; color:var(--muted); font-size:12px;}
      .compose .as-row img{width:26px; height:26px; border-radius:50%; object-fit:cover; border:1.5px solid var(--gold);}
      .compose .btn{width:100%;}
      /* cast flash */
      .vote-flash{position:fixed; inset:0; z-index:300; display:flex; align-items:center; justify-content:center;
        background:radial-gradient(90% 70% at 50% 40%, rgba(48,76,178,.92), rgba(16,26,69,.97));
        animation:sheetFade .3s ease; text-align:center;}
      .vote-flash h2{font-family:var(--display); font-weight:800; font-size:52px; color:#fff; letter-spacing:-.02em;
        animation:flashPop .55s cubic-bezier(.2,.9,.3,1.4);}
      .vote-flash p{color:var(--gold); font-weight:700; font-size:14px; margin-top:8px;}
      @keyframes flashPop{from{transform:scale(.5); opacity:0;}to{transform:scale(1); opacity:1;}}
      .vote-flash.out{opacity:0; transition:opacity .4s;}
      /* results */
      .poll-total{display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--muted); margin:2px 0 14px;}
      .yourvote{background:var(--surface); border:1.5px solid var(--gold); border-radius:18px;
        padding:14px; margin-bottom:18px; display:flex; gap:12px;}
      .yourvote .yv-av{flex:0 0 44px; height:44px; border-radius:50%; overflow:hidden;
        border:2px solid var(--gold); background:var(--surface2);}
      .yourvote .yv-av img{width:100%; height:100%; object-fit:cover;}
      .yourvote .yv-k{font-size:10px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--gold);}
      .yourvote .yv-nm{font-family:var(--display); font-weight:800; font-size:16px; color:#fff; margin:2px 0;}
      .yourvote .yv-note{font-size:13px; color:var(--muted); font-style:italic;}
      .yourvote .yv-ph{width:44px; height:44px; border-radius:10px; object-fit:cover; margin-left:auto; flex:0 0 auto;}
      .poll-res{background:var(--surface); border:1px solid var(--line); border-radius:16px;
        padding:14px; margin-bottom:10px; position:relative;}
      .poll-res .top{display:flex; justify-content:space-between; align-items:baseline; gap:10px;}
      .poll-res .nm{font-family:var(--display); font-weight:800; font-size:15.5px; color:#fff;}
      .poll-res .dept{font-size:10px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--muted);}
      .poll-res .dept .lead-chip{color:var(--gold);}
      .poll-res .pct{font-family:var(--display); font-weight:800; font-size:20px; color:#fff; flex:0 0 auto;}
      .poll-res .bar{height:10px; border-radius:99px; background:var(--surface2); margin-top:9px; overflow:hidden;}
      .poll-res .fill{height:100%; border-radius:99px; background:var(--accent); width:0;
        transition:width .9s cubic-bezier(.2,.8,.2,1);}
      .poll-res.lead .fill{background:linear-gradient(90deg,var(--accent),var(--gold));}
      .poll-res .mine{position:absolute; top:-8px; right:12px; font-size:9.5px; font-weight:800;
        letter-spacing:.12em; text-transform:uppercase; background:var(--gold); color:#1B2A5E;
        border-radius:99px; padding:3px 9px;}
      .poll-res .votes{font-size:11.5px; color:var(--muted); margin-top:6px;}
      .poll-reset{display:block; text-align:center; font-size:11px; color:var(--muted); margin-top:16px;
        text-decoration:underline; background:none; width:100%;}
      /* tasting log */
      .log-summary{font-size:12px; color:var(--muted); margin:-4px 0 12px;}
      .log-summary b{color:var(--gold);}
      .log-badge{font-size:8.5px; font-weight:800; letter-spacing:.1em; color:#1B2A5E;
        background:var(--gold); border-radius:5px; padding:2px 6px;}
      .log-heart{width:14px; height:14px; color:var(--accent); display:inline-block;}
      .log-heart svg{width:100%; height:100%;}
      .log-row{display:flex; gap:9px; margin-bottom:10px;}
      .log-row button{flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px;
        border:1.5px solid var(--line); border-radius:12px; padding:12px; font-weight:800; font-size:13px;
        color:var(--muted); background:var(--surface2); transition:all .15s;}
      .log-row button svg{width:15px; height:15px;}
      .log-row .log-t.on{background:var(--gold); border-color:var(--gold); color:#1B2A5E;}
      .log-row .log-l.on{background:var(--accent-soft); border-color:var(--accent); color:var(--accent);}
      .log-note{width:100%; min-height:52px; resize:none; background:var(--surface2);
        border:1.5px dashed var(--line); border-radius:12px; color:var(--ink); font-family:var(--body);
        font-size:12.5px; padding:10px 12px; outline:none; margin-bottom:16px;}
      .log-note:focus{border-color:var(--gold);}
      /* buzz */
      .buzz{margin-bottom:16px;}
      .buzz-h{font-family:var(--display); font-weight:800; font-size:17px; color:#fff; margin-bottom:8px;}
      .buzz-item{background:var(--surface2); border:1px solid var(--line); border-radius:12px;
        padding:9px 12px; font-size:12.5px; color:var(--ink); margin-bottom:6px;}
      .buzz-item b{display:block; font-size:9.5px; letter-spacing:.12em; text-transform:uppercase;
        color:var(--gold); margin-bottom:2px;}
      .buzz-item.mine{border-style:dashed;}
      .buzz-add{display:flex; gap:8px; margin-top:8px;}
      .buzz-add input{flex:1; min-width:0; background:var(--surface2); border:1.5px solid var(--line);
        border-radius:11px; color:var(--ink); font-family:var(--body); font-size:13px; padding:10px 12px; outline:none;}
      .buzz-add input:focus{border-color:var(--gold);}
      .buzz-add button{background:var(--surface2); border:1.5px solid var(--line); border-radius:11px;
        font-weight:800; font-size:12px; color:var(--ink); padding:0 16px;}
      /* recipe requests */
      .rec-btn{width:100%; text-align:center; border:1.5px dashed rgba(249,182,18,.5); border-radius:12px;
        padding:12px 14px; font-weight:700; font-size:12.5px; color:var(--gold); margin-bottom:14px;
        background:rgba(249,182,18,.06); line-height:1.5;}
      .rec-btn.on{border-style:solid; background:rgba(249,182,18,.14);}
      /* superlatives */
      .sup-card{display:flex; align-items:center; gap:12px; width:100%; text-align:left;
        background:var(--surface); border:1.5px solid var(--line); border-radius:16px;
        padding:14px; margin-bottom:9px; color:var(--ink); transition:border-color .15s;}
      .sup-card.picked{border-color:rgba(249,182,18,.55);}
      .sup-info{flex:1; min-width:0;}
      .sup-info b{font-family:var(--display); font-weight:800; font-size:16px; color:#fff; display:block;}
      .sup-info i{font-style:normal; font-size:11.5px; color:var(--muted);}
      .sup-pick{flex:0 0 auto; font-size:11px; font-weight:800; color:var(--gold); text-align:right;}
      .sup-pick em{font-style:normal; display:block; color:var(--muted); font-weight:700; font-size:10px;}
      .sup-opts{margin:14px 0 4px; max-height:46dvh; overflow:auto;}
      .sup-opt{display:block; width:100%; text-align:left; padding:11px 4px;
        border-bottom:1px solid var(--line); color:var(--ink);}
      .sup-opt:last-child{border-bottom:none;}
      .sup-opt b{font-weight:800; font-size:14px; display:block;}
      .sup-opt i{font-style:normal; font-size:11.5px; color:var(--muted);}
    `,
    render(ctx){
      const P = ctx.client.polls, el = ctx.el;
      if(!P){ el.innerHTML = ""; return; }
      const KEY = "venu:" + ctx.slug + ":poll:" + P.id;
      const votesCol = ()=> ctx.db && ctx.db.collection("clients").doc(ctx.slug).collection("votes");
      const optIndex = id => P.options.findIndex(o=>o.id===id);

      /* ---- TASTING LOG (tried / LUV / private note, per chili) ---- */
      const LOG_KEY = "venu:" + ctx.slug + ":tastelog";
      function getLog(){ try{ return JSON.parse(venuLS.get(LOG_KEY) || "{}"); }catch(e){ return {}; } }
      function patchLog(id, patch){
        const l = getLog();
        l[id] = Object.assign(l[id] || {}, patch);
        venuLS.set(LOG_KEY, JSON.stringify(l));
        if(window.refreshHomeTiles) refreshHomeTiles();
        return l[id];
      }
      /* ---- SUPERLATIVES (one pick per category per device) ---- */
      const SUP_KEY = "venu:" + ctx.slug + ":supers";
      function getSup(){ try{ return JSON.parse(venuLS.get(SUP_KEY) || "{}"); }catch(e){ return {}; } }
      /* ---- RECIPE REQUESTS + my public comments (demo-local) ---- */
      const REC_KEY = "venu:" + ctx.slug + ":recipes";
      function getRec(){ try{ return JSON.parse(venuLS.get(REC_KEY) || "[]"); }catch(e){ return []; } }
      const MYBUZZ_KEY = "venu:" + ctx.slug + ":mybuzz";
      function getMyBuzz(){ try{ return JSON.parse(venuLS.get(MYBUZZ_KEY) || "{}"); }catch(e){ return {}; } }

      function myVote(){
        const raw = venuLS.get(KEY);
        if(!raw) return null;
        try{ return JSON.parse(raw); }catch(e){ return { opt: raw }; }
      }

      /* ---------- 1 · BALLOT ---------- */
      function renderBallot(){
        const log = getLog();
        const tried = Object.values(log).filter(x=>x && x.tried).length;
        el.innerHTML = `
          <h2 class="section">${P.title}</h2>
          <p class="poll-sub">${P.sub}</p>
          ${P.mascots && window.VENU_PEPPERS ? `<div class="poll-peps">${VENU_PEPPERS.trio()}</div>` : ""}
          <div class="log-summary">${tried ? `Your tasting log: <b>${tried} of ${P.options.length} tried</b> — tap a chili to log it.` : `Tap a chili for the full story — and log the ones you try.`}</div>
          <div id="ballot"></div>
          <div class="poll-note">${P.closes}<br>One vote per device — choose wisely, it's the last one.</div>
          <div id="supersWrap"></div>`;
        const box = el.querySelector("#ballot");
        P.options.forEach((o,i)=>{
          const lg = log[o.id] || {};
          const b = document.createElement("button");
          b.className = "poll-opt";
          b.innerHTML = `
            ${photoHtml(o, i, "shot")}
            <span class="body">
              <span class="dept">${o.dept}</span>
              <div class="nm">${o.name}</div>
              <div class="ds">${o.desc}</div>
              <div class="meta">${heatHtml(o.heat||3)}<span style="font-size:10.5px;color:var(--muted);font-weight:700">Booth ${o.booth}</span>
                ${lg.tried ? '<span class="log-badge">TRIED</span>' : ""}
                ${lg.luv ? `<span class="log-heart">${HRT}</span>` : ""}
              </div>
            </span>
            <span class="chev">›</span>`;
          b.onclick = ()=>openSheet(o, i);
          box.appendChild(b);
        });
        renderSupers(el.querySelector("#supersWrap"));
      }

      /* ---------- 2 · DETAIL SHEET ---------- */
      let sheetEls = null;
      function closeSheet(){
        if(sheetEls){ sheetEls.forEach(x=>x.remove()); sheetEls = null; }
        if(!myVote()) renderBallot();   /* refresh tasting badges */
      }
      function openSheet(o, i){
        closeSheet();
        const back = document.createElement("div"); back.className = "sheet-back";
        const sh = document.createElement("div"); sh.className = "sheet";
        const initials = (o.maker||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
        const hero = o.img
          ? `<div class="hero-shot"><img src="${o.img}" alt="${o.name}"><div class="grab"></div></div>`
          : `<div class="hero-shot" style="${tileStyle(i)}display:grid;place-items:center;">
               <span style="width:64px;height:64px;color:rgba(255,255,255,.9)">${PEP}</span>
               <span style="position:absolute;bottom:12px;right:14px;font-size:13px;font-weight:800;color:rgba(255,255,255,.85)">${o.booth}</span>
               <div class="grab"></div></div>`;
        sh.innerHTML = `
          ${hero}
          <div class="sh-body">
            <div class="dept">${o.dept}</div>
            <h3>${o.name}</h3>
            <div class="ds">${o.desc}</div>
            <div class="stats">${heatHtml(o.heat||3)}<span class="booth-chip">BOOTH ${o.booth}</span></div>
            <div class="maker">
              <div class="mk-av">${initials}</div>
              <div>
                <div class="mk-nm">${o.maker||"Department champion"}</div>
                <div class="mk-rl">${o.makerRole||""}</div>
                <div class="mk-st">${o.story||""}</div>
              </div>
            </div>
            <div class="log-row">
              <button class="log-t" id="logTried">Tried it</button>
              <button class="log-l" id="logLuv">${HRT} LUV it</button>
            </div>
            <textarea class="log-note" id="logNote" maxlength="120" placeholder="Private tasting note — just for you. Notes fly free."></textarea>
            <div class="buzz">
              <div class="buzz-h">The word on the row.</div>
              <div id="buzzList"></div>
              <div class="buzz-add">
                <input id="buzzInp" maxlength="90" placeholder="Add your take (public)">
                <button id="buzzPost">Post</button>
              </div>
            </div>
            <button class="rec-btn" id="recBtn"></button>
            <button class="btn" id="sheetVote">Vote for ${o.name}</button>
            <button class="sh-close" id="sheetClose">Keep browsing</button>
          </div>`;
        back.onclick = closeSheet;
        sh.querySelector("#sheetClose").onclick = closeSheet;
        sh.querySelector("#sheetVote").onclick = ()=>{ closeSheet(); renderCompose(o, i); };

        /* --- tasting log controls --- */
        const lg0 = getLog()[o.id] || {};
        const tBtn = sh.querySelector("#logTried"), lBtn = sh.querySelector("#logLuv"), nIn = sh.querySelector("#logNote");
        if(lg0.tried) tBtn.classList.add("on");
        if(lg0.luv)   lBtn.classList.add("on");
        nIn.value = lg0.note || "";
        tBtn.onclick = ()=>{
          const on = !tBtn.classList.contains("on");
          tBtn.classList.toggle("on", on);
          patchLog(o.id, { tried:on });
        };
        lBtn.onclick = ()=>{
          const on = !lBtn.classList.contains("on");
          lBtn.classList.toggle("on", on);
          patchLog(o.id, { luv:on });
          if(on && window.venuFX) venuFX.burst(12);
        };
        nIn.addEventListener("input", ()=>patchLog(o.id, { note:nIn.value }));

        /* --- public buzz (demo-local; production runs the moderation queue) --- */
        function drawBuzz(){
          const mine = (getMyBuzz()[o.id] || []);
          const rows = (o.buzz || []).map(bz=>`<div class="buzz-item"><b>${bz.w}</b>${bz.t}</div>`)
            .concat(mine.map(t=>`<div class="buzz-item mine"><b>You · pending review</b>${t}</div>`));
          sh.querySelector("#buzzList").innerHTML = rows.join("") || `<div class="buzz-item"><b>Quiet so far</b>Be the first take.</div>`;
        }
        drawBuzz();
        sh.querySelector("#buzzPost").onclick = ()=>{
          const inp = sh.querySelector("#buzzInp");
          const t = inp.value.trim();
          if(!t) return;
          const mb = getMyBuzz();
          (mb[o.id] = mb[o.id] || []).push(t);
          venuLS.set(MYBUZZ_KEY, JSON.stringify(mb));
          inp.value = "";
          drawBuzz();
        };

        /* --- recipe reveal requests --- */
        function drawRec(){
          const asked = getRec().includes(o.id);
          const n = 42 + (seedCount(o.id) % 97) + (asked ? 1 : 0);
          const rb = sh.querySelector("#recBtn");
          rb.classList.toggle("on", asked);
          rb.innerHTML = asked
            ? `Recipe requested — you + ${(n-1).toLocaleString()} others. Winners' recipes drop after the event.`
            : `Request the recipe · ${n.toLocaleString()} asking`;
        }
        drawRec();
        sh.querySelector("#recBtn").onclick = ()=>{
          const r = getRec();
          if(!r.includes(o.id)){ r.push(o.id); venuLS.set(REC_KEY, JSON.stringify(r)); }
          drawRec();
        };

        document.body.appendChild(back);
        document.body.appendChild(sh);
        sheetEls = [back, sh];
      }

      /* ---------- SUPERLATIVES (category awards) ---------- */
      function renderSupers(wrap){
        const S = P.superlatives;
        if(!S || !wrap) return;
        const picks = getSup();
        wrap.innerHTML = `
          <h2 class="section" style="margin-top:30px">${S.title}</h2>
          <p class="poll-sub">${S.sub}</p>
          <div id="supList"></div>`;
        const list = wrap.querySelector("#supList");
        S.cats.forEach(c=>{
          const pk = picks[c.id] ? P.options[optIndex(picks[c.id])] : null;
          const b = document.createElement("button");
          b.className = "sup-card" + (pk ? " picked" : "");
          b.innerHTML = `
            <span class="sup-info"><b>${c.title}</b><i>${c.sub}</i></span>
            <span class="sup-pick">${pk ? `${pk.dept} <em>Booth ${pk.booth}</em>` : "Pick →"}</span>`;
          b.onclick = ()=>openSuperPicker(c, wrap);
          list.appendChild(b);
        });
      }
      function openSuperPicker(cat, wrap){
        const back = document.createElement("div"); back.className = "sheet-back";
        const sh = document.createElement("div"); sh.className = "sheet";
        sh.innerHTML = `
          <div class="sh-body" style="padding-top:26px">
            <div class="dept">${cat.title}</div>
            <h3 style="font-size:26px">${cat.sub}.</h3>
            <div class="sup-opts">${P.options.map(o=>`
              <button class="sup-opt" data-id="${o.id}"><b>${o.dept}</b><i>${o.name} · Booth ${o.booth}</i></button>`).join("")}
            </div>
            <button class="sh-close">Never mind</button>
          </div>`;
        const close = ()=>{ back.remove(); sh.remove(); };
        back.onclick = close;
        sh.querySelector(".sh-close").onclick = close;
        sh.querySelectorAll(".sup-opt").forEach(b=>{
          b.onclick = ()=>{
            const s = getSup();
            s[cat.id] = b.dataset.id;
            venuLS.set(SUP_KEY, JSON.stringify(s));
            if(window.venuFX) venuFX.burst(14);
            close();
            renderSupers(wrap);
          };
        });
        document.body.appendChild(back);
        document.body.appendChild(sh);
      }

      /* ---------- 3 · COMPOSE (note + photo) ---------- */
      function renderCompose(o, i){
        const av = (typeof venuAvatar === "function") ? venuAvatar() : null;
        let attachedPhoto = null;
        el.innerHTML = `
          <div class="compose">
            <button class="back" id="composeBack">‹ Back to the ballot</button>
            <h2 class="section">Lock it in.</h2>
            <div class="picked">
              ${photoHtml(o, i, "shot")}
              <span><span class="dept">${o.dept}</span><div class="nm">${o.name}</div></span>
            </div>
            ${av ? `<div class="as-row"><img src="${av}" alt="Your check-in photo"> Voting with your check-in pic</div>` : ""}
            <textarea id="voteNote" maxlength="140" placeholder="Add a note with your vote (optional) — &quot;${(o.maker||"This one").split(" ")[0]}'s chili changed me.&quot;"></textarea>
            <div class="attach-row">
              <input type="file" id="voteCam" accept="image/*" capture="environment" hidden>
              <button class="attach" id="voteAttach">+ Add a photo of the bowl</button>
              <img class="attach-thumb" id="voteThumb" style="display:none" alt="Your photo">
            </div>
            <button class="btn" id="castBtn">Cast my vote</button>
            <div class="poll-note">One vote per device. No takebacks — it's the last one.</div>
          </div>`;
        el.querySelector("#composeBack").onclick = renderBallot;
        el.querySelector("#voteAttach").onclick = ()=>el.querySelector("#voteCam").click();
        el.querySelector("#voteCam").addEventListener("change", async (e)=>{
          const f = e.target.files[0]; if(!f) return;
          try{
            attachedPhoto = await resizeImage(f, 500, 0.7);
            const th = el.querySelector("#voteThumb");
            th.src = attachedPhoto; th.style.display = "block";
            el.querySelector("#voteAttach").textContent = "Swap photo";
          }catch(err){}
        });
        el.querySelector("#castBtn").onclick = async ()=>{
          const note = el.querySelector("#voteNote").value.trim();
          const rec = { opt:o.id, note, photo:attachedPhoto, ts:Date.now() };
          venuLS.set(KEY, JSON.stringify(rec));
          try{
            if(votesCol()) await votesCol().doc(deviceId()).set({ poll:P.id, opt:o.id, note, ts:rec.ts });
          }catch(e){ /* offline / rules: local vote still counts in this demo */ }
          castMoment(o);
        };
      }

      /* ---------- 4 · THE MOMENT ---------- */
      function castMoment(o){
        const AV = ctx.client.aviation || {};
        const fl = document.createElement("div");
        fl.className = "vote-flash";
        fl.innerHTML = `<div><h2>${AV.castTitle || "Vote cast."}</h2><p>${AV.castSub || o.dept + " thanks you. Results are live."}</p>${P.mascots && window.VENU_PEPPERS ? VENU_PEPPERS.trio() : ""}</div>`;
        document.body.appendChild(fl);
        if(window.venuFX){
          venuFX.burst(54);
          if(venuFX.flyby && AV.flight) venuFX.flyby({ top:"20%", delay:250 });
        }
        setTimeout(()=>{
          fl.classList.add("out");
          setTimeout(()=>fl.remove(), 420);
          /* main vote done → hand out the remaining trophies before results */
          const picks = getSup();
          const remaining = P.superlatives ? P.superlatives.cats.filter(c=>!picks[c.id]).length : 0;
          remaining ? renderSupersStep() : renderResults();
        }, 1700);
      }

      /* ---------- 4b · SUPERLATIVES STEP (right after the main vote) ---------- */
      function renderSupersStep(){
        el.innerHTML = `
          <h2 class="section">While you're here.</h2>
          <p class="poll-sub">Your chili vote is in. A few more trophies still need homes — crown them, then see where your bowl stands.</p>
          <div id="supersWrap"></div>
          <button class="btn" id="supersDone" style="width:100%; margin-top:6px">See live results</button>`;
        renderSupers(el.querySelector("#supersWrap"));
        /* hide the duplicate section header inside the step */
        const h = el.querySelector("#supersWrap h2");
        if(h) h.style.display = "none";
        el.querySelector("#supersDone").onclick = renderResults;
      }

      /* ---------- 5 · RESULTS ---------- */
      async function renderResults(){
        const mine = myVote();
        const counts = {};
        P.options.forEach(o=> counts[o.id] = seedCount(o.id));   // demo baseline
        let sharedMine = false;
        try{
          if(votesCol()){
            const snap = await votesCol().where("poll","==",P.id).get();
            snap.forEach(d=>{
              const v = d.data();
              if(counts[v.opt] != null) counts[v.opt]++;
              if(d.id === deviceId()) sharedMine = true;
            });
          }
        }catch(e){}
        if(mine && !sharedMine && counts[mine.opt] != null) counts[mine.opt]++;
        const total = Object.values(counts).reduce((a,b)=>a+b,0);
        const rows = P.options.map(o=>({ ...o, n:counts[o.id] })).sort((a,b)=>b.n-a.n);
        const mineOpt = mine ? P.options[optIndex(mine.opt)] : null;
        const av = (typeof venuAvatar === "function") ? venuAvatar() : null;

        el.innerHTML = `
          <h2 class="section">${P.resultsTitle || P.title}</h2>
          <div class="poll-total"><span class="live-dot"></span>${total.toLocaleString()} votes and counting</div>
          ${mineOpt ? `
            <div class="yourvote">
              <div class="yv-av">${av ? `<img src="${av}" alt="You">` : ""}</div>
              <div style="min-width:0">
                <div class="yv-k">Your vote</div>
                <div class="yv-nm">${mineOpt.name} · ${mineOpt.dept}</div>
                ${mine.note ? `<div class="yv-note">“${mine.note}”</div>` : ""}
              </div>
              ${mine.photo ? `<img class="yv-ph" src="${mine.photo}" alt="Your photo">` : ""}
            </div>` : ""}
          <div id="resList"></div>
          <div class="poll-note">${P.closes}</div>
          <div id="supersWrap"></div>
          <button class="poll-reset" id="pollReset">Demo: reset my vote</button>`;
        renderSupers(el.querySelector("#supersWrap"));
        const list = el.querySelector("#resList");
        rows.forEach((r,i)=>{
          const pct = total ? Math.round(r.n/total*100) : 0;
          const d = document.createElement("div");
          d.className = "poll-res" + (i===0 ? " lead" : "");
          d.innerHTML = `${mine && r.id===mine.opt ? '<span class="mine">Your vote</span>' : ""}
            <div class="top"><div><div class="dept">${i===0 ? '<span class="lead-chip">Leading · </span>' : ""}${r.dept}</div>
              <div class="nm">${r.name}</div></div><div class="pct">${pct}%</div></div>
            <div class="bar"><div class="fill" data-w="${pct}"></div></div>
            <div class="votes">${r.n.toLocaleString()} votes · Booth ${r.booth}</div>`;
          list.appendChild(d);
        });
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          list.querySelectorAll(".fill").forEach(f=> f.style.width = f.dataset.w + "%");
        }));
        el.querySelector("#pollReset").onclick = ()=>{
          venuLS.del(KEY);
          renderBallot();
        };
      }

      myVote() ? renderResults() : renderBallot();
    }
  });
})();
