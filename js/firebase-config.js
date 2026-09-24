// ⚙️ Reemplaza estos valores con los de TU proyecto de Firebase.
// Firebase Console → ⚙️ Configuración del proyecto → General → "Tus apps" → SDK setup and configuration.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDxtvRUhXrXsKASwBC8MPZzvgfXeME2CE",
  authDomain: "bank-class-eaaca.firebaseapp.com",
  projectId: "bank-class-eaaca",
  storageBucket: "bank-class-eaaca.firebasestorage.app",
  messagingSenderId: "139196241998",
  appId: "1:139196241998:web:0895d14bf1150cb912cb1f",
  measurementId: "G-ECR6C312B9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// PIN de acceso al panel del banquero (maestro). Cámbialo por uno propio.
export const TEACHER_PIN = "2468";
