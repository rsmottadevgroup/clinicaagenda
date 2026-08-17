/* ============================================================
   FIREBASE-CONFIG.JS
   Configuração do Firebase Cloud Messaging (push notifications).
   >>> SUBSTITUA pelos dados do SEU projeto Firebase
   (Project Settings > General > Your apps > Web app). <<<
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCBSAk2QNADHHAyg_hQfXzXXghCj6EzC8o",
  authDomain: "clinicadrluana.firebaseapp.com",
  projectId: "clinicadrluana",
  storageBucket: "clinicadrluana.firebasestorage.app",
  messagingSenderId: "346469890796",
  appId: "1:346469890796:web:970481af82407632efc3c9"
};

// Chave VAPID pública, gerada em: Project Settings > Cloud Messaging > Web Push certificates
const FCM_VAPID_KEY = "BPD5ZieX8ZIzsrCbgLUTYgRMwvcbUs1OuSau1VC7lDO6HSVDoveWt8tfrJRtg5QV386qIGlVETW4-b-oFKUuqZU";

// Inicializa o Firebase apenas se o SDK estiver carregado (evita erro em páginas sem push)
if (window.firebase) {
  firebase.initializeApp(firebaseConfig);
}

window.FIREBASE_CONFIG = firebaseConfig;
window.FCM_VAPID_KEY = FCM_VAPID_KEY;


// Import the functions you need from the SDKs you need import { initializeApp } from "firebase/app";
//  // TODO: Add SDKs for Firebase products that you want to use 
// // https://firebase.google.com/docs/web/setup#available-libraries 
// // Your web app's Firebase configuration const firebaseConfig = { apiKey: "AIzaSyCBSAk2QNADHHAyg_hQfXzXXghCj6EzC8o", authDomain: "clinicadrluana.firebaseapp.com", 
// projectId: "clinicadrluana", storageBucket: "clinicadrluana.firebasestorage.app", messagingSenderId: "346469890796", appId: "1:346469890796:web:970481af82407632efc3c9" };
//  // Initialize Firebase const app = initializeApp(firebaseConfig);
 //web push = BPD5ZieX8ZIzsrCbgLUTYgRMwvcbUs1OuSau1VC7lDO6HSVDoveWt8tfrJRtg5QV386qIGlVETW4-b-oFKUuqZU