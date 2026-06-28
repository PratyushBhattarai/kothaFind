import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWfuuMqmA57OuM9XsON7j0--Tz6VN-jLs",
  authDomain: "kothafind-44dfc.firebaseapp.com",
  projectId: "kothafind-44dfc",
  storageBucket: "kothafind-44dfc.firebasestorage.app",
  messagingSenderId: "913183163903",
  appId: "1:913183163903:web:5c3afde5f39088014f13ca",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();