// Import the functions you need from the SDKs you need
import {initializeApp, getApp, getApps} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCi7miUqeBXhW9H7w78kq7-41uXxZplito",
  authDomain: "mockly-bdd47.firebaseapp.com",
  projectId: "mockly-bdd47",
  storageBucket: "mockly-bdd47.appspot.app",
  messagingSenderId: "701542325256",
  appId: "1:701542325256:web:c0d3d036f754d5837045bd",
  measurementId: "G-9JE2E7GH3F"
};
console.log(firebaseConfig.projectId);


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);


