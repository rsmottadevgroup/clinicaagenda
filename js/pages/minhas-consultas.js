/* ============================================================
   MINHAS-CONSULTAS.JS
   Lista o histórico completo de consultas do paciente logado.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await Auth.protegerPagina("cliente");
  if (!perfil) return;

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  await render(perfil.id);
});

async function render(pacienteId) {
  const tbody = document.getElementById("consultas-tbody");
  try {
    const agendamentos = await Booking.listarMeusAgendamentos(pacienteId);
    if (!agendamentos.length) {
      tbody.innerHTML = `<tr><td colspan="5">Nenhuma consulta encontrada.</td></tr>`;
      return;
    }
    tbody.innerHTML = agendamentos.map(a => `
      <tr>
        <td>${formatarData(a.data)}</td>
        <td>${a.horario}</td>
        <td><span class="badge badge-${a.status}">${{aguardando:"Aguardando",confirmado:"Confirmado",recusado:"Recusado",cancelado:"Cancelado"}[a.status]}</span></td>
        <td>${a.observacoes || "—"}</td>
        <td>${a.status === "aguardando" ? `<button class="btn btn-outline btn-sm" onclick="cancelar('${a.id}', '${pacienteId}')">Cancelar</button>` : "—"}</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar.</td></tr>`;
    showToast(err.message, "error");
  }
}

async function cancelar(id, pacienteId) {
  if (!confirm("Deseja realmente cancelar esta solicitação?")) return;
  try {
    await Booking.cancelarAgendamento(id);
    showToast("Consulta cancelada.", "success");
    render(pacienteId);
  } catch (err) {
    showToast(err.message, "error");
  }
}
window.cancelar = cancelar;
