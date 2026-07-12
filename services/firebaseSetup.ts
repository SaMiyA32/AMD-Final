import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseSetup = {
  apiKey: "AIzaSyDpA7ns4Jqct9OIXIzI3Md534snO0OG5_g",
  authDomain: "crystal-clear-cleaning-c90d1.firebaseapp.com",
  projectId: "crystal-clear-cleaning-c90d1",
  storageBucket: "crystal-clear-cleaning-c90d1.firebasestorage.app",
  messagingSenderId: "367769653513",
  appId: "1:367769653513:web:f3e1f831b0d2bf9c0883d8"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseSetup);
}

export const auth = firebase.auth();
export const firestoreDB = firebase.firestore();
console.log('--- FIREBASE CONFIG INITIALIZED ---');
console.log('auth:', !!auth);
console.log('firestoreDB:', !!firestoreDB, typeof firestoreDB?.collection);
