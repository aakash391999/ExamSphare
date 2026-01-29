import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ------------------------------------------------------------------
// IMPORTANT: REPLACE THE OBJECT BELOW WITH YOUR OWN FIREBASE CONFIG
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project
// 3. Go to Project Settings > General > "Your apps" > Add Web App
// 4. Copy the "firebaseConfig" object and paste it below
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCMLc6LtrOXS7airwiUSfZNOEbKopSOw4Q",
  authDomain: "examsphare.firebaseapp.com",
  projectId: "examsphare",
  storageBucket: "examsphare.firebasestorage.app",
  messagingSenderId: "493039988523",
  appId: "1:493039988523:web:e83bc295d031a270a45f6e",
  measurementId: "G-VBXT0840Z1"
};


// Helper to check if config is valid
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && firebaseConfig.projectId !== "your-project-id";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);