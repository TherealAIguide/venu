/* =========================================================================
   MODULE: scavenger  ·  status: beta
   Photo-hunt, v2: every stop is a camera moment. Snap the thing to check
   it off; your shots build a hunt journal. Finish all stops → confetti,
   prize screen, and a bridge to share your favorite on the Photo wall.

   Config (client.scavenger):
     { tabLabel, title, sub, prize, prizeCode, shareCta,
       stops:[{ id, name, task }] }

   Storage: photos + progress live on-device (venuLS) — zero backend
   traffic at any crowd size. The demo trusts the camera (any photo
   counts); production verification options, pick per prize value:
     - QR code on the station sign scanned in the same flow (cheap)
     - geofenced check-in (needs location permission)
     - staff stamp screen at the prize booth (zero tech, works today)
   ========================================================================= */
(function(){
  window.VenuModules = window.VenuModules || { registry:{}, register(id,def){ this.registry[id]=def; } };

  const ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
  const CAM = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>';

  VenuModules.register("scavenger", {
    configKey: "scavenger",
    tab: { label:"Hunt", view:"scavenger", ico:ICO },
    styles: `
      .hunt-sub{color:var(--muted); font-size:14px; margin:-4px 0 16px; line-height:1.55;}
      .hunt-progress{background:var(--surface); border:1px solid var(--line); border-radius:18px;
        padding:16px; margin-bottom:14px;}
      .hunt-progress .big{font-family:var(--display); font-weight:800; font-size:38px; line-height:1; color:#fff; letter-spacing:-.02em;}
      .hunt-progress .big em{font-style:normal; color:var(--gold);}
      .hunt-bar{height:10px; border-radius:99px; background:var(--surface2); margin-top:12px; overflow:hidden;}
      .hunt-bar .fill{height:100%; border-radius:99px; width:0;
        background:linear-gradient(90deg,var(--accent),var(--gold));
        transition:width .7s cubic-bezier(.2,.8,.2,1);}
      .hunt-stop{background:var(--surface); border:1px solid var(--line); border-radius:18px;
        padding:13px; margin-bottom:10px; display:flex; gap:13px; align-items:center;
        transition:border-color .2s;}
      .hunt-stop .badge{flex:0 0 54px; height:54px; border-radius:14px; display:grid; place-items:center;
        background:var(--surface2); border:1px solid var(--line); overflow:hidden;
        font-family:var(--display); font-weight:800; font-size:17px; color:var(--muted);}
      .hunt-stop.found{border-color:rgba(249,182,18,.55);}
      .hunt-stop.found .badge{border:2px solid var(--gold); padding:0;}
      .hunt-stop .badge img{width:100%; height:100%; object-fit:cover; animation:snapIn .4s cubic-bezier(.2,.9,.3,1.4);}
      @keyframes snapIn{from{transform:scale(.4) rotate(-8deg); opacity:0;}to{transform:none; opacity:1;}}
      .hunt-stop .body{flex:1; min-width:0;}
      .hunt-stop .nm{font-family:var(--display); font-weight:800; font-size:16px; color:#fff; letter-spacing:-.01em;}
      .hunt-stop .task{color:var(--muted); font-size:12.5px; margin-top:2px; line-height:1.5;}
      .hunt-stop .done-tag{font-size:10px; font-weight:800; letter-spacing:.14em; text-transform:uppercase;
        color:var(--gold); margin-top:4px;}
      .hunt-snap{flex:0 0 auto; display:inline-flex; align-items:center; gap:6px;
        background:var(--gold); color:#1B2A5E; font-weight:800; font-size:12.5px;
        border-radius:11px; padding:10px 13px; transition:transform .12s;}
      .hunt-snap:active{transform:scale(.94);}
      .hunt-done{border-radius:18px; border:1.5px solid var(--gold); text-align:center;
        padding:24px 18px; margin-bottom:14px;
        background:radial-gradient(120% 100% at 50% 0%, rgba(249,182,18,.22), transparent 60%), var(--surface);}
      .hunt-done h3{font-family:var(--display); font-weight:800; font-size:32px; color:#fff; letter-spacing:-.02em; margin-bottom:6px;}
      .hunt-done .venu-pep{width:58px; margin:0 auto 8px; display:block;}
      .hunt-done p{color:var(--muted); font-size:13px; max-width:36ch; margin:0 auto;}
      .hunt-done .code{display:inline-block; margin-top:14px; font-family:var(--display); font-weight:800; font-size:22px;
        letter-spacing:.12em; color:var(--gold); border:2px dashed rgba(249,182,18,.6);
        border-radius:12px; padding:10px 20px;}
      .hunt-done .journal{display:flex; justify-content:center; gap:6px; margin-top:16px; flex-wrap:wrap;}
      .hunt-done .journal img{width:44px; height:44px; border-radius:10px; object-fit:cover; border:1.5px solid var(--gold);}
      .hunt-done .btn{width:100%; margin-top:16px;}
      .hunt-note{font-size:11.5px; color:var(--muted); text-align:center; margin-top:14px; line-height:1.6;}
    `,
    render(ctx){
      const H = ctx.client.scavenger, el = ctx.el;
      if(!H){ el.innerHTML = ""; return; }
      const KEY = "venu:" + ctx.slug + ":hunt";
      let found = {};
      try{ found = JSON.parse(venuLS.get(KEY) || "{}"); }catch(e){ found = {}; }
      const save = ()=> venuLS.set(KEY, JSON.stringify(found));
      const count = ()=> Object.keys(found).length;

      function draw(){
        const n = count(), all = H.stops.length, doneAll = n === all;
        el.innerHTML = `
          <h2 class="section">${H.title}</h2>
          <p class="hunt-sub">${H.sub}</p>
          ${doneAll ? `
            <div class="hunt-done">
              ${H.mascots && window.VENU_PEPPERS ? VENU_PEPPERS.one("#E51D23", 1) : ""}
              <h3>You got them all.</h3>
              <p>${H.prize}</p>
              <div class="code">${H.prizeCode}</div>
              <div class="journal">${H.stops.map(s=>found[s.id] ? `<img src="${found[s.id]}" alt="${s.name}">` : "").join("")}</div>
              <button class="btn" id="huntShare">${H.shareCta || "Share one to the Photo wall"}</button>
            </div>` : `
            <div class="hunt-progress">
              <div class="big"><em>${n}</em> of ${all}</div>
              <div class="hunt-bar"><div class="fill" data-w="${Math.round(n/all*100)}"></div></div>
            </div>`}
          <div id="stops"></div>
          <div class="hunt-note">Demo: any photo counts as a check-in. Production adds QR / geofence verification at each station.</div>`;
        const box = el.querySelector("#stops");
        H.stops.forEach((s,i)=>{
          const shot = found[s.id];
          const d = document.createElement("div");
          d.className = "hunt-stop" + (shot ? " found" : "");
          d.innerHTML = `
            <div class="badge">${shot ? `<img src="${shot}" alt="Your ${s.name} shot">` : i+1}</div>
            <div class="body">
              <div class="nm">${s.name}</div>
              <div class="task">${s.task}</div>
              ${shot ? `<div class="done-tag">Got it</div>` : ""}
            </div>
            ${shot ? "" : `<button class="hunt-snap">${CAM} Snap it</button>
              <input type="file" accept="image/*" capture="environment" hidden>`}`;
          if(!shot){
            const inp = d.querySelector("input");
            d.querySelector(".hunt-snap").onclick = ()=>inp.click();
            inp.addEventListener("change", async (e)=>{
              const f = e.target.files[0]; if(!f) return;
              try{
                found[s.id] = await resizeImage(f, 500, 0.7);
                save();
                if(count() === H.stops.length && window.venuFX) venuFX.burst(60);
                else if(window.venuFX) venuFX.burst(16);
                draw();
                if(window.refreshHomeTiles) refreshHomeTiles();
                /* the payoff: scroll up to the map and let the pin pop in */
                if(H.embedIn){
                  setTimeout(()=>{
                    window.scrollTo({ top:0, behavior:"smooth" });
                    setTimeout(()=>window.dispatchEvent(new CustomEvent("venu:hunt-updated")), 450);
                  }, 500);
                } else {
                  window.dispatchEvent(new CustomEvent("venu:hunt-updated"));
                }
              }catch(err){}
            });
          }
          box.appendChild(d);
        });
        const fill = el.querySelector(".hunt-bar .fill");
        if(fill) requestAnimationFrame(()=>requestAnimationFrame(()=>{ fill.style.width = fill.dataset.w + "%"; }));
        const share = el.querySelector("#huntShare");
        if(share) share.onclick = ()=>{ if(typeof switchTab === "function") switchTab("wall"); };
      }
      draw();
    }
  });
})();
