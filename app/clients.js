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
  theme: "pulse",
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
  theme: "gala",
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

/* --- Client C: SOUTHWEST — THE LAST CHILI COOKOFF (prototype pitch build).
       Live at: southwestchili.thevenu.app  ·  preview with ?client=southwestchili
       First client to exercise the module loader: polls (chili vote),
       scavenger (hunt), venueMap (map + booth finder) load from /modules,
       plus the branded splash. Southwest-INSPIRED palette (bold blue
       #304CB2 · warm red #E51D23 · sunrise yellow #F9B612) — real brand
       assets get swapped in after client review. Department names are real
       SWA departments; chili names, schedule, codes and map are SAMPLE data
       for the demo. ~25k attendees expected: see notes in each module about
       what changes at that scale. --- */
CLIENTS.southwestchili = {
  theme: "chili",
  oneDay: true,   /* single-day event: no day pill, just the pulsing LIVE chip */
  brand: {
    kicker: "Southwest · Nov 14",
    name: "The Last Chili Cookoff",
    venue: "Southfork Ranch · Parker, TX",
    accent: "#E51D23",
    gold: "#F9B612",
    displayCaption: "THE LAST CHILI COOKOFF",
    displaySub: "Share your bowl — it could hit the big screen"
  },

  /* Branded opening — high visibility moment before the app shell. */
  splash: {
    kicker: "SOUTHWEST PRESENTS",
    title: ["THE LAST", "CHILI COOKOFF"],
    date: "SAT · NOV 14 · SOUTHFORK RANCH",
    sub: "Every department sent its champion. One bowl leaves Southfork with the Final Ladle.",
    cta: "Let's dig in"
  },

  /* Post-splash check-in moment: welcome them, grab a selfie that rides
     along with their vote + shared photos — and issues their boarding
     pass. Also the on-ramp to the wall. */
  welcome: {
    title: "Welcome to Southfork.",
    sub: "You made it to the last one. Snap a check-in pic and we'll issue your boarding pass — it rides along with your vote and anything you share today.",
    cta: "Snap my check-in pic",
    skip: "Maybe later",
    afterTitle: "You're checked in.",
    after: "Boarding pass issued. Share shots all day in the Photos tab — the best ones hit the big screen."
  },

  /* Aviation layer: boarding pass, departures-board schedule, flyby
     moments, "now boarding" copy. This is the Southwest of it all. */
  aviation: {
    flight: "LUV1114",
    from: "DAL", fromCity: "Dallas Love",
    to: "SFR",  toCity: "Southfork Ranch",
    nowLabel: "Now boarding",
    passNote: "Open seating — everyone boards Group A today. One last time, for old times' sake.",
    castTitle: "Cleared for takeoff.",
    castSub: "Your vote is wheels up. Results are live."
  },
  departures: true,   /* schedule renders as a departures board */

  /* Insider nuggets — rotating one-liners on Now. Gentle nods only:
     employees know every reference; nothing that stings. */
  quips: [
    "Bags fly free. Tasting notes always will.",
    "Open seating at every booth — one last time, for old times' sake.",
    "Est. 1971: Dallas, Houston, San Antonio. Today: chili, chili, chili.",
    "Herb always said the business of business is people. Today it's people holding bowls.",
    "This is your captain speaking: the cornbread is to your left.",
    "25 years of cookoffs. Zero middle seats."
  ],

  /* polls / scavenger / venueMap are loaded from /modules by the loader;
     schedule + photoWall render from the legacy shell. */
  features: { schedule:true, speakers:false, sponsors:false, photoWall:true,
              polls:true, scavenger:true, venueMap:true },
  tabOrder: ["home","polls","venueMap","wall","schedule"],   /* hunt lives inside the map page */

  days: [
    { label:"Sat 11/14", slots:[
      { time:"11:00", title:"Gates open — first tastings", who:"Main gate", kind:"open", status:"DEPARTED" },
      { time:"11:30", title:"Chili Row opens — all 10 departments", who:"Chili Row", kind:"session", status:"BOARDING" },
      { time:"12:00", title:"Live band — The Jet Bridge Trio (sample)", who:"Main stage · Mansion lawn", kind:"session", status:"ON TIME" },
      { time:"12:30", title:"Kids' corral games", who:"The Mild Side", kind:"break", status:"DELAYED" },
      { time:"1:00",  title:"Judges' tasting round", who:"Judges' tent", kind:"session", status:"ON TIME" },
      { time:"2:00",  title:"People's Choice voting closes", who:"Right here in the app", kind:"main", status:"FINAL CALL" },
      { time:"2:30",  title:"Department spirit awards", who:"Main stage", kind:"session", status:"ON TIME" },
      { time:"3:00",  title:"THE FINAL LADLE — winner announced", who:"Main stage", kind:"main", status:"ON TIME" },
      { time:"3:30",  title:"Fan cam finale + last bowl toast", who:"All over the ranch", kind:"main", status:"ON TIME" }
    ]}
  ],
  speakers: [],
  sponsors: [],

  /* ---- MODULE CONFIG: polls (the Chili Vote) ----
     Each option: img (photo of the chili/team — null renders a branded
     placeholder tile until real photos arrive), maker (the person who won
     their department's internal cookoff to rep it here), story, heat 1–5.
     Booth QR codes deep-link straight here: <event-url>/#vote            */
  polls: {
    tabLabel: "Vote",
    id: "peoples-choice-2026",
    title: "Cast your vote.",
    resultsTitle: "Live from Chili Row.",
    sub: "Ten departments held their own cookoffs to pick a champion. These are the winners — and you get one vote.",
    closes: "Voting doors close at 2:00 PM — no standbys. Winner announced at 3:00 on the main stage.",
    /* Category awards — every booth runs its own experience, so the
       superlatives give them something to win too. One pick per device
       per category. */
    superlatives: {
      title: "The Superlatives.",
      sub: "Every booth runs its own show. Crew them generously — one pick per category.",
      cats: [
        { id:"crew",    title:"Best Cabin Crew",      sub:"Friendliest booth experience on the row" },
        { id:"payload", title:"Heaviest Payload",     sub:"Biggest portions. Structural limits tested." },
        { id:"snack",   title:"Best In-Flight Snack", sub:"Cornbread, crackers & fixin's division" }
      ]
    },
    options: [
      { id:"flightops", dept:"Flight Ops",          name:"Turbulence in a Bowl", desc:"Brisket + three peppers. Fasten your seatbelt.", booth:"C1",  img:null, heat:4,
        maker:"Maria G.", makerRole:"Dispatcher · 12 yrs", story:"Beat 14 entries in the Flight Ops runoff with a brisket base she smokes overnight before every shift swap.",
        buzz:[{w:"Gate C12 crew",t:"Brisket falls apart. Beautiful."},{w:"Anon in Ops",t:"Had thirds. Zero turbulence."}] },
      { id:"inflight",  dept:"Inflight",            name:"Cabin Pressure",       desc:"Slow-simmered. Heat rises at altitude.",          booth:"C2",  img:null, heat:3,
        maker:"Devon P.", makerRole:"Flight attendant · DAL base", story:"Two-time Inflight champion. The secret is roasted hatch chiles he brings back from ABQ turns.",
        buzz:[{w:"DAL ramp",t:"The hatch chiles are doing something special."},{w:"Retiree, 28 yrs",t:"Devon does it again."}] },
      { id:"techops",   dept:"Tech Ops",            name:"Wrench-Turner Red",    desc:"Torque-tested. No beans, all business.",          booth:"C3",  img:null, heat:4,
        maker:"Big Al",   makerRole:"A&P mechanic · 23 yrs", story:"No beans. Ever. Al has strong opinions and a smoker the size of a golf cart.",
        buzz:[{w:"Hangar 3",t:"No beans and I respect the commitment."},{w:"Line check",t:"Smoke ring visible from row C."}] },
      { id:"groundops", dept:"Ground Ops",          name:"Ramp Heat Advisory",   desc:"Loaded like a full bin on a Friday.",             booth:"C4",  img:null, heat:3,
        maker:"The Ramp Crew", makerRole:"Team entry · DAL ramp", story:"A group recipe perfected during summer delay days. Loaded with everything, like a full bin on a Friday.",
        buzz:[{w:"Bag room",t:"Portions as advertised. Heavy."},{w:"Tug driver",t:"Tastes like overtime, in a good way."}] },
      { id:"custcare",  dept:"Customer Care",       name:"Hold-Time Habanero",   desc:"Worth the wait. We promise.",                     booth:"C5",  img:null, heat:5,
        maker:"Tanya W.", makerRole:"Customer Care lead", story:"Habanero-forward but somehow polite about it. Won her floor's vote three to one.",
        buzz:[{w:"Phones team",t:"Polite heat is real. It sneaks up."},{w:"Anon",t:"Cried a little. Voting for it anyway."}] },
      { id:"noc",       dept:"Network Ops Control", name:"Storm Cell Smoke",     desc:"Smoked 14 hours. Rerouted around mild.",          booth:"C6",  img:null, heat:4,
        maker:"The Storm Desk", makerRole:"Team entry · NOC", story:"Smoked for 14 hours straight — through an actual thunderstorm rerouting event.",
        buzz:[{w:"Dispatch",t:"14-hour smoke and you can tell."},{w:"WX desk",t:"Storm-rated. Confirmed."}] },
      { id:"people",    dept:"People Dept",         name:"Culture Club Verde",   desc:"Green chili, golden rule.",                       booth:"C7",  img:null, heat:2,
        maker:"Rosa M.",  makerRole:"People Dept · 8 yrs", story:"Green chile verde from her abuela's recipe. The department vote was not close.",
        buzz:[{w:"HQ 4th floor",t:"Abuela knew what she was doing."},{w:"New hire",t:"Best verde I have had in Texas."}] },
      { id:"marketing", dept:"Marketing",           name:"Brand Heat",           desc:"Bold flavor. Extremely on-message spice.",        booth:"C8",  img:null, heat:3,
        maker:"The Brand Team", makerRole:"Team entry", story:"Focus-grouped, taste-tested, and extremely on-message. The tagline took longer than the chili.",
        buzz:[{w:"Brand studio",t:"On-message AND on-flavor."},{w:"Anon",t:"The tagline is chili. The chili is good."}] },
      { id:"tech",      dept:"Technology",          name:"404: Mild Not Found",  desc:"Shipped hot. There is no rollback.",              booth:"C9",  img:null, heat:5,
        maker:"Kev C.",   makerRole:"Software engineer", story:"Iterated through eleven versions. This is v12. There is no rollback plan.",
        buzz:[{w:"Dev team",t:"v12 is stable. Spicy, but stable."},{w:"On-call",t:"Paged twice while eating. Worth it."}] },
      { id:"finance",   dept:"Finance",             name:"The Bean Counter",     desc:"Fully audited beans. Generous ROI.",              booth:"C10", img:null, heat:1,
        maker:"Norm B.",  makerRole:"Auditor · 31 yrs", story:"A conservative, well-documented chili. Every bean accounted for. Norm's beans have changed people.",
        buzz:[{w:"Audit",t:"Reviewed the beans personally. All present."},{w:"Anon CPA",t:"Conservative? Yes. Boring? No."}] }
    ]
  },

  /* ---- MODULE CONFIG: scavenger hunt ----
     Photo check-ins: snap each stop to check it off. EMBEDDED in the map
     page (embedIn) — the map is the main event, the hunt is its
     personality layer. Each stop carries map coords (x/y in the map's
     viewBox): the stop's pin is INVISIBLE on the map until they find it,
     then it pops in gold with their photo attached. Demo accepts any
     photo; production verification options (QR at station, geofence,
     staff stamp) are noted in the module. ---- */
  scavenger: {
    embedIn: "venueMap",
    title: "The hunt is on.",
    sub: "Seven photo stops hidden around the ranch. Snap one and it lights up on your map above — fill the whole thing in.",
    prize: "Got all 7? Show your journal at the merch tent to enter the Final Ladle raffle.",
    prizeCode: "LADLE CHAMP",
    shareCta: "Share your favorite to the Photo wall",
    stops: [
      { id:"pinata",    name:"The Giant Chili Piñata", task:"Snap it swinging over the main gate.",                 x:212, y:452 },
      { id:"longhorn",  name:"The Longhorn",           task:"You + Southfork's longhorn. Keep a respectful distance.", x:36,  y:288 },
      { id:"mansion",   name:"The Ewing Mansion",      task:"Fit the whole mansion in one shot.",                   x:60,  y:36  },
      { id:"cornbread", name:"Cornbread Corner",       task:"Your cornbread. Butter clearly visible.",              x:82,  y:132 },
      { id:"judges",    name:"The Judges' Tent",       task:"Catch a judge mid-bite. Bonus points for the face.",   x:228, y:92  },
      { id:"kids",      name:"The Kids' Corral",       task:"The Mild Side in full chaos.",                         x:72,  y:426 },
      { id:"merch",     name:"The Last Merch Tent",    task:"You wearing the shirt. It really is the last one.",    x:322, y:390 }
    ]
  },

  /* ---- MODULE CONFIG: venue map (viewBox coordinates, 375×520) ----
     Southfork Ranch, Parker TX — mansion lawn hosts the stage, Chili Row
     runs down the event field, main gate at the south end. ---- */
  map: {
    tabLabel: "Map",
    title: "Find your way.",
    sub: "Booths, bathrooms, cornbread — hunt finds light up as you snap them.",
    w: 375, h: 520,
    areas: [
      { x:22,  y:18,  w:118, h:64,  label:"EWING MANSION", cls:"zone" },
      { x:168, y:18,  w:184, h:56,  label:"MAIN STAGE",    cls:"stage" },
      { x:96,  y:120, w:183, h:250, label:"CHILI ROW",     cls:"row" },
      { x:22,  y:406, w:100, h:70,  label:"KIDS' CORRAL",  cls:"zone" },
      { x:140, y:480, w:95,  h:30,  label:"MAIN GATE",     cls:"door" }
    ],
    points: [
      { id:"c1",  x:120, y:150, t:"chili", l:"C1 · Flight Ops",          d:"Turbulence in a Bowl" },
      { id:"c2",  x:120, y:196, t:"chili", l:"C2 · Inflight",            d:"Cabin Pressure" },
      { id:"c3",  x:120, y:242, t:"chili", l:"C3 · Tech Ops",            d:"Wrench-Turner Red" },
      { id:"c4",  x:120, y:288, t:"chili", l:"C4 · Ground Ops",          d:"Ramp Heat Advisory" },
      { id:"c5",  x:120, y:334, t:"chili", l:"C5 · Customer Care",       d:"Hold-Time Habanero" },
      { id:"c6",  x:255, y:150, t:"chili", l:"C6 · Network Ops Control", d:"Storm Cell Smoke" },
      { id:"c7",  x:255, y:196, t:"chili", l:"C7 · People Dept",         d:"Culture Club Verde" },
      { id:"c8",  x:255, y:242, t:"chili", l:"C8 · Marketing",           d:"Brand Heat" },
      { id:"c9",  x:255, y:288, t:"chili", l:"C9 · Technology",          d:"404: Mild Not Found" },
      { id:"c10", x:255, y:334, t:"chili", l:"C10 · Finance",            d:"The Bean Counter" },
      { id:"wc1", x:36,  y:104, t:"wc",    l:"Restrooms — mansion side", d:"Just past the mansion porch" },
      { id:"wc2", x:340, y:452, t:"wc",    l:"Restrooms — main gate",    d:"Right of the gate as you enter" },
      { id:"med", x:340, y:250, t:"med",   l:"First aid",                d:"East fence line, marked with a cross" },
      { id:"w1",  x:36,  y:250, t:"water", l:"Water station — west",     d:"Free refills all day" },
      { id:"w2",  x:340, y:120, t:"water", l:"Water station — east",     d:"Free refills all day" },
      { id:"f1",  x:60,  y:150, t:"food",  l:"Cornbread Corner",         d:"Butter. So much butter." },
      { id:"f2",  x:60,  y:200, t:"food",  l:"Drinks & sweet tea",       d:"Iced tea, lemonade, sodas" },
      { id:"ph1", x:36,  y:330, t:"photo", l:"Longhorn photo op",        d:"Southfork's resident longhorn" },
      { id:"ph2", x:82,  y:50,  t:"photo", l:"Mansion porch photo op",   d:"The classic Southfork shot" },
      { id:"fun1",x:187, y:458, t:"fun",   l:"Chili piñata",             d:"Swinging over the main gate" },
      { id:"fun2",x:300, y:56,  t:"fun",   l:"Pepper Wall of Fame",      d:"25 years of past winners" },
      { id:"m1",  x:300, y:406, t:"fun",   l:"The Last Merch Tent",      d:"Shirts, pins, raffle check-in" }
    ]
  }
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
