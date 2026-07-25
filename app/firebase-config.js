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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
