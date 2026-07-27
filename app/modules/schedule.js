/* =========================================================================
   MODULE: schedule  ·  status: live
   Multi-day agenda with day chips. Reference implementation of the module
   interface — extracted from the original app. Other modules follow this shape.
   ========================================================================= */
(function(){
  window.VenuModules = window.VenuModules || { registry:{}, register(id,def){ this.registry[id]=def; } };

  VenuModules.register("schedule", {
    tab: { label:"Schedule", view:"schedule" },
    render(ctx){
      const C = ctx.client, el = ctx.el;
      if(!C.days || !C.days.length){ el.innerHTML = ""; return; }
      el.innerHTML =
        `<h2 class="section">Schedule <span class="tag">${C.brand && C.brand.venue ? C.brand.venue : ""}</span></h2>
         <div class="daychips"></div>
         <div class="card slots"></div>`;
      const chips = el.querySelector(".daychips");
      const list  = el.querySelector(".slots");

      function renderDay(i){
        list.innerHTML = C.days[i].slots.map(s=>`
          <div class="slot">
            <div class="time">${s.time}</div>
            <div class="what"><div class="title">${s.title}</div><div class="who">${s.who}</div></div>
            <div class="kind ${s.kind==="main"?"main":""}">${s.kind}</div>
          </div>`).join("");
      }
      C.days.forEach((d,i)=>{
        const b = document.createElement("button");
        b.textContent = d.label;
        b.onclick = ()=>{ chips.querySelectorAll("button").forEach(x=>x.classList.remove("active")); b.classList.add("active"); renderDay(i); };
        if(i===0) b.classList.add("active");
        chips.appendChild(b);
      });
      renderDay(0);
    }
  });
})();
