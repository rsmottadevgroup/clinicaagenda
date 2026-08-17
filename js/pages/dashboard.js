/* ============================================================
   DASHBOARD.JS (cliente)
   Carrega o resumo do paciente: próxima consulta, pendências e
   histórico. Protege a página exigindo role "cliente".
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await Auth.protegerPagina("cliente");
  if (!perfil) return;

  document.getElementById("user-nome").textContent = perfil.nome.split(" ")[0];
  document.getElementById("user-avatar").src = `https://ui-avatars.com/api/?background=1f5f6b&color=fff&name=${encodeURIComponent(perfil.nome)}`;

  Notifications.iniciar(perfil.id);

  await carregarResumo(perfil.id);

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
});

async function carregarResumo(pacienteId) {
  const tbody = document.getElementById("consultas-tbody");
  try {
    const agendamentos = await Booking.listarMeusAgendamentos(pacienteId);

    const hoje = new Date().toISOString().split("T")[0];
    const futuras = agendamentos.filter(a => a.data >= hoje && a.status !== "cancelado" && a.status !== "recusado");
    const pendentes = agendamentos.filter(a => a.status === "aguardando");
    const historico = agendamentos.filter(a => a.data < hoje);

    document.getElementById("proxima-consulta").textContent = futuras.length
      ? `${formatarData(futuras[futuras.length - 1].data)} às ${futuras[futuras.length - 1].horario}`
      : "Nenhuma";
    document.getElementById("qtd-pendentes").textContent = pendentes.length;
    document.getElementById("qtd-historico").textContent = historico.length;

    if (!agendamentos.length) {
      tbody.innerHTML = `<tr><td colspan="4">Você ainda não tem consultas. <a href="agendar.html">Agendar agora</a></td></tr>`;
      return;
    }

    tbody.innerHTML = agendamentos.slice(0, 8).map(a => `
      <tr>
        <td>${formatarData(a.data)}</td>
        <td>${a.horario}</td>
        <td><span class="badge badge-${a.status}">${statusLabel(a.status)}</span></td>
        <td class="table-actions">
          ${a.status === "aguardando" ? `<button class="btn btn-outline btn-sm" onclick="cancelar('${a.id}')">Cancelar</button>` : "—"}
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Erro ao carregar consultas.</td></tr>`;
    showToast(err.message, "error");
  }
}

function statusLabel(status) {
  return { aguardando: "Aguardando", confirmado: "Confirmado", recusado: "Recusado", cancelado: "Cancelado" }[status] || status;
}

async function cancelar(id) {
  if (!confirm("Deseja realmente cancelar esta solicitação?")) return;
  try {
    await Booking.cancelarAgendamento(id);
    showToast("Consulta cancelada.", "success");
    const perfil = await Auth.getPerfil();
    carregarResumo(perfil.id);
  } catch (err) {
    showToast(err.message, "error");
  }
}
window.cancelar = cancelar;
