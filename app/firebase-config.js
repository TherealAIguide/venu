/* =========================================================================
   VENU — Firebase configuration
   ---------------------------------------------------------------------
   These values are safe to expose in client code (they are not secrets).
   Access is controlled entirely by Firestore security rules, not by hiding
   this config. Project: venu-b5134.
   ========================================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyCF9rT-w7TYk6Wfxa98eWiOIEtmxleHcqs",
  authDomain: "venu-b5134.firebaseapp.com",
  projectId: "venu-b5134",
  storageBucket: "venu-b5134.firebasestorage.app",
  messagingSenderId: "945654411922",
  appId: "1:945654411922:web:9e36a534cdb0594dc4ec4b"
};

/* `var` (not const) so the binding always exists even if the Firebase CDN
   is blocked (ad-blockers, captive portals, venue wifi) — the app then runs
   in local/demo mode instead of dying on a TDZ ReferenceError. */
var db = null;
try{
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
}catch(e){
  console.warn("Venu: Firebase unavailable — running in local demo mode.", e && e.message);
}
