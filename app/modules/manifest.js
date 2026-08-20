/* =========================================================================
   VENU MODULE CATALOG — single source of truth for module metadata + dev
   status. Shared by the builder portal (status/pricing) and the app loader
   (which module files to pull in for a given client config).
   status: live | beta | planned | roadmap
   ========================================================================= */
const VENU_MODULES = [
  // Core
  { id:"schedule",  file:"schedule.js",   cat:"Core",        name:"Schedule & agenda",   status:"live",    requires:[] },
  { id:"speakers",  file:"speakers.js",   cat:"Core",        name:"Speaker profiles",    status:"live",    requires:["schedule"] },
  { id:"announce",  file:"announce.js",   cat:"Core",        name:"Announcements",       status:"planned", requires:[] },
  { id:"venueMap",  file:"venue-map.js",  cat:"Core",        name:"Venue map + search",  status:"beta",    requires:[] },
  { id:"geofence",  file:"geofence.js",   cat:"Core",        name:"Geo-fenced alerts",   status:"planned", requires:[] },

  // Networking
  { id:"profiles",  file:"profiles.js",   cat:"Networking",  name:"Attendee directory",  status:"planned", requires:[] },
  { id:"connect",   file:"connect.js",    cat:"Networking",  name:"Tap-to-connect cards",status:"planned", requires:["profiles"] },
  { id:"meetups",   file:"meetups.js",    cat:"Networking",  name:"Meetups & groups",    status:"planned", requires:["profiles"] },

  // Engagement
  { id:"photoWall", file:"photo-wall.js", cat:"Engagement",  name:"Photo wall / fan cam",status:"live",    requires:["moderation"] },
  { id:"geoPhoto",  file:"geo-photo.js",  cat:"Engagement",  name:"Geo-fenced photo ops",status:"planned", requires:["photoWall"] },
  { id:"qa",        file:"qa.js",         cat:"Engagement",  name:"Live Q&A",            status:"planned", requires:["moderation"] },
  { id:"polls",     file:"polls.js",      cat:"Engagement",  name:"Live polls",          status:"beta",    requires:[] },
  { id:"trivia",    file:"trivia.js",     cat:"Engagement",  name:"Trivia / games",      status:"planned", requires:[] },
  { id:"scavenger", file:"scavenger.js",  cat:"Engagement",  name:"Scavenger hunt",      status:"beta",    requires:[] },
  { id:"lightShow", file:"light-show.js", cat:"Engagement",  name:"Screen light show",   status:"planned", requires:[] },
  { id:"lyrics",    file:"lyrics.js",     cat:"Engagement",  name:"Singalong lyrics",    status:"planned", requires:[] },
  { id:"raffle",    file:"raffle.js",     cat:"Engagement",  name:"Raffle / prize drawing",status:"planned", requires:[] },
  { id:"mic",       file:"mic.js",        cat:"Engagement",  name:"Audience mic",        status:"roadmap", requires:["moderation"] },

  // Revenue
  { id:"sponsors",  file:"sponsors.js",   cat:"Revenue",     name:"Sponsor spotlight",   status:"live",    requires:[] },
  { id:"leadCap",   file:"lead-capture.js",cat:"Revenue",    name:"Sponsor lead capture",status:"planned", requires:["sponsors"] },
  { id:"offers",    file:"offers.js",     cat:"Revenue",     name:"In-app offers",       status:"planned", requires:["sponsors"] },
  { id:"vendors",   file:"vendors.js",    cat:"Revenue",     name:"Vendor hub",          status:"planned", requires:["moderation"] },
  { id:"tickets",   file:"tickets.js",    cat:"Revenue",     name:"Tickets & VIP badges",status:"planned", requires:[] },
  { id:"merch",     file:"merch.js",      cat:"Revenue",     name:"Merch store",         status:"planned", requires:[] },
  { id:"food",      file:"food.js",       cat:"Revenue",     name:"Food & trucks",       status:"planned", requires:[] },
  { id:"donate",    file:"donate.js",     cat:"Revenue",     name:"Giving / pledge",     status:"planned", requires:[] },
  { id:"auction",   file:"auction.js",    cat:"Revenue",     name:"Live auction",        status:"planned", requires:[] },

  // Branding
  { id:"splash",    file:"splash.js",     cat:"Branding",    name:"Custom splash screen",status:"beta",    requires:[] },  // rendered by app.js from client.splash config
  { id:"domain",    file:"domain.js",     cat:"Branding",    name:"Custom domain",       status:"live",    requires:[] },

  // Operations
  { id:"moderation",file:"moderation.js", cat:"Operations",  name:"Moderation dashboard",status:"live",    requires:[] },
  { id:"bigScreen", file:"big-screen.js", cat:"Operations",  name:"Big screen display",  status:"live",    requires:[] },
  { id:"qrKit",     file:"qr-kit.js",     cat:"Operations",  name:"QR launch kit",       status:"live",    requires:[] },
  { id:"analytics", file:"analytics.js",  cat:"Operations",  name:"Post-event analytics",status:"planned", requires:[] },
];

if (typeof module !== "undefined" && module.exports) module.exports = { VENU_MODULES };
if (typeof window !== "undefined") window.VENU_MODULES = VENU_MODULES;
