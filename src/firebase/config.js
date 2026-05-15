import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyB3GqzV0SCvYx3ZCPubg9k54NdKmJj8QkI",
  authDomain: "planejamento-ea0ca.firebaseapp.com",
  projectId: "planejamento-ea0ca",
  storageBucket: "planejamento-ea0ca.firebasestorage.app",
  messagingSenderId: "1017840994323",
  appId: "1:1017840994323:web:5cabe4f96257f8741b97e6",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()