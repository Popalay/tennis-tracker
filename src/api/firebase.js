// src/api/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Зверніть увагу: в реальному додатку ці дані повинні бути в .env файлі
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "tennistracker-9ce69.firebaseapp.com",
  projectId: "tennistracker-9ce69",
  storageBucket: "tennistracker-9ce69.firebasestorage.app",
  messagingSenderId: "183387245111",
  appId: "1:183387245111:web:a62870a61a372e7c120db2",
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
