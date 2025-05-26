// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAGOzqKIhd5rStoszL135j-RsxdRhYluaY",
//   authDomain: "spaceyapp-7c7f1.firebaseapp.com",
//   projectId: "spaceyapp-7c7f1",
//   storageBucket: "spaceyapp-7c7f1.firebasestorage.app",
//   // storageBucket: "spaceyapp-7c7f1.appspot.com",
//   messagingSenderId: "696302679606",
//   appId: "1:696302679606:web:e5b346f3a6cfd74700ca97",
//   measurementId: "G-JT4H8MY7VM"
// };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // This is optional
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
// export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider(); 
export const db = getFirestore(app);
export const storage = getStorage(app);