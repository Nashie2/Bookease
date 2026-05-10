// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVdnB12ja1H-skaS41U1O6lBKOhmgbZQk",
  authDomain: "bookease-3420f.firebaseapp.com",
  projectId: "bookease-3420f",
  storageBucket: "bookease-3420f.firebasestorage.app",
  messagingSenderId: "413134184766",
  appId: "1:413134184766:web:ad13ab0f65582c06320c6f",
  measurementId: "G-ZG5Z13DMBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();