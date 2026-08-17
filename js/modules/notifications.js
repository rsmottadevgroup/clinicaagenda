/* ============================================================
   NOTIFICATIONS.JS
   Integração com Firebase Cloud Messaging: solicita permissão,
   obtém o token do dispositivo, salva no Supabase e envia
   notificações de novos agendamentos.

   IMPORTANTE: o envio real do push (server-side) precisa de uma
   Cloud Function ou Edge Function que use a Firebase Admin SDK
   com sua chave de serviço — isso NÃO pode rodar no frontend por
   segurança. Veja /database/edge-function-exemplo.md no README.
   Depende de: config/firebase-config.js, config/supabase-config.js
   ============================================================ */

const Notifications = {
  messaging: null,

  /** Solicita permissão do navegador e registra o token FCM do usuário logado */
  async iniciar(usuarioId) {
    if (!window.firebase || !firebase.messaging) {
      console.warn("Firebase Messaging não carregado.");
      return;
    }
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") return;

      this.messaging = firebase.messaging();
      const token = await this.messaging.getToken({ vapidKey: window.FCM_VAPID_KEY });

      if (token) {
        await window.db.from("notificacoes_tokens").upsert(
          { usuario_id: usuarioId, token, atualizado_em: new Date().toISOString() },
          { onConflict: "usuario_id,token" }
        );
      }

      // Notificação recebida com o app aberto em primeiro plano
      this.messaging.onMessage((payload) => {
        showToast(payload.notification?.body || "Nova notificação", "info");
      });
    } catch (err) {
      console.error("Erro ao iniciar notificações:", err);
    }
  },

  /**
   * Registra a solicitação de agendamento na tabela "notificacoes".
   * Um trigger/Edge Function no Supabase (ver database/schema.sql)
   * é responsável por efetivamente disparar o push ao administrador.
   */
  async notificarNovoAgendamento(agendamento) {
    try {
      await window.db.from("notificacoes").insert({
        tipo: "novo_agendamento",
        agendamento_id: agendamento.id,
        titulo: "Novo agendamento solicitado",
        mensagem: `Data: ${agendamento.data} às ${agendamento.horario}`,
        lida: false
      });
    } catch (err) {
      console.error("Erro ao registrar notificação:", err);
    }
  }
};

window.Notifications = Notifications;
