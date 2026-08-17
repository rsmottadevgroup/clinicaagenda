/* ============================================================
   ADMIN.JS
   Operações exclusivas do painel administrativo: gerenciar
   solicitações, pacientes, disponibilidade e estatísticas.
   Depende de: config/supabase-config.js, utils/toast.js
   ============================================================ */

const Admin = {
  async getEstatisticas() {
    const hoje = new Date().toISOString().split("T")[0];

    const [{ count: consultasHoje }, { count: pendentes }, { count: pacientes }, { count: totalConsultas }] = await Promise.all([
      window.db.from("agendamentos").select("id", { count: "exact", head: true }).eq("data", hoje),
      window.db.from("agendamentos").select("id", { count: "exact", head: true }).eq("status", "aguardando"),
      window.db.from("usuarios").select("id", { count: "exact", head: true }).eq("role", "cliente"),
      window.db.from("agendamentos").select("id", { count: "exact", head: true })
    ]);

    return { consultasHoje: consultasHoje || 0, pendentes: pendentes || 0, pacientes: pacientes || 0, totalConsultas: totalConsultas || 0 };
  },

  /** Lista agendamentos com dados do paciente (join), com filtro opcional de status */
  async listarAgendamentos({ status = null, dataInicio = null, dataFim = null } = {}) {
    let query = window.db
      .from("agendamentos")
      .select("*, usuarios:paciente_id (nome, telefone, email)")
      .order("data", { ascending: true })
      .order("horario", { ascending: true });

    if (status) query = query.eq("status", status);
    if (dataInicio) query = query.gte("data", dataInicio);
    if (dataFim) query = query.lte("data", dataFim);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async atualizarStatusAgendamento(id, status) {
    const { error } = await window.db.from("agendamentos").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async listarPacientes(termoBusca = "") {
    let query = window.db.from("usuarios").select("*").eq("role", "cliente").order("nome");
    if (termoBusca) query = query.ilike("nome", `%${termoBusca}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /** Busca a disponibilidade configurada para os 7 dias da semana (0=domingo) */
  async getDisponibilidadeSemana() {
    const { data, error } = await window.db.from("disponibilidade").select("*").order("dia_semana");
    if (error) throw error;
    return data;
  },

  /** Cria ou atualiza a regra de disponibilidade de um dia da semana */
  async salvarDisponibilidade(regra) {
    const { error } = await window.db
      .from("disponibilidade")
      .upsert(regra, { onConflict: "dia_semana" });
    if (error) throw error;
  },

  async exportarAgendamentosCSV(agendamentos) {
    const linhas = [
      ["Paciente", "Telefone", "Data", "Horário", "Status", "Observações"],
      ...agendamentos.map(a => [
        a.usuarios?.nome || "", a.usuarios?.telefone || "", a.data, a.horario, a.status, (a.observacoes || "").replace(/\n/g, " ")
      ])
    ];
    const csv = linhas.map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `agendamentos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

window.Admin = Admin;
