// 0xrex Firebase Configuration
// Replace these values with your Firebase project config
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBNeE4bFm1POKhKNKP0a8z6xdq_HEjw9E0",
  authDomain: "xrex-50edf.firebaseapp.com",
  projectId: "xrex-50edf",
  storageBucket: "xrex-50edf.firebasestorage.app",
  messagingSenderId: "702755174692",
  appId: "1:702755174692:web:4be28ae095b3b3b8dc1bb1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
