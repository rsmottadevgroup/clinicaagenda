/* ============================================================
   FIREBASE-MESSAGING-SW.JS
   Service Worker necessário para o Firebase Cloud Messaging
   exibir notificações quando o site está em segundo plano ou
   fechado. Deve ficar na RAIZ do projeto (mesmo nível do index.html).
   >>> Preencha com as MESMAS credenciais de config/firebase-config.js <<<
   ============================================================ */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyCBSAk2QNADHHAyg_hQfXzXXghCj6EzC8o",
  authDomain: "clinicadrluana.firebaseapp.com",
  projectId: "clinicadrluana",
  storageBucket: "clinicadrluana.firebasestorage.app",
  messagingSenderId: "346469890796",
  appId: "1:346469890796:web:970481af82407632efc3c9"
});

const messaging = firebase.messaging();

// Ao clicar na notificação, abre diretamente o painel administrativo
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Novo agendamento solicitado";
  const options = {
    body: payload.notification?.body || "",
    icon: "/assets/img/icon-192.png",
    data: { url: "/pages/admin-agendamentos.html" }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
