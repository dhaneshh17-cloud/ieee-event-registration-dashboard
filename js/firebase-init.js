// firebase-init.js
// TO MAKE THIS A PRODUCTION APP:
// 1. Go to console.firebase.google.com and create a project
// 2. Enable Firestore Database
// 3. Replace the placeholder config below with your actual Firebase config object

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase only if the user has replaced the dummy config
window.isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

if (window.isFirebaseConfigured) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized Successfully.");
  } catch (err) {
    console.error("Firebase initialization error:", err);
    window.isFirebaseConfigured = false;
  }
} else {
  console.warn("Firebase is not configured. Falling back to LocalStorage. Please update js/firebase-init.js to connect to a real database.");
}
