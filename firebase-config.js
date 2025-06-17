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
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase başarıyla başlatıldı');
  } else {
    firebase.app(); // Zaten başlatılmışsa, mevcut örneği kullan
  }

  // Servisleri başlat ve global olarak kullanılabilir yap
  window.db = firebase.firestore();
  window.auth = firebase.auth();
  window.storage = firebase.storage();

} catch (error) {
  console.error('Firebase başlatma hatası:', error);
  throw error;
}




