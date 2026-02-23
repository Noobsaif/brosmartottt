import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2YJ19IlYVa2strLdNiZnCNhSaOE_DTdQ",
  authDomain: "brosmartott.firebaseapp.com",
  projectId: "brosmartott",
  storageBucket: "brosmartott.firebasestorage.app",
  messagingSenderId: "983715013856",
  appId: "1:983715013856:web:fa9fda4b8a63247d829c85"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
