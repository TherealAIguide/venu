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
    name: "53rd & Last Chili Cookoff",
    venue: "Southfork Ranch · Parker, TX",
    accent: "#E51D23",
    gold: "#F9B612",
    displayCaption: "53RD & LAST CHILI COOKOFF",
    displaySub: "Share your bowl — it could hit the big screen"
  },

  /* Branded opening — high visibility moment before the app shell.
     "& Last" every year — that's the bit, and the 52nd kept it going. */
  splash: {
    kicker: "SOUTHWEST PRESENTS",
    title: ["53RD & LAST", "CHILI COOKOFF"],
    date: "SAT · NOV 14 · SOUTHFORK RANCH",
    sub: "Every department sent its champion. One bowl leaves Southfork with the Final Ladle.",
    /* mascots: true — re-enable when the real pepper art arrives */
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

  /* Photo-wall copy — this event has no "fan cam"; it's photos from
     around the ranch. Organizers pre-load prep-day shots before doors so
     the big-screen loop is never empty. */
  wall: {
    title: "Photos",
    tag: "Around the ranch",
    ctaTitle: "Moments fly free.",
    ctaSub: "Capture the day with your Cohearts — the best shots rotate on the big screen and land in the feed below.",
    btn: "Take or choose a photo"
  },

  /* Insider nuggets — rotating one-liners on Now. Gentle nods only:
     employees know every reference; nothing that stings. */
  quips: [
    "Bags fly free. Tasting notes always will.",
    "Open seating at every booth — one last time, for old times' sake.",
    "Est. 1971: Dallas, Houston, San Antonio. Today: chili, chili, chili.",
    "Herb always said the business of business is people. Today it's people holding bowls.",
    "The 52nd was the last one. So is this one.",
    "Bingo proceeds go to the Coheart Relief Fund. The Adult grilled cheese goes to you.",
    "53 cookoffs. Zero middle seats."
  ],

  /* polls / scavenger / venueMap are loaded from /modules by the loader;
     schedule + photoWall render from the legacy shell. */
  features: { schedule:true, speakers:false, sponsors:false, photoWall:true,
              polls:true, scavenger:true, venueMap:true },
  tabOrder: ["home","polls","venueMap","wall","schedule"],   /* hunt lives inside the map page */

  /* Schedule mirrors the real 52nd's run of show: 10–3, bingo 11–1:30 in
     Oil Barrons (benefits the Coheart Relief Fund), winners announced
     2:00 in the Oil Barrons Ballroom. Free tastings all day. */
  days: [
    { label:"Sat 11/14", slots:[
      { time:"10:00", title:"Gates open — check-in & first tastings", who:"Event check-in", kind:"open", status:"DEPARTED" },
      { time:"10:30", title:"Chili tents open — all 10 departments", who:"Chili tents", kind:"session", status:"BOARDING" },
      { time:"11:00", title:"Bingo (cash only · benefits Coheart Relief Fund)", who:"Oil Barrons Ballroom", kind:"session", status:"ON TIME" },
      { time:"11:30", title:"Live music — The Jet Bridge Trio (sample)", who:"Lawn stage", kind:"session", status:"ON TIME" },
      { time:"12:00", title:"Bounce houses, face painting & petting zoo", who:"Activity field", kind:"break", status:"DELAYED" },
      { time:"12:30", title:"Mansion tours", who:"The Ewing Mansion", kind:"break", status:"ON TIME" },
      { time:"1:00",  title:"Chef's Choice — judges' blind tasting", who:"Judging booth · Lone Star", kind:"session", status:"ON TIME" },
      { time:"1:30",  title:"People's Choice + Showmanship voting closes", who:"Right here in the app", kind:"main", status:"FINAL CALL" },
      { time:"2:00",  title:"WINNERS ANNOUNCED — the Final Ladle", who:"Oil Barrons Ballroom", kind:"main", status:"ON TIME" },
      { time:"3:00",  title:"Last call — the 53rd & Last departs", who:"All over the ranch", kind:"main", status:"ON TIME" }
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
    /* mascots: true — re-enable when the real pepper art arrives */
    id: "peoples-choice-2026",
    title: "Cast your vote.",
    resultsTitle: "Live from Chili Row.",
    sub: "Ten departments held their own cookoffs to pick a champion. These are the winners — and you get one vote.",
    closes: "Voting doors close at 1:30 — no standbys. Winners announced at 2:00 in the Oil Barrons Ballroom.",
    /* Category awards. Showmanship is a REAL official award (best themed
       booth, voted by phone — i.e., right here); Chef's Choice is the
       judges' blind tasting and isn't voted in-app. The other two are
       unofficial and deeply important. One pick per device per category. */
    superlatives: {
      title: "More trophies.",
      sub: "Showmanship is an official award — best themed booth experience, decided by you. The other two are unofficial, but the winners will absolutely put them on a shelf.",
      cats: [
        { id:"showmanship", title:"Showmanship",          sub:"Best themed booth experience · official award" },
        { id:"payload",     title:"Heaviest Payload",     sub:"Biggest portions. Structural limits tested." },
        { id:"snack",       title:"Best In-Flight Snack", sub:"Fixin's & sides division (unofficial)" }
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
    prize: "Got all 7? Show your journal at event check-in to enter the Final Ladle raffle.",
    prizeCode: "LADLE CHAMP",
    shareCta: "Share your favorite to the Photo wall",
    stops: [
      { id:"pinata",   name:"The Giant Chili Piñata", task:"Snap it swinging over the entrance.",                        x:62,  y:360 },
      { id:"longhorn", name:"The Longhorns",          task:"Southfork's actual residents. Respectful distance.",         x:296, y:340 },
      { id:"mansion",  name:"The Ewing Mansion",      task:"Fit the whole mansion in one shot.",                         x:322, y:258 },
      { id:"petting",  name:"The Petting Zoo",        task:"You + a goat. Goat must be visible.",                        x:224, y:243 },
      { id:"judging",  name:"The Judging Booth",      task:"Catch a judge mid-blind-taste. Bonus points for the face.",  x:150, y:165 },
      { id:"bounce",   name:"The Bounce Houses",      task:"Full chaos, mid-air preferred.",                             x:150, y:230 },
      { id:"bingo",    name:"Bingo at Oil Barrons",   task:"A winning card — or a dramatic near-miss.",                  x:62,  y:120 }
    ]
  },

  /* ---- MODULE CONFIG: venue map (viewBox coordinates, 375×520) ----
     Laid out to match the REAL Southfork event map from the 52nd:
     ballrooms NW (Oil Barrons = bingo; Lone Star = concessions, bar,
     judging booth, restrooms), event check-in below them, chili tents SW,
     mansion + pastures east, entrance at the south. Swap in the real map
     image later — same coordinate system, image under the pins. ---- */
  /* THE REAL MAP: southfork-map.jpg is the actual venue map from the
     event site, layered under the pins. Coordinates are in its space
     (viewBox 375×385). Chili booth pins are smaller (r:7) to fit the
     tents zone at true scale — the map zooms on tap anyway. */
  map: {
    tabLabel: "Map",
    title: "Find your way.",
    sub: "The real Southfork map — hunt finds light up on it as you snap them.",
    img: "southfork-map.jpg",
    w: 375, h: 385,
    areas: [],
    points: [
      { id:"c1",  x:88,  y:300, t:"chili", r:7, l:"C1 · Flight Ops",          d:"Turbulence in a Bowl" },
      { id:"c2",  x:88,  y:314, t:"chili", r:7, l:"C2 · Inflight",            d:"Cabin Pressure" },
      { id:"c3",  x:88,  y:328, t:"chili", r:7, l:"C3 · Tech Ops",            d:"Wrench-Turner Red" },
      { id:"c4",  x:88,  y:342, t:"chili", r:7, l:"C4 · Ground Ops",          d:"Ramp Heat Advisory" },
      { id:"c5",  x:88,  y:356, t:"chili", r:7, l:"C5 · Customer Care",       d:"Hold-Time Habanero" },
      { id:"c6",  x:168, y:300, t:"chili", r:7, l:"C6 · Network Ops Control", d:"Storm Cell Smoke" },
      { id:"c7",  x:168, y:314, t:"chili", r:7, l:"C7 · People Dept",         d:"Culture Club Verde" },
      { id:"c8",  x:168, y:328, t:"chili", r:7, l:"C8 · Marketing",           d:"Brand Heat" },
      { id:"c9",  x:168, y:342, t:"chili", r:7, l:"C9 · Technology",          d:"404: Mild Not Found" },
      { id:"c10", x:168, y:356, t:"chili", r:7, l:"C10 · Finance",            d:"The Bean Counter" },
      { id:"chk", x:72,  y:183, t:"fun",   r:9, l:"Event check-in",           d:"Scan your barcode · hunt raffle here too" },
      { id:"w1",  x:117, y:216, t:"water", r:9, l:"Water station",            d:"Free refills all day" },
      { id:"bar", x:127, y:273, t:"food",  r:9, l:"Bar",                      d:"Complimentary drinks · ID required" },
      { id:"con", x:115, y:110, t:"food",  r:9, l:"Concessions — Lone Star",  d:"Grilled cheese, pizza, nachos, dogs, tenders · $6–16" },
      { id:"bng", x:75,  y:133, t:"fun",   r:9, l:"Bingo — Oil Barrons",      d:"11:00–1:30 · cash only · benefits Coheart Relief Fund" },
      { id:"jdg", x:172, y:152, t:"fun",   r:9, l:"Judging booth — Lone Star",d:"Chef's Choice blind tasting at 1:00" },
      { id:"inf", x:164, y:238, t:"fun",   r:9, l:"Bounce houses",            d:"Face painting nearby · kid chaos guaranteed" },
      { id:"pet", x:210, y:257, t:"fun",   r:9, l:"Petting zoo",              d:"Goats with strong opinions" },
      { id:"tou", x:302, y:288, t:"photo", r:9, l:"Mansion tours",            d:"The classic Southfork shot" },
      { id:"lng", x:280, y:328, t:"photo", r:9, l:"The Longhorns",            d:"Real residents. Respectful distance." },
      { id:"vis", x:29,  y:84,  t:"fun",   r:9, l:"Visitors Center",          d:"Southfork history + gift shop" },
      { id:"wc1", x:82,  y:241, t:"wc",    r:9, l:"Restrooms — field",        d:"Also inside Lone Star Ballroom" },
      { id:"wc2", x:177, y:322, t:"wc",    r:9, l:"Restrooms — chili tents",  d:"East side of the tents" },
      { id:"med", x:44,  y:180, t:"med",   r:9, l:"First aid",                d:"Marked day-of — ask at event check-in" }
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
