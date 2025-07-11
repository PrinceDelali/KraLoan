// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEd7RqozNXyt0qKOcEdmn7HOvrsJ9nsyQ",
  authDomain: "fintech-website-23329.firebaseapp.com",
  projectId: "fintech-website-23329",
  storageBucket: "fintech-website-23329.firebasestorage.app",
  messagingSenderId: "413690849983",
  appId: "1:413690849983:web:aea8ad46514acfdb9c340a",
  measurementId: "G-4PDREBKSMY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
