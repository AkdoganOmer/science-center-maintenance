// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-q-7B2IVQDRdNmUJ5K_UT-Tp2j1gZHIk",
  authDomain: "sergi-bakim-onarim.firebaseapp.com",
  projectId: "sergi-bakim-onarim",
  storageBucket: "sergi-bakim-onarim.appspot.com",
  messagingSenderId: "998277420747",
  appId: "1:998277420747:web:663a465d9e198a2fadad4e"
};

// Initialize Firebase and export db instance
let db;

async function initFirebase() {
  try {
    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    // Get Firestore instance
    db = firebase.firestore();
    
    console.log('Firebase başarıyla başlatıldı');
    return db;
  } catch (error) {
    console.error('Firebase başlatma hatası:', error);
    throw error;
  }
}

// Export the initialization function and db instance
window.initFirebase = initFirebase;
window.db = db;




