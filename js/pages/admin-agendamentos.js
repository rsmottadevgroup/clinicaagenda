/* ============================================================
   ADMIN-AGENDAMENTOS.JS
   Lista, filtra e gerencia solicitações de consulta.
   ============================================================ */

let agendamentoAtualId = null;

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await Auth.protegerPagina("admin");
  if (!perfil) return;

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  document.getElementById("filtro-status").addEventListener("change", carregarLista);
  document.getElementById("fechar-modal").addEventListener("click", () => document.getElementById("modal-detalhes").classList.add("hidden"));
  document.getElementById("exportar-csv").addEventListener("click", exportar);

  document.getElementById("btn-confirmar").addEventListener("click", () => atualizarStatus("confirmado"));
  document.getElementById("btn-recusar").addEventListener("click", () => atualizarStatus("recusado"));
  document.getElementById("btn-cancelar").addEventListener("click", () => atualizarStatus("cancelado"));

  await carregarLista();
});

let agendamentosCache = [];

async function carregarLista() {
  const tbody = document.getElementById("agendamentos-tbody");
  const status = document.getElementById("filtro-status").value;
  tbody.innerHTML = `<tr><td colspan="6">Carregando...</td></tr>`;

  try {
    agendamentosCache = await Admin.listarAgendamentos(status ? { status } : {});
    if (!agendamentosCache.length) {
      tbody.innerHTML = `<tr><td colspan="6">Nenhum agendamento encontrado.</td></tr>`;
      return;
    }
    tbody.innerHTML = agendamentosCache.map(a => `
      <tr>
        <td>${a.usuarios?.nome || "—"}</td>
        <td>${a.usuarios?.telefone || "—"}</td>
        <td>${formatarData(a.data)}</td>
        <td>${a.horario}</td>
        <td><span class="badge badge-${a.status}">${{aguardando:"Aguardando",confirmado:"Confirmado",recusado:"Recusado",cancelado:"Cancelado"}[a.status]}</span></td>
        <td><button class="btn btn-outline btn-sm" onclick="abrirDetalhes('${a.id}')">Ver</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar.</td></tr>`;
    showToast(err.message, "error");
  }
}

function abrirDetalhes(id) {
  const a = agendamentosCache.find(x => x.id === id);
  if (!a) return;
  agendamentoAtualId = id;
  document.getElementById("det-nome").textContent = a.usuarios?.nome || "—";
  document.getElementById("det-telefone").textContent = a.usuarios?.telefone || "—";
  document.getElementById("det-data").textContent = formatarData(a.data);
  document.getElementById("det-horario").textContent = a.horario;
  document.getElementById("det-obs").textContent = a.observacoes || "Nenhuma";
  document.getElementById("modal-detalhes").classList.remove("hidden");
}
window.abrirDetalhes = abrirDetalhes;

async function atualizarStatus(status) {
  if (!agendamentoAtualId) return;
  try {
    await Admin.atualizarStatusAgendamento(agendamentoAtualId, status);
    showToast("Status atualizado com sucesso!", "success");
    document.getElementById("modal-detalhes").classList.add("hidden");
    await carregarLista();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function exportar() {
  if (!agendamentosCache.length) { showToast("Nada para exportar.", "warning"); return; }
  await Admin.exportarAgendamentosCSV(agendamentosCache);
}
