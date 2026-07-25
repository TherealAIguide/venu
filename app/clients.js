/* =========================================================================
   VENU — white-label event platform · thevenu.app
   ---------------------------------------------------------------------
   CLIENT REGISTRY. Keyed by subdomain: pulsefest.thevenu.app loads
   CLIENTS.pulsefest. Wildcard DNS (*.thevenu.app) means adding a client is
   a new entry here — no DNS change, no redeploy target.

   In production this object becomes a Firestore lookup by hostname; the
   shape stays identical, so nothing below this block changes.
   These are FICTIONAL sample events for demo purposes. Schedule, lineup,
   speaker and sponsor names are placeholders.
   ========================================================================= */
const CLIENTS = {};

/* --- Sample event A: a high-energy music festival.
       Live at: pulsefest.thevenu.app  ·  preview with ?client=pulsefest
       Deliberately the opposite vibe of the gala below — neon, loud, lineup-
       driven, huge fan cam, no formal "speakers." --- */
CLIENTS.pulsefest = {
  brand: {
    kicker: "Pulse Live",
    name: "Pulse Fest '26",
    venue: "Riverfront Arena",
    accent: "#B14CE4",
    gold: "#22D3EE",
    displayCaption: "PULSE FAN CAM",
    displaySub: "Tag #PulseFest to hit the screens"
  },
  features: { schedule:true, speakers:false, sponsors:true, photoWall:true },
  days: [
    { label:"Fri 7/24", slots:[
      { time:"4:00",  title:"Gates open", who:"Riverfront lawn", kind:"open" },
      { time:"5:30",  title:"Opening set — DJ Vega (sample)", who:"Neon Stage", kind:"session" },
      { time:"7:00",  title:"The Wildcards (sample)", who:"Main Stage", kind:"session" },
      { time:"9:00",  title:"Headliner — AURORA SKY (sample)", who:"Main Stage", kind:"main" },
      { time:"10:30", title:"Afterglow silent disco", who:"River Tent", kind:"break" }
    ]},
    { label:"Sat 7/25", slots:[
      { time:"2:00",  title:"Gates open + food trucks", who:"Riverfront lawn", kind:"open" },
      { time:"4:00",  title:"Rising Acts showcase (sample)", who:"Neon Stage", kind:"session" },
      { time:"6:30",  title:"Crowd light show", who:"Main Stage screens", kind:"main" },
      { time:"8:00",  title:"Headliner — BASSLINE (sample)", who:"Main Stage", kind:"main" },
      { time:"10:00", title:"Fireworks + fan cam finale", who:"Main Stage", kind:"main" }
    ]}
  ],
  speakers: [],
  sponsors: [
    { tier:"Presenting partners", items:[
      { name:"VoltEnergy", booth:"Main gate · Charging lounge", url:"#" },
      { name:"Sample Brand", booth:"Neon Stage · Placeholder", url:"#" }
    ]},
    { tier:"On-site partners", items:[
      { name:"Riverfront Eats", booth:"Food row", url:"#" },
      { name:"Sample Partner", booth:"Vendor village", url:"#" }
    ]}
  ]
};

/* --- Sample event B: an elegant black-tie fundraiser.
       Live at: harborgala.thevenu.app  ·  preview with ?client=harborgala
       Proves the same codebase reskins into a completely different feel. --- */
CLIENTS.harborgala = {
  brand:{
    kicker:"Harbor Foundation", name:"Harbor Gala", venue:"The Grand Ballroom",
    accent:"#C9A227", gold:"#7FB2C4",
    displayCaption:"HARBOR GALA", displaySub:"Share your night with us"
  },
  features:{ schedule:true, speakers:true, sponsors:true, photoWall:true },
  days:[
    { label:"Sat 9/12", slots:[
      { time:"6:00", title:"Cocktail reception", who:"Terrace", kind:"open" },
      { time:"7:00", title:"Dinner service", who:"Grand Ballroom", kind:"main" },
      { time:"8:15", title:"The ask + live giving", who:"Board chair", kind:"main" },
      { time:"9:00", title:"Raffle drawing", who:"Main stage", kind:"session" },
      { time:"9:30", title:"Dancing + photo wall", who:"Ballroom floor", kind:"break" }
    ]}
  ],
  speakers:[
    { name:"Sample Chair", role:"Board chair (placeholder)" },
    { name:"Sample Honoree", role:"Honoree (placeholder)" }
  ],
  sponsors:[
    { tier:"Presenting", items:[{ name:"Sample Trust", booth:"Table 1", url:"#" }] },
    { tier:"Supporting", items:[{ name:"Sample Partner", booth:"Table 8", url:"#" }] }
  ]
};

/* =========================================================================
   HOSTNAME RESOLVER — the multi-tenant switch.
   pulsefest.thevenu.app  → CLIENTS.pulsefest
   harborgala.thevenu.app → CLIENTS.harborgala
   Local/preview fallback: ?client=harborgala
   ========================================================================= */
function resolveClient(){
  const override = new URLSearchParams(location.search).get("client");
  if(override && CLIENTS[override]) return CLIENTS[override];
  const host = location.hostname;                 // e.g. pulsefest.thevenu.app
  const sub = host.split(".")[0];
  if(CLIENTS[sub]) return CLIENTS[sub];
  return CLIENTS.pulsefest;                        // default / sales demo
}

/* Returns the resolved client SLUG string (not the config object). Used to
   scope every storage key by client so one event's photos never leak into
   another's. Mirrors resolveClient()'s selection logic exactly. */
function resolveSlug(){
  const override = new URLSearchParams(location.search).get("client");
  if(override && CLIENTS[override]) return override;
  const sub = location.hostname.split(".")[0];
  if(CLIENTS[sub]) return sub;
  return "pulsefest";                             // default / sales demo
}
