// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBDHm3JrMzyLgQM9pJGHQuWigA5hA-TbA",
  authDomain: "chaintracer-16381.firebaseapp.com",
  projectId: "chaintracer-16381",
  storageBucket: "chaintracer-16381.firebasestorage.app",
  messagingSenderId: "361844745988",
  appId: "1:361844745988:web:b96dfb784b481f92789251",
  measurementId: "G-88BBVFL5YV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
