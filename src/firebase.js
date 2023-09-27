import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this import
import "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDqpDfJwoRCG0iH2DCXq5zNV2VNXjLeXV4",
  authDomain: "quora-iitm.firebaseapp.com",
  projectId: "quora-iitm",
  storageBucket: "quora-iitm.appspot.com",
  messagingSenderId: "120324268288",
  appId: "1:120324268288:web:b8791f66411198fb1153e5",
  measurementId: "G-TCGTF5S6GT"
};

// Initialize Firebase
//const firebaseapp = firebase.initializeApp(firebaseConfig)
const app = initializeApp(firebaseConfig);
const auth = getAuth()
const provider = new GoogleAuthProvider()
const db = getFirestore(app); 
export { auth, provider }
export default db