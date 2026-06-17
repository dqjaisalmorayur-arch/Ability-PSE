import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  arrayUnion,
  Timestamp 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  projectId: "invertible-window-l7854",
  appId: "1:32898688530:web:089b83f6cedbba89231acb",
  apiKey: "AIzaSyCkK30JGl55Wa37y32-Jes3uPPohh1f280",
  authDomain: "invertible-window-l7854.firebaseapp.com",
  storageBucket: "invertible-window-l7854.firebasestorage.app",
  messagingSenderId: "32898688530"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
const db = getFirestore(app, "ai-studio-6702233a-24ab-437b-9715-a1df06bc5ed6");

// Initialize Auth
const auth = getAuth(app);

export { 
  app, 
  db, 
  auth, 
  signInAnonymously, 
  onAuthStateChanged,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  arrayUnion,
  Timestamp 
};
export type { User };
