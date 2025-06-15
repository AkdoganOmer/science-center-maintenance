// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-q-7B2IVQDRdNmUJ5K_UT-Tp2j1gZHIk",
  authDomain: "sergi-bakim-onarim.firebaseapp.com",
  projectId: "sergi-bakim-onarim",
  storageBucket: "sergi-bakim-onarim.appspot.com",
  messagingSenderId: "998277420747",
  appId: "1:998277420747:web:663a465d9e198a2fadad4e"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase başarıyla başlatıldı');
} catch (error) {
  console.error('Firebase başlatma hatası:', error);
  throw error;
}

// Get Firestore instance
const db = firebase.firestore();

// Export the db instance
window.db = db;




