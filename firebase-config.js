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
  // Check if Firebase is already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase başarıyla başlatıldı');
  } else {
    firebase.app(); // If already initialized, use existing instance
  }
  
  // Get Firestore instance and make it globally available
  window.db = firebase.firestore();

} catch (error) {
  console.error('Firebase başlatma hatası:', error);
  throw error;
}




