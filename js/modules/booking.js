/* ============================================================
   BOOKING.JS
   Lógica de agendamento de consultas: monta o calendário
   (FullCalendar), calcula horários disponíveis a partir da
   tabela "disponibilidade" e grava novas consultas no Supabase.
   Depende de: config/supabase-config.js, utils/toast.js, modules/auth.js
   ============================================================ */

const Booking = {
  DURACAO_PADRAO_MIN: 30,

  /** Inicializa o FullCalendar no elemento #calendar-container */
  async iniciarCalendario(onDateClick) {
    const calendarEl = document.getElementById("calendar-container");
    if (!calendarEl || !window.FullCalendar) return null;

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "pt-br",
      height: "auto",
      selectable: true,
      headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" },
      validRange: { start: new Date().toISOString().split("T")[0] },
      dateClick: async (info) => {
        const status = await this.getStatusDia(info.dateStr);
        if (status === "indisponivel") {
          showToast("A clínica não atende neste dia.", "warning");
          return;
        }
        if (status === "lotado") {
          showToast("Todos os horários deste dia já foram preenchidos.", "warning");
          return;
        }
        onDateClick(info.dateStr);
      },
      dayCellDidMount: async (arg) => {
        const status = await this.getStatusDia(arg.date.toISOString().split("T")[0]);
        if (status === "disponivel") arg.el.classList.add("fc-day-available");
        if (status === "lotado") arg.el.classList.add("fc-day-full");
        if (status === "indisponivel") arg.el.classList.add("fc-day-unavailable");
      }
    });
    calendar.render();
    return calendar;
  },

  /** Retorna "disponivel" | "lotado" | "indisponivel" para uma data (YYYY-MM-DD) */
  async getStatusDia(dataStr) {
    const diaSemana = new Date(dataStr + "T12:00:00").getDay(); // 0=domingo ... 6=sábado
    const { data: disponibilidade } = await window.db
      .from("disponibilidade")
      .select("*")
      .eq("dia_semana", diaSemana)
      .eq("ativo", true)
      .maybeSingle();

    if (!disponibilidade) return "indisponivel";

    const horarios = this.gerarHorarios(disponibilidade);
    const { count } = await window.db
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("data", dataStr)
      .in("status", ["aguardando", "confirmado"]);

    if ((count || 0) >= horarios.length) return "lotado";
    return "disponivel";
  },

  /** Gera a lista de horários (HH:MM) a partir de uma regra de disponibilidade */
  gerarHorarios(disp) {
    const slots = [];
    const duracao = disp.duracao_consulta_min || this.DURACAO_PADRAO_MIN;

    const adicionarIntervalo = (inicio, fim) => {
      let [h, m] = inicio.split(":").map(Number);
      const [hf, mf] = fim.split(":").map(Number);
      while (h < hf || (h === hf && m < mf)) {
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        m += duracao;
        if (m >= 60) { h += Math.floor(m / 60); m %= 60; }
      }
    };

    adicionarIntervalo(disp.horario_inicio, disp.intervalo_inicio || disp.horario_fim);
    if (disp.intervalo_fim) adicionarIntervalo(disp.intervalo_fim, disp.horario_fim);

    return slots;
  },

  /** Retorna os horários livres de uma data específica */
  async getHorariosDisponiveis(dataStr) {
    const diaSemana = new Date(dataStr + "T12:00:00").getDay();
    const { data: disp } = await window.db
      .from("disponibilidade")
      .select("*")
      .eq("dia_semana", diaSemana)
      .eq("ativo", true)
      .maybeSingle();
    if (!disp) return [];

    const todosHorarios = this.gerarHorarios(disp);
    const { data: ocupados } = await window.db
      .from("agendamentos")
      .select("horario")
      .eq("data", dataStr)
      .in("status", ["aguardando", "confirmado"]);

    const horariosOcupados = new Set((ocupados || []).map(a => a.horario));
    return todosHorarios.map(h => ({ horario: h, disponivel: !horariosOcupados.has(h) }));
  },

  /** Cria uma nova solicitação de consulta com status "aguardando" */
  async criarAgendamento({ pacienteId, data, horario, observacoes }) {
    const { data: novo, error } = await window.db
      .from("agendamentos")
      .insert({
        paciente_id: pacienteId,
        data,
        horario,
        observacoes: sanitizeInput(observacoes || ""),
        status: "aguardando"
      })
      .select()
      .single();
    if (error) throw error;

    // Dispara a notificação push para o administrador (ver modules/notifications.js)
    if (window.Notifications) {
      window.Notifications.notificarNovoAgendamento(novo);
    }
    return novo;
  },

  async cancelarAgendamento(agendamentoId) {
    const { error } = await window.db
      .from("agendamentos")
      .update({ status: "cancelado" })
      .eq("id", agendamentoId);
    if (error) throw error;
  },

  async listarMeusAgendamentos(pacienteId) {
    const { data, error } = await window.db
      .from("agendamentos")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data", { ascending: false });
    if (error) throw error;
    return data;
  }
};

window.Booking = Booking;
