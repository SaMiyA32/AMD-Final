import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseSetup = {
  apiKey: "AIzaSyDpA7ns4Jqct9OIXIzI3Md534snO0OG5_g",
  authDomain: "crystal-clear-cleaning-c90d1.firebaseapp.com",
  projectId: "crystal-clear-cleaning-c90d1",
  storageBucket: "crystal-clear-cleaning-c90d1.firebasestorage.app",
  messagingSenderId: "367769653513",
  appId: "1:367769653513:web:f3e1f831b0d2bf9c0883d8"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseSetup) : getApp();

// Initialize Firebase Authentication for Web
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);
