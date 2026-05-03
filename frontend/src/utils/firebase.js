import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Hardcoded for final submission to ensure stability
const firebaseConfig = {
  apiKey: "AIzaSyCZvZ1R3cgyCHeYLzS3x2NfCZLMwbryjD8",
  authDomain: "pollaris-election.firebaseapp.com",
  projectId: "pollaris-election",
  storageBucket: "pollaris-election.appspot.com",
  messagingSenderId: "373949436168",
  appId: "1:373949436168:web:78f161823f66c9d0979f4c",
  measurementId: "G-POLLARIS-GA"
};

// Initialize Firebase safely
let app, analytics, db, auth;

try {
  app = initializeApp(firebaseConfig);
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, analytics, db, auth };
