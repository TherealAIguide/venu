/* =========================================================================
   MODULE: venueMap  ·  status: beta
   Interactive venue map + booth finder. Fully config-driven: the client
   config supplies labeled areas (stage, zones, entrances) and typed points
   (booths, restrooms, food, first aid, ...) in viewBox coordinates, so a
   new venue is data entry, not code. Filter chips, tap-a-pin details, and
   a searchable list ("I'm here for someone specific") come free.

   Config (client.map):
     { tabLabel, title, sub, w, h,
       areas:[{ x,y,w,h,label,cls }],
       points:[{ id,x,y, t:type, l:label, d:detail }] }

   Point types + filter groups are defined in TYPES below.
   Static + client-side only: zero backend traffic at any crowd size.

   ZOOM: selecting a pin or a filter chip animates the viewBox in — "Full
   map" resets. ROADMAP: swap the schematic for the real venue map image
   (same coordinate system, image layered under the pins); QR codes at
   fixed points can deep-link to ?at=<pointId> for a "you are here" pin
   (no location permission needed — right call for a website; GPS is an
   app-store-app conversation).
   ========================================================================= */
(function(){
  window.VenuModules = window.VenuModules || { registry:{}, register(id,def){ this.registry[id]=def; } };

  const ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>';

  /* type -> color, short glyph, filter group, list label */
  const TYPES = {
    chili: { c:"#F9B612", g:"",   grp:"chili", name:"Chili booth" },
    wc:    { c:"#5BC0EB", g:"WC", grp:"wc",    name:"Restrooms" },
    food:  { c:"#FF8C42", g:"F",  grp:"food",  name:"Food & drink" },
    water: { c:"#4CC9F0", g:"W",  grp:"food",  name:"Water" },
    med:   { c:"#2EC4B6", g:"+",  grp:"svc",   name:"First aid" },
    photo: { c:"#F06AA8", g:"P",  grp:"fun",   name:"Photo op" },
    fun:   { c:"#9B5DE5", g:"★",  grp:"fun",   name:"Things to do" }
  };
  const FILTERS = [
    { id:"all",   label:"All" },
    { id:"chili", label:"Chili Row" },
    { id:"wc",    label:"Restrooms" },
    { id:"food",  label:"Food & drink" },
    { id:"fun",   label:"Fun" },
    { id:"svc",   label:"First aid" }
  ];

  VenuModules.register("venueMap", {
    configKey: "map",
    tab: { label:"Map", view:"venueMap", ico:ICO },
    styles: `
      .map-wrap{background:var(--surface); border:1px solid var(--line); border-radius:var(--radius);
        overflow:hidden; position:relative;}
      .map-zoomout{position:absolute; top:10px; right:10px; z-index:5; display:none;
        background:var(--gold); color:#1B2A5E; font-weight:800; font-size:11px;
        border-radius:9px; padding:7px 12px; box-shadow:0 6px 16px rgba(0,0,0,.35);}
      .map-zoomout.on{display:block;}
      .map-wrap svg{display:block; width:100%; height:auto;}
      .map-wrap.has-img{background:#EFEDE6;}
      .map-wrap.has-img .map-pin circle{stroke:#fff; stroke-width:1.6;}
      .map-wrap.has-img .map-pin text{fill:#101A45;}
      .map-area{fill:var(--surface2); stroke:var(--line); stroke-width:1.2; rx:10;}
      .map-area.stage{fill:rgba(229,29,35,.2); stroke:rgba(229,29,35,.5);}
      .map-area.row{fill:rgba(249,182,18,.08); stroke:rgba(249,182,18,.3); stroke-dasharray:5 4;}
      .map-area.door{fill:rgba(91,215,120,.14); stroke:rgba(91,215,120,.45);}
      .map-arealbl{font-family:var(--body); font-size:9px; font-weight:700; letter-spacing:.14em;
        fill:var(--muted); text-anchor:middle;}
      .map-pin{cursor:pointer;}
      .map-pin circle{stroke:rgba(0,0,0,.35); stroke-width:1; transition:r .15s;}
      .map-pin text{font-family:var(--body); font-size:8.5px; font-weight:800; text-anchor:middle;
        fill:#101A45; pointer-events:none;}
      .map-pin.dim{opacity:.14; pointer-events:none;}
      .map-pin.sel circle{stroke:#fff; stroke-width:2.5;}
      .map-info{margin-top:10px; display:none; align-items:center; gap:12px;}
      .map-info.on{display:flex;}
      .map-info .dot{flex:0 0 14px; height:14px; border-radius:50%;}
      .map-info .nm{font-weight:700; font-size:14.5px;}
      .map-info .ds{color:var(--muted); font-size:12.5px;}
      .map-search{width:100%; background:var(--surface); border:1.5px solid var(--line);
        border-radius:12px; color:var(--ink); font-family:var(--body); font-size:14px;
        padding:12px 14px; outline:none; margin:16px 0 10px;}
      .map-search:focus{border-color:var(--accent);}
      .map-list .item{display:flex; align-items:center; gap:12px; width:100%; text-align:left;
        color:var(--ink); padding:11px 4px; border-bottom:1px solid var(--line);}
      .map-list .item:last-child{border-bottom:none;}
      .map-list .dot{flex:0 0 11px; height:11px; border-radius:50%;}
      .map-list .nm{font-weight:600; font-size:14px;}
      .map-list .ds{color:var(--muted); font-size:12px;}
      .map-list .ty{margin-left:auto; flex:0 0 auto; font-size:9.5px; font-weight:700; letter-spacing:.1em;
        text-transform:uppercase; color:var(--muted); border:1px solid var(--line); border-radius:6px; padding:3px 7px;}
      .map-none{color:var(--muted); font-size:13px; text-align:center; padding:20px 0;}
      .map-sub{color:var(--muted); font-size:14px; margin:-4px 0 12px; line-height:1.55;}
      .hunt-embed{margin-top:28px;}
      .map-pin.hunt-pin{transform-box:fill-box; transform-origin:center;
        animation:huntPop .55s cubic-bezier(.2,.9,.3,1.5);}
      @keyframes huntPop{from{opacity:0; transform:scale(.2);}to{opacity:1; transform:scale(1);}}
      .hunt-halo{fill:none; stroke:#F9B612; stroke-width:1.5; opacity:.7;
        transform-box:fill-box; transform-origin:center; animation:huntHalo 2.4s infinite;}
      @keyframes huntHalo{0%{transform:scale(.7); opacity:.8;}70%{transform:scale(1.45); opacity:0;}100%{transform:scale(1.45); opacity:0;}}
      @media (prefers-reduced-motion:reduce){ .map-pin.hunt-pin,.hunt-halo{animation:none;} }
      .map-info .hunt-thumb{flex:0 0 44px; width:44px; height:44px; border-radius:10px;
        object-fit:cover; border:2px solid #F9B612;}
    `,
    render(ctx){
      const M = ctx.client.map, el = ctx.el;
      if(!M){ el.innerHTML = ""; return; }
      let filter = "all", selected = null;

      el.innerHTML = `
        <h2 class="section">${M.title}</h2>
        <p class="map-sub">${M.sub}</p>
        <div class="daychips" id="mapChips"></div>
        <div class="map-wrap">
          <svg viewBox="0 0 ${M.w} ${M.h}" role="img" aria-label="${M.title}"></svg>
          <div class="map-info card" id="mapInfo" style="border:none; border-top:1px solid var(--line); border-radius:0;"></div>
        </div>
        <input class="map-search" id="mapSearch" placeholder="Search booths, departments, chilis…">
        <div class="card map-list" id="mapList"></div>
        ${ctx.client.scavenger && ctx.client.scavenger.embedIn === "venueMap" ? '<div id="embed-scavenger" class="hunt-embed"></div>' : ""}`;

      const svg = el.querySelector("svg");
      const NS = "http://www.w3.org/2000/svg";

      /* real venue map image under the pins (M.img). The schematic areas
         render only when there's no image — the image carries its own
         labels. */
      if(M.img){
        const im = document.createElementNS(NS, "image");
        im.setAttribute("href", M.img);
        im.setAttribute("x", 0); im.setAttribute("y", 0);
        im.setAttribute("width", M.w); im.setAttribute("height", M.h);
        im.setAttribute("preserveAspectRatio", "xMidYMid slice");
        svg.appendChild(im);
        el.querySelector(".map-wrap").classList.add("has-img");
      }

      /* areas */
      (M.areas || []).forEach(a=>{
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("x", a.x); r.setAttribute("y", a.y);
        r.setAttribute("width", a.w); r.setAttribute("height", a.h);
        r.setAttribute("rx", 10);
        r.setAttribute("class", "map-area " + (a.cls || ""));
        svg.appendChild(r);
        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", a.x + a.w/2); t.setAttribute("y", a.y + a.h/2 + 3);
        t.setAttribute("class", "map-arealbl");
        t.textContent = a.label;
        svg.appendChild(t);
      });

      /* points — per-point radius override (p.r) lets dense clusters like
         the chili tents use smaller pins on the real map */
      const pins = {};
      M.points.forEach(p=>{
        const ty = TYPES[p.t] || TYPES.fun;
        const r = p.r || 11;
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "map-pin");
        g.dataset.id = p.id;
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", r);
        c.setAttribute("fill", ty.c);
        g.appendChild(c);
        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", p.x); t.setAttribute("y", p.y + r*0.28);
        t.setAttribute("style", "font-size:" + (r*0.78).toFixed(1) + "px");
        t.textContent = p.t === "chili" ? p.l.split(" ")[0] : ty.g;   /* booth # or glyph */
        g.appendChild(t);
        g.addEventListener("click", ()=>select(p.id));
        svg.appendChild(g);
        pins[p.id] = g;
      });

      /* ---- viewBox zoom (animated) ---- */
      let curVB = [0, 0, M.w, M.h], vbAnim = null;
      const resetBtn = document.createElement("button");
      resetBtn.className = "map-zoomout";
      resetBtn.textContent = "Full map";
      resetBtn.onclick = ()=>animateVB([0, 0, M.w, M.h]);
      el.querySelector(".map-wrap").appendChild(resetBtn);
      function setVB(v){
        curVB = v;
        svg.setAttribute("viewBox", v.map(x=>x.toFixed(1)).join(" "));
        resetBtn.classList.toggle("on", v[2] < M.w - 1);
      }
      function animateVB(target){
        cancelAnimationFrame(vbAnim);
        const from = curVB.slice(), t0 = performance.now(), DUR = 420;
        const step = (now)=>{
          const k = Math.min(1, (now - t0) / DUR);
          const e = 1 - Math.pow(1 - k, 3);
          setVB(from.map((v, j)=> v + (target[j] - v) * e));
          if(k < 1) vbAnim = requestAnimationFrame(step);
        };
        vbAnim = requestAnimationFrame(step);
      }
      const clamp = (v, lo, hi)=>Math.max(lo, Math.min(hi, v));
      function zoomToPoint(p){
        const w = 170, h = w * M.h / M.w;
        animateVB([clamp(p.x - w/2, 0, M.w - w), clamp(p.y - h/2, 0, M.h - h), w, h]);
      }
      function zoomToPts(pts){
        if(!pts.length) return animateVB([0, 0, M.w, M.h]);
        const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y), PAD = 46;
        let x0 = Math.min(...xs) - PAD, y0 = Math.min(...ys) - PAD;
        let w = Math.max(...xs) - Math.min(...xs) + PAD*2, h = Math.max(...ys) - Math.min(...ys) + PAD*2;
        const ratio = M.h / M.w;
        if(h / w > ratio){ const nw = h / ratio; x0 -= (nw - w)/2; w = nw; }
        else { const nh = w * ratio; y0 -= (nh - h)/2; h = nh; }
        w = Math.min(w, M.w); h = Math.min(h, M.h);
        animateVB([clamp(x0, 0, M.w - w), clamp(y0, 0, M.h - h), w, h]);
      }

      /* ---- HUNT FINDS LAYER ----
         Hunt stops (client.scavenger.stops with x/y) are INVISIBLE here
         until snapped in the hunt below — then the pin pops in, gold,
         with a pulsing halo and their own photo in the info card. The
         map fills in as they play. */
      const H = ctx.client.scavenger;
      const huntPins = {};
      function huntFound(){
        try{ return JSON.parse(venuLS.get("venu:" + ctx.slug + ":hunt") || "{}"); }catch(e){ return {}; }
      }
      function renderHuntPins(){
        if(!H || !H.stops) return;
        const found = huntFound();
        H.stops.forEach(s=>{
          if(s.x == null) return;
          const has = !!found[s.id];
          let g = huntPins[s.id];
          if(has && !g){
            g = document.createElementNS(NS, "g");
            g.setAttribute("class", "map-pin hunt-pin");
            const halo = document.createElementNS(NS, "circle");
            halo.setAttribute("cx", s.x); halo.setAttribute("cy", s.y); halo.setAttribute("r", 15);
            halo.setAttribute("class", "hunt-halo");
            g.appendChild(halo);
            const c = document.createElementNS(NS, "circle");
            c.setAttribute("cx", s.x); c.setAttribute("cy", s.y); c.setAttribute("r", 11);
            c.setAttribute("fill", "#F9B612");
            g.appendChild(c);
            const t = document.createElementNS(NS, "text");
            t.setAttribute("x", s.x); t.setAttribute("y", s.y + 3.5);
            t.textContent = "✓";
            g.appendChild(t);
            g.addEventListener("click", ()=>selectHunt(s));
            svg.appendChild(g);
            huntPins[s.id] = g;
          } else if(!has && g){
            g.remove();
            delete huntPins[s.id];
          }
        });
      }
      function selectHunt(s){
        Object.values(pins).forEach(g=>g.classList.remove("sel"));
        Object.values(huntPins).forEach(g=>g.classList.remove("sel"));
        if(huntPins[s.id]) huntPins[s.id].classList.add("sel");
        const info = el.querySelector("#mapInfo");
        info.className = "map-info on";
        info.innerHTML = `<img class="hunt-thumb" src="${huntFound()[s.id]}" alt="Your find">
          <span><div class="nm">${s.name} — found</div><div class="ds">${s.task}</div></span>`;
        zoomToPoint(s);
      }
      renderHuntPins();
      window.addEventListener("venu:hunt-updated", renderHuntPins);

      function select(id){
        selected = id;
        const p = M.points.find(x=>x.id === id);
        const ty = TYPES[p.t] || TYPES.fun;
        Object.values(pins).forEach(g=>g.classList.remove("sel"));
        Object.values(huntPins).forEach(g=>g.classList.remove("sel"));
        pins[id].classList.add("sel");
        const info = el.querySelector("#mapInfo");
        info.className = "map-info on";
        info.innerHTML = `<span class="dot" style="background:${ty.c}"></span>
          <span><div class="nm">${p.l}</div><div class="ds">${p.d} · ${ty.name}</div></span>`;
        zoomToPoint(p);
      }

      function applyFilter(){
        const kept = [];
        M.points.forEach(p=>{
          const ty = TYPES[p.t] || TYPES.fun;
          const out = filter !== "all" && ty.grp !== filter;
          pins[p.id].classList.toggle("dim", out);
          if(!out) kept.push(p);
        });
        const dimHunt = filter !== "all" && filter !== "fun";
        Object.values(huntPins).forEach(g=>g.classList.toggle("dim", dimHunt));
        filter === "all" ? animateVB([0, 0, M.w, M.h]) : zoomToPts(kept);
        renderList();
      }

      /* filter chips (reuses .daychips styling) */
      const chips = el.querySelector("#mapChips");
      FILTERS.forEach((f,i)=>{
        const b = document.createElement("button");
        b.textContent = f.label;
        if(i === 0) b.classList.add("active");
        b.onclick = ()=>{
          filter = f.id;
          chips.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
          b.classList.add("active");
          applyFilter();
        };
        chips.appendChild(b);
      });

      /* searchable list */
      const search = el.querySelector("#mapSearch");
      search.addEventListener("input", renderList);
      function renderList(){
        const q = search.value.trim().toLowerCase();
        const list = el.querySelector("#mapList");
        const rows = M.points.filter(p=>{
          const ty = TYPES[p.t] || TYPES.fun;
          if(filter !== "all" && ty.grp !== filter) return false;
          return !q || (p.l + " " + p.d).toLowerCase().includes(q);
        });
        list.innerHTML = rows.length ? "" : `<div class="map-none">Nothing matches — try another word.</div>`;
        rows.forEach(p=>{
          const ty = TYPES[p.t] || TYPES.fun;
          const b = document.createElement("button");
          b.className = "item";
          b.innerHTML = `<span class="dot" style="background:${ty.c}"></span>
            <span><div class="nm">${p.l}</div><div class="ds">${p.d}</div></span>
            <span class="ty">${ty.name}</span>`;
          b.onclick = ()=>{
            select(p.id);
            el.querySelector(".map-wrap").scrollIntoView({ behavior:"smooth", block:"start" });
          };
          list.appendChild(b);
        });
      }
      renderList();
    }
  });
})();
