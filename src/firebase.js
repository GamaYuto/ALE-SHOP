import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxMaAw4SEBSe0epUdkxOq6gnIOsyvW4sU",
  authDomain: "ale-shop-7b472.firebaseapp.com",
  projectId: "ale-shop-7b472",
  storageBucket: "ale-shop-7b472.firebasestorage.app",
  messagingSenderId: "1002028648365",
  appId: "1:1002028648365:web:a7f0f68a38714c07bb4324",
  measurementId: "G-TZPG0LJETY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usar en otros archivos
export const db = getFirestore(app);
export const auth = getAuth(app);
