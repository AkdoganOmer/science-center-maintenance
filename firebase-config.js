// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBJ6H3FfBCkE8sxXXLF_Z8nFHxNz1K_5Zk",
  authDomain: "science-center-maintenance.firebaseapp.com",
  projectId: "science-center-maintenance",
  storageBucket: "science-center-maintenance.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

// Firebase'i başlat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Zaten başlatılmışsa, mevcut örneği kullan
}

// Servisleri başlat
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Global olarak kullanılabilir yap
window.db = db;
window.storage = storage;
window.auth = auth;




