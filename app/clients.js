/* =========================================================================
   VENU — white-label event platform · thevenu.app
   ---------------------------------------------------------------------
   CLIENT REGISTRY. Keyed by subdomain: tomferry.thevenu.app loads CLIENTS
   .tomferry. Wildcard DNS (*.thevenu.app) means adding a client is a new
   entry here — no DNS change, no redeploy target.

   In production this object becomes a Firestore lookup by hostname; the
   shape stays identical, so nothing below this block changes.
   Schedule & speaker data below are SAMPLE placeholders.
   ========================================================================= */
const CLIENTS = {};

CLIENTS.tomferry = {
  brand: {
    kicker: "Tom Ferry",
    name: "Success Summit '26",
    venue: "Anaheim Convention Center",
    accent: "#E4032E",
    gold: "#F2B01E",
    displayCaption: "SUMMIT FAN CAM",
    displaySub: "Submit yours in the event app"
  },
  features: { schedule:true, speakers:true, sponsors:true, photoWall:true },
  days: [
    { label:"Mon 8/3", slots:[
      { time:"8:00",  title:"Doors + registration", who:"Main lobby", kind:"open" },
      { time:"9:00",  title:"Opening keynote", who:"Tom Ferry · Main stage", kind:"main" },
      { time:"11:00", title:"Market outlook panel", who:"Guest speakers (sample)", kind:"panel" },
      { time:"12:30", title:"Lunch + expo floor", who:"Visit sponsor booths", kind:"break" },
      { time:"2:00",  title:"Listing strategies workshop", who:"Sample session", kind:"session" },
      { time:"4:30",  title:"Day 1 close + fan cam break", who:"Main stage screens", kind:"main" }
    ]},
    { label:"Tue 8/4", slots:[
      { time:"9:00",  title:"Morning keynote", who:"Main stage (sample)", kind:"main" },
      { time:"10:45", title:"Marketing & scripts intensive", who:"Sample session", kind:"session" },
      { time:"12:30", title:"Lunch + expo floor", who:"Sponsor spotlight rotation", kind:"break" },
      { time:"2:00",  title:"Team scaling breakout", who:"Sample session", kind:"session" },
      { time:"4:30",  title:"Day 2 close + fan cam break", who:"Main stage screens", kind:"main" }
    ]},
    { label:"Wed 8/5", slots:[
      { time:"9:00",  title:"Final day keynote", who:"Main stage (sample)", kind:"main" },
      { time:"11:00", title:"Action planning session", who:"Sample session", kind:"session" },
      { time:"1:00",  title:"Closing + send-off", who:"Tom Ferry · Main stage", kind:"main" }
    ]}
  ],
  speakers: [
    { name:"Tom Ferry", role:"Host · Keynote" },
    { name:"Sample Speaker", role:"Guest keynote (placeholder)" },
    { name:"Sample Panelist", role:"Market outlook panel (placeholder)" },
    { name:"Sample Trainer", role:"Workshop lead (placeholder)" }
  ],
  sponsors: [
    { tier:"Title sponsors", items:[
      { name:"PalmAgent", booth:"Booth 101 · Closing cost tech", url:"#" },
      { name:"Sample Co", booth:"Booth 102 · Placeholder", url:"#" }
    ]},
    { tier:"Expo partners", items:[
      { name:"Sample Partner A", booth:"Booth 210", url:"#" },
      { name:"Sample Partner B", booth:"Booth 214", url:"#" },
      { name:"Sample Partner C", booth:"Booth 220", url:"#" }
    ]}
  ]
};

/* --- Second client: proves the same codebase reskins entirely from config.
       Live at: harborgala.thevenu.app  ·  preview here with ?client=harborgala --- */
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
   tomferry.thevenu.app  → CLIENTS.tomferry
   harborgala.thevenu.app → CLIENTS.harborgala
   Local/preview fallback: ?client=harborgala
   ========================================================================= */
function resolveClient(){
  const override = new URLSearchParams(location.search).get("client");
  if(override && CLIENTS[override]) return CLIENTS[override];
  const host = location.hostname;                 // e.g. tomferry.thevenu.app
  const sub = host.split(".")[0];
  if(CLIENTS[sub]) return CLIENTS[sub];
  return CLIENTS.tomferry;                        // default / sales demo
}
